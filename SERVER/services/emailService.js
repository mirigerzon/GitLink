const nodemailer = require('nodemailer');
const messagesRepository = require('../repositories/messages');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.PASSWORD_USER
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendEmail = async ({ user_id, email, title, content, dbContent, saveOnly = true }) => {
    if (!user_id || !email || !title || !content) {
        throw new Error('User ID, email, title, and content are required');
    }

    try {
        await messagesRepository.createMessage({
            user_id,
            email,
            title,
            content: dbContent || content
        });

        if (!saveOnly) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: title,
                html: content.replace(/\n/g, '<br/>')
            });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

const sendWelcomeEmail = async (userId, email, username) => {
    if (!userId || !email || !username) {
        throw new Error('User ID, email, and username are required');
    }

    const welcomeContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to GitLink! 🎉</h2>
            <p>Hello ${username},</p>
            <p>Welcome to GitLink - the platform for project management and developer collaboration!</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #007bff; margin-top: 0;">What you can do:</h3>
                <ul style="margin: 10px 0;">
                    <li>Manage projects with powerful tools</li>
                    <li>Collaborate with teams globally</li>
                    <li>Track code changes with version control</li>
                    <li>Join our active developer community</li>
                </ul>
            </div>
            <p><strong>Getting started:</strong> Complete your profile and create your first repository to explore all features.</p>
            <p>Need help? Contact us at <a href="mailto:support@gitlink.com" style="color: #007bff;">support@gitlink.com</a> or visit our <a href="https://gitlink.com/help" style="color: #007bff;">Help Center</a>.</p>
            <br>
            <p>Best regards,<br>GitLink Team</p>
        </div>
    `;

    await sendEmail({
        user_id: userId,
        email,
        title: 'Welcome to GitLink! 🎉',
        content: welcomeContent,
        dbContent: `Hello ${username}, welcome to GitLink!`,
        saveOnly: false
    });
};

const sendPasswordResetEmail = async (user, newPassword) => {
    if (!user || !user.username || !user.email || !newPassword) {
        throw new Error('User data and new password are required');
    }

    const emailContent = `
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
    `;

    await sendEmail({
        user_id: user.id,
        email: user.email,
        title: 'Password Reset - GitLink',
        content: emailContent,
        dbContent: `Your password was reset. New password: ${newPassword}`,
        saveOnly: false
    });
};

const sendPasswordChangeWarningEmail = async (userId, email) => {
    if (!userId || !email) {
        throw new Error('User ID and email are required');
    }

    const subject = 'Security Alert: Your Password Was Changed';
    const content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">⚠️ Security Alert</h2>
            <p>Hello,</p>
            <p>We noticed that your password was just changed.</p>
            <p>If <strong>you</strong> made this change, no further action is needed.</p>
            <p>But if this wasn't you, please reset your password immediately to protect your account.</p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>👉 <a href="https://localhost/reset-password" style="color: #007bff;">Click here to reset your password</a></strong></p>
            </div>
            <p>Stay safe,<br>The Security Team</p>
        </div>
    `;

    await sendEmail({
        user_id: userId,
        email,
        title: subject,
        content,
        dbContent: 'Your password was changed. If this wasn\'t you, please reset it.',
        saveOnly: false
    });
};

const sendApplicationEmail = async (userId, email, jobId) => {
    if (!userId || !email || !jobId) {
        throw new Error('User ID, email, and job ID are required');
    }

    const content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Application Received! ✅</h2>
            <p>Thank you for your interest in our position!</p>
            <p>We have received your application for job #${jobId}. Our team will review it shortly.</p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>What's next?</strong> We'll be in touch if your qualifications match our requirements.</p>
            </div>
            <p>Thank you for applying!</p>
            <br>
            <p>Best regards,<br>GitLink Team</p>
        </div>
    `;

    await sendEmail({
        user_id: userId,
        email,
        title: 'Application Received!',
        content,
        dbContent: `We received your application for job #${jobId}. Thank you!`,
        saveOnly: false
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordChangeWarningEmail,
    sendApplicationEmail
};