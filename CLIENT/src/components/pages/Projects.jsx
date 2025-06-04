import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Project from "./Project";
import "../../style/Projects.css";
import { CurrentUser } from "../../../App";
import { fetchData } from "../../hooks/fetchData";
import { useLogout } from "../../hooks/LogOut";
import Search from "../common/Search";
import Sort from "../common/Sort";

function Projects() {
  const { gitName, id } = useParams();
  const logOut = useLogout();
  const { currentUser } = useContext(CurrentUser);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [isChange, setIsChange] = useState(0);

  useEffect(() => {
    setIsChange(0);
    fetchData({
      type: "projects",
      params: {
        ...(gitName && { git_name: gitName }),
        ...(id && { id: id }),
      },
      role: currentUser ? `/${currentUser.role}` : "/guest",
      method: "GET",
      onSuccess: (data) => {
        setProjects(data);
        setFilteredProjects(data);
      },
      onError: (err) => console.error(`Failed to fetch programers: ${err}`),
      logOut,
    });
  }, [currentUser, isChange]);

  return (
    <div className="projects-container">
      {!id && (
        <div className="controls-section">
          <Search
            data={projects}
            setFilteredData={setFilteredProjects}
            searchFields={["git_name", "details", "name"]}
            placeholder="Search projects..."
          />
          <Sort
            data={filteredProjects}
            setFilteredData={setFilteredProjects}
            sortOptions={[
              { key: "languages", label: "languages" },
              { key: "views", label: "views" },
              { key: "name", label: "project name" },
            ]}
          />
        </div>
      )}

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <Project key={project.id} projectData={project} />
        ))}
      </div>
    </div>
  );
}

export default Projects;
