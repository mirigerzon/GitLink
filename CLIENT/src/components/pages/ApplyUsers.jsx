import { useParams } from "react-router-dom";
import { FiUser, FiStar, FiFolder, FiMail, FiTrash2, FiEdit, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from "react";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut";
import { useCurrentUser } from "../../context.jsx";
import '../../style/ApplyUsers.css';

function ApplyUsers() {
    const fetchData = useFetchData();
    const logOut = useLogout();
    const { currentUser } = useCurrentUser();
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
    }, [isChange]);

    const handleSendEmail = (applicant) => {
        applicant;
    };

    const submitEmail = () => {

    };

    const handleDeleteJob = () => {
        // if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
    };

    const handleMarkAsFilled = () => {
        // if (window.confirm('Mark this job as filled?')) {

        // }
    };

    const handleEditJob = () => {
        // console.log('Editing job:', id);

        // alert('Redirecting to edit job...'); // זמני
    };

    return (
        <div className="applications-container">
            <div className="header-section">
                <h2>Applicants for Job #{id}</h2>
            </div>

            {applicants.length === 0 ? (
                <p>No applicants yet.</p>
            ) : (
                <div className="applicants-grid">
                    {applicants.map(applicant => (<>
                        <div key={applicant.id} className="applicant-card">
                            <div className="job-management-buttons">
                                <button
                                    className="edit-job-btn"
                                    onClick={handleEditJob}
                                    title="Edit Job"
                                >
                                    <FiEdit /> Edit Job
                                </button>
                                <button
                                    className="mark-filled-btn"
                                    onClick={handleMarkAsFilled}
                                    title="Mark as Filled"
                                >
                                    <FiCheck /> Mark as Filled
                                </button>
                                <button
                                    className="delete-job-btn"
                                    onClick={handleDeleteJob}
                                    title="Delete Job"
                                >
                                    <FiTrash2 /> Delete Job
                                </button>
                                <button
                                    className="send-email-btn"
                                    onClick={() => handleSendEmail(applicant)}
                                    title="Send Job Offer Email"
                                >
                                    <FiMail /> Send Offer
                                </button>
                            </div>
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

                            <div className="applicant-actions">
                                {applicant.cv_file ? (
                                    <a
                                        href={`/uploads/cv_files/${applicant.cv_file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cv-link"
                                    >
                                        <FiFolder /> View CV
                                    </a>
                                ) : (
                                    <p className="no-cv">No CV uploaded</p>
                                )}
                            </div>
                        </div>
                    </>))}
                </div>
            )}

            {/* {showEmailModal && (
                <div className="email-modal-overlay">
                    <div className="email-modal">
                        <div className="modal-header">
                            <h3>Send Job Offer Email</h3>
                            <button
                                className="close-modal"
                                onClick={() => setShowEmailModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="recipient-info">
                                <p><strong>To:</strong> {selectedApplicant?.email}</p>
                                <p><strong>Applicant:</strong> {selectedApplicant?.username}</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email-subject">Subject:</label>
                                <input
                                    id="email-subject"
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="email-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email-body">Message:</label>
                                <textarea
                                    id="email-body"
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="email-textarea"
                                    rows="8"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowEmailModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="send-btn"
                                onClick={submitEmail}
                            >
                                <FiMail /> Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default ApplyUsers;