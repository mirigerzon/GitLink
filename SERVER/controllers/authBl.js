const genericDal = require('../services/genericDal.js');
const dal = require('../services/dal.js');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'sara3280624@gmail.com',//להעביר לקובץ ENV
//         pass: 'ojoj bcch hqdc chst'
//     }
// });

async function sendEmail(userDetails) {
    const { user_id, email, title, content, username } = userDetails;

    try {
        await genericDal.POST("messages", {
            user_id,
            email,
            title,
            content
        });

        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: email,
        //     subject: title,
        //     html: content
        // });

        console.log('Email sent and saved successfully');

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

const verifyLogin = async (username, password) => {
    const users = await dal.getUser(username);
    if (!users || users.length === 0)
        return null;
    const user = users[0];
    const hashedPassword = user.hashed_password;
    if (!hashedPassword) return null;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) return null;
    delete user.hashed_password;
    return user;
};

const registerNewUser = async (userData) => {
    const {
        username, password, email, phone, role, about, profile_image,
        git_name, experience, languages, company_name, cv_file
    } = userData;

    if (role !== "developer" && role !== "recruiter") {
        throw new Error("Invalid role");
    }

    if (role === "developer") {
        const existingDevs = await genericDal.GET("developers", [
            { field: "git_name", value: git_name }
        ]);
        if (existingDevs.length > 0) throw new Error("git_name already exists");
    }

    const hashedPassword = await hashPassword(password);
    const generalUser = { username, email, phone, role, about, profile_image, cv_file };
    const newUser = await genericDal.POST("users", generalUser);

    await genericDal.POST("passwords", {
        user_id: newUser.insertId,
        hashed_password: hashedPassword
    });

    if (role === "developer") {
        const developerData = { user_id: newUser.insertId, git_name, experience, languages };
        await genericDal.POST("developers", developerData);
    } else if (role === "recruiter") {
        const recruiterData = {
            user_id: newUser.insertId,
            company_name
        };
        await genericDal.POST("recruiters", recruiterData);
    }

    await sendEmail({
        user_id: newUser.insertId,
        email: email,
        title: 'WELCOME!',
        content: `💌 - Welcome to our platform, ${username}! We're excited to have you on board.`,
        username: username
    });

    return {
        id: newUser.insertId,
        ...generalUser,
        ...(role === "developer" && { git_name, experience, languages }),
        ...(role === "recruiter" && { company_name })
    };
};

const getUser = async (username) => {
    return dal.getUser(username);
}

const hashPassword = async (plainPassword) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
};

module.exports = {
    verifyLogin,
    registerNewUser,
    getUser
};