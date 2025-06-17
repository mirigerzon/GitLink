const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authBl = require('../../controllers/authBl.js');
const { writeLog } = require('../../log/log.js');
const fs = require('fs');

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const multer = require('multer');
const path = require('path');

const uploadDirs = [
    path.join(__dirname, '../../uploads/profile_images'),
    path.join(__dirname, '../../uploads/cv_files')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profile_image') {
            cb(null, path.join(__dirname, '../../uploads/profile_images'));
        } else if (file.fieldname === 'cv_file') {
            cb(null, path.join(__dirname, '../../uploads/cv_files'));
        } else {
            cb(new Error('Unknown field name'), false);
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);

        if (file.fieldname === 'profile_image') {
            cb(null, `profile-${timestamp}-${randomNum}${ext}`);
        } else if (file.fieldname === 'cv_file') {
            cb(null, `cv-${timestamp}-${randomNum}${ext}`);
        }
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log(`Processing file: ${file.fieldname}, mimetype: ${file.mimetype}`);

        if (file.fieldname === 'profile_image') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Profile image must be an image file!'), false);
            }
        } else if (file.fieldname === 'cv_file') {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('CV must be a PDF file!'), false);
            }
        } else {
            cb(new Error('Unknown field name!'), false);
        }
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await authBl.verifyLogin(username, password);
        if (!user) {
            writeLog(`Failed login attempt for user name=${username}`, 'warn');
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const ip = req.ip;
        const accessToken = jwt.sign({ id: user.id, email: user.email, ip, username: user.username, role_id: user.role_id }, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: user.username, id: user.id }, REFRESH_SECRET, { expiresIn: '1d' });
        writeLog(`User logged in successfully: user name=${username}, ip=${ip}`, 'info');
        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
            .json({ user, token: accessToken });
    } catch (err) {
        console.error(err);
        writeLog(`Login error for user name=${req.body.username} - ${err.message}`, 'error');
        res.status(500).json({ error: 'Login error' });
    }
});

router.post('/register', upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]), async (req, res) => {
    try {
        let profileImagePath = null;
        let cvFilePath = null;

        if (req.body.profile_image && req.body.profile_image.startsWith('https://github.com/')) {
            profileImagePath = req.body.profile_image;
        }
        else if (req.files && req.files['profile_image'] && req.files['profile_image'].length > 0) {
            profileImagePath = `profile_images/${req.files['profile_image'][0].filename}`;
        }
        else if (req.body.role_id === 2) {
            profileImagePath = `profile_images/user.png`;
        }
        if (req.files && req.files['cv_file'] && req.files['cv_file'].length > 0) {
            cvFilePath = `cv_files/${req.files['cv_file'][0].filename}`;
        }
        const userData = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            phone: req.body.phone,
            role_id: req.body.role_id,
            profile_image: profileImagePath,
            cv_file: cvFilePath,
            company_name: req.body.company_name
        };
        if (req.body.role_id === 1) {
            userData.git_name = req.body.git_name;
            userData.experience = parseInt(req.body.experience) || 0;
            userData.languages = req.body.languages || '';
            userData.about = req.body.about || '';
        } else if (req.body.role_id === 2) {
            userData.company_name = req.body.company_name || '';
        }
        console.log('Final userData:', userData);
        const user = await authBl.registerNewUser(userData);
        const ip = req.ip;
        const accessToken = jwt.sign({
            id: user.id,
            email: user.email,
            ip,
            username: user.username,
            role_id: user.role_id
        }, ACCESS_SECRET, { expiresIn: '15m' });

        const refreshToken = jwt.sign({
            username: user.username,
            id: user.id
        }, REFRESH_SECRET, { expiresIn: '1d' });

        writeLog(`User registered successfully: email=${user.email}, ip=${ip}`, 'info');

        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
            .status(201)
            .json({
                message: 'Registration successful',
                user,
                token: accessToken
            });
    } catch (err) {
        console.error('Registration error:', err);
        writeLog(`Registration error for email=${req.body.email} - ${err.message}`, 'error');
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                fs.unlink(file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
            });
        }
        res.status(400).json({ error: err.message });
    }
});

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        writeLog('Refresh token missing in request', 'warn');
        return res.sendStatus(401);
    }
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            writeLog('Invalid refresh token', 'warn');
            return res.sendStatus(403);
        }
        const user = await authBl.getUser(decoded.username);
        if (!user) {
            return res.sendStatus(403);
        }
        const ip = req.ip;
        const newAccessToken = jwt.sign(
            { id: decoded.id, username: user.username, ip, role_id: user.role_id },
            ACCESS_SECRET,
            { expiresIn: '15m' }
        );
        writeLog(`Access token refreshed for userId=${decoded.id}, ip=${ip}`, 'info');
        res.json({ token: newAccessToken });
    });
});

router.post('/logout', (req, res) => {
    writeLog('User logged out', 'info');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: "Logged out" });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username || username.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Username is required"
            });
        }
        const result = await authBl.forgotPassword(username.trim());
        res.status(200).json(result);
    } catch (error) {
        console.error('Forgot password route error:', error);
        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: "Username not found"
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to send reset email. Please try again later."
        });
    }
});

// זה כנראה לא צריך להיות בראוט הזה
// לקרוא לפונקציה הזאת מהקלינט

router.get('/cv/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await genericDal.GET("users", [
            { field: "id", value: userId }
        ]);

        if (!user.length || !user[0].cv_file) {
            return res.status(404).json({ error: 'CV not found' });
        }

        const filePath = path.join(__dirname, '../../uploads/', user[0].cv_file);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'CV file not found on server' });
        }
        res.download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error downloading CV' });
    }
});

module.exports = router;