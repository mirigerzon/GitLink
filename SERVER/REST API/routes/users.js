const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const path = require('path');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
    const table = "users";
    try {
        const data = await dataService.getUser(req.params.id);
        writeLog(`Fetched data from table=${table}`, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=${table} - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting ${table}` });
    }
});

router.get('/:username', async (req, res) => {
    const table = "users";
    try {
        const data = await dataService.getUser(req.params.username);
        writeLog(`Fetched data from table=${table} `, 'info');
        res.json(data);
    } catch (err) {
        console.error(err);
        writeLog(`ERROR fetching data from table=${table} - ${err.message}`, 'error');
        res.status(500).json({ error: `ERROR requesting ${table}` });
    }
});

router.post("/rate", async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { project_id, rating } = req.body;
        if (!project_id || !rating) throw new Error("Missing parameters.");

        await dataService.rateProject(userEmail, project_id, rating);
        res.status(200).json({ message: "Rating submitted successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// const createConditions = (req) => {
//     const query = req.query;
//     if (query.user_id === 'null') {
//         query.user_id = req.user?.id;
//     }
//     let conditions = [];
//     if (Object.keys(query).length > 0) {
//         conditions = Object.entries(query).map(([key, value]) => ({
//             field: key,
//             value: isNaN(value) ? value : Number(value)
//         }));
//     }
//     return conditions;
// };

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'cv_file') {
            cb(null, 'uploads/cv_files/');
        } else if (file.fieldname === 'profile_image') {
            cb(null, 'uploads/profile_images/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'cv_file') {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only PDF files are allowed for CV'), false);
            }
        } else if (file.fieldname === 'profile_image') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        }
    }
});

router.put('/update-cv', upload.single('cv_file'), async (req, res) => {
    try {
        const { user_id } = req.body;
        let cvFilePath = null;
        if (req.file) {
            cvFilePath = `cv_files/${req.file.filename}`;
        }
        await genericDataService.updateItem('users',
            { cv_file: cvFilePath },
            [{ field: 'id', value: user_id }]
        );
        res.status(200).json({ message: 'CV updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

router.put('/update-image', upload.single('profile_image'), async (req, res) => {
    try {
        const { user_id, use_git_avatar } = req.body;
        let profileImagePath = null;
        if (use_git_avatar === 'true') {
            profileImagePath = req.body.profile_image; // GitHub URL
        } else if (req.file) {
            profileImagePath = `profile_images/${req.file.filename}`;
        }
        await genericDataService.updateItem('users',
            { profile_image: profileImagePath },
            [{ field: 'id', value: user_id }]
        );
        res.status(200).json({ message: 'Profile image updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

router.put('/change-password', async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        const user = await dataService.getUser(username);
        if (!user) {
            throw new Error('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashed_password);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await genericDataService.updateItem('passwords',
            { hashed_password: hashedNewPassword },
            [{ field: 'user_id', value: user.id }]
        );
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});
module.exports = router;