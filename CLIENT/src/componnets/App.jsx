import { useState, createContext, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import LogIn from './LogIn.jsx';
import Register from './Register.jsx';
import Home from './Home.jsx';
import Programmers from './Programmers.jsx';
import Jobs from './Jobs.jsx';
import Projects from './Projects.jsx';
import ErrorPage from './ErrorPage.jsx'
import Profile from './Profile.jsx';
import '../style/App.css'

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
                    <Route path='/programmers' element={<Programmers />} />
                    <Route path='/jobs' element={<Jobs />} />
                    <Route path='/projects' element={<Projects />} />
                    <Route path='/:gitName'>
                        <Route path="home" element={<Home />} />
                        <Route path='programmers' element={<Programmers />} />
                        <Route path='jobs' element={<Jobs />} />
                        <Route path='projects' element={< Projects />} />
                        <Route path='profile' element={< Profile />} />
                    </Route>
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </CurrentUser.Provider>
        </>
    )
}

export default App;