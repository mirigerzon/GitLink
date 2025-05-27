import { useState, createContext, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import LogIn from './LogIn';
import Register from './Register';
import Home from './Home';
import Programmers from './Programmers';
import Jobs from './Jobs.jsx';
import ErrorPage from './ErrorPage'
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
                    <Route path='/Programmers' element={<Programmers />} />
                    <Route path='/jobs' element={<Jobs />} />
                    <Route path='/userName'>
                        <Route path="home" element={<Home />} />
                        <Route path='Programmers' element={<Programmers />} />
                        <Route path='jobs' element={<Jobs />} />
                    </Route>
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </CurrentUser.Provider>
        </>
    )
}

export default App;