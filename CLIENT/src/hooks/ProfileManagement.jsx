import { useState } from "react";
import { FiUpload, FiEdit, FiLock } from "react-icons/fi";
import Modal from "../components/common/Modal";
import { useCurrentUser } from "../context";

function ProfileManagement({ userData, currentUser, isOwnProfile, setIsChange, fetchData }) {
    const [showCVUpload, setShowCVUpload] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const { setCurrentUser } = useCurrentUser();
    const [cvFile, setCvFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [useGitAvatar, setUseGitAvatar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleCVUpload = async (e) => {
        e.preventDefault();
        if (!cvFile) {
            setMessage('Please select a CV file');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('cv_file', cvFile);
        formData.append('user_id', userData.id);

        try {
            await fetchData({
                type: 'users/update-cv',
                role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
                method: 'PUT',
                body: formData,
                onSuccess: (result) => {
                    setMessage('CV updated successfully!', result);
                    setShowCVUpload(false);
                    setCvFile(null);
                    setIsChange(prev => prev + 1);
                },
                onError: (error) => {
                    setMessage(`Error updating CV: ${error}`);
                }
            });
        } catch (error) {
            setMessage('Unexpected error occurred', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();

        if (useGitAvatar && userData.git_name) {
            formData.append('profile_image', `https://github.com/${userData.git_name}.png`);
            formData.append('use_git_avatar', 'true');
        } else if (imageFile) {
            formData.append('profile_image', imageFile);
        } else {
            setMessage('Please select an image or choose to use GitHub avatar');
            setLoading(false);
            return;
        }
        formData.append('user_id', userData.id);

        try {
            await fetchData({
                type: 'users/update-image',
                method: 'PUT',
                role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
                body: formData,
                onSuccess: (result) => {
                    setMessage('Profile image updated successfully!', result);
                    setShowImageUpload(false);
                    setUseGitAvatar(false);
                    setIsChange(prev => prev + 1);
                    setCurrentUser(prevUser => ({
                        ...prevUser,
                        profile_image: result.file
                    }));
                    setImageFile(null);
                },
                onError: (error) => {
                    setMessage(`Error updating image: ${error}`);
                }
            });
        } catch (error) {
            setMessage('Unexpected error occurred', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage('New passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 6) {
            setMessage('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await fetchData({
                type: 'users/change-password',
                method: 'PUT',
                role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "guests",
                body: {
                    user_id: userData.user_id,
                    email: userData.email,
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                },
                onSuccess: (result) => {
                    setMessage('Password changed successfully!', result);
                    setShowPasswordChange(false);
                    setPasswords({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });
                },
                onError: (error) => {
                    setMessage(`Error changing password: ${error}`);
                }
            });
        } catch (error) {
            setMessage('Unexpected error occurred', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOwnProfile) return null;

    return (
        <div className="profile-management">
            <h2>Profile Management</h2>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="management-buttons">
                {userData.role === 'developer' && (
                    <button
                        className="management-btn"
                        onClick={() => setShowCVUpload(true)}
                    >
                        <FiUpload /> {userData.cv_file ? 'Update CV' : 'Upload CV'}
                    </button>
                )}

                <button
                    className="management-btn"
                    onClick={() => setShowImageUpload(true)}
                >
                    <FiEdit /> Update Profile Image
                </button>

                <button
                    className="management-btn"
                    onClick={() => setShowPasswordChange(true)}
                    disabled={loading}
                >
                    <FiLock /> Change Password
                </button>
            </div>

            {showCVUpload && (
                <Modal onClose={() => setShowCVUpload(false)}>
                    <h3>Upload CV</h3>
                    <form onSubmit={handleCVUpload}>
                        <label className="custom-file-upload">
                            Select CV (PDF only)
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setCvFile(e.target.files[0])}
                            />
                        </label>
                        <div className="form-buttons">
                            <button type="submit" disabled={loading}>
                                {loading ? "Uploading..." : "Upload CV"}
                            </button>
                            <button type="button" onClick={() => setShowCVUpload(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showImageUpload && (
                <Modal onClose={() => setShowImageUpload(false)}>
                    <h3>Update Profile Image</h3>
                    <form onSubmit={handleImageUpload}>
                        <div className="form-group">
                            {userData.role === 'developer' && userData.git_name && (
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={useGitAvatar}
                                        onChange={(e) => setUseGitAvatar(e.target.checked)}
                                    />
                                    Use GitHub profile image
                                </label>
                            )}
                            {!useGitAvatar && (
                                <>
                                    <label className="file-input-label">
                                        <FiUpload className="upload-icon" />
                                        <span>Select Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                        />
                                    </label>
                                    {imageFile && <p>Selected: {imageFile.name}</p>}
                                </>
                            )}
                        </div>
                        <div className="form-buttons">
                            <button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Image'}
                            </button>
                            <button type="button" onClick={() => setShowImageUpload(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showPasswordChange && (
                <Modal onClose={() => setShowPasswordChange(false)}>
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-buttons">
                            <button type="submit" disabled={loading}>
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                            <button type="button" onClick={() => setShowPasswordChange(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default ProfileManagement;