const dal = require('../services/dal.js');
const genericDal = require('../services/genericDal.js');
const bcrypt = require('bcrypt');

const getDevelopers = () => {
    const res = dal.getDevelopers();
    return res || null;
}

const getDeveloper = (id) => {
    const res = dal.getDeveloper(id);
    return res || null;
}

const getRecruiters = () => {
    const res = dal.getRecruiters();
    return res || null;
}

const getRecruiter = (id) => {
    const res = dal.getRecruiter(id);
    return res || null;
}

const getUser = async (username) => {
    const users = await dal.getUser(username);
    if (!users || users.length === 0)
        return null;
    const user = users[0];
    return user;
}
const getJobApplications = async (job_id) => {
    const applications = await dal.getApplications(job_id);
    return applications;
}

const rateProject = async (username, projectId, rating) => {
    await dal.rateProjectTransactional(username, projectId, rating);

    const projectWithUser = await dal.getProjectWithCreator(projectId);
    if (!projectWithUser || projectWithUser.length === 0)
        throw new Error("Project or creator not found.");

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
    await genericDal.PUT("developers", {
        rating: userRating
    }, [{ field: "git_name", value: gitName }]);
};

async function createApply(data, email) {
    if (Array.isArray(data)) {
        data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
    }
    let response;
    try {
        response = await genericDal.POST('job_applications', data);
    } catch (err) {
        if (err.message.includes('Duplicate ') || err.code === '23505') {
            throw new Error('You have already contacted the recruiter for this position. Please wait for a response before sending another message.');
        }
        throw err;
    }
    await genericDal.POST("messages", {
        user_id: data.user_id,
        email: email,
        title: 'Application Received!',
        content: `We have received your application for job number ${data.job_id}. The recruiter has been notified. We wish you the best of luck!`
    });
    return response;
}

module.exports = {
    getJobApplications,
    getDevelopers,
    getDeveloper,
    getRecruiters,
    getUser,
    getRecruiter,
    rateProject,
    createApply
};