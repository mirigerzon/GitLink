const dal = require('../models/dal.js');
const { updateUserRating } = require('./developerService');

const rateProject = async (username, projectId, rating) => {
    try {
        await dal.rateProjectTransactional(username, projectId, rating);

        const projectWithUser = await dal.getProjectWithCreator(projectId);
        if (!projectWithUser?.length) {
            throw new Error("Project or creator not found.");
        }

        const gitName = projectWithUser[0].git_name;
        await updateUserRating(gitName);
    } catch (error) {
        console.error('Error rating project:', error);
        throw error;
    }
};

const updateUserRating = async (gitName) => {
    try {
        const creatorProjects = await genericDal.GET("projects", [
            { field: "git_name", value: gitName }
        ]);

        const ratedProjects = creatorProjects.filter(p => p.rating_count > 0);
        if (ratedProjects.length === 0) return;

        const totalRatings = ratedProjects.reduce((sum, p) => sum + p.rating * p.rating_count, 0);
        const totalCount = ratedProjects.reduce((sum, p) => sum + p.rating_count, 0);
        const userRating = totalCount > 0 ? Math.round((totalRatings / totalCount) * 100) / 100 : null;

        await genericDal.UPDATE("developers", { rating: userRating }, [
            { field: "git_name", value: gitName }
        ]);
    } catch (error) {
        console.error('Error updating user rating:', error);
        throw new Error('Failed to update user rating');
    }
};

module.exports = {
    rateProject
};
