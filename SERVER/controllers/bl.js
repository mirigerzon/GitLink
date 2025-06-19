const dal = require('../services/dal.js');
const genericDal = require('../services/genericDal.js');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../services/emailService');
const { sendPasswordChangeWarningEmail } = require('../services/emailService');

const getUsers = async () => {
    const users = await dal.getUsers();
    if (!users || users.length === 0) return null;
    return users;
}

const getUser = async (username) => {
    if (!username) throw new Error("Username is required");

    const users = await dal.getUser(username);
    if (!users || users.length === 0) return null;

    return users;
}

const updateUserStatus = async (table, body, conditions) => {
    const { email, id } = body;
    const data = { status: body.status };
    const messageData = {
        user_id: id,
        email: email,
        title: body.status === 0 ? 'Account Blocked' : 'Account Active',
        content: body.status === 0
            ? `Your account has been blocked due to a violation of our policies.  
                Please contact support if you have questions.  
                - The Support Team`
            : `Your account has been reactivated.  
                Welcome back! If you have any questions, please contact support.  
                - The Support Team`
    };
    await genericDal.updateAndInformUser(table, data, conditions, messageData);
}

const getDevelopers = () => {
    const res = dal.getUsersByRole('developer');
    return res || null;
}

const getDeveloper = (id) => {
    const res = dal.getUserWithRoleData(id, 'developer');
    return res || null;
}

const getRecruiters = () => {
    const res = dal.getUsersByRole('recruiter');
    return res || null;
}

const getRecruiter = (id) => {
    const res = dal.getUserWithRoleData(id, 'recruiter');
    return res || null;
}

const getJobApplications = async (job_id) => {
    const applications = await dal.getApplications(job_id);
    return applications;
}

const rejectApplicant = async (body, job_id) => {
    const { developerId, developerEmail } = body;
    const messageData = {
        user_id: developerId,
        email: developerEmail,
        title: 'Application Rejected',
        content: `Thank you for applying for Job #123.  
            After careful review, we have decided to move forward with other candidates.  
            We appreciate your interest and wish you success in your journey.
            - The Recruitment Team`,
    };
    await dal.rejectApplicant(job_id, developerId, messageData);
}

const notifyApplicant = async ({ email, title, content }) => {
    await sendEmail({
        to: email,
        subject: title,
        html: content
    });
}

const rateProject = async (username, projectId, rating) => {
    await dal.rateProjectTransactional(username, projectId, rating);

    const projectWithUser = await dal.getProjectWithCreator(projectId);
    if (!projectWithUser || projectWithUser.length === 0) throw new Error("Project or creator not found.");

    const gitName = projectWithUser[0].git_name;
    await updateUserRating(gitName);
};

async function updateUserRating(gitName) {
    const creatorProjects = await genericDal.GET("projects", [
        { field: "git_name", value: gitName }
    ]);
    const ratedProjects = creatorProjects.filter(p => p.rating_count > 0);
    const totalRatings = ratedProjects.reduce((sum, p) => sum + p.rating * p.rating_count, 0);
    const totalCount = ratedProjects.reduce((sum, p) => sum + p.rating_count, 0);
    const userRating = totalCount > 0 ? Math.round((totalRatings / totalCount) * 100) / 100 : null;
    await genericDal.UPDATE("developers", {
        rating: userRating
    }, [{ field: "git_name", value: gitName }]);
};

async function createApply(data, email) {
    if (Array.isArray(data)) {
        data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
    }
    let response;
    try {
        response = await genericDal.CREATE('job_applications', data);
    } catch (err) {
        if (err.message.includes('Duplicate ') || err.code === '23505') {
            throw new Error('You have already contacted the recruiter for this position. Please wait for a response before sending another message.');
        }
        throw err;
    }
    await genericDal.CREATE("messages", {
        user_id: data.user_id,
        email: email,
        title: 'Application Received!',
        content: `We have received your application for job number ${data.job_id}. The recruiter has been notified. We wish you the best of luck!`
    });
    return response;
}

const changeUserPassword = async (userId, currentPassword, newPassword, email) => {
    if (!userId || !currentPassword || !newPassword) throw new Error("All password fields are required");

    const passwords = await genericDal.GET('passwords', [
        { field: 'user_id', value: userId }
    ]);
    if (!passwords || passwords.length === 0) throw new Error('User not found');

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, passwords[0].hashed_password);
    if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const conditions = [{ field: 'user_id', value: userId }];

    sendPasswordChangeWarningEmail(userId, email)

    return await genericDal.UPDATE('passwords',
        { hashed_password: hashedNewPassword },
        conditions
    );
};

module.exports = {
    getUsers,
    getUser,
    updateUserStatus,
    getJobApplications,
    getDevelopers,
    getDeveloper,
    getRecruiters,
    getRecruiter,
    rateProject,
    createApply,
    changeUserPassword,
    rejectApplicant,
    notifyApplicant
};

// const updateUserProfile = async (userId, userData) => {
//     if (!userId) throw new Error("User ID is required");

//     const conditions = [{ field: 'id', value: userId }];
//     return await genericDal.UPDATE('users', userData, conditions);
// };

