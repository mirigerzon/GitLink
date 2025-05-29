import { useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from './FetchData.jsx';
import { CurrentUser } from './App.jsx';
import Cookies from 'js-cookie';
import '../style/Register.css';

function Register() {
    // useForm לשני השלבים
    const { register: registerFirst, handleSubmit: handleFirstSubmit, reset: resetFirstForm } = useForm();
    const { register: registerSecond, handleSubmit: handleSecondSubmit, reset: resetSecondForm } = useForm();

    const [registerIsCompleted, setRegisterIsCompleted] = useState(0);
    const [responsText, setResponstText] = useState("Fill the form and click the sign up button");
    const { setCurrentUser } = useContext(CurrentUser);
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        username: '',
        password: '',
        name: '',
        git_name: '',
        email: '',
        phone: '',
        role: '',
        experience: '',
    });

    const validateInitialForm = (data) => {
        const { username, password, verifyPassword } = data;
        if (password !== verifyPassword) {
            setResponstText("Password and verify password do not match");
            return;
        }
        if (password.length < 6) {
            setResponstText("Password must be at least 6 characters");
            return;
        }
        setUserData(prev => ({
            ...prev,
            username,
            password
        }));
        setRegisterIsCompleted(1);
        resetFirstForm();
        setResponstText("");
    };

    const onSecondSubmit = async (data) => {
        const updatedUserData = {
            ...userData,
            git_name: data.git_name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            experience: data.experience,
        };
        setUserData(updatedUserData);
        await signUpFunc(updatedUserData);
        resetSecondForm();
    };

    async function signUpFunc(createdUserData) {
        fetchData({
            type: "register",
            method: "POST",
            body: createdUserData,
            onSuccess: ({ user, token }) => {
                console.log("User registered successfully:", user);
                navigate(`/${user.git_name}/home`);
                setCurrentUser(user);
                localStorage.setItem("currentUser", JSON.stringify(user));
                Cookies.set('accessToken', token, {
                    expires: 1,
                    secure: true,
                    sameSite: 'Strict',
                });
                setResponstText("Registration successful! Redirecting to home page...");
            },
            onError: (errorMessage) => {
                console.error("Failed to register user:", errorMessage);
                setResponstText("Registration failed. Please try again.");
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
                        <form onSubmit={handleFirstSubmit(validateInitialForm)} className="register-form">
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
                            <button type="submit" className="register-btn">Next</button>
                            {responsText && <p className="error-text">{responsText}</p>}
                        </form>
                    </>
                )}

                {registerIsCompleted === 1 && (
                    <>
                        <div className="register-header">
                            <h2 className="register-title">Create Account - Step 2</h2>
                            <p className="register-subtitle">Fill in your details</p>
                        </div>
                        <form onSubmit={handleSecondSubmit(onSecondSubmit)} className="register-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Git Username"
                                    {...registerSecond("git_name", { required: true })}
                                    className="form-input"
                                    required
                                />
                            </div>
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
                            <div className="form-group">
                                <select
                                    {...registerSecond("role", { required: true })}
                                    className="form-input"
                                    defaultValue=""
                                    required
                                >
                                    <option value="" disabled>בחר תפקיד</option>
                                    <option value="developer">מתכנת</option>
                                    <option value="recruiter">מגייס</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <input
                                    type="number"
                                    placeholder="experience"
                                    {...registerSecond("experience", { required: true })}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <button type="submit" className="register-btn">Submit</button>
                            {responsText && <p className="error-text">{responsText}</p>}
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Register;
