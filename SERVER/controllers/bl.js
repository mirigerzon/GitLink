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
  const newRating =
    ((project.rating || 0) * (project.numOfRatings || 0) + rating) /
    ((project.numOfRatings || 0) + 1);

  return await dal.PUT("projects", {
    rating: newRating,
    numOfRatings: (project.numOfRatings || 0) + 1
  }, [{ field: "id", value: projectId }]);
}



module.exports = {
  getItemByConditions,
  deleteItem,
  createItem,
  updateItem,
  rateProject,
};
