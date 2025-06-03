import { useState, createContext, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import Navigation from "./src/components/common/Navigation";
import LogIn from "./src/components/forms/LogIn";
import Register from "./src/components/forms/Register";
import Home from "./src/components/pages/Home";
import Programmers from "./src/components/pages/Programmers";
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
          <Route path="/programmers" element={<Programmers />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/:gitName">
            <Route path="home" element={<Home />} />
            <Route path="programmers" element={<Programmers />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="projects" element={<Projects />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Error />} />
        </Routes>
      </CurrentUser.Provider>
    </>
  );
}

export default App;
