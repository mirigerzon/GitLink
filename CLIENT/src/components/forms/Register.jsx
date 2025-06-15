import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { FiUpload } from 'react-icons/fi';
import "../../style/Register.css";

function Register() {
  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    mode: 'onBlur'
  });

  const { register: registerUser, isLoading, message } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [useGitAvatar, setUseGitAvatar] = useState(false);
  const [stepOneData, setStepOneData] = useState({});

  const password = watch("password");

  const onStepOneSubmit = (data) => {
    setStepOneData(data);
    setStep(2);
  };

  const onStepTwoSubmit = async (data) => {
    const formData = new FormData();

    formData.append("username", stepOneData.username);
    formData.append("password", stepOneData.password);
    formData.append("role", selectedRole);
    formData.append("email", data.email);
    formData.append("phone", data.phone);

    if (selectedRole === "developer") {
      formData.append("git_name", data.git_name);
      formData.append("experience", data.experience);
      formData.append("languages", data.languages || "");
      formData.append("about", data.about || "");

      if (useGitAvatar) {
        const gitAvatarUrl = `https://github.com/${data.git_name}.png`;
        formData.append("profile_image", gitAvatarUrl);
      } else if (data.profile_image?.length > 0) {
        formData.append("profile_image", data.profile_image[0]);
      }

      if (data.cv_file?.length > 0) {
        formData.append("cv_file", data.cv_file[0]);
      }
    } else if (selectedRole === "recruiter") {
      formData.append("company_name", data.company_name || "");
      if (data.profile_image?.length > 0) {
        formData.append("profile_image", data.profile_image[0]);
      }
    }

    await registerUser(formData);
    reset();
  };

  if (step === 1) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2 className="register-title">Create Account - Step 1</h2>
            <p className="register-subtitle">Choose your role and set credentials</p>
          </div>

          <div className="role-selection">
            <button
              type="button"
              onClick={() => setSelectedRole("developer")}
              className={`role-btn ${selectedRole === "developer" ? "selected" : ""}`}
            >
              Register as Developer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("recruiter")}
              className={`role-btn ${selectedRole === "recruiter" ? "selected" : ""}`}
            >
              Register as Recruiter
            </button>
            {!selectedRole && (
              <span className="error-message">Please select a role</span>
            )}
          </div>

          <form onSubmit={handleSubmit(onStepOneSubmit)} className="register-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                {...registerForm("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters"
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Username can only contain letters, numbers, and underscores"
                  }
                })}
              />
              {errors.username && (
                <span className="error-message">{errors.username.message}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                {...registerForm("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Verify Password"
                className={`form-input ${errors.verifyPassword ? 'error' : ''}`}
                {...registerForm("verifyPassword", {
                  required: "Please verify your password",
                  validate: value => value === password || "Passwords do not match"
                })}
              />
              {errors.verifyPassword && (
                <span className="error-message">{errors.verifyPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={!selectedRole || Object.keys(errors).length > 0}
            >
              Next
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">Create Account - Step 2</h2>
          <p className="register-subtitle">Complete your profile</p>
        </div>

        <form onSubmit={handleSubmit(onStepTwoSubmit)} className="register-form">
          {selectedRole === "developer" && (
            <div className="form-group">
              <input
                type="text"
                placeholder="GitHub Username"
                className={`form-input ${errors.git_name ? 'error' : ''}`}
                {...registerForm("git_name", {
                  required: "GitHub username is required",
                  pattern: {
                    value: /^[a-zA-Z0-9]([a-zA-Z0-9]|-)*[a-zA-Z0-9]$/,
                    message: "Invalid GitHub username format"
                  }
                })}
              />
              {errors.git_name && (
                <span className="error-message">{errors.git_name.message}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...registerForm("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address"
                }
              })}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="tel"
              placeholder="Phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              {...registerForm("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[\d+\-\s()]+$/,
                  message: "Please enter a valid phone number"
                }
              })}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone.message}</span>
            )}
          </div>

          {selectedRole === "developer" && (
            <>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Experience (years)"
                  className={`form-input ${errors.experience ? 'error' : ''}`}
                  min={0}
                  max={50}
                  {...registerForm("experience", {
                    required: "Experience is required",
                    min: {
                      value: 0,
                      message: "Experience cannot be negative"
                    },
                    max: {
                      value: 50,
                      message: "Experience cannot exceed 50 years"
                    }
                  })}
                />
                {errors.experience && (
                  <span className="error-message">{errors.experience.message}</span>
                )}
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Programming Languages (e.g. JavaScript, Python)"
                  className="form-input"
                  {...registerForm("languages")}
                />
              </div>

              <div className="form-group">
                <textarea
                  placeholder="About yourself"
                  className="form-input"
                  rows={4}
                  {...registerForm("about")}
                />
              </div>

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
            </>
          )}

          {selectedRole === "recruiter" && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Company Name"
                className={`form-input ${errors.company_name ? 'error' : ''}`}
                {...registerForm("company_name", {
                  required: "Company name is required",
                  minLength: {
                    value: 2,
                    message: "Company name must be at least 2 characters"
                  }
                })}
              />
              {errors.company_name && (
                <span className="error-message">{errors.company_name.message}</span>
              )}
            </div>
          )}

          {(!useGitAvatar || selectedRole === "recruiter") && (
            <div className="form-group">
              <label className="file-input-label">
                <FiUpload className="upload-icon" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input file-input"
                  {...registerForm("profile_image")}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {selectedRole === "developer" && (
            <div className="form-group">
              <label className="file-input-label">
                <FiUpload className="upload-icon" />
                <span>Upload CV (PDF only)</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="form-input file-input"
                  {...registerForm("cv_file")}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className={`register-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading || Object.keys(errors).length > 0}
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
      </div>
    </div>
  );
}

export default Register;