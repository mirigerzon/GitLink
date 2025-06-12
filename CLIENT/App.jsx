import { useState, createContext, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Navigation from "./src/components/common/NuvBar";
import LogIn from "./src/components/forms/LogIn";
import Register from "./src/components/forms/Register";
import Home from "./src/components/pages/Home";
import Developers from "./src/components/pages/Developers";
import Recruiters from "./src/components/pages/Recruiters";
import Jobs from "./src/components/pages/Jobs";
import Projects from "./src/components/pages/Projects";
import Error from "./src/components/pages/Error";
import Profile from "./src/components/pages/Profile";
import "./src/style/App.css";

export const CurrentUser = createContext([]);

function App() {
  const initialCurrentUser = useMemo(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);
  const [currentUser, setCurrentUser] = useState(initialCurrentUser);

  return (
    <>
      <CurrentUser.Provider value={{ currentUser, setCurrentUser }}>
        <Navigation currentUser={currentUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/recruiters" element={<Recruiters />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/:username">
            <Route path="home" element={<Home />} />
            <Route path="developers" element={<Developers />} />
            <Route path="jobs" element={<Jobs />} >
              <Route path=":id" element={<Projects />} />
            </Route>
            <Route path="projects" element={<Projects />}>
              <Route path=":id" element={<Projects />} />
            </Route>
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Error />} />
        </Routes>
      </CurrentUser.Provider>
      
    </>
  );
}

export default App;
