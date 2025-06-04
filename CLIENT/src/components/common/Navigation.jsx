import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { CurrentUser } from "../../../App";
import { useLogout } from "../../hooks/LogOut";
import "../../style/Navigation.css";

function Navigation() {
  const { currentUser } = useContext(CurrentUser);
  const logOut = useLogout();
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/home" className="brand-link">
            GitLink
          </Link>
        </div>

        <div className="nav-links">
          <Link
            to={"/home"}
            className={`nav-link ${
              location.pathname.includes("home") ? "active" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to={"/developers"}
            className={`nav-link ${
              location.pathname.includes("developers") ? "active" : ""
            }`}
          >
            Developers
          </Link>
          <Link
            to={"/projects"}
            className={`nav-link ${
              location.pathname.includes("projects") ? "active" : ""
            }`}
          >
            Projects
          </Link>
          <Link
            to={"/jobs"}
            className={`nav-link ${
              location.pathname.includes("jobs") ? "active" : ""
            }`}
          >
            Jobs
          </Link>
          {currentUser && (
            <Link
              to={`${currentUser.git_name}/profile`}
              className={`nav-link ${
                location.pathname.includes("profile") ? "active" : ""
              }`}
            >
              Profile
            </Link>
          )}
          {!currentUser && (
            <>
              <Link
                to="/login"
                className={`nav-link ${
                  location.pathname.includes("login") ? "active" : ""
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-link ${
                  location.pathname.includes("register") ? "active" : ""
                }`}
              >
                Register
              </Link>
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
