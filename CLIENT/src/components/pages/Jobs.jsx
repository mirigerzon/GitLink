import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { CurrentUser } from "../../../App";
import { useFetchData } from "../../hooks/FetchData.js";
import { useLogout } from "../../hooks/LogOut";
import Job from "./Job";
import "../../style/jobs.css";
import Search from "../common/Search";
import Sort from "../common/Sort";

function Jobs() {
  const { username, id } = useParams();
  const [jobs, setJobs] = useState([]);
  const { currentUser } = useContext(CurrentUser);
  const [isChange, setIsChange] = useState(0);
  const logOut = useLogout();
  const fetchData = useFetchData();
  const [filteredJobs, setFilteredJobs] = useState(jobs);
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
        {ownJobs && username == null && <button onClick={() => navigate(`/${currentUser.username}/projects`)}>My Jobs</button>}
        {ownJobs && username && <button onClick={() => navigate(`/projects`)}>All Jobs</button>}
      </div>
      <div className="jobs-grid">
        {filteredJobs.length > 0 &&
          filteredJobs.map((job) => <Job key={job.id} jobData={job} />)}
      </div>
    </div>
  );
}

export default Jobs;
