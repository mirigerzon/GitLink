const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const { login, register, refreshToken, forgotPassword, checkUsername, getUserCV, handleFileUploads, generateTokens, setCookieOptions } = require('../../services/auth.js');
const { upload } = require('../utils/routerHelpers.js');
const path = require('path');
const fs = require('fs');
const { writeLog } = require('../../common/logger.js');

router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        writeLog(`Login attempt failed - missing credentials from IP: ${req.ip}`, 'warn');
        const error = new Error('Username and password are required');
        error.status = 400;
        throw error;
    }

    writeLog(`Login attempt for username: ${username} from IP: ${req.ip}`, 'info');

    try {
        const result = await login(username, password);
        const ip = req.ip;
        const { refreshToken, accessToken } = generateTokens(result, ip);

        writeLog(`User logged in successfully: ${username} from IP: ${ip}`, 'info');

        res.cookie('refreshToken', refreshToken, setCookieOptions())
            .json({ user: result, token: accessToken });
    } catch (error) {
        writeLog(`Login failed for username: ${username} from IP: ${req.ip} - Error: ${error.message}`, 'warn');
        throw error;
    }
}));

router.post('/register', upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]), asyncHandler(async (req, res) => {
    writeLog(`Registration attempt from IP: ${req.ip}`, 'info');

    const { profileImagePath, cvFilePath } = handleFileUploads(req.body, req.files);

    const userData = {
        ...req.body,
        profile_image: profileImagePath,
        cv_file: cvFilePath,
    };

    try {
        const result = await register(userData);
        const ip = req.ip;
        const { refreshToken, accessToken } = generateTokens(result, ip);

        writeLog(`New user registered successfully: ${result.username} from IP: ${ip}`, 'info');

        res.cookie('refreshToken', refreshToken, setCookieOptions())
            .status(201)
            .json({ user: result, token: accessToken });
    } catch (error) {
        writeLog(`Registration failed from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.post('/refresh', asyncHandler(async (req, res) => {
    if (!req.cookies?.refreshToken) {
        writeLog(`Token refresh attempt failed - no refresh token provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Refresh token is required');
        error.status = 401;
        throw error;
    }

    try {
        const token = await refreshToken(req.cookies.refreshToken);
        writeLog(`Token refreshed successfully from IP: ${req.ip}`, 'info');
        res.json({ token });
    } catch (error) {
        writeLog(`Token refresh failed from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.post('/logout', (req, res) => {
    writeLog(`User logged out from IP: ${req.ip}`, 'info');
    res.clearCookie('refreshToken').json({ message: "Logged out successfully" });
});

router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { username } = req.body;

    if (!username) {
        writeLog(`Password reset attempt failed - no username provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
    }

    try {
        const result = await forgotPassword(username);
        writeLog(`Password reset requested for username: ${username} from IP: ${req.ip}`, 'info');
        res.json(result);
    } catch (error) {
        writeLog(`Password reset failed for username: ${username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.get('/check-username/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        writeLog(`Username check failed - no username provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
    }

    try {
        const result = await checkUsername(username);
        writeLog(`Username check performed for: ${username} from IP: ${req.ip}`, 'info');
        res.json(result);
    } catch (error) {
        writeLog(`Username check failed for: ${username} from IP: ${req.ip} - Error: ${error.message}`, 'error');
        throw error;
    }
}));

router.get('/cv/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        writeLog(`CV download attempt failed - no username provided from IP: ${req.ip}`, 'warn');
        const error = new Error('Username is required');
        error.status = 400;
        throw error;
    }

    writeLog(`CV download attempt for user: ${username} from IP: ${req.ip}`, 'info');

    const userCV = await getUserCV(username);

    if (!userCV) {
        writeLog(`CV not found for user: ${username} from IP: ${req.ip}`, 'warn');
        const error = new Error('CV not found');
        error.status = 404;
        throw error;
    }

    const filePath = path.join(__dirname, '../../uploads/', userCV);
    if (!fs.existsSync(filePath)) {
        writeLog(`CV file not found on server for user: ${username} from IP: ${req.ip}`, 'error');
        const error = new Error('CV file not found on server');
        error.status = 404;
        throw error;
    }

    writeLog(`CV downloaded successfully for user: ${username} from IP: ${req.ip}`, 'info');
    res.setHeader('Content-Disposition', `attachment; filename="${username}-cv.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
}));

module.exports = router;