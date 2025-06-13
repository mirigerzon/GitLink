import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Project from "./Project";
import "../../style/Projects.css";
import { CurrentUser } from "../../../App";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut";
import Search from "../common/Search";
import Sort from "../common/Sort";

function Projects() {
  const { username, id } = useParams();
  const logOut = useLogout();
  const fetchData = useFetchData();
  const { currentUser } = useContext(CurrentUser);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [isChange, setIsChange] = useState(0);
  const navigate = useNavigate();
  const ownProjects = currentUser && currentUser.role == 'developer';

  useEffect(() => {
    setIsChange(0);
    fetchData({
      type: "projects",
      params: {
        ...(username && { username: username }),
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
      <h1>Projects community</h1>
      {!id && (
        <div className="controllers-section">
          <Search
            data={projects}
            setFilteredData={setFilteredProjects}
            searchFields={["git_name", "details", "name", "languages"]}
            placeholder="Search by project name, GitHub name, details, or programming languages..."
          />
          <Sort
            type="projects"
            setUserData={setFilteredProjects}
            originalData={projects}
          />
          {ownProjects && username == null && <button onClick={() => navigate(`/${currentUser.username}/projects`)}>My Project</button>}
          {ownProjects && username && <button onClick={() => navigate(`/projects`)}>All Project</button>}
        </div>
      )}

      <div className="projects-grid">
        {filteredProjects.length > 0 ? filteredProjects.map((project) => (
          <Project key={project.id} projectData={project} setIsChange={setIsChange} />
        )) : <h4>no projects found</h4>}
      </div>
    </div>
  );
}

export default Projects;
