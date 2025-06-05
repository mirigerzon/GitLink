const dal = require('../services/dal.js');
const bcrypt = require('bcrypt');

const getItemByConditions = async (table, conditions = []) => {
  const res = await dal.GET(table, conditions);
  return res || null;
};

const deleteItem = async (table, conditions = []) => {
  return await dal.DELETE(table, conditions);
};

const createItem = async (table, data) => {
  return await dal.POST(table, data);
};

const updateItem = async (table, data, conditions = []) => {
  return await dal.PUT(table, data, conditions);
};

async function rateProject(userGitName, projectId, rating) {
  const existing = await dal.GET("project_ratings", [
    { field: "git_name", value: userGitName },
    { field: "project_id", value: projectId }
  ]);
  if (existing.length > 0) throw new Error("User has already rated this project.");

  await dal.POST("project_ratings", {
    git_name: userGitName,
    project_id: projectId,
    rating
  });

  const project = (await dal.GET("projects", [{ field: "id", value: projectId }]))[0];
  const newProjectRating = Math.round((
    ((project.rating || 0) * (project.rating_count || 0) + rating) /
    ((project.rating_count || 0) + 1)
  ) * 100) / 100;

  await dal.PUT("projects", {
    rating: newProjectRating,
    rating_count: (project.rating_count || 0) + 1
  }, [{ field: "id", value: projectId }]);

  await updateUserRating(project.git_name);
}

async function updateUserRating(gitName) {
  const creatorProjects = await dal.GET("projects", [
    { field: "git_name", value: gitName }
  ]);
  const ratedProjects = creatorProjects.filter(p => p.rating_count > 0);
  const totalRatings = ratedProjects.reduce((sum, p) => sum + p.rating * p.rating_count, 0);
  const totalCount = ratedProjects.reduce((sum, p) => sum + p.rating_count, 0);
  const userRating = totalCount > 0 ? Math.round((totalRatings / totalCount) * 100) / 100 : null;

  await dal.PUT("users", {
    rating: userRating
  }, [{ field: "git_name", value: gitName }]);
}

module.exports = {
  getItemByConditions,
  deleteItem,
  createItem,
  updateItem,
  rateProject,
};
