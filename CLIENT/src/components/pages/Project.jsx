import "../../style/Project.css";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { CurrentUser } from "../../../App";
import { fetchData } from "../../hooks/fetchData";

function Project({ projectData }) {
  const navigate = useNavigate();
  const { currentUser } = useContext(CurrentUser);
  const [hasRated, setHasRated] = useState(false);

  const isOwner = currentUser?.git_name === projectData.git_name;
  const canRate = currentUser && !isOwner && !hasRated;

  const handleRate = (rating) => {
    fetchData({
      type: "projects/rate",
      role: currentUser ? `/${currentUser.role}` : "gousts",
      method: "POST",
      body: {
        project_id: projectData.id,
        rating,
      },
      onSuccess: () => {
        setHasRated(true);
        alert("Thanks for rating!");
      },
      onError: (err) => {
        console.error("Rating failed", err);
        alert("Rating failed");
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

      {canRate && (
        <div className="rating-section">
          <p>Rate this project:</p>
          {[1, 2, 3, 4, 5].map((num) => (
            <button key={num} onClick={() => handleRate(num)}>
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Project;