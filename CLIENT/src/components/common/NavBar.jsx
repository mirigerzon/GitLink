import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Joyride from "react-joyride";
import Swal from "sweetalert2";
import { useCurrentUser } from "../../context.jsx";
import { useLogout } from "../../hooks/LogOut";
import Messages from "../pages/Messages";
import { FiLogOut } from 'react-icons/fi';
import "../../style/NavBar.css";

function NavBar() {
  const { currentUser } = useCurrentUser();
  const logOut = useLogout();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const isNewUser = localStorage.getItem("isNewUser");
    if (isNewUser === "true") {
      showWelcome();
    }
    const handleStartGuide = () => {
      showWelcome();
    };

    window.addEventListener("startGuide", handleStartGuide);
    return () => {
      window.removeEventListener("startGuide", handleStartGuide);
    };
  }, []);


  const showWelcome = async () => {
    const result = await Swal.fire({
      title: "Welcome to GitLink!",
      text: "This short guide will help you navigate the main menu.",
      icon: "info",
      confirmButtonText: "Let's start!",
      confirmButtonColor: "#156299",
    });

    if (result.isConfirmed) {
      setRun(true);
    }
  };

  const handleJoyrideCallback = (data) => {
    const { status, type, index } = data;
    if (type === "step:after") {
      setStepIndex(index + 1);
    }
    if (["finished", "skipped"].includes(status)) {
      localStorage.removeItem("isNewUser");
      setRun(false);
      Swal.fire({
        icon: 'success',
        title: 'Good luck!',
        text: 'We wish you great success. Hope you enjoy GitLink and find it helpful!',
        confirmButtonText: 'Thanks!',
        confirmButtonColor: '#156299',
      });
    }
  };

  const getImageUrl = () => {
    if (!currentUser?.profile_image) return null;
    if (currentUser.profile_image.startsWith('https://github.com/')) {
      return currentUser.profile_image;
    }
    return `http://localhost:3001/uploads/${currentUser.profile_image}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const steps = [
    {
      target: ".profile-link",
      content: "This is your profile – you can view and edit your personal information here.",
      disableBeacon: true,
    },
    {
      target: ".nav-link.home-link",
      content: "Here you can go back to the homepage at any time.",
    },
    {
      target: ".nav-link.developers-link",
      content: "Here you can find the developer community.",
    },
    {
      target: ".nav-link.projects-link",
      content: "Here you can view or find other people's projects.",
    },
    {
      target: ".nav-link.recruiters-link",
      content: "This is the recruiters area – manage opportunities.",
    },
    {
      target: ".nav-link.jobs-link",
      content: "Find job opportunities for you.",
    },
    ...(currentUser ? [{
      target: ".logout-btn",
      content: "Click here to log out of your account.",
    }] : [
      {
        target: ".nav-link.login-link",
        content: "Already have an account? Log in here.",
      },
      {
        target: ".nav-link.register-link",
        content: "New here? Register for a new account.",
      }
    ])
  ];

  return (
    <nav className="navigation">
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        locale={{
          back: "Back",
          close: "Close",
          last: "Done",
          next: "Next",
          skip: "Skip",
        }}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: "#3085d6",
            overlayColor: "rgba(0,0,0,0.4)",
          },
        }}
      />

      <div className="nav-container">
        {currentUser && (
          <div className="user-control">
            <Link to={`${currentUser.username}/profile`} className="profile-link">
              <img
                src={getImageUrl()}
                alt={`${currentUser.username} avatar`}
                className="profile-img"
              />
              <span className="user-greeting">Hello, {currentUser.username}</span>
            </Link>
            <Messages />
          </div>
        )}

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/home" className={`nav-link home-link ${location.pathname.includes("home") ? "active" : ""}`} onClick={closeMobileMenu}>
            Home
          </Link>
          <Link to="/developers" className={`nav-link developers-link ${location.pathname.includes("developers") ? "active" : ""}`} onClick={closeMobileMenu}>
            Developers
          </Link>
          <Link to="/projects" className={`nav-link projects-link ${location.pathname.includes("projects") ? "active" : ""}`} onClick={closeMobileMenu}>
            Projects
          </Link>
          <Link to="/Recruiters" className={`nav-link recruiters-link ${location.pathname.includes("Recruiters") ? "active" : ""}`} onClick={closeMobileMenu}>
            Recruiters
          </Link>
          <Link to="/Jobs" className={`nav-link jobs-link ${location.pathname.includes("Jobs") ? "active" : ""}`} onClick={closeMobileMenu}>
            Jobs
          </Link>
          {!currentUser && (
            <>
              <Link to="/login" className={`nav-link login-link ${location.pathname.includes("login") ? "active" : ""}`} onClick={closeMobileMenu}>
                Login
              </Link>
              <Link to="/register" className={`nav-link register-link ${location.pathname.includes("register") ? "active" : ""}`} onClick={closeMobileMenu}>
                Register
              </Link>
            </>
          )}
          {currentUser && currentUser?.role === 'admin' && (
            <>
              <Link to="/users" className={`nav-link users-link ${location.pathname.includes("users") ? "active" : ""}`} onClick={closeMobileMenu}>
                user control
              </Link>
            </>
          )}
        </div>

        <div className="nav-brand">
          <Link to="/home" className="brand-link">
            GitLink
          </Link>
          {currentUser && (
            <button onClick={logOut} className="logout-btn">
              <FiLogOut />
            </button>
          )}
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
