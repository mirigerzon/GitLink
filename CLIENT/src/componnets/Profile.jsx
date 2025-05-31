import React, { useState, useEffect, useContext, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CurrentUser } from './App.jsx';
import { fetchData } from './FetchData';
import '../style/Profile.css';

function Profile() {
    const { gitName } = useParams();
    const { currentUser } = useContext(CurrentUser);
    const [isChange, setIsChange] = useState(0);
    const [programmerData, setProgrammerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        setIsChange(0);
        setLoading(true);
        fetchData({
            type: "users",
            params: { git_name: gitName },
            onSuccess: (data) => {
                setProgrammerData(data[0]);
                setLoading(false);
            },
            onError: (err) => {
                setError(`Failed to fetch programmer data: ${err}`);
                setLoading(false);
            },
        });
    }, [gitName, isChange]);

    if (loading) return <div className="profile-loading">Loading profile...</div>;
    if (error) return <div className="profile-error">{error}</div>;
    if (!programmerData) return <div className="profile-error">Programmer not found</div>;

    const isOwnProfile = currentUser && gitName === currentUser.git_name;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-image-section">
                    <img
                        src={programmerData.profileImage || "/default-avatar.png"}
                        alt={`${programmerData.name}'s profile`}
                        className="profile-image"
                    />
                </div>

                <div className="profile-info">
                    <h1 className="profile-name">{programmerData.username}</h1>
                    <div className="profile-details">
                        <div className="detail-item">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value">{programmerData.role}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{programmerData.email}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{programmerData.phone}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Experience:</span>
                            <span className="detail-value">{programmerData.experience} years</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Rating:</span>
                            <span className="detail-value">{programmerData.rating}/5 ⭐</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <h2>About</h2>
                    <p className="profile-description">
                        {programmerData.about || "No description available"}
                    </p>
                </div>

                <div className="profile-section">
                    <h2>Programming Languages</h2>
                    <div className="languages-container">
                        {programmerData.languages && programmerData.languages.length > 0 ? (
                            programmerData.languages
                                .split(',')
                                .map(skill => skill.trim())
                                .filter(skill => skill)
                                .map((skill, index) => (
                                    <span key={index} className="skill-tag">{skill}</span>
                                ))
                        ) : (
                            <p>No programming languages specified</p>
                        )}

                    </div>
                </div>

                {isOwnProfile && (
                    <div className="profile-section">
                        <h2>Project Management</h2>
                        <div className="project-actions">
                            <button
                                className="action-btn add-btn"
                            >
                                Add Project
                            </button>
                            <button
                                className="action-btn delete-btn"
                            >
                                Delete Project
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;


// import { useState } from 'react';
// import { CurrentUser } from './App';
// import { logOut } from './LogOut';
// function profile(gitName) {
//     const { currentUser } = useContext(CurrentUser);
//     const [isChange, setIsChange] = useState(0);
//     const [programmerData, setProgrammerData] = useState([]);
//     useEffect(() => {
//         setIsChange(0);
//         fetchData({
//             type: "programmers",
//             params: { git_name: gitName },
//             onSuccess: (data) => setProgrammerData(data),
//             onError: (err) => setError(`Failed to fetch posts: ${err}`),
//             logOut,
//         });
//     }, [currentUser.id, isChange]);

//     return (
//         <div className='programmerData'>
//             if (gitName == currentUser.git_name) {
//                 <button></button>
//             }
//         </div>
//     )
// }

// export default profile;