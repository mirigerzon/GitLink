const genericDal = require('../services/genericDal.js');
const dal = require('../services/dal.js');

const bcrypt = require('bcrypt');

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
    const { username, password, email, phone, role, about, profile_image, git_name, experience, languages, company_name
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

    //register to rusers and passwords
    const hashedPassword = await hashPassword(password);
    const generalUser = { username, email, phone, role, about, profile_image };
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

    await genericDal.POST("messages", {
        email: email,
        title: 'WELCOME!',
        content: `💌 - Welcome to our platform, ${username}! We're excited to have you on board.`,
    });

    return {
        id: newUser.insertId,
        ...generalUser,
        ...(role === "developer" && { git_name, experience, languages }),
        ...(role === "recruiter" && { company_name })
    };
};

const hashPassword = async (plainPassword) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
};

module.exports = {
    verifyLogin,
    registerNewUser
};