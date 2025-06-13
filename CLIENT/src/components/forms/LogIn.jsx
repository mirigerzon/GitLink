import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth.js";
import "../../style/Login.css";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    mode: 'onBlur' 
  });

  const { login, isLoading, message } = useAuth();

  const onSubmit = async (data) => {
    await login({
      username: data.username,
      password: data.password,
    });
    reset();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your GitLink account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters"
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
              {...register("password", {
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

          <button
            type="submit"
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

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

export default Login;