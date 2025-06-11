const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dataService = require('../../controllers/authBl.js');
const { writeLog } = require('../../LOG/log.js');

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/profile_images'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    }
});

const upload = multer({ storage });

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await dataService.verifyLogin(username, password);
        if (!user) {
            writeLog(`Failed login attempt for user name=${username}`, 'warn');
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const ip = req.ip;
        const accessToken = jwt.sign({ id: user.id, username: user.username, ip }, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '1d' });
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

router.post('/register', upload.single('profile_image'), async (req, res) => {
    try {
        const user = await dataService.registerNewUser(req.body);
        const ip = req.ip;
        const accessToken = jwt.sign({ id: user.id, email: user.email, ip }, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '1d' });
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
        const user = await dataService.getUserById(decoded.id);
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


module.exports = router;