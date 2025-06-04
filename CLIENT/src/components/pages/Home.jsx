import { useContext } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { CurrentUser } from "../../../App";
import "../../style/Home.css";

function Home() {
  const { currentUser } = useContext(CurrentUser);
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <main className="home-content">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome to GitLink</h1>
            <p className="welcome-subtitle">
              Connect Programmers, showcase projects, and discover opportunities
            </p>
            <div className="welcome-features">
              <div className="feature-card">
                <Link to={"/programmers"}>
                  <div className="feature-icon">👨‍💻</div>{" "}
                  <h3>Find Programmers</h3>
                  <p>Connect with talented programmers worldwide</p>
                </Link>
              </div>
              <div className="feature-card">
                <Link to={"/projects"}>
                  <div className="feature-icon">🚀</div>
                  <h3>Showcase Projects</h3>
                  <p>Display your best work and get recognized</p>
                </Link>
              </div>
              <div className="feature-card">
                <Link to={"/jobs"}>
                  <div className="feature-icon">💼</div>
                  <h3>Discover Jobs</h3>
                  <p>Find your next career opportunity</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="outlet-section">
          <Outlet />
        </div> */}
      </main>
    </div>
  );
}

export default Home;
