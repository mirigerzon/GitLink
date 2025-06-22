const generic = require('../models/generic.js');
const userModel = require('../models/users.js')
const bcrypt = require('bcrypt');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('./emailService.js');
const { generateUsername } = require('unique-username-generator');
const jwt = require('jsonwebtoken');

const login = async (username, password) => {
    try {
        const users = await userModel.getUser(username);
        if (!users) {
            throw new Error("Invalid credentials");
        }

        const user = users;
        const hashedPassword = user.hashed_password;
        if (!hashedPassword) throw new Error("Invalid credentials");

        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) throw new Error("Invalid credentials");

        delete user.hashed_password;
        return user;
    } catch (error) {
        console.error('Error in login verification:', error);
        throw error;
    }
};

const register = async (userData) => {
    try {
        const { username, password, email, phone, role_id, about, git_name, experience, languages, company_name, cv_file } = userData;

        if (role_id === '1' && !git_name) {
            throw new Error("Git name is required for developers");
        }

        if (role_id === '1') {
            const existingDevs = await generic.GET("developers", [{ field: "git_name", value: git_name }]);
            if (existingDevs.length > 0) {
                throw new Error("Git name already exists");
            }
        }

        const profile_image = userData.profile_image || 'profile_images/user.png';
        const hashedPassword = await hashPassword(password);
        const generalUser = { username, email, phone, role_id, about, profile_image, cv_file };

        const newUser = await generic.CREATE("users", generalUser);
        await generic.CREATE("passwords", { user_id: newUser.insertId, hashed_password: hashedPassword });

        if (role_id === '1') {
            await generic.CREATE("developers", { user_id: newUser.insertId, git_name, experience, languages });
        } else if (role_id === '2') {
            await generic.CREATE("recruiters", { user_id: newUser.insertId, company_name });
        }

        await sendWelcomeEmail(newUser.insertId, email, username);

        return {
            id: newUser.insertId,
            ...generalUser,
            ...(role_id === '1' && { role: 'developer', git_name, experience, languages }),
            ...(role_id === '2' && { role: 'recruiter', company_name })
        };
    } catch (error) {
        console.error('Error registering new user:', error);
        throw error;
    }
};

const refreshToken = async (refreshTokenFromCookie, ip) => {
    if (!refreshTokenFromCookie) {
        const err = new Error('No refresh token provided');
        err.status = 401;
        throw err;
    }

    try {
        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_SECRET);
        const user = await userModel.getUser(decoded.username);
        if (!user) {
            const err = new Error('User not found');
            err.status = 403;
            throw err;
        }

        return jwt.sign(
            { id: user.id, username: user.username, ip, role_id: user.role_id },
            process.env.ACCESS_SECRET,
            { expiresIn: '15m' }
        );;
    } catch (err) {
        err.status = err.status || 403;
        throw err;
    }
};

const checkUsername = async (username) => {
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const isAvailable = await isUsernameAvailable(username);
    if (isAvailable) {
        const suggestions = [];
        for (let i = 0; i < 5; i++) {
            const suggestion = generateUsername("", 0, 5);
            if (isUsernameAvailable(suggestion)) {
                suggestions.push(suggestion);
            }
        }
        return { available: false, ...suggestions };
    } else {
        return { available: true, username };
    }
};

const forgotPassword = async (username) => {
    try {
        const user = await userModel.getUser(username);
        if (!user) {
            throw new Error("User not found");
        }

        const newPassword = generateRandomPassword();
        const hashedNewPassword = await hashPassword(newPassword);

        await generic.UPDATE("passwords",
            { hashed_password: hashedNewPassword },
            [{ field: "user_id", value: user.user_id }]
        );
        await sendPasswordResetEmail(user, newPassword);

        return { success: true, message: "New password sent to your email address" };
    } catch (error) {
        console.error('Error in forgot password:', error);
        throw error;
    }
}

const hashPassword = async (plainPassword) => {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};

const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

const isUsernameAvailable = async (username) => {
    try {
        const user = await userModel.getUser(username);
        return user ? true : false;
    } catch (error) {
        console.error('Error checking username availability:', error);
        throw new Error('Failed to check username availability');
    }
}

const getUserCV = async (username) => {
    try {
        const user = await userModel.getUser(username);
        return user.cv_file;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
    }
}

module.exports = {
    login,
    register,
    refreshToken,
    checkUsername,
    forgotPassword,
    isUsernameAvailable,
    getUserCV
};
