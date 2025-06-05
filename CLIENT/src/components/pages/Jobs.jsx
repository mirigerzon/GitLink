import { useState, useEffect, useContext } from "react";
import { CurrentUser } from "../../../App";
import { fetchData } from "../../hooks/fetchData";
import { useLogout } from "../../hooks/LogOut";
import Job from "./Job";
import "../../style/jobs.css";
import Search from "../common/Search";
import Sort from "../common/Sort";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const { currentUser } = useContext(CurrentUser);
  const [isChange, setIsChange] = useState(0);
  const logOut = useLogout();

  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    setIsChange(0);
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      type: "jobs",
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
      </div>
      <div className="jobs-grid">
        {filteredJobs.length > 0 &&
          filteredJobs.map((job) => <Job key={job.id} jobData={job} />)}
      </div>
    </div>
  );
}

export default Jobs;
