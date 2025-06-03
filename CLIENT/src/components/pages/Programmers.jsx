import Programmer from "./Programmer";
import { React, useState, useEffect, useContext } from "react";
import { CurrentUser } from "../../../App";
import { fetchData } from "../../hooks/fetchData";
import { useLogout } from "../../hooks/LogOut";
import "../../style/programmers.css";
import Search from "../common/Search";
import Sort from "../common/Sort";

function Programmers() {
  const { currentUser } = useContext(CurrentUser);
  const logOut = useLogout();
  const [programmers, setProgrammers] = useState([]);
  const [filteredProgrammers, setFilteredProgrammers] = useState(programmers);
  const [isChange, setIsChange] = useState(0);

  useEffect(() => {
    setIsChange(0);
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      type: "users",
      method: "GET",
      onSuccess: (data) => {
        setProgrammers(data);
      },
      onError: (err) => console.error(`Failed to fetch programers: ${err}`),
      logOut,
    });
  }, [currentUser, isChange]);

  return (
    <div className="programmers-container">
      <div className="programmers-header">
        <Search
          data={programmers}
          setFilteredData={setFilteredProgrammers}
          searchFields={["git_name"]}
          placeholder="Search by gitName."
        />
        {/* <Sort
          data={filteredProgrammers}
          setFilteredData={setFilteredProgrammers}
          sortOptions={[
            { key: "languages", label: "languages" },
            { key: "rating", label: "rating" },
            { key: "experience", label: "experience" },
          ]}
        /> */}
      </div>
      <div className="programmers-grid">
        {filteredProgrammers.length > 0 ? (
          filteredProgrammers.map((programmer) => (
            <Programmer key={programmer.id} programmerData={programmer} />
          ))
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default Programmers;
