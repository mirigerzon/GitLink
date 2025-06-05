import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CurrentUser } from "../../../App";
import { fetchData } from "../../hooks/fetchData";
import { useLogout } from "../../hooks/LogOut";
import Update from "../common/Update";
import Delete from "../common/Delete";
import "../../style/Profile.css";

function Profile() {
  const { gitName } = useParams();
  const { currentUser } = useContext(CurrentUser);
  const [isChange, setIsChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [developerData, setDeveloperData] = useState(null);
  const [projectsToAdd, setProjectToAdd] = useState(null);
  const [existingProjects, setExistingProjects] = useState(null);
  const [openRepo, setOpenRepo] = useState(null);
  const logOut = useLogout();
  const { register, handleSubmit, reset } = useForm();
  const nuvigate = useNavigate();

  useEffect(() => {
    setIsChange(0);
    setLoading(true);
    fetchData({
      type: "users",
      params: { git_name: gitName },
      role: currentUser ? `/${currentUser.role}` : "/guest",
      onSuccess: (data) => {
        setDeveloperData(data[0]);
        setLoading(false);
      },
      onError: (err) => {
        setError(`Failed to fetch developer data: ${err}`);
        setLoading(false);
      },
    });
  }, [gitName, isChange]);

  useEffect(() => {
    setIsChange(0);
    setLoading(true);
    fetchData({
      type: "projects",
      params: { git_name: gitName },
      role: currentUser ? `/${currentUser.role}` : "/guest",
      onSuccess: (data) => {
        setExistingProjects(data);
        setLoading(false);
      },
      onError: (err) => {
        setError(`Failed to fetch developer data: ${err}`);
        setLoading(false);
      },
    });
  }, [gitName, isChange]);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!developerData)
    return <div className="profile-error">Developer not found</div>;

  const isOwnProfile = currentUser && gitName === currentUser.git_name;

  async function getGithubRepoNames() {
    const url = `https://api.github.com/users/${gitName}/repos?per_page=100`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const repos = await response.json();
      setProjectToAdd(repos);
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  }

  async function onSubmit(data) {
    console.log("Adding project with data:", data);
    try {
      await fetchData({
        type: "projects",
        role: "/developer",
        method: "POST",
        body: data,
        onSuccess: (result) => {
          console.log("add successful:", result);
          setIsChange(1);
          setOpenRepo(null);
          reset();
        },
        onError: (error) => {
          console.log("add was unsuccessful", error);
        },
        logOut,
      });
    } catch (error) {
      console.log("Unexpected error:", error);
    }
    reset();
  }

  function openAddForm(repo) {
    setOpenRepo(repo);
    reset({
      git_name: gitName,
      name: repo.name,
      forks_count: repo.forks_count,
      url: repo.html_url,
      languages: repo.languages,
      details: repo.details || "",
    });
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-section">
          <img
            src={developerData.profile_image || "/default-avatar.png"}
            alt={`${developerData.name}'s profile`}
            className="profile-image"
          />
          <button onClick={() => nuvigate(`/${gitName}/projects`)}>
            view all projects
          </button>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{developerData.username}</h1>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{developerData.role}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{developerData.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{developerData.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Experience:</span>
              <span className="detail-value">
                {developerData.experience} years
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rating:</span>
              <span className="detail-value">{developerData.rating}/5 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>About</h2>
          <p className="profile-description">
            {developerData.about || "No description available"}
          </p>
          <h2>Programming Languages</h2>
          <div className="languages-container">
            {developerData.languages && developerData.languages.length > 0 ? (
              developerData.languages
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill)
                .map((skill, index) => (
                  <h3 key={index} className="skill-tag">
                    {skill}
                  </h3>
                ))
            ) : (
              <p>No programming languages specified</p>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <div className="profile-section">
            <h2>Existing Projects</h2>
            <ul>
              {existingProjects ? (
                existingProjects.map((project) => (
                  <li key={project.id}>
                    {project.name}
                    <button
                      onClick={() =>
                        nuvigate(
                          `/${currentUser.git_name}/projects/${project.id}`
                        )
                      }
                    >
                      view
                    </button>
                    <Delete
                      className="delete_btn"
                      type={"projects"}
                      itemId={project.id}
                      setIsChange={setIsChange}
                      role={currentUser ? `/${currentUser.role}` : null}
                    />
                    <Update
                      type={"projects"}
                      itemId={project.id}
                      setIsChange={setIsChange}
                      inputs={["name"]}
                      role={currentUser ? `/${currentUser.role}` : null}
                    />
                  </li>
                ))
              ) : (
                <p>no projects found</p>
              )}
            </ul>
            <h2>Project Management</h2>
            <div className="project-actions">
              <button
                className="action-btn add-btn"
                onClick={getGithubRepoNames}
              >
                Add Projects
              </button>
            </div>

            {projectsToAdd && (
              <div className="projectsToAdd">
                <div className="projectsName">
                  <h3>Projects can be added:</h3>
                  <ul>
                    {projectsToAdd.map((repo) => {
                      const alreadyExists = existingProjects?.some(
                        (project) => project.name === repo.name
                      );
                      return (
                        <li key={repo.id}>
                          {repo.name}
                          <button
                            disabled={alreadyExists}
                            onClick={() => openAddForm(repo)}
                          >
                            add
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {openRepo && (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="project-form"
                  >
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Project name"
                        className="form-input"
                        {...register("name", { required: true })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Languages used"
                        className="form-input"
                        {...register("languages", { required: true })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <textarea
                        placeholder="Description"
                        className="form-input textarea"
                        {...register("details")}
                      />
                    </div>

                    <div className="form-buttons">
                      <button type="submit" className="submit-btn">
                        Add
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setOpenRepo(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
