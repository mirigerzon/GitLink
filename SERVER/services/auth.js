const generic = require('../repositories/generic.js');
const userRepository = require('../repositories/users.js');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('./emailService.js');
const { generateUsername } = require('unique-username-generator');
const jwt = require('jsonwebtoken');

const login = async (username, password) => {
    if (!username || !password) {
        throw new Error('Username and password are required');
    }

    try {
        const user = await userRepository.getUser(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const hashedPassword = user.hashed_password;
        if (!hashedPassword) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        delete user.hashed_password;
        return user;
    } catch (error) {
        console.error('Error in login verification:', error);
        throw error;
    }
};

const register = async (userData) => {
    if (!userData || !userData.username || !userData.password || !userData.email) {
        throw new Error('Username, password, and email are required');
    }

    try {
        const { username, password, email, phone, role_id, about, git_name, experience, languages, company_name, cv_file } = userData;

        if (role_id === '1' && !git_name) {
            throw new Error('Git name is required for developers');
        }

        if (role_id === '1') {
            const existingDevs = await generic.GET('developers', [{ field: 'git_name', value: git_name }]);
            if (existingDevs.length > 0) {
                throw new Error('Git name already exists');
            }
        }

        const existingUser = await userRepository.getUser(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const profile_image = userData.profile_image || 'profile_images/user.png';
        const hashedPassword = await hashPassword(password);
        const generalUser = { username, email, phone, role_id, about, profile_image, cv_file };

        const newUser = await generic.CREATE('users', generalUser);
        await generic.CREATE('passwords', { user_id: newUser.insertId, hashed_password: hashedPassword });

        if (role_id === '1') {
            await generic.CREATE('developers', { user_id: newUser.insertId, git_name, experience, languages });
        } else if (role_id === '2') {
            await generic.CREATE('recruiters', { user_id: newUser.insertId, company_name });
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

const refreshToken = async (refreshTokenFromCookie) => {
    if (!refreshTokenFromCookie) {
        const error = new Error('No refresh token provided');
        error.status = 401;
        throw error;
    }

    try {
        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_SECRET);
        const user = await userRepository.getUser(decoded.username);
        if (!user) {
            const error = new Error('User not found');
            error.status = 403;
            throw error;
        }

        return jwt.sign(
            { id: user.id, username: user.username, role_id: user.role_id },
            process.env.ACCESS_SECRET,
            { expiresIn: '15m' }
        );
    } catch (error) {
        error.status = error.status || 403;
        throw error;
    }
};

const checkUsername = async (username) => {
    if (!username) {
        throw new Error('Username is required');
    }

    try {
        const isAvailable = await isUsernameAvailable(username);
        if (!isAvailable) {
            const suggestions = [];
            for (let i = 0; i < 5; i++) {
                const suggestion = generateUsername('', 0, 5);
                const suggestionAvailable = await isUsernameAvailable(suggestion);
                if (suggestionAvailable) {
                    suggestions.push(suggestion);
                }
            }
            return { available: false, suggestions };
        } else {
            return { available: true, username };
        }
    } catch (error) {
        console.error('Error checking username:', error);
        throw error;
    }
};

const forgotPassword = async (username) => {
    if (!username) {
        throw new Error('Username is required');
    }

    try {
        const user = await userRepository.getUser(username);
        if (!user) {
            throw new Error('User not found');
        }

        const newPassword = generateRandomPassword();
        const hashedNewPassword = await hashPassword(newPassword);

        await generic.UPDATE('passwords',
            { hashed_password: hashedNewPassword },
            [{ field: 'user_id', value: user.id }]
        );

        await sendPasswordResetEmail(user, newPassword);

        return { success: true, message: 'New password sent to your email address' };
    } catch (error) {
        console.error('Error in forgot password:', error);
        throw error;
    }
};

const getUserCV = async (username) => {
    if (!username) {
        throw new Error('Username is required');
    }

    try {
        const user = await userRepository.getUser(username);
        if (!user) {
            throw new Error('User not found');
        }
        return user.cv_file;
    } catch (error) {
        console.error('Error fetching user CV:', error);
        throw error;
    }
};

const hashPassword = async (plainPassword) => {
    if (!plainPassword) {
        throw new Error('Password is required');
    }

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
    if (!username) {
        throw new Error('Username is required');
    }

    try {
        const user = await userRepository.getUser(username);
        return !user;
    } catch (error) {
        console.error('Error checking username availability:', error);
        throw new Error('Failed to check username availability');
    }
};

module.exports = {
    login,
    register,
    refreshToken,
    checkUsername,
    forgotPassword,
    getUserCV
};