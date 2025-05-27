import React, { useState, useEffect, useContext } from 'react';
import Programmer from './Programmer';
import Project from './Project';
import { useNavigate, Outlet } from 'react-router-dom';
import { CurrentUser } from './App';
function Home() {
    const [programers, setProgramers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [displayData, setDisplayData] = useState("programmers");
    const [isChange, setIsChange] = useState(0);
    const { currentUser } = useContext(CurrentUser);
    const [amountPerPage, setAmountPerPage] = useState(10);
    const [endPagesLoaded, setEndPagesLoaded] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (photosByPage[page] && isChange == 0) {
            return;
        }
        setIsChange(0);
        fetchData({
            type: "programers",
            params: { _page: page, _per_page: amountPerPage, albumId },
            method: "GET",
            onSuccess: (data) => {
                setProgramers(data);
                setEndPagesLoaded(photos.next == null ? 1 : 0);
            },
            onError: (err) => setError(`Failed to fetch programers: ${err}`),
        });
    }, [currentUser.id, isChange, page, amountPerPage]);

    useEffect(() => {
        if (photosByPage[page] && isChange == 0) {
            return;
        }
        setIsChange(0);
        fetchData({
            type: "projects",
            params: { _page: page, _per_page: amountPerPage, albumId },
            method: "GET",
            onSuccess: (data) => {
                setProjects(data);
                setEndPagesLoaded(photos.next == null ? 1 : 0);
            },
            onError: (err) => setError(`Failed to fetch programers: ${err}`),
        });
    }, [currentUser.id, isChange, page, amountPerPage]);

    const handleAmountPerPageChange = (e) => {
        const value = Number(e.target.value);
        setAmountPerPage(value);
        setPage(1);
        setPhotosByPage({});
    };

    return (
        <>
            <div className='control'>
                <button onClick={() => { setDisplayData((prev) => prev == "programmers" ? "projects" : "programmers") }}>{`All ${displayData == "programmers" ? "projects" : "programmers"}`}</button>
                <select name="amountPerPage" onChange={handleAmountPerPageChange}>
                    <option value={10} > 10 per page</option>
                    <option value={20}> 20 per page</option>
                    <option value={30}> 30 per page</option>
                </select>
            </div >
            <div className="container">
                {displayData === "programmers" &&
                    <div>
                        <h3>programmers list</h3>
                        <ul className="programmers-list">
                            {programers.map((programmer) => (
                                Programmer(programmer = { programmer })
                            ))}
                        </ul>
                    </div>
                }
                {displayData === "projects" &&
                    <div>
                        <h3>projects list</h3>
                        <ul className="projects-list">
                            {projects.map((project) => (
                                Project(project = { project })
                            ))}
                        </ul>
                    </div>
                }
            </div >
            <Outlet />
        </>
    )
}

export default Home;