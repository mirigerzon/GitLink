const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../../dataBase/LOG/log.js');

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

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        writeLog('Refresh token missing in request', 'warn');
        return res.sendStatus(401);
    }
    jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
        if (err) {
            writeLog('Invalid refresh token', 'warn');
            return res.sendStatus(403);
        }
        const ip = req.ip;
        const newAccessToken = jwt.sign({ id: decoded.id, ip }, ACCESS_SECRET, { expiresIn: '1d' });
        writeLog(`Access token refreshed for userId=${decoded.id}, ip=${ip}`, 'info');
        res.json({ token: newAccessToken });
    });
});

router.post('/logout', (req, res) => {
    writeLog('User logged out', 'info');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: "Logged out" });
});

const addUserIdCondition = (req) => {
    const body = { ...req.body };
    if (body.user_id === 'null') {
        body.user_id = req.user?.id;
    }
    return body;
};

module.exports = router;