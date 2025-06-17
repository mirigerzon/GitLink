import { useNavigate, useParams } from "react-router-dom";
import { FiUser, FiStar, FiFolder } from 'react-icons/fi';
import { useState, useEffect, useContext } from "react";
import { useFetchData } from "../../hooks/fetchData";
import { useLogout } from "../../hooks/LogOut";
import { CurrentUser } from "../../../App";
import '../../style/ApplyUsers.css';
function ApplyUsers() {
    const navigate = useNavigate();
    const fetchData = useFetchData();
    const logOut = useLogout();
    const { currentUser } = useContext(CurrentUser);
    const { id } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [isChange, setIsChange] = useState(0);

    useEffect(() => {
        setIsChange(0);
        fetchData({
            role: currentUser ? `/${currentUser.role}` : "/guest",
            type: `job_applications/${id}`,
            method: "GET",
            onSuccess: (data) => {
                setApplicants(data);
            },
            onError: (err) => console.error(`Failed to fetch applications: ${err}`),
            logOut,
        });
    }, [currentUser, isChange]);

    return (
        <div className="applications-container">
            <h2>Applicants for Job #{id}</h2>

            {applicants.length === 0 ? (
                <p>No applicants yet.</p>
            ) : (
                <div className="applicants-grid">
                    {applicants.map(applicant => (
                        <div key={applicant.id} className="applicant-card">
                            <img
                                src={applicant.profile_image || "/images/default-profile.png"}
                                alt={`${applicant.username}'s profile`}
                                className="profile-image"
                            />
                            <h3>{applicant.username}</h3>
                            <p><FiUser /> {applicant.role}</p>
                            <p><FiStar /> Rating: {applicant.rating ?? "N/A"}</p>
                            {(applicant.languages ?? "")
                                .split(",")
                                .map((skill) => skill.trim())
                                .filter((skill) => skill)
                                .map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill}
                                    </span>
                                ))}
                            <p>Email: {applicant.email}</p>
                            <p>Phone: {applicant.phone}</p>
                            <p>GitHub: {applicant.git_name}</p>
                            <p>Experience: {applicant.experience}</p>
                            <p>About: {applicant.about}</p>
                            {applicant.remark && <p><strong>Remark:</strong> {applicant.remark}</p>}
                            {applicant.cv_file ? (
                                <a
                                    href={`/uploads/cv_files/${applicant.cv_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cv-link"
                                >
                                    View CV
                                </a>
                            ) : (
                                <p className="no-cv">No CV uploaded</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}

export default ApplyUsers;