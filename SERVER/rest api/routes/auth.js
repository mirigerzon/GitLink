const express = require('express');
const router = express.Router();
const {
    login,
    register,
    refreshToken,
    forgotPassword,
    checkUsername,
    getUserCV
} = require('../../services/auth.js');
const { handleError, upload } = require('../utils/routerHelpers.js');
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const path = require('path');
const fs = require('fs');
const { writeLog } = require('../../log/log.js');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await login(username, password);
        const ip = req.ip;
        const refreshToken = jwt.sign({ username: result.username, id: result.id }, REFRESH_SECRET, { expiresIn: '1d' });
        const accessToken = jwt.sign({ id: result.id, email: result.email, ip, username: result.username, role_id: result.role_id }, ACCESS_SECRET, { expiresIn: '15m' });

        writeLog(`User logged in: ${username} from IP: ${ip}`, 'info');

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        }).json({ user: result, token: accessToken });
    } catch (err) {
        writeLog(`Login failed for user: ${req.body.username} - ${err.message}`, 'error');
        handleError(res, err, 'auth', 'login');
    }
});

router.post('/register', upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]), async (req, res) => {
    try {
        let profileImagePath = null;

        if (req.body.profile_image && req.body.profile_image.startsWith('https://github.com/')) {
            profileImagePath = req.body.profile_image;
        }
        else if (req.files && req.files['profile_image'] && req.files['profile_image'].length > 0) {
            profileImagePath = `profile_images/${req.files['profile_image'][0].filename}`;
        }
        else if (req.body.role_id === 2) {
            profileImagePath = `profile_images/user.png`;
        }

        let cvFilePath = null;
        if (req.files && req.files['cv_file'] && req.files['cv_file'].length > 0) {
            cvFilePath = `cv_files/${req.files['cv_file'][0].filename}`;
        }

        const userData = {
            ...req.body,
            profile_image: profileImagePath,
            cv_file: cvFilePath,
        };

        const result = await register(userData);
        const ip = req.ip;
        const refreshToken = jwt.sign({ username: result.username, id: result.id }, REFRESH_SECRET, { expiresIn: '1d' });
        const accessToken = jwt.sign({ id: result.id, email: result.email, ip, username: result.username, role_id: result.role_id }, ACCESS_SECRET, { expiresIn: '15m' });

        writeLog(`New user registered: ${result.username} from IP: ${ip}`, 'info');

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        })
            .status(201)
            .json({ user: result, token: accessToken });
    } catch (err) {
        writeLog(`Registration failed: ${err.message}`, 'error');
        handleError(res, err, 'auth', 'register');
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const token = await refreshToken(req.cookies?.refreshToken);
        writeLog(`Token refreshed for token: ${req.cookies?.refreshToken}`, 'info');
        res.json({ token });
    } catch (err) {
        writeLog(`Token refresh failed: ${err.message}`, 'error');
        res.sendStatus(err.status || 403);
    }
});

router.post('/logout', (req, res) => {
    writeLog(`User logged out`, 'info');
    res.clearCookie('refreshToken').json({ message: "Logged out" });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const result = await forgotPassword(req.body.username);
        writeLog(`Password reset requested for username: ${req.body.username}`, 'info');
        res.json(result);
    } catch (err) {
        writeLog(`Forgot-password failed for username: ${req.body.username} - ${err.message}`, 'error');
        handleError(res, err, 'auth', 'forgot-password');
    }
});

router.get('/check-username/:username', async (req, res) => {
    try {
        const result = await checkUsername(req.params.username);
        writeLog(`Username check for: ${req.params.username}`, 'info');
        res.json(result);
    } catch (err) {
        writeLog(`Check username failed for: ${req.params.username} - ${err.message}`, 'error');
        handleError(res, err, 'auth', 'check-username');
    }
});

router.get('/cv/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userCV = await getUserCV(username);

        if (!userCV) {
            writeLog(`CV not found for user: ${username}`, 'warn');
            return res.status(404).json({ error: 'CV not found' });
        }

        const filePath = path.join(__dirname, '../../uploads/', userCV);
        if (!fs.existsSync(filePath)) {
            writeLog(`CV file not found on server for user: ${username}`, 'warn');
            return res.status(404).json({ error: 'CV file not found on server' });
        }

        writeLog(`CV downloaded for user: ${username}`, 'info');
        res.setHeader('Content-Disposition', `attachment; filename="${username}-cv.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(filePath);
    } catch (err) {
        writeLog(`Downloading CV failed for user: ${req.params.username} - ${err.message}`, 'error');
        handleError(res, err, 'CV', 'downloading CV');
    }
});

module.exports = router;
