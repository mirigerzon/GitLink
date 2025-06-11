import "../../style/Recruiter.css";
import { useNavigate } from "react-router-dom";

function Recruiter({ recruiterData }) {
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

  const experienceInfo = getExperienceLevel(recruiterData.experience);

  return (
    <div className="recruiter-card">
      <div className="recruiter-header">
        <div className="avatar">
          <img
            src={recruiterData.profile_image}
            alt={`${recruiterData.name} avatar`}
            className="avatar-img"
          />
          <div className="online-indicator"></div>
        </div>

        <div className="recruiter-info">
          <h3 className="recruiter-name">{recruiterData.name}</h3>
          <p className="git-name">@{recruiterData.git_name}</p>

          <div
            className="experience-badge"
            style={{ backgroundColor: experienceInfo.color }}
          >
            <span>{experienceInfo.level}</span>
            <span>{recruiterData.experience} years</span>
          </div>
        </div>
      </div>

      <div className="skills-section">
        <div className="skills-list">
          {(recruiterData.languages ?? "")
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

      <div className="recruiter-actions">
        <button
          className="btn-profile"
          onClick={() => navigate(`/${recruiterData.username}/profile`)}
        >
          <span className="btn-icon">👤</span>
          View Profile
        </button>

        <button
          className="btn-jobs"
          onClick={() => navigate(`/${recruiterData.username}/jobs`)}
        >
          <span className="btn-icon">📁</span>
          View Jobs
        </button>
      </div>

      <div className="card-overlay"></div>
    </div>
  );
}

export default Recruiter;
