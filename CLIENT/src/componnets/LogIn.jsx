import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fetchData } from './fetchData.jsx';
import { CurrentUser } from './App.jsx';
import Cookies from 'js-cookie';
import '../style/Login.css';

function Login() {
    const { register, handleSubmit, reset } = useForm();
    const { setCurrentUser } = useContext(CurrentUser);
    const [responseText, setResponseText] = useState("Enter your credentials to access your account");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsLoading(true);
        const userDetails = {
            name: data.username,
            password: data.password,
        };
        await checkIfExists(userDetails);
        reset();
        setIsLoading(false);
    };

    async function checkIfExists(userDetails) {
        const username = userDetails.name;
        const password = userDetails.password;

        await fetchData({
            type: "login",
            method: "POST",
            body: { username, password },
            onSuccess: (res) => {
                if (res && res.token) {
                    Cookies.set('accessToken', res.token, {
                        expires: 1,
                        secure: true,
                        sameSite: 'Strict',
                    });
                    localStorage.setItem("currentUser", JSON.stringify(res.user));
                    setResponseText("Login successful! Redirecting...");
                    setCurrentUser(res.user);
                    navigate(`/users/${res.user.id}/home`);
                } else {
                    setResponseText('Incorrect username or password');
                }
            },
            onError: () => {
                setResponseText('Connection error. Please try again.');
            },
        });

        setTimeout(() => setResponseText("Enter your credentials to access your account"), 3000);
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
                            placeholder="GitHub Username"
                            className="form-input"
                            {...register("username", { required: true })}
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
                        className={`login-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="response-message">
                        {responseText}
                    </div>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;