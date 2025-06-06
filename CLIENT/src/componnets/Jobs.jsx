import { React, useState, useEffect, useContext } from 'react';
import { CurrentUser } from './App';
import { fetchData } from './FetchData';
import { useLogout } from './LogOut';
import Job from './Job.jsx';
import '../style/jobs.css';

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [experienceFilter, setExperienceFilter] = useState('');
    const [languageFilter, setLanguageFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [filterBy, setFilterBy] = useState('all');
    const [programmers, setProgrammers] = useState([]);
    const [displayData, setDisplayData] = useState("programmers");
    const [isChange, setIsChange] = useState(0);
    const { currentUser } = useContext(CurrentUser);
    const [error, setError] = useState(null);
    const logOut = useLogout();
    // TODO: Implement these functions
    // - handleSearch() - filter programmers by search term
    // - handleSort() - sort programmers by selected criteria
    // - handleFilter() - filter programmers by experience/rating

    useEffect(() => {
        setIsChange(0);
        fetchData({
            role: currentUser ? `/${currentUser.role}` : "/guest",
            type: "jobs",
            method: "GET",
            onSuccess: (data) => {
                setJobs(data);
            },
            onError: (err) => setError(`Failed to fetch programers: ${err}`),
            logOut,
        });
    }, [currentUser, isChange,]);

    return (
        <div className="jobs-container">
            {/* <div className="jobs-header">
                <h1>Available Positions</h1>
                <p>Discover your next career opportunity</p>
            </div> */}

            <div className="jobs-filters">
                <div className="search-section">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search jobs by title, company, or keywords..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="filter-section">
                    <select
                        value={experienceFilter}
                        onChange={(e) => setExperienceFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Experience Levels</option>
                        <option value="0-1">Entry Level (0-1 years)</option>
                        <option value="2-4">Mid Level (2-4 years)</option>
                        <option value="5+">Senior Level (5+ years)</option>
                    </select>

                    <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Languages</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="C#">C#</option>
                        <option value="React">React</option>
                        <option value="Node.js">Node.js</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value)}
                        className="filter-select"
                    >
                        <option value="latest">Latest Posts</option>
                        <option value="salary-high">Highest Salary</option>
                        <option value="experience">Experience Required</option>
                        <option value="company">Company Name</option>
                    </select>
                </div>
            </div>

            <div className="jobs-grid">
                {jobs.length > 0 && jobs.map(job => (
                    <Job
                        key={job.id}
                        jobData={job}
                    />
                ))}
            </div>
        </div>
    );
}

export default Jobs;