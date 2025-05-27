import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fetchData } from './fetchData.jsx';
import { CurrentUser } from './App';
import '../style/LogIn.css';
import Cookies from 'js-cookie';

function LogIn() {
    const { register, handleSubmit, reset } = useForm();
    const { setCurrentUser } = useContext(CurrentUser);
    const [responsText, setResponstText] = useState("Fill the form and click the login button");
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const userDetails = {
            name: data.username,
            password: data.password,
        };
        await checkIfExsist(userDetails);
        reset();
    };

    async function checkIfExsist(userDetails) {
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
                    setResponstText("Login successful");
                    setCurrentUser(res.user);
                    navigate(`/users/${res.user.id}/home`);
                } else {
                    setResponstText('Incorrect username or password');
                }
            },
            onError: () => {
                setResponstText('ERROR');
            },
        });
        setTimeout(() => setResponstText("Fill the form and click the login button"), 2000);
    }

    return (
        <>
            <div className="back-ground-img">
                <h2>Login</h2>
                <div className="entryContainer">
                    <form onSubmit={handleSubmit(onSubmit)} className="entryForm">
                        <input
                            type="text"
                            placeholder="Name"
                            required
                            {...register("username", { required: true })}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            {...register("password", { required: true })}
                        />
                        <button type="submit">log in</button>
                        <h4>{responsText}</h4>
                    </form>
                </div>
            </div>
        </>
    );
}

export default LogIn;