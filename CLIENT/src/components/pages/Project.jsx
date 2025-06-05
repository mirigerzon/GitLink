import "../../style/Project.css";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { CurrentUser } from "../../../App";
import { fetchData } from "../../hooks/fetchData";

function Project({ projectData, setIsChange }) {
  const navigate = useNavigate();
  const { currentUser } = useContext(CurrentUser);
  const [selectedRating, setSelectedRating] = useState(0);

  const isOwner = currentUser?.git_name === projectData.git_name;
  // allow slider visible always, but rating only allowed if connected, not owner, and not rated yet
  const canRate = currentUser && !isOwner;

  const handleRate = () => {
    if (!currentUser) {
      alert("You must be logged in to rate this project.");
      return;
    }
    if (selectedRating < 1) {
      alert("Please select a rating before submitting.");
      return;
    }
    fetchData({
      type: "projects/rate",
      role: currentUser ? `/${currentUser.role}` : "guests",
      method: "POST",
      body: {
        project_id: projectData.id,
        rating: selectedRating,
      },
      onSuccess: (res) => {
        setIsChange(1);
        alert(`${res.message}`);
        setSelectedRating(0);
      },
      onError: (err) => {
        console.error("Rating failed", err);
        alert(`${err}`);
        setSelectedRating(0);
      },
    });
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h3 className="project-name">{projectData.name}</h3>
        <div className="project-stats">
          <div className="stat">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{projectData.commits}</span>
            <span className="stat-label">Commits</span>
          </div>
          <div className="stat">
            <span className="stat-icon">👀</span>
            <span className="stat-value">{projectData.views}</span>
            <span className="stat-label">Views</span>
          </div>
        </div>
      </div>
      <div>
        <p>
          link to GitHub → <a target="_blank" href={projectData.url}>{projectData.url}</a>
        </p>
      </div>
      <div className="project-data">
        <h4>Technologies:</h4>
        <div className="languages-list">
          {(projectData.languages ?? "")
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
            .map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
        </div>
        <h4>description:</h4>
        <p>{projectData.details}</p>
      </div>

      <div className="project-actions">
        <button
          className="btn-primary"
          onClick={() => navigate(`/${projectData.git_name}/profile`)}
        >
          View Developer
        </button>

        {false && (
          <button
            className="btn-admin"
            onClick={() => console.log("Hide project")}
          >
            Hide Project
          </button>
        )}
      </div>

      <div className="rating-section">
        <p>Rate this project: {selectedRating}</p>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={selectedRating}
          onChange={(e) => setSelectedRating(Number(e.target.value))}
          className="rating-slider"
        />
        <button
          onClick={handleRate}
          className="btn-primary"
        >
          Submit Rating
        </button>
      </div>
      </div>
  );
}

export default Project;
