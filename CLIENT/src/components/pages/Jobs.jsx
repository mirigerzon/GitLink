import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/FetchData.js";
import { useLogout } from "../../hooks/LogOut.js";
import Job from "./Job.jsx";
import "../../style/jobs.css";
import Search from "../common/Search.jsx";
import Sort from "../common/Sort.jsx";

function Jobs() {
  const { username, id } = useParams();
  const [jobs, setJobs] = useState([]);
  const { currentUser } = useCurrentUser();
  const [isChange, setIsChange] = useState(0);
  const logOut = useLogout();
  const fetchData = useFetchData();
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const navigate = useNavigate();
  const ownJobs = currentUser && currentUser.role == 'recruiter';

  useEffect(() => {
    setIsChange(0);
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      type: "jobs",
      params: {
        ...(username && { username: username }),
        ...(id && { id: id }),
      },
      method: "GET",
      onSuccess: (data) => {
        setJobs(data);
      },
      onError: (err) => console.error(`Failed to fetch developers: ${err}`),
      logOut,
    });
  }, [isChange, currentUser]);

  return (
    <div className="jobs-container">
      <h1>Jobs community</h1>
      <div className="controllers-section">
        <Search
          data={jobs}
          setFilteredData={setFilteredJobs}
          searchFields={["name", "languages"]}
          placeholder="Search by job title or required technologies..."
        />
        <Sort type="jobs" setUserData={setFilteredJobs} originalData={jobs} />
        {ownJobs && username == null && <button onClick={() => navigate(`/${currentUser.username}/jobs`)}>My Jobs</button>}
        {ownJobs && username && <button onClick={() => navigate(`/jobs`)}>All Jobs</button>}
      </div>
      <div className="jobs-grid">
        {filteredJobs.length > 0 &&
          filteredJobs.map((job) => <Job key={job.id} jobData={job} />)}
      </div>
      <Outlet />
    </div>
  );
}

export default Jobs;
