const genericDal = require('../services/genericDal.js');
const dal = require('../services/dal.js');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.PASSWORD_USER
    }
});

async function sendEmail(userDetails) {
    const { user_id, email, title, content, username } = userDetails;

    try {
        await genericDal.POST("messages", {
            user_id,
            email,
            title,
            content
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: title,
            html: content
        });

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
        username, password, email, phone, role, about,
        git_name, experience, languages, company_name, cv_file
    } = userData;

    const profile_image = userData.profile_image || 'profile_images/user.png';

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

const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

const forgotPassword = async (username) => {
    try {
        const users = await dal.getUser(username);
        if (!users || users.length === 0) {
            throw new Error("User not found");
        }
        const user = users[0];
        const newPassword = generateRandomPassword();
        const hashedNewPassword = await hashPassword(newPassword);
        await sendEmail({
            user_id: user.user_id,
            email: user.email,
            title: 'Password Reset - GitLink',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset</h2>
                    <p>Hello ${user.username},</p>
                    <p>Your password has been reset as requested. Here is your new password:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong style="font-size: 18px; color: #007bff;">${newPassword}</strong>
                    </div>
                    <p><strong>Important:</strong> Please change this password after logging in for security reasons.</p>
                    <p>If you didn't request this password reset, please contact support immediately.</p>
                    <br>
                    <p>Best regards,<br>GitLink Team</p>
                </div>
            `,
            username: user.username
        });
        
        await genericDal.PUT("passwords",
            { hashed_password: hashedNewPassword },
            [{ field: "user_id", value: user.user_id }]
        );

        return {
            success: true,
            message: "New password sent to your email address"
        };

    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

module.exports = {
    verifyLogin,
    registerNewUser,
    getUser,
    forgotPassword
};