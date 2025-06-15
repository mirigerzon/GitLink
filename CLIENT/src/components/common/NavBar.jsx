import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { CurrentUser } from "../../../App";
import { useLogout } from "../../hooks/LogOut";
import { Messages } from "../pages/Messages";
import { FiLogOut } from 'react-icons/fi';
import "../../style/NavBar.css";

function Navigation() {
  const { currentUser } = useContext(CurrentUser);
  const logOut = useLogout();
  const location = useLocation();

  const getImageUrl = () => {
    if (!currentUser.profile_image) return null;
    if (currentUser.profile_image.startsWith('https://github.com/')) {
      return currentUser.profile_image;
    }

    return `http://localhost:3001/uploads/${currentUser.profile_image}`;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {currentUser && <div className="user-control">
          <Link to={`${currentUser.username}/profile`}>
            <div className="profile-link">
              <img src={getImageUrl()}
                alt={`${currentUser.username} avatar`}
                className="profile-img" />
              <span className="user-greeting">Hello, {currentUser.username}</span>
            </div>
          </Link>
          <Messages />
        </div>}
        <div className="nav-links">
          <Link to={"/home"} className={`nav-link ${location.pathname.includes("home") ? "active" : ""}`}  >
            Home
          </Link>
          <Link to={"/developers"} className={`nav-link ${location.pathname.includes("developers") ? "active" : ""}`}  >
            Developers
          </Link>
          <Link to={"/projects"} className={`nav-link ${location.pathname.includes("projects") ? "active" : ""}`}  >
            Projects
          </Link>
          <Link to={"/Recruiters"} className={`nav-link ${location.pathname.includes("Recruiters") ? "active" : ""}`}  >
            Recruiters
          </Link>
          <Link to={"/Jobs"} className={`nav-link ${location.pathname.includes("Jobs") ? "active" : ""}`}  >
            Jobs
          </Link>
          {!currentUser && (<><Link to="/login" className={`nav-link ${location.pathname.includes("login") ? "active" : ""}`}      >
            Login
          </Link>
            <Link to="/register" className={`nav-link ${location.pathname.includes("register") ? "active" : ""}`}      >
              Register
            </Link>
          </>
          )}
        </div>
        <div className="nav-brand">
          <Link to="/home" className="brand-link">
            GitLink
          </Link>
          {currentUser && (
            <button onClick={logOut} className="logout-btn nav-user">
              <FiLogOut />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
