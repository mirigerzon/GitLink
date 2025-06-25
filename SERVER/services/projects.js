const projectsRepository = require('../repositories/projects');
const generic = require('../repositories/generic');

const rateProject = async (username, projectId, rating) => {
    if (!username || !projectId || !rating) {
        throw new Error('Username, project ID, and rating are required');
    }

    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    try {
        await projectsRepository.rateProjectTransactional(username, projectId, rating);

        const projectWithUser = await projectsRepository.getProjectWithCreator(projectId);
        if (!projectWithUser?.length) {
            throw new Error('Project or creator not found');
        }

        const gitName = projectWithUser[0].git_name;
        await updateUserRating(gitName);
    } catch (error) {
        console.error('Error rating project:', error);
        throw error;
    }
};

const updateUserRating = async (gitName) => {
    if (!gitName) {
        throw new Error('Git name is required');
    }

    try {
        await projectsRepository.updateDeveloperRating(gitName);
    } catch (error) {
        console.error('Error updating user rating:', error);
        throw new Error('Failed to update user rating');
    }
};

module.exports = {
    rateProject
};