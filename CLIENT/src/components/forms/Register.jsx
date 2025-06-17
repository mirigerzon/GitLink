import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { FiUpload } from 'react-icons/fi';
import "../../style/Register.css";

const ROLES = {
  DEVELOPER: 1,
  RECRUITER: 2
};

const VALIDATION_RULES = {
  username: {
    required: "Username is required",
    minLength: {
      value: 3,
      message: "Username must be at least 3 characters"
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: "Username can only contain letters, numbers, and underscores"
    }
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters"
    }
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    }
  },
  phone: {
    required: "Phone number is required",
    pattern: {
      value: /^[\d+\-\s()]+$/,
      message: "Please enter a valid phone number"
    }
  },
  git_name: {
    required: "GitHub username is required",
    pattern: {
      value: /^[a-zA-Z0-9]([a-zA-Z0-9]|-)*[a-zA-Z0-9]$/,
      message: "Invalid GitHub username format"
    }
  },
  experience: {
    required: "Experience is required",
    min: {
      value: 0,
      message: "Experience cannot be negative"
    },
    max: {
      value: 50,
      message: "Experience cannot exceed 50 years"
    }
  },
  company_name: {
    required: "Company name is required",
    minLength: {
      value: 2,
      message: "Company name must be at least 2 characters"
    }
  }
};

const RoleSelection = ({ selectedRole, setSelectedRole }) => (
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
    {!selectedRole && (
      <span className="error-message">Please select a role</span>
    )}
  </div>
);

const StepOneForm = ({
  register: registerForm,
  handleSubmit,
  errors,
  selectedRole,
  onSubmit
}) => {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Username"
          className={`form-input ${errors.username ? 'error' : ''}`}
          {...registerForm("username", VALIDATION_RULES.username)}
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
          {...registerForm("password", VALIDATION_RULES.password)}
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
            validate: (value, { password }) =>
              value === password || "Passwords do not match"
          })}
        />
        {errors.verifyPassword && (
          <span className="error-message">{errors.verifyPassword.message}</span>
        )}
      </div>

      <button
        type="submit"
        className="register-btn"
        disabled={!selectedRole || hasErrors}
      >
        Next
      </button>
    </form>
  );
};

// Component for developer fields
const DeveloperFields = ({
  register: registerForm,
  errors,
  useGitAvatar,
  setUseGitAvatar
}) => (
  <>
    <div className="form-group">
      <input
        type="text"
        placeholder="GitHub Username"
        className={`form-input ${errors.git_name ? 'error' : ''}`}
        {...registerForm("git_name", VALIDATION_RULES.git_name)}
      />
      {errors.git_name && (
        <span className="error-message">{errors.git_name.message}</span>
      )}
    </div>

    <div className="form-group">
      <input
        type="number"
        placeholder="Experience (years)"
        className={`form-input ${errors.experience ? 'error' : ''}`}
        min={0}
        max={50}
        {...registerForm("experience", VALIDATION_RULES.experience)}
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
  </>
);

// Component for recruiter fields
const RecruiterFields = ({ register: registerForm, errors }) => (
  <div className="form-group">
    <input
      type="text"
      placeholder="Company Name"
      className={`form-input ${errors.company_name ? 'error' : ''}`}
      {...registerForm("company_name", VALIDATION_RULES.company_name)}
    />
    {errors.company_name && (
      <span className="error-message">{errors.company_name.message}</span>
    )}
  </div>
);

// Component for common fields
const CommonFields = ({ register: registerForm, errors }) => (
  <>
    <div className="form-group">
      <input
        type="email"
        placeholder="Email"
        className={`form-input ${errors.email ? 'error' : ''}`}
        {...registerForm("email", VALIDATION_RULES.email)}
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
        {...registerForm("phone", VALIDATION_RULES.phone)}
      />
      {errors.phone && (
        <span className="error-message">{errors.phone.message}</span>
      )}
    </div>
  </>
);

// Component for file upload
const FileUploadField = ({ register: registerForm, showUpload }) => {
  if (!showUpload) return null;

  return (
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
  );
};

// Component for step 2 form
const StepTwoForm = ({
  register: registerForm,
  handleSubmit,
  errors,
  selectedRole,
  useGitAvatar,
  setUseGitAvatar,
  onSubmit,
  isLoading,
  message
}) => {
  const hasErrors = Object.keys(errors).length > 0;
  const showImageUpload = !useGitAvatar || selectedRole === ROLES.RECRUITER;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
      {selectedRole === ROLES.DEVELOPER && (
        <DeveloperFields
          register={registerForm}
          errors={errors}
          useGitAvatar={useGitAvatar}
          setUseGitAvatar={setUseGitAvatar}
        />
      )}

      <CommonFields register={registerForm} errors={errors} />

      {selectedRole === ROLES.RECRUITER && (
        <RecruiterFields register={registerForm} errors={errors} />
      )}

      <FileUploadField
        register={registerForm}
        showUpload={showImageUpload}
      />

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
  );
};

// Main Register component
function Register() {
  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    mode: 'onBlur'
  });

  const { register: registerUser, isLoading, message } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [useGitAvatar, setUseGitAvatar] = useState(false);
  const [stepOneData, setStepOneData] = useState({});

  const onStepOneSubmit = (data) => {
    setStepOneData(data);
    setStep(2);
  };

  const buildFormData = (data) => {
    const formData = new FormData();

    // Add step one data
    formData.append("username", stepOneData.username);
    formData.append("password", stepOneData.password);
    formData.append("role_id", selectedRole);

    // Add common fields
    formData.append("email", data.email);
    formData.append("phone", data.phone);

    if (selectedRole === ROLES.DEVELOPER) {
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
    } else if (selectedRole === ROLES.RECRUITER) {
      formData.append("company_name", data.company_name || "");
      if (data.profile_image?.length > 0) {
        formData.append("profile_image", data.profile_image[0]);
      } else {
        formData.append("profile_image", `http://localhost:3001/uploads/profile_images/user.png`);
      }
    }

    return formData;
  };

  const onStepTwoSubmit = async (data) => {
    const formData = buildFormData(data);
    await registerUser(formData);
    reset();
  };

  const commonProps = {
    register: registerForm,
    handleSubmit,
    errors,
    selectedRole
  };

  if (step === 1) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2 className="register-title">Create Account - Step 1</h2>
            <p className="register-subtitle">Choose your role and set credentials</p>
          </div>

          <RoleSelection
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />

          <StepOneForm
            {...commonProps}
            onSubmit={onStepOneSubmit}
          />
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

        <StepTwoForm
          {...commonProps}
          useGitAvatar={useGitAvatar}
          setUseGitAvatar={setUseGitAvatar}
          onSubmit={onStepTwoSubmit}
          isLoading={isLoading}
          message={message}
        />
      </div>
    </div>
  );
}

export default Register;