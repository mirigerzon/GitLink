const express = require('express');
const router = express.Router();
const authService = require('../../services/auth.js');
const { handleError, upload } = require('../utils/routerHelpers.js');
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const path = require('path');
const fs = require('fs');
// log

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        const ip = req.ip;
        const refreshToken = jwt.sign({ username: result.username, id: result.id }, REFRESH_SECRET, { expiresIn: '1d' });
        const accessToken = jwt.sign({ id: result.id, email: result.email, ip, username: result.username, role_id: result.role_id }, ACCESS_SECRET, { expiresIn: '15m' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        }).json({ user: result, token: accessToken });
    } catch (err) {
        handleError(res, err, 'auth', 'login');
    }
});

router.post('/register', upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]), async (req, res) => {
    try {
        let profileImagePath = null;

        // בדיקה אם profile_image הוא URL מגיט
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

        const result = await authService.register(userData);
        const ip = req.ip;
        const refreshToken = jwt.sign({ username: result.username, id: result.id }, REFRESH_SECRET, { expiresIn: '1d' });
        const accessToken = jwt.sign({ id: result.id, email: result.email, ip, username: result.username, role_id: result.role_id }, ACCESS_SECRET, { expiresIn: '15m' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        })
            .status(201)
            .json({ user: result, token: accessToken });
    } catch (err) {
        handleError(res, err, 'auth', 'register');
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const token = await authService.refreshToken(req.cookies?.refreshToken);
        res.json({ token });
    } catch (err) {
        res.sendStatus(err.status || 403);
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken').json({ message: "Logged out" });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body.username);
        res.json(result);
    } catch (err) {
        handleError(res, err, 'auth', 'forgot-password');
    }
});

router.get('/check-username/:username', async (req, res) => {
    try {
        const result = await authService.checkUsername(req.params.username);
        res.json(result);
    } catch (err) {
        handleError(res, err, 'auth', 'check-username');
    }
});

router.get('/cv/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userCV = await authService.getUserCV(username);

        if (!userCV) return res.status(404).json({ error: 'CV not found' });

        const filePath = path.join(__dirname, '../../uploads/', userCV);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'CV file not found on server' });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${username}-cv.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(filePath);
    } catch (err) {
        handleError(res, err, 'CV', 'downloading CV');
    }
});

module.exports = router;