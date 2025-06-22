import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import DeveloperProfile from "../../hooks/DeveloperProfile.jsx";
import RecruiterProfile from "../../hooks/RecruiterProfile.jsx";
import ProfileManagement from "../../hooks/ProfileManagement.jsx";
import "../../style/Profile.css";

function Profile() {
  const { username } = useParams();
  const { currentUser } = useCurrentUser();
  const [isChange, setIsChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [existingDeliverables, setExistingDeliverables] = useState(null);
  const fetchData = useFetchData();
  const navigate = useNavigate();

  const isOwnProfile = currentUser && username === currentUser.username;
  const userItemsType = userData?.role === "developer" ? "projects" : (userData?.role === 'recruiter') ? "jobs" : 'users';

  useEffect(() => {
    setIsChange(0);
    setLoading(true);
    fetchData({
      type: `users/${username}`,
      params: { "username": username },
      role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
      onSuccess: (data) => {
        setUserData(data);
        setLoading(false);
      },
      onError: (err) => {
        setError(`Failed to fetch user data: ${err}`);
        setLoading(false);
      },
    });
  }, [username, isChange]);

  useEffect(() => {
    if (!userData) return;
    const itemsType = userData.role === "developer" ? "projects" : "jobs";

    setIsChange(0);
    setLoading(true);
    fetchData({
      type: itemsType,
      params: { "username": username },
      role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
      onSuccess: (data) => {
        setExistingDeliverables(data);
        setLoading(false);
      },
      onError: (err) => {
        setError(`Failed to fetch ${itemsType} data: ${err}`);
        setLoading(false);
      },
    });
  }, [username, isChange, userData]);

  const getImageUrl = () => {
    if (!userData?.profile_image) return;
    if (userData.profile_image.startsWith('https://github.com/')) {
      return userData.profile_image;
    }
    return `http://localhost:3001/uploads/${userData.profile_image}`;
  };

  const getCVUrl = () => {
    if (!userData?.cv_file) return null;
    return `http://localhost:3001/uploads/${userData.cv_file}`;
  };

  const handleViewCV = () => {
    const cvUrl = getCVUrl();
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    }
  };

  const handleDownloadCV = async () => {
    try {
      const response = await fetch(`http://localhost:3001/cv/${userData.username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userData.username}-cv.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!userData) return <div className="profile-error">User not found</div>;

  const sharedProps = {
    userData,
    currentUser,
    isOwnProfile,
    existingDeliverables,
    setIsChange,
    navigate,
    userItemsType,
    handleViewCV,
    handleDownloadCV
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-section">
          <img
            src={getImageUrl()}
            alt={`${userData.username}'s profile`}
            className="profile-image"
          />
          <button
            onClick={() =>
              navigate(userItemsType === "users" ? "/users" : `/${username}/${userItemsType}`)
            }
          >
            view all {userItemsType}
          </button>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{userData.username}</h1>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{userData.email}</span>
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{userData.phone}</span>
              <span className="detail-label">Rating:</span>
              <span className="detail-value">{userData.rating}/5 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>About</h2>
          <p className="profile-description">
            {userData.about || "No description available"}
          </p>

          <ProfileManagement
            userData={userData}
            currentUser={currentUser}
            isOwnProfile={isOwnProfile}
            setIsChange={setIsChange}
            fetchData={fetchData}
          />

          {userData.role === "developer" && (
            <>
              <h2>Programming Languages</h2>
              <div className="languages-container">
                {userData.languages && userData.languages.length > 0 ? (
                  userData.languages
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter((skill) => skill)
                    .map((skill, index) => (
                      <h3 key={index} className="skill-tag">
                        {skill}
                      </h3>
                    ))
                ) : (
                  <p>No programming languages specified</p>
                )}
              </div>
            </>
          )}
        </div>

        {userData.role === "developer" ? (
          <DeveloperProfile {...sharedProps} />
        ) : (
          userData.role === 'recruiter' &&
          <RecruiterProfile {...sharedProps} />
        )}
      </div>
    </div>
  );
}

export default Profile;