import React, { useState, useEffect } from 'react';
import Job from './Job.jsx';
import '../style/jobs.css';

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [experienceFilter, setExperienceFilter] = useState('');
    const [languageFilter, setLanguageFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    // TODO: Implement fetchJobs function to get jobs from API
    // useEffect(() => {
    //     fetchJobs();
    // }, []);

    // TODO: Implement filtering and sorting logic
    const handleSearch = (term) => {
        setSearchTerm(term);
        // Implement search functionality
    };

    const handleFilter = () => {
        // Implement filtering logic based on experience and language
    };

    const handleSort = (sortType) => {
        setSortBy(sortType);
        // Implement sorting logic
    };

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
                {/* TODO: Map through jobs array and render Job components */}
                {/* {filteredJobs.map(job => (
                    <Job key={job.id} jobData={job} />
                ))} */}

                {/* Placeholder for demonstration */}
                <div className="no-jobs">
                    <h3>No jobs available at the moment</h3>
                    <p>Check back later for new opportunities</p>
                </div>
            </div>
        </div>
    );
}

export default Jobs;