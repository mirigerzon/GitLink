import { React, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CurrentUser } from "../../../App";
import { fetchData } from "../../hooks/fetchData";
import { useLogout } from "../../hooks/LogOut";
import Update from "../common/Update";
import Delete from "../common/Delete";
// import Add from "../common/Add";
import "../../style/Profile.css";

function Profile() {
  const { username } = useParams();
  const { currentUser } = useContext(CurrentUser);
  const [isChange, setIsChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [projectsToAdd, setProjectToAdd] = useState(null);
  const [existingDeliverables, setExistingDeliverables] = useState(null);
  const [openRepo, setOpenRepo] = useState(null);
  const [userItemsType, setUserItemsType] = useState(null)
  const logOut = useLogout();
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    setIsChange(0);
    setLoading(true);
    fetchData({
      type: `users/${username}`,
      params: { "username": username },
      role: currentUser ? `/${currentUser.role}` : "/guest",
      onSuccess: (data) => {
        setUserData(data);
        setLoading(false);
        setUserItemsType(data.role == "developer" ? "projects" : "jobs");
      },
      onError: (err) => {
        setError(`Failed to fetch ${userItemsType} data: ${err}`);
        setLoading(false);
      },
    });
  }, [username, isChange]);

  useEffect(() => {
    if (!userItemsType) return;
    setIsChange(0);
    setLoading(true);
    fetchData({
      type: userItemsType,
      params: { "username": username },
      role: currentUser ? `/${currentUser.role}` : "/guest",
      onSuccess: (data) => {
        setExistingDeliverables(data);
        setLoading(false);
      },
      onError: (err) => {
        setError(`Failed to fetch developer data: ${err}`);
        setLoading(false);
      },
    });
  }, [username, isChange, userItemsType]);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!userData)
    return <div className="profile-error">Developer not found</div>;

  const isOwnProfile = currentUser && username === currentUser.username;

  async function getGithubRepoNames() {
    const url = `https://api.github.com/users/${userData.git_name}/repos?per_page=100`;
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
          setOpenRepo(null);
          reset();
          setIsChange(1);
        },
        onError: (error) => {
          console.log("add was unsuccessful", error);
          alert(error);
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
    {
      userItemsType == 'developer' ?
        reset({
          git_name: currentUser.git_name,
          username: currentUser.username,
          name: repo.name,
          forks_count: repo.forks_count,
          url: repo.html_url,
          languages: repo.languages,
          details: repo.details || "",
        }) : (reset({
          username: currentUser.username,
          company_name: currentUser.company_name,
          requirements: repo.requirements,
          experience: repo.experience,
          languages: repo.languages,
          details: repo.details || "",
        }) && setOpenRepo(1));
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-section">
          <img
            src={userData.profile_image || "/default-avatar.png"}
            alt={`${userData.name}'s profile`}
            className="profile-image"
          />
          <button onClick={() => navigate(`/${username}/${userItemsType}`)}>
            view all {userItemsType}
          </button>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{userData.username}</h1>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{userData.role}</span>
              <span className="detail-label">Email:</span>
              <span className="detail-value">{userData.email}</span>
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{userData.phone}</span>
              <span className="detail-label">Experience:</span>
              <span className="detail-value">{userData.experience} years</span>
              <span className="detail-label">Rating:</span>
              <span className="detail-value">{userData.rating}/5 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>About</h2>
          <p className="profile-description">
            {userData.about || "No description available"}
          </p>
          <h2>Programming Languages</h2>
          <div className="languages-container">
            {userData.languages && userData.languages.length > 0 ? (
              userData.languages
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
        <div className="profile-section">
          <h2>Existing {userItemsType}</h2>
          <ul>
            {existingDeliverables ? (
              existingDeliverables.map((item) => (
                <li key={item.id}>
                  {item.name}
                  <button
                    onClick={() =>
                      navigate(
                        `/${item.username}/${userItemsType}/${item.id}`)}> view
                  </button>
                  {isOwnProfile && (
                    <><Delete
                      className="delete_btn"
                      type={userItemsType}
                      itemId={item.id}
                      setIsChange={setIsChange}
                      role={currentUser ? `/${currentUser.role}` : null}
                    />
                      <Update
                        type={userItemsType}
                        itemId={item.id}
                        setIsChange={setIsChange}
                        inputs={["name", "details"]}
                        role={currentUser ? `/${currentUser.role}` : null}
                      /></>)}
                </li>
              ))
            ) : (
              <p>no {userItemsType} found</p>
            )}
          </ul>
          {isOwnProfile && (<>
            <h2>{userItemsType} Management</h2>
            <div className="project-actions">
              <button
                className="action-btn add-btn"
                onClick={getGithubRepoNames}
              >
                Add {userItemsType}
              </button>
            </div>

            {projectsToAdd && (
              <div className="projectsToAdd">
                <div className="projectsName">
                  <h3>Projects can be added:</h3>
                  <ul>
                    {projectsToAdd.map((repo) => {
                      const alreadyExists = existingDeliverables?.some(
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
          </>)}
        </div>
      </div>
    </div>
  )
}

export default Profile;
