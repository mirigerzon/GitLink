const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const {
    login,
    register,
    refreshToken,
    forgotPassword,
    checkUsername,
    getUserCV
} = require('../../services/auth.js');
const { upload } = require('../utils/routerHelpers.js');
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const path = require('path');
const fs = require('fs');
const { writeLog } = require('../../common/logger.js');

router.post('/login', asyncHandler(async (req, res) => {
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
}));

router.post('/register', upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]), asyncHandler(async (req, res) => {
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
}));

router.post('/refresh', asyncHandler(async (req, res) => {
    const token = await refreshToken(req.cookies?.refreshToken);
    writeLog(`Token refreshed for token: ${req.cookies?.refreshToken}`, 'info');
    res.json({ token });
}));

router.post('/logout', (req, res) => {
    writeLog(`User logged out`, 'info');
    res.clearCookie('refreshToken').json({ message: "Logged out" });
});

router.post('/forgot-password', asyncHandler(async (req, res) => {
    const result = await forgotPassword(req.body.username);
    writeLog(`Password reset requested for username: ${req.body.username}`, 'info');
    res.json(result);
}));

router.get('/check-username/:username', asyncHandler(async (req, res) => {
    const result = await checkUsername(req.params.username);
    writeLog(`Username check for: ${req.params.username}`, 'info');
    res.json(result);
}));

router.get('/cv/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;
    const userCV = await getUserCV(username);

    if (!userCV) {
        writeLog(`CV not found for user: ${username}`, 'warn');
        const error = new Error('CV not found');
        error.status = 404;
        throw error;
    }

    const filePath = path.join(__dirname, '../../uploads/', userCV);
    if (!fs.existsSync(filePath)) {
        writeLog(`CV file not found on server for user: ${username}`, 'warn');
        const error = new Error('CV file not found on server');
        error.status = 404;
        throw error;
    }

    writeLog(`CV downloaded for user: ${username}`, 'info');
    res.setHeader('Content-Disposition', `attachment; filename="${username}-cv.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
}));

module.exports = router;