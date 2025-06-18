import { useForm } from "react-hook-form";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';
import "../../style/Register.css";

const ROLES = {
  DEVELOPER: 1,
  RECRUITER: 2
};

const VALIDATION_RULES = {
  username: {
    required: "Username is required",
    minLength: { value: 3, message: "Username must be at least 3 characters" },
    pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" }
  },
  password: {
    required: "Password is required",
    minLength: { value: 6, message: "Password must be at least 6 characters" }
  },
  email: {
    required: "Email is required",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" }
  },
  phone: {
    required: "Phone number is required",
    pattern: { value: /^[\d+\-\s()]+$/, message: "Please enter a valid phone number" }
  },
  git_name: {
    required: "GitHub username is required",
    pattern: { value: /^[a-zA-Z0-9]([a-zA-Z0-9]|-)*[a-zA-Z0-9]$/, message: "Invalid GitHub username format" }
  },
  experience: {
    required: "Experience is required",
    min: { value: 0, message: "Experience cannot be negative" },
    max: { value: 50, message: "Experience cannot exceed 50 years" }
  },
  company_name: {
    required: "Company name is required",
    minLength: { value: 2, message: "Company name must be at least 2 characters" }
  }
};

function Register() {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({ mode: 'onBlur' });
  const {
    register: registerUser,
    isLoading,
    message,
    checkUsernameAvailability,
    usernameStatus,
    suggestedUsernames,
    isCheckingUsername,
    clearUsernameCheck
  } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [useGitAvatar, setUseGitAvatar] = useState(false);
  const [stepOneData, setStepOneData] = useState({});

  const [profileImage, setProfileImage] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const [username, setUsername] = useState('');
  const [checkTimeout, setCheckTimeout] = useState(null);

  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    // if (checkTimeout) {
    //   clearTimeout(checkTimeout);
    // }

    if (username) {
      const timeout = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);

      setCheckTimeout(timeout);
    }
    // else {
    //   clearUsernameCheck();
    // }

    // return () => {
    //   if (checkTimeout) {
    //     clearTimeout(checkTimeout);
    //   }
    // };
  }, [username]);

  const selectSuggestedUsername = (suggestedName) => {
    setUsername(suggestedName);
    setValue('username', suggestedName);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Error opening camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        setProfileImage(file);
        closeCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
    setCameraError(null);
    setShowCameraModal(false);
  };

  const openCamera = () => {
    setShowCameraModal(true);
    startCamera();
  };

  const triggerProfileImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setProfileImage(file);
      }
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  }, []);

  const triggerCvFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.style.display = 'none';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setCvFile(file);
      }
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  }, []);

  const onStepOneSubmit = (data) => {
    setStepOneData(data);
    setStep(2);
  };

  const buildFormData = (data) => {
    const formData = new FormData();

    formData.append("username", stepOneData.username);
    formData.append("password", stepOneData.password);
    formData.append("role_id", selectedRole);
    formData.append("email", data.email);
    formData.append("phone", data.phone);

    if (selectedRole === ROLES.DEVELOPER) {
      formData.append("git_name", data.git_name);
      formData.append("experience", data.experience);
      formData.append("languages", data.languages || "");
      formData.append("about", data.about || "");

      if (useGitAvatar) {
        formData.append("profile_image", `https://github.com/${data.git_name}.png`);
      } else if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      if (cvFile) {
        formData.append("cv_file", cvFile);
      }
    } else if (selectedRole === ROLES.RECRUITER) {
      formData.append("company_name", data.company_name || "");
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }
    }
    return formData;
  };

  const onStepTwoSubmit = async (data) => {
    const formData = buildFormData(data);

    console.log('Form data contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    await registerUser(formData);
    reset();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const showImageUpload = !useGitAvatar || selectedRole === ROLES.RECRUITER;

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">
            Create Account - Step {step}
          </h2>
          <p className="register-subtitle">
            {step === 1 ? "Choose your role and set credentials" : "Complete your profile"}
          </p>
        </div>

        {step === 1 ? (
          <>
            <div className="role-selection">
              <button
                type="button"
                onClick={() => setSelectedRole(ROLES.DEVELOPER)}
                className={`role-btn ${selectedRole === ROLES.DEVELOPER ? "selected" : ""}`}
              >
                Register as Developer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole(ROLES.RECRUITER)}
                className={`role-btn ${selectedRole === ROLES.RECRUITER ? "selected" : ""}`}
              >
                Register as Recruiter
              </button>
              {!selectedRole && <span className="error-message">Please select a role</span>}
            </div>

            <form onSubmit={handleSubmit(onStepOneSubmit)} className="register-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  className={`form-input ${errors.username ? 'error' : ''} ${usernameStatus === 'available' ? 'success' : ''} ${usernameStatus === 'taken' ? 'error' : ''}`}
                  {...register("username", VALIDATION_RULES.username)}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    register("username", VALIDATION_RULES.username).onChange(e);
                  }}
                />
                {errors.username && <span className="error-message">{errors.username.message}</span>}

                {isCheckingUsername && (
                  <span className="checking-message">Checking availability...</span>
                )}
                {usernameStatus === 'available' && (
                  <span className="success-message">Username is available!</span>
                )}
                {usernameStatus === 'taken' && (
                  <span className="error-message">Username is taken</span>
                )}

                {suggestedUsernames.length > 0 && (
                  <div className="username-suggestions">
                    <p className="suggestions-title">Available usernames:</p>
                    <div className="suggestions-list">
                      {suggestedUsernames.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="suggestion-btn"
                          onClick={() => selectSuggestedUsername(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register("password", VALIDATION_RULES.password)}
                />
                {errors.password && <span className="error-message">{errors.password.message}</span>}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Verify Password"
                  className={`form-input ${errors.verifyPassword ? 'error' : ''}`}
                  {...register("verifyPassword", {
                    required: "Please verify your password",
                    validate: (value, { password }) => value === password || "Passwords do not match"
                  })}
                />
                {errors.verifyPassword && <span className="error-message">{errors.verifyPassword.message}</span>}
              </div>

              <button
                type="submit"
                className="register-btn"
                disabled={!selectedRole || hasErrors || usernameStatus === 'taken' || isCheckingUsername}
              >
                Next
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleSubmit(onStepTwoSubmit)} className="register-form">
            {selectedRole === ROLES.DEVELOPER && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="GitHub Username"
                    className={`form-input ${errors.git_name ? 'error' : ''}`}
                    {...register("git_name", VALIDATION_RULES.git_name)}
                  />
                  {errors.git_name && <span className="error-message">{errors.git_name.message}</span>}
                </div>

                <div className="form-group">
                  <input
                    type="number"
                    placeholder="Experience (years)"
                    className={`form-input ${errors.experience ? 'error' : ''}`}
                    min={0}
                    max={50}
                    {...register("experience", VALIDATION_RULES.experience)}
                  />
                  {errors.experience && <span className="error-message">{errors.experience.message}</span>}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Programming Languages (e.g. JavaScript, Python)"
                    className="form-input"
                    {...register("languages")}
                  />
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="About yourself"
                    className="form-input"
                    rows={4}
                    {...register("about")}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                {...register("email", VALIDATION_RULES.email)}
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                placeholder="Phone"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                {...register("phone", VALIDATION_RULES.phone)}
              />
              {errors.phone && <span className="error-message">{errors.phone.message}</span>}
            </div>

            {selectedRole === ROLES.RECRUITER && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Company Name"
                  className={`form-input ${errors.company_name ? 'error' : ''}`}
                  {...register("company_name", VALIDATION_RULES.company_name)}
                />
                {errors.company_name && <span className="error-message">{errors.company_name.message}</span>}
              </div>
            )}

            {selectedRole === ROLES.DEVELOPER && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={useGitAvatar}
                    onChange={(e) => setUseGitAvatar(e.target.checked)}
                  />
                  Use GitHub profile image
                </label>
              </div>
            )}

            {showImageUpload && (
              <div className="form-group">
                <div className="file-upload-container">
                  <button
                    type="button"
                    className="file-input-label"
                    onClick={triggerProfileImageUpload}
                  >
                    <FiUpload className="upload-icon" />
                    <span>Upload Profile Image</span>
                  </button>

                  <button
                    type="button"
                    className="camera-btn"
                    onClick={openCamera}
                  >
                    <FiCamera className="camera-icon" />
                    <span>Take Photo</span>
                  </button>
                </div>

                {profileImage && (
                  <div className="file-preview">
                    <span>Selected: {profileImage.name}</span>
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(profileImage)}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedRole === ROLES.DEVELOPER && (
              <div className="form-group">
                <div className="file-upload-container">
                  <button
                    type="button"
                    className="file-input-label"
                    onClick={triggerCvFileUpload}
                  >
                    <FiUpload className="upload-icon" />
                    <span>Upload CV (PDF only)</span>
                  </button>
                </div>

                {cvFile && (
                  <div className="file-preview">
                    <span>Selected: {cvFile.name}</span>
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className={`register-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading || hasErrors}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            {message && (
              <div className={`response-message ${message.includes('successful') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </form>
        )}

        {showCameraModal && (
          <div className="camera-overlay">
            <div className="camera-container">
              <div className="camera-header">
                <h3>Take Photo</h3>
                <button onClick={closeCamera} className="close-btn" type="button">
                  <FiX />
                </button>
              </div>

              {cameraError ? (
                <div className="camera-error">
                  <p>{cameraError}</p>
                  <button onClick={closeCamera} className="error-close-btn">Close</button>
                </div>
              ) : (
                <>
                  <div className="camera-preview">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-video"
                    />
                  </div>
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {isReady && (
                    <div className="camera-controls">
                      <button onClick={capturePhoto} className="capture-btn" type="button">
                        <FiCamera /> Take Photo
                      </button>
                      <button onClick={closeCamera} className="cancel-btn" type="button">
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;