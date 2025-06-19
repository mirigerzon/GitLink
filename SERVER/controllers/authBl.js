const genericDal = require('../services/genericDal.js');
const dal = require('../services/dal.js');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../services/emailService');

const verifyLogin = async (username, password) => {
    if (!username || !password) throw new Error("Username and password are required");

    const users = await dal.getUser(username);
    if (!users || users.length === 0) throw new Error("Invalid credentials");

    const user = users;
    const hashedPassword = user.hashed_password;

    if (!hashedPassword) throw new Error("Invalid credentials");
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) throw new Error("Invalid credentials");
    delete user.hashed_password;
    return user;
};

const registerNewUser = async (userData) => {
    const { username, password, email, phone, role_id, about, git_name, experience, languages, company_name, cv_file } = userData;
    if (!username || !password || !email || !role_id) throw new Error("Missing required fields");
    if (role_id !== '1' && role_id !== '2') throw new Error("Invalid role");
    if (role_id === '1') {
        if (!git_name) throw new Error("Git name is required for developers");
        const existingDevs = await genericDal.GET("developers", [{ field: "git_name", value: git_name }]);
        if (existingDevs.length > 0) throw new Error("Git name already exists");
    }
    const profile_image = userData.profile_image || 'profile_images/user.png';
    const hashedPassword = await hashPassword(password);
    const generalUser = { username, email, phone, role_id, about, profile_image, cv_file };
    const newUser = await genericDal.CREATE("users", generalUser);
    await genericDal.CREATE("passwords", { user_id: newUser.insertId, hashed_password: hashedPassword });
    if (role_id === '1') {
        await genericDal.CREATE("developers", { user_id: newUser.insertId, git_name, experience, languages });
    } else if (role_id === '2') {
        await genericDal.CREATE("recruiters", { user_id: newUser.insertId, company_name });
    }
    await sendWelcomeEmail(newUser.insertId, email, username);
    return { id: newUser.insertId, ...generalUser, ...(role_id === '1' && { role: 'developer', git_name, experience, languages }), ...(role_id === '2' && { role: 'recruiter', company_name }) };
};

const forgotPassword = async (username) => {
    if (!username) throw new Error("Username is required");

    const users = await dal.getUser(username);
    if (!users || users.length === 0) throw new Error("User not found");

    const user = users[0];
    const newPassword = generateRandomPassword();
    const hashedNewPassword = await hashPassword(newPassword);

    await sendPasswordResetEmail(user, newPassword);

    await genericDal.UPDATE("passwords",
        { hashed_password: hashedNewPassword },
        [{ field: "user_id", value: user.user_id }]
    );

    return { success: true, message: "New password sent to your email address" };
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

const isUsernameAvailable = async (username) => {
    if (!username) throw new Error("Username is required");

    const user = await dal.getUser(username);
    return user ? true : false;
}

module.exports = {
    verifyLogin,
    registerNewUser,
    forgotPassword,
    isUsernameAvailable
};