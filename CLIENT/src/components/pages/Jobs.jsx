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
      onError: (err) => console.error(`Failed to fetch programers: ${err}`),
      logOut,
    });
  }, [isChange, currentUser]);

  return (
    <div className="jobs-container">
      <div className="jobs-filters">
        <Search
          data={jobs}
          setFilteredData={setFilteredJobs}
          searchFields={["name"]}
          placeholder="Search jobs..."
        />
        {/* <Sort
          data={filteredJobs}
          setFilteredData={setFilteredJobs}
          sortOptions={[
            { key: "experience", label: "experience" },
            { key: "views", label: "views" },
          ]}
          filterOptions={[
            {
              key: "languages",
              label: "languages",
              type: "multiSelect",
            },
          ]}
        /> */}
      </div>
      <div className="jobs-grid">
        {filteredJobs.length > 0 &&
          filteredJobs.map((job) => <Job key={job.id} jobData={job} />)}
      </div>
    </div>
  );
}

export default Jobs;
