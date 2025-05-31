import Programmer from './Programmer';
import { React, useState, useEffect, useContext } from 'react';
import { CurrentUser } from './App';
import { fetchData } from './FetchData';
import { useLogout } from './LogOut';
import '../style/programmers.css';
function Programmers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
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
            role: currentUser ? currentUser.role : "guest",
            type: "users",
            method: "GET",
            onSuccess: (data) => {
                setProgrammers(data);
            },
            onError: (err) => setError(`Failed to fetch programers: ${err}`),
            logOut,
        });
    }, [currentUser, isChange,]);

    return (
        <div className="programmers-container">
            <div className="programmers-header">
                <h1>Developers Community</h1>
                <p className="subtitle">Discover talented developers and their amazing projects</p>
                <div className="controls-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search developers..."
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
                            <option value="rating">Sort by Rating</option>
                            <option value="experience">Sort by Experience</option>
                            <option value="projects">Sort by Projects</option>
                        </select>
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Experience</option>
                            <option value="junior">Junior (0-2 years)</option>
                            <option value="mid">Mid Level (3-5 years)</option>
                            <option value="senior">Senior (6+ years)</option>
                        </select>
                        <div className="rating-filter">
                            <label>Min Rating:</label>
                            <select className="filter-select">
                                <option value="0">All Ratings</option>
                                <option value="4">4+ Stars</option>
                                <option value="4.5">4.5+ Stars</option>
                                <option value="4.8">4.8+ Stars</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="programmers-grid">
                {programmers.length > 0 && programmers.map(programmer => (
                    <Programmer
                        key={programmer.id}
                        programmerData={programmer}
                    />
                ))}
            </div>
        </div>
    );
}

export default Programmers;