import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CurrentUser } from './App.jsx';
import { fetchData } from './fetchData.jsx';
import logOut from './LogOut.jsx';
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
            type: "programmers",
            params: { gitname: gitName },
            onSuccess: (data) => {
                setProgrammerData(data);
                setLoading(false);
            },
            onError: (err) => {
                setError(`Failed to fetch programmer data: ${err}`);
                setLoading(false);
            },
            logOut,
        });
    }, [gitName, isChange]);

    const handleAddProject = () => {
        // TODO: Implement add project functionality
        console.log("Add project clicked");
    };

    const handleDeleteProject = () => {
        // TODO: Implement delete project functionality
        console.log("Delete project clicked");
    };

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
                    <h1 className="profile-name">{programmerData.name}</h1>
                    <div className="profile-details">
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
                            <span className="detail-value">{programmerData.yearsOfExperience} years</span>
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
                        {programmerData.skillsDescription || "No description available"}
                    </p>
                </div>

                <div className="profile-section">
                    <h2>Programming Languages</h2>
                    <div className="languages-container">
                        {programmerData.programmingLanguages && programmerData.programmingLanguages.length > 0 ? (
                            programmerData.programmingLanguages.map((language, index) => (
                                <span key={index} className="language-tag">
                                    {language}
                                </span>
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
                                onClick={handleAddProject}
                                className="action-btn add-btn"
                            >
                                Add Project
                            </button>
                            <button
                                onClick={handleDeleteProject}
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