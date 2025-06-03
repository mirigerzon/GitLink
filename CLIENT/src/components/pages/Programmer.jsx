import "../../style/Programmer.css";
import { Link, useNavigate, Outlet } from "react-router-dom";
// import { CurrentUser } from "../../../App";
// import { useContext } from "react";

function Programmer({ programmerData }) {
  const navigate = useNavigate();
//   const { currentUser } = useContext(CurrentUser);

  const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </div>
    );
  };

  const getExperienceLevel = (years) => {
    if (years <= 2) return { level: "Junior", color: "#10b981" };
    if (years <= 5) return { level: "Mid Level", color: "#f59e0b" };
    return { level: "Senior", color: "#ef4444" };
  };

  const experienceInfo = getExperienceLevel(programmerData.experience);

  return (
    <div className="programmer-card">
      <div className="programmer-header">
        <div className="avatar">
          <img
            src={programmerData.profile_image}
            alt={`${programmerData.name} avatar`}
            className="avatar-img"
          />
          <div className="online-indicator"></div>
        </div>

        <div className="programmer-info">
          <h3 className="programmer-name">{programmerData.name}</h3>
          <p className="git-name">@{programmerData.git_name}</p>

          <div
            className="experience-badge"
            style={{ backgroundColor: experienceInfo.color }}
          >
            <span>{experienceInfo.level}</span>
            <span>{programmerData.experience} years</span>
          </div>
        </div>
      </div>

      <div className="programmer-stats">
        <div className="stat-item">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <span className="stat-number">{programmerData.projectsCount}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <span className="stat-number">{programmerData.rating}</span>
            <div className="rating-stars">
              {generateStars(programmerData.rating)}
            </div>
          </div>
        </div>
      </div>

      <div className="skills-section">
        <div className="skills-list">
          {(programmerData.languages ?? "")
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
            .map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
        </div>
      </div>

      <div className="programmer-actions">
        <button
          className="btn-profile"
          onClick={() => navigate(`/${programmerData.git_name}/profile`)}
        >
          <span className="btn-icon">👤</span>
          View Profile
        </button>

        <button
          className="btn-projects"
          onClick={() => navigate(`/${programmerData.git_name}/projects`)}
        >
          <span className="btn-icon">📁</span>
          View Projects
        </button>
      </div>

      <div className="card-overlay"></div>
    </div>
  );
}

export default Programmer;
