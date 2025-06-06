import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Project from './Project';
import '../style/Projects.css'
import { CurrentUser } from './App';
import { fetchData } from './FetchData';
import { useLogout } from './LogOut';
function Projects() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filterBy, setFilterBy] = useState('all');
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const currentUser = useContext(CurrentUser);;
    const [isChange, setIsChange] = useState(0);
    const logOut = useLogout();
    const { gitName } = useParams();
    // TODO: Implement these functions
    // - fetchProjects() - fetch projects from API
    // - handleSearch() - filter projects by search term
    // - handleSort() - sort projects by selected criteria
    // - handleFilter() - filter projects by programming language

    useEffect(() => {
        setIsChange(0);
        fetchData({
            type: "projects",
            params: gitName ? { git_name: gitName } : {},
            method: "GET",
            onSuccess: (data) => {
                setProjects(data);
            },
            onError: (err) => setError(`Failed to fetch programers: ${err}`),
            logOut,
        });
    }, [currentUser, isChange]);

    return (
        <div className="projects-container">
            {/* Search and Filter Section */}
            <div className="projects-header">
                <h1>Projects</h1>
                <div className="controls-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="search-btn">🔍</button>
                    </div>

                    <div className="filters">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="commits">Sort by Commits</option>
                            <option value="views">Sort by Views</option>
                            <option value="date">Sort by Date</option>
                        </select>

                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Languages</option>
                            <option value="react">React</option>
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
                {projects.map(project => (
                    <Project
                        key={project.id}
                        projectData={project}
                    />
                ))}
            </div>
        </div>
    );
}

export default Projects;