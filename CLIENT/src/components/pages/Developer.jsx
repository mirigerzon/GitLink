import "../../style/Developer.css";
import { useNavigate } from "react-router-dom";
import { FiUser, FiStar, FiFolder } from 'react-icons/fi';

function Developer({ developerData }) {
  const navigate = useNavigate();

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

  const experienceInfo = getExperienceLevel(developerData.experience);

  return (
    <div className="developer-card">
      <div className="developer-header">
        <div className="avatar">
          <img
            src={developerData.profile_image}
            alt={`${developerData.username} avatar`}
            className="avatar-img"
          />
          <div className="online-indicator"></div>
        </div>

        <div className="developer-info">
          <h3 className="developer-name">{developerData.name}</h3>
          <p className="git-name">@{developerData.git_name}</p>

          <div
            className="experience-badge"
            style={{ backgroundColor: experienceInfo.color }}
          >
            <span>{experienceInfo.level}</span>
            <span>{developerData.experience} years</span>
          </div>
        </div>
      </div>

      <div className="developer-stats">
        {/* <div className="stat-item">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <span className="stat-number">{developerData.projectsCount}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div> */}

        <div className="stat-item">
          <div className="stat-icon"><FiStar /></div>
          <div className="stat-content">
            <span className="stat-number">{developerData.rating}</span>
            <div className="rating-stars">
              {generateStars(developerData.rating)}
            </div>
          </div>
        </div>
      </div>

      <div className="skills-section">
        <div className="skills-list">
          {(developerData.languages ?? "")
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

      <div className="developer-actions">
        <button
          className="btn-profile"
          onClick={() => navigate(`/${developerData.username}/profile`)}
        >
          <FiUser className="btn-icon" />
        </button>

        <button
          className="btn-projects"
          onClick={() => navigate(`/${developerData.username}/projects`)}
        >
          <FiFolder className="btn-icon" />
        </button>
      </div>

      <div className="card-overlay"></div>
    </div>
  );
}

export default Developer;