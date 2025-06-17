import { useContext, } from "react";
import "../../style/Job.css";
import Update from "../common/Update";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { useFetchData } from "../../hooks/fetchData";
import { useLogout } from "../../hooks/LogOut";
import { CurrentUser } from "../../../App";

function Job({ jobData }) {
  const navigate = useNavigate();
  const fetchData = useFetchData();
  const logOut = useLogout();
  const { currentUser, setCurrentUser } = useContext(CurrentUser);

  const handleApply = () => {
    if (!currentUser) {
      Swal.fire({
        title: 'Not logged in',
        text: 'In order to register for a job, you must log in.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Go to login',
        cancelButtonText: 'Ignore',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      method: "POST",
      type: "job_applications",
      body: { user_id: currentUser.id, job_id: jobData.id, email: currentUser.email },
      onSuccess: () => {
        setCurrentUser(prevUser => ({
          ...prevUser,
          initiatedAction: true
        }));
      },
      onError: (err) => {
        console.error(`Failed to fetch developers: ${err}`);
        alert(err);
      },
      logOut,
    });
  };

  return (
    <div className="job-card">
      {/* <Update
        type={"todos"}
        itemId={todo.id}
        setIsChange={setIsChange}
        inputs={["title"]}
      /> */}
      <div className="job-header">
        <div className="job-title-section">
          <p className="company-name">{jobData.company_name}</p>
        </div>
      </div>

      <div className="job-content">
        <div className="job-requirements">
          <h4>Requirements</h4>
          <p>{jobData.requirements}</p>
        </div>

        <div className="job-details">
          <div className="experience-badge">
            <p className="detail-label">Experience:</p>
            <span className="detail-value">{jobData.experience} years</span>
          </div>
          <p className="detail-label">Languages:</p>
          <div className="languages-container">
            {jobData.languages && (
              jobData.languages
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill)
                .map((skill, index) => (
                  <h3 key={index} className="skill-tag">
                    {skill}
                  </h3>
                )))}
          </div>
          <p>views:</p>
          <span>{jobData.views}</span>
        </div>

        <div className="job-actions">
          {currentUser && currentUser.username == jobData.username ?
            <button className="apply-btn" onClick={() => navigate(`/${jobData.username}/jobs/${jobData.id}/apply`)}>
              View Applicants
            </button> : <button className="apply-btn" onClick={handleApply}>
              Apply Now
            </button>}
          <button className="view-company-btn" onClick={() => navigate(`/${jobData.username}/profile`)}>
            View recruiter
          </button>
        </div>
      </div>
    </div>
  );
}

export default Job;
