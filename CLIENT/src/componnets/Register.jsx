import { useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from './fetchData.jsx';
import { CurrentUser } from './App.jsx';
import Cookies from 'js-cookie';
import '../style/Register.css';

function Register() {
    const { register, handleSubmit: handleFirstSubmit, reset: resetFirstForm } = useForm();
    const { register: registerSecond, handleSubmit: handleSecondSubmit, reset: resetSecondForm } = useForm();
    const [registerIsCompleted, setRegisterIsCompleted] = useState(0);
    const [responsText, setResponstText] = useState("Fill the form and click the sign up button");
    const { setCurrentUser } = useContext(CurrentUser);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        gitUsername: '',
        phone: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.gitUsername.trim()) newErrors.gitUsername = 'Git username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const validateInitialForm = async (data) => {
    //     const userDetails = {
    //         name: data.username,
    //         password: data.password,
    //         verifyPassword: data.verifyPassword,
    //     };
    //     if (userDetails.password !== userDetails.verifyPassword) {
    //         setResponstText("Password and verifyPassword are not the same");
    //         return;
    //     }
    //     if (userDetails.password.length < 6) {
    //         setResponstText("Password must contain at least 6 characters.");
    //         return;
    //     }
    //     setUserData((prevData) => ({
    //         ...prevData,
    //         username: userDetails.name,
    //         password: userDetails.password
    //     }));
    //     setRegisterIsCompleted(1);
    //     resetFirstForm();
    // };

    const onSecondSubmit = async (data) => {
        const updatedUserData = {
            ...userData,
            name: data.name,
            email: data.email,
            phone: data.phone
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
                navigate(`/users/${user.id}/home`);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // TODO: Implement registration API call
            console.log('Registration data:', formData);
            // navigate('/login');
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2 className="register-title">Create Account</h2>
                    <p className="register-subtitle">Join our developer community</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`form-input ${errors.name ? 'error' : ''}`}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="gitUsername"
                            placeholder="Git Username"
                            value={formData.gitUsername}
                            onChange={handleInputChange}
                            className={`form-input ${errors.gitUsername ? 'error' : ''}`}
                        />
                        {errors.gitUsername && <span className="error-text">{errors.gitUsername}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`form-input ${errors.phone ? 'error' : ''}`}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`form-input ${errors.password ? 'error' : ''}`}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <button type="submit" className="register-btn">
                        Create Account
                    </button>
                </form>
                <div className="register-footer">
                    <p> <a href="/login">Log in here</a></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
