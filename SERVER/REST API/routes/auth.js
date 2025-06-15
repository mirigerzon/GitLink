const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const autoBl = require('../../controllers/authBl.js');
const { writeLog } = require('../../log/log.js');

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profile_image') {
            cb(null, path.join(__dirname, '../../uploads/profile_images'));
        } else if (file.fieldname === 'cv_file') {
            cb(null, path.join(__dirname, '../../uploads/cv_files'));
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        if (file.fieldname === 'profile_image') {
            cb(null, `${timestamp}-${file.fieldname}${ext}`);
        } else if (file.fieldname === 'cv_file') {
            cb(null, `${timestamp}-cv-${file.originalname}`);
        }
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profile_image' && file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else if (file.fieldname === 'cv_file' && file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type!'), false);
        }
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await autoBl.verifyLogin(username, password);
        if (!user) {
            writeLog(`Failed login attempt for user name=${username}`, 'warn');
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const ip = req.ip;
        const accessToken = jwt.sign({ id: user.id, email: user.email, ip, username: user.username, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
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
        } else if (req.files && req.files['profile_image']) {
            profileImagePath = `profile_images/${req.files['profile_image'][0].filename}`;
        }

        if (req.files && req.files['cv_file']) {
            cvFilePath = `cv_files/${req.files['cv_file'][0].filename}`;
        }

        const userData = {
            ...req.body,
            profile_image: profileImagePath,
            cv_file: cvFilePath
        };

        const user = await autoBl.registerNewUser(userData);
        const ip = req.ip;
        const accessToken = jwt.sign({
            id: user.id,
            email: user.email,
            ip,
            username: user.username,
            role: user.role
        }, ACCESS_SECRET, { expiresIn: '15m' });

        const refreshToken = jwt.sign({
            username: user.username,
            id: user.id
        }, REFRESH_SECRET, { expiresIn: '1d' });

        writeLog(`User registered successfully: email=${user.email}, ip=${ip}`, 'info');

        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
            .status(201)
            .json({ user, token: accessToken });
    } catch (err) {
        console.error(err);
        writeLog(`Registration error for email=${req.body.email} - ${err.message}`, 'error');
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
        const user = await autoBl.getUser(decoded.username);
        if (!user) {
            return res.sendStatus(403);
        }
        const ip = req.ip;
        const newAccessToken = jwt.sign(
            { id: decoded.id, username: user.username, ip },
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
        const result = await autoBl.forgotPassword(username.trim());
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
        res.download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error downloading CV' });
    }
});

module.exports = router;