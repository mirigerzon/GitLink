import { React, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CurrentUser } from "../../../App";
import { useFetchData } from "../../hooks/fetchData.js";
import { useDeveloperProfile } from "../../hooks/DeveloperProfile.jsx";
import { useRecruiterProfile } from "../../hooks/RecruiterProfile.jsx";
import Update from "../common/Update";
import Delete from "../common/Delete";
import "../../style/Profile.css";

function Profile() {
  const { username } = useParams();
  const { currentUser } = useContext(CurrentUser);
  const [isChange, setIsChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [existingDeliverables, setExistingDeliverables] = useState(null);
  const fetchData = useFetchData();
  const navigate = useNavigate();

  const developerHook = useDeveloperProfile(currentUser, username, setIsChange);
  const recruiterHook = useRecruiterProfile(currentUser, username, setIsChange);

  const currentHook = userData?.role === "developer" ? developerHook : recruiterHook;
  const userItemsType = currentHook?.userItemsType;

  useEffect(() => {
    setIsChange(0);
    setLoading(true);
    fetchData({
      type: `users/${username}`,
      params: { "username": username },
      role: currentUser ? `/${currentUser.role}` : "/guest",
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
      role: currentUser ? `/${currentUser.role}` : "/guest",
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

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!userData) return <div className="profile-error">User not found</div>;

  const isOwnProfile = currentUser && username === currentUser.username;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-section">
          <img
            src={userData.profile_image || "/default-avatar.png"}
            alt={`${userData.name}'s profile`}
            className="profile-image"
          />
          <button onClick={() => navigate(`/${username}/${userItemsType}`)}>
            view all {userItemsType}
          </button>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{userData.username}</h1>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{userData.role}</span>
              <span className="detail-label">Email:</span>
              <span className="detail-value">{userData.email}</span>
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{userData.phone}</span>
              <span className="detail-label">Experience:</span>
              <span className="detail-value">{userData.experience} years</span>
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

          {userData.role === "recruiter" && userData.company_name && (
            <>
              <h2>Company</h2>
              <p className="profile-description">{userData.company_name}</p>
            </>
          )}

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
        </div>

        <div className="profile-section">
          <h2>Existing {userItemsType}</h2>
          <ul>
            {existingDeliverables ? (
              existingDeliverables.map((item) => (
                <li key={item.id}>
                  {item.name}
                  <button
                    onClick={() =>
                      navigate(`/${item.username}/${userItemsType}/${item.id}`)
                    }
                  >
                    view
                  </button>
                  {isOwnProfile && (
                    <>
                      <Delete
                        className="delete_btn"
                        type={userItemsType}
                        itemId={item.id}
                        setIsChange={setIsChange}
                        role={currentUser ? `/${currentUser.role}` : null}
                      />
                      <Update
                        type={userItemsType}
                        itemId={item.id}
                        setIsChange={setIsChange}
                        inputs={["name", "details"]}
                        role={currentUser ? `/${currentUser.role}` : null}
                      />
                    </>
                  )}
                </li>
              ))
            ) : (
              <p>no {userItemsType} found</p>
            )}
          </ul>

          {isOwnProfile && currentHook && currentHook.renderManagementSection(existingDeliverables, userData)}
        </div>
      </div>
    </div>
  );
}

export default Profile;