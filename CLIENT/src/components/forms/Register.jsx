import { useForm } from "react-hook-form";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchData } from "../../hooks/FetchData.js";
import { CurrentUser } from "../../../App";
import Cookies from "js-cookie";
import "../../style/Register.css";

function Register() {
  const fetchData = useFetchData();

  const {
    register: registerFirst,
    handleSubmit: handleFirstSubmit,
    reset: resetFirstForm,
  } = useForm();
  const {
    register: registerSecond,
    handleSubmit: handleSecondSubmit,
    reset: resetSecondForm,
  } = useForm();

  const [registerIsCompleted, setRegisterIsCompleted] = useState(0);
  const [responseText, setResponseText] = useState(
    "Fill the form and click the sign up button"
  );
  const { setCurrentUser } = useContext(CurrentUser);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    password: "",
    role: "",
  });

  const [selectedRole, setSelectedRole] = useState("");
  const [useGitAvatar, setUseGitAvatar] = useState(false);

  // שלב 1 - אימות בסיסי
  const validateInitialForm = (data) => {
    const { username, password, verifyPassword } = data;
    if (password !== verifyPassword) {
      setResponseText("Password and verify password do not match");
      return;
    }
    if (password.length < 6) {
      setResponseText("Password must be at least 6 characters");
      return;
    }
    if (!selectedRole) {
      setResponseText("Please select a role (Developer or Recruiter)");
      return;
    }
    setUserData((prev) => ({
      ...prev,
      username,
      password,
      role: selectedRole,
    }));
    setRegisterIsCompleted(1);
    resetFirstForm();
    setResponseText("");
  };
  // שלב 2 - שליחת הנתונים לפי תפקיד
  const onSecondSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("username", userData.username);
      formData.append("password", userData.password);
      formData.append("role", userData.role);
      formData.append("email", data.email);
      formData.append("phone", data.phone);

      if (userData.role === "developer") {
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
      } else if (userData.role === "recruiter") {
        formData.append("company_name", data.company_name || "");
        if (data.profile_image?.length > 0) {
          formData.append("profile_image", data.profile_image[0]);
        }
      }

      await signUpFunc(formData);
      resetSecondForm();
    } catch (err) {
      setResponseText("Registration failed. Please try again.");
      console.error(err);
    }
  };

  async function signUpFunc(formData) {
    fetchData({
      type: "register",
      method: "POST",
      body: formData,
      onSuccess: ({ user, token }) => {
        navigate(`/${user.git_name || user.username}/home`);
        localStorage.setItem("currentUser", JSON.stringify(user));
        Cookies.set("accessToken", token, {
          expires: 1,
          secure: true,
          sameSite: "Strict",
        });
        const enHancedUser = {
          ...user,
          initiatedAction: false,
        };
        setCurrentUser(enHancedUser);
        setResponseText("Registration successful! Redirecting to home page...");
      },
      onError: (errorMessage) => {
        setResponseText("Registration failed. Please try again.");
        console.error("Failed to register user:", errorMessage);
      },
    });
  }

  return (
    <div className="register-container">
      <div className="register-card">
        {registerIsCompleted === 0 && (
          <>
            <div className="register-header">
              <h2 className="register-title">Create Account - Step 1</h2>
              <p className="register-subtitle">Set your username and password</p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => setSelectedRole("developer")}
                style={{
                  marginRight: "1rem",
                  backgroundColor: selectedRole === "developer" ? "#4caf50" : "",
                  color: selectedRole === "developer" ? "white" : "",
                }}
              >
                Register as Developer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("recruiter")}
                style={{
                  backgroundColor: selectedRole === "recruiter" ? "#4caf50" : "",
                  color: selectedRole === "recruiter" ? "white" : "",
                }}
              >
                Register as Recruiter
              </button>
            </div>
            <form
              onSubmit={handleFirstSubmit(validateInitialForm)}
              className="register-form"
            >
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  {...registerFirst("username", { required: true })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  {...registerFirst("password", { required: true })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Verify Password"
                  {...registerFirst("verifyPassword", { required: true })}
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="register-btn">
                Next
              </button>
              {responseText && <p className="error-text">{responseText}</p>}
            </form>
          </>
        )}
        {registerIsCompleted === 1 && (
          <>
            <div className="register-header">
              <h2 className="register-title">Create Account - Step 2</h2>
              <p className="register-subtitle">Fill in your details</p>
            </div>
            <form
              onSubmit={handleSecondSubmit(onSecondSubmit)}
              className="register-form"
            >
              {userData.role === "developer" && (
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Git Username"
                    {...registerSecond("git_name", { required: true })}
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  {...registerSecond("email", { required: true })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone"
                  {...registerSecond("phone", { required: true })}
                  className="form-input"
                  required
                />
              </div>

              {userData.role === "developer" && (
                <>
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="Experience (years)"
                      {...registerSecond("experience", { required: true })}
                      className="form-input"
                      min={0}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Languages (e.g. C++, Java...)"
                      {...registerSecond("languages")}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="About yourself"
                      {...registerSecond("about")}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={useGitAvatar}
                        onChange={(e) => setUseGitAvatar(e.target.checked)}
                      />{" "}
                      Use GitHub profile image
                    </label>
                  </div>
                </>
              )}

              {userData.role === "recruiter" && (
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Company Name"
                    {...registerSecond("company_name", { required: true })}
                    className="form-input"
                    required
                  />
                </div>
              )}

              {(!useGitAvatar || userData.role === "recruiter") && (
                <div className="form-group">
                  <input
                    type="file"
                    accept="image/*"
                    {...registerSecond("profile_image")}
                    className="form-input"
                  />
                </div>
              )}

              <button type="submit" className="register-btn">
                Submit
              </button>
              {responseText && <p className="error-text">{responseText}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
