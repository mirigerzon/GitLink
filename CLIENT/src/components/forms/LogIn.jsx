import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { fetchData } from "../../hooks/fetchData";
import { CurrentUser } from "../../../App";
import Cookies from "js-cookie";
import "../../style/Login.css";

function Login() {
  const { register, handleSubmit, reset } = useForm();
  const { setCurrentUser } = useContext(CurrentUser);
  const [responseText, setResponseText] = useState(
    "Enter your credentials to access your account"
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const userDetails = {
      git_name: data.name,
      password: data.password,
    };
    await checkIfExists(userDetails);
    reset();
    setIsLoading(false);
  };

  async function checkIfExists(userDetails) {
    const git_name = userDetails.git_name;
    const password = userDetails.password;

    await fetchData({
      type: "login",
      method: "POST",
      body: { git_name, password },
      onSuccess: (res) => {
        if (res && res.token) {
          Cookies.set("accessToken", res.token, {
            expires: 1,
            secure: true,
            sameSite: "Strict",
          });
          localStorage.setItem("currentUser", JSON.stringify(res.user));
          setResponseText("Login successful! Redirecting...");
          setCurrentUser(res.user);
          navigate(`/${git_name}/home`);
        } else {
          setResponseText("Incorrect username or password");
        }
      },
      onError: () => {
        setResponseText("Connection error. Please try again.");
      },
    });

    setTimeout(
      () => setResponseText("Enter your credentials to access your account"),
      3000
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your GitLink account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Git name"
              className="form-input"
              {...register("name", { required: true })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              className="form-input"
              {...register("password", { required: true })}
              required
            />
          </div>

          <button
            type="submit"
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="response-message">{responseText}</div>
        </form>
      </div>
    </div>
  );
}

export default Login;
