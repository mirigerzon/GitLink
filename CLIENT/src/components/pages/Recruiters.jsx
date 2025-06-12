import Recruiter from "./Recruiter";
import { React, useState, useEffect, useContext } from "react";
import { CurrentUser } from "../../../App";
import { useFetchData } from "../../hooks/FetchData.js";
import { useLogout } from "../../hooks/LogOut";
import "../../style/recruiters.css";
import Search from "../common/Search";
import Sort from "../common/Sort";

function Recruiters() {
  const { currentUser } = useContext(CurrentUser);
  const fetchData = useFetchData();
  const logOut = useLogout();
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState(recruiters);
  const [isChange, setIsChange] = useState(0);

  useEffect(() => {
    setIsChange(0);
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      type: "recruiters",
      params: { role: "recruiter" },
      method: "GET",
      onSuccess: (data) => {
        setRecruiters(data);
      },
      onError: (err) => console.error(`Failed to fetch programers: ${err}`),
      logOut,
    });
  }, [currentUser, isChange]);

  return (
    <div className="recruiters-container">
      <div className="recruiters-header">
        <h1>Recruiters community</h1>
        <div className="controllers-section">
          <Search
            data={recruiters}
            setFilteredData={setFilteredRecruiters}
            searchFields={["git_name", "email", "languages"]}
            placeholder="Search by GitHub name, email or programming languages..."
          />
          <Sort
            type="recruiters"
            setUserData={setFilteredRecruiters}
            originalData={recruiters}
          />
        </div>
      </div>
      <div className="recruiters-grid">
        {filteredRecruiters.length > 0 ? (
          filteredRecruiters.map((recruiter) => (
            <Recruiter key={recruiter.id} recruiterData={recruiter} />
          ))
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default Recruiters;
