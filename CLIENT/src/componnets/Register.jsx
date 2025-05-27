import { useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from './fetchData.jsx';
import { CurrentUser } from './App';
import Cookies from 'js-cookie';
import '../style/Register.css';

function Register() {
    const { register, handleSubmit: handleFirstSubmit, reset: resetFirstForm } = useForm();
    const { register: registerSecond, handleSubmit: handleSecondSubmit, reset: resetSecondForm } = useForm();
    const [registerIsCompleted, setRegisterIsCompleted] = useState(0);
    const [responsText, setResponstText] = useState("Fill the form and click the sign up button");
    const { setCurrentUser } = useContext(CurrentUser);
    const [userData, setUserData] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: ""
    });
    const navigate = useNavigate();

    const validateInitialForm = async (data) => {
        const userDetails = {
            name: data.username,
            password: data.password,
            verifyPassword: data.verifyPassword,
        };
        if (userDetails.password !== userDetails.verifyPassword) {
            setResponstText("Password and verifyPassword are not the same");
            return;
        }
        if (userDetails.password.length < 6) {
            setResponstText("Password must contain at least 6 characters.");
            return;
        }
        setUserData((prevData) => ({
            ...prevData,
            username: userDetails.name,
            password: userDetails.password
        }));
        setRegisterIsCompleted(1);
        resetFirstForm();
    };

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
                Cookies.set('accessToken',token, {
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
        <>
            <div className="back-ground-img">
                {registerIsCompleted === 0 &&
                    <div>
                        <h2>Sign Up</h2>
                        <div className="entryContainer">
                            <form onSubmit={handleFirstSubmit(validateInitialForm)} className="entryForm">
                                <input
                                    type="text"
                                    placeholder="username"
                                    required
                                    {...register("username", { required: true })}
                                />
                                <input
                                    type="password"
                                    placeholder="password"
                                    required
                                    {...register("password", { required: true })}
                                />
                                <input
                                    type="password"
                                    placeholder="verifyPassword"
                                    required
                                    {...register("verifyPassword", { required: true })}
                                />
                                <button type="submit">sign up</button>
                                <h4>{responsText}</h4>
                            </form>
                        </div>
                    </div>
                }
                {registerIsCompleted === 1 &&
                    <div className="form-container">
                        <form onSubmit={handleSecondSubmit(onSecondSubmit)}>
                            <h2 className="form-title">More Details</h2>
                            <input
                                type="text"
                                name="name"
                                {...registerSecond("name", { required: true })}
                                placeholder="Name"
                                className="form-input"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                {...registerSecond("email", { required: true })}
                                placeholder="Email"
                                className="form-input"
                                required
                            />
                            <input
                                type="text"
                                name="phone"
                                {...registerSecond("phone", { required: true })}
                                placeholder="Phone"
                                className="form-input"
                                required
                            />
                               <input
                                type="text"
                                name=""
                                {...registerSecond("phone", { required: true })}
                                placeholder="Phone"
                                className="form-input"
                                required
                            />
                            <button type="submit" className="form-button">Submit</button>
                        </form>
                    </div>
                }
            </div>
        </>
    );
}

export default Register;
