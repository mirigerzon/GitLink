import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CurrentUser } from './App';
import { useLogout } from './LogOut';
import '../style/Navigation.css';

function Navigation() {
    const { currentUser } = useContext(CurrentUser);
    const logOut = useLogout();

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <Link to="/home" className="brand-link">GitLink</Link>
                </div>

                <div className="nav-links">
                    <Link to={"/home"} className="nav-link">Home</Link>
                    <Link to={"/programmers"} className="nav-link">Programmers</Link>
                    <Link to={"/projects"} className="nav-link">Projects</Link>
                    <Link to={"/jobs"} className="nav-link">Jobs</Link>
                    {currentUser && <Link to={`${currentUser.git_name}/profile`} className="nav-link">Profile</Link>}

                    {!currentUser && (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </>
                    )}
                </div>

                {currentUser && (
                    <div className="nav-user">
                        <span className="user-greeting">Hello, {currentUser.username}</span>
                        <button onClick={logOut} className="logout-btn">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navigation;