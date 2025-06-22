const { writeLog } = require('../../log/log');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createConditions = (req) => {
    const query = req.query;
    if (query.user_id === 'null') query.user_id = req.user?.id;

    let conditions = [];
    if (Object.keys(query).length > 0) {
        conditions = Object.entries(query).map(([key, value]) => ({
            field: key,
            value: isNaN(value) ? value : Number(value)
        }));
    }
    return conditions;
};

const addUserIdCondition = (req, conditions = []) => {
    const userId = req.user?.id;
    if (!userId) return conditions;
    return [...conditions];
};

const handleError = (res, err, table, operation = 'requesting') => {
    console.error(err);
    writeLog(`ERROR ${operation} ${table} - ${err.message}`, 'error');
    res.status(500).json({ error: `ERROR ${operation} ${table}` });
};

const validateRequiredFields = (body, requiredFields) => {
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
};

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
        fileSize: 10 * 1024 * 1024
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

module.exports = {
    createConditions,
    addUserIdCondition,
    handleError,
    validateRequiredFields,
    upload
};