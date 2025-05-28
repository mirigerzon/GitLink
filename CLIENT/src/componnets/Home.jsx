import React, { useContext } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { CurrentUser } from './App';
import '../style/Home.css';

function Home() {
    const { currentUser } = useContext(CurrentUser);
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <main className="home-content">
                <div className="welcome-section">
                    <div className="welcome-content">
                        <h1 className="welcome-title">
                            Welcome to GitLink
                        </h1>
                        <p className="welcome-subtitle">
                            Connect developers, showcase projects, and discover opportunities
                        </p>
                        <div className="welcome-features">
                            <ul className="feature-card">
                                <Link to="/programmers" >
                                    <div className="feature-icon">👨‍💻</div>
                                    <h3>Find Developers</h3>
                                    <p>Connect with talented programmers worldwide</p>
                                </Link>
                            </ul>
                            <ul className="feature-card">
                                <Link to="/projects" >
                                    <div className="feature-icon">🚀</div>
                                    <h3>Showcase Projects</h3>
                                    <p>Display your best work and get recognized</p>
                                </Link>
                            </ul>
                            <ul className="feature-card">
                                <Link to="/jobs" >
                                    <div className="feature-icon">💼</div>
                                    <h3>Discover Jobs</h3>
                                    <p>Find your next career opportunity</p>
                                </Link>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="outlet-section">
                    <Outlet />
                </div>
            </main >
        </div >
    );
}

export default Home;


// import React, { useState, useEffect, useContext } from 'react';
// import Programmer from './Programmer';
// import Project from './Project';
// import { useNavigate, Outlet } from 'react-router-dom';
// import { CurrentUser } from './App';
// function Home() {
//     const [projects, setProjects] = useState([]);
//     const [displayData, setDisplayData] = useState("programmers");
//     const [isChange, setIsChange] = useState(0);
//     const { currentUser } = useContext(CurrentUser);
//     const [amountPerPage, setAmountPerPage] = useState(10);
//     const [endPagesLoaded, setEndPagesLoaded] = useState(0);
//     const [page, setPage] = useState(1);

//
//     useEffect(() => {
//         if (photosByPage[page] && isChange == 0) {
//             return;
//         }
//         setIsChange(0);
//         fetchData({
//             type: "projects",
//             params: { _page: page, _per_page: amountPerPage, albumId },
//             method: "GET",
//             onSuccess: (data) => {
//                 setProjects(data);
//                 setEndPagesLoaded(photos.next == null ? 1 : 0);
//             },
//             onError: (err) => setError(`Failed to fetch programers: ${err}`),
//         });
//     }, [currentUser.id, isChange, page, amountPerPage]);

//     const handleAmountPerPageChange = (e) => {
//         const value = Number(e.target.value);
//         setAmountPerPage(value);
//         setPage(1);
//         setPhotosByPage({});
//     };

//     return (
//         <>
//             <div className='control'>
//                 <button onClick={() => { setDisplayData((prev) => prev == "programmers" ? "projects" : "programmers") }}>{`All ${displayData == "programmers" ? "projects" : "programmers"}`}</button>
//                 <select name="amountPerPage" onChange={handleAmountPerPageChange}>
//                     <option value={10} > 10 per page</option>
//                     <option value={20}> 20 per page</option>
//                     <option value={30}> 30 per page</option>
//                 </select>
//             </div >
//             <div className="container">
//                 {displayData === "programmers" &&
//                     <div>
//                         <h3>programmers list</h3>
//                         <ul className="programmers-list">
//                             {programers.map((programmer) => (
//                                 Programmer(programmer = { programmer })
//                             ))}
//                         </ul>
//                     </div>
//                 }
//                 {displayData === "projects" &&
//                     <div>
//                         <h3>projects list</h3>
//                         <ul className="projects-list">
//                             {projects.map((project) => (
//                                 Project(project = { project })
//                             ))}
//                         </ul>
//                     </div>
//                 }
//             </div >
//             <Outlet />
//         </>
//     )
// }

// export default Home;