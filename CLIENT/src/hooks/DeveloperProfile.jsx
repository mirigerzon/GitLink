import React, { useState } from "react";
import { useFetchData } from "../hooks/fetchData.js";
import { useLogout } from "../hooks/LogOut.js";
import { useForm } from "react-hook-form";
import Update from "../components/common/Update.jsx";
import Delete from "../components/common/Delete.jsx";

function DeveloperProfile({
    userData,
    currentUser,
    isOwnProfile,
    existingDeliverables,
    setIsChange,
    navigate,
    userItemsType,
    handleViewCV,
    handleDownloadCV
}) {
    const [projectsToAdd, setProjectToAdd] = useState(null);
    const [openRepo, setOpenRepo] = useState(null);
    const fetchData = useFetchData();
    const logOut = useLogout();
    const { register, handleSubmit, reset } = useForm();

    // Fetch GitHub repositories
    async function getGithubRepoNames(gitName) {
        const url = `https://api.github.com/users/${gitName}/repos?per_page=100`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            const repos = await response.json();
            setProjectToAdd(repos);
        } catch (error) {
            console.error("Error fetching repositories:", error);
        }
    }

    // Submit new project
    async function onSubmit(data) {
        console.log("Adding project with data:", data);
        try {
            await fetchData({
                type: "projects",
                role: "/developer",
                method: "POST",
                body: data,
                onSuccess: (result) => {
                    console.log("add successful:", result);
                    setOpenRepo(null);
                    reset();
                    setIsChange(1);
                },
                onError: (error) => {
                    console.log("add was unsuccessful", error);
                    alert(error);
                },
                logOut,
            });
        } catch (error) {
            console.log("Unexpected error:", error);
        }
        reset();
    }

    // Open project form with pre-filled data
    function openAddForm(repo) {
        setOpenRepo(repo);
        reset({
            git_name: userData.git_name,
            username: userData.username,
            name: repo.name,
            forks_count: repo.forks_count,
            url: repo.html_url,
            languages: repo.languages,
            details: repo.details || "",
        });
    }

    // Render project management section
    const renderProjectManagement = () => {
        if (!isOwnProfile) return null;

        return (
            <>
                <h2>Projects Management</h2>
                <div className="project-actions">
                    <button
                        className="action-btn add-btn"
                        onClick={() => getGithubRepoNames(userData.git_name)}
                    >
                        Add Projects
                    </button>
                </div>

                {projectsToAdd && (
                    <div className="projectsToAdd">
                        <div className="projectsName">
                            <h3>Projects can be added:</h3>
                            <ul>
                                {projectsToAdd.map((repo) => {
                                    const alreadyExists = existingDeliverables?.some(
                                        (project) => project.name === repo.name
                                    );
                                    return (
                                        <li key={repo.id}>
                                            {repo.name}
                                            <button
                                                disabled={alreadyExists}
                                                onClick={() => openAddForm(repo)}
                                            >
                                                {alreadyExists ? 'Already Added' : 'Add'}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        {openRepo && (
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="project-form"
                            >
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Project name"
                                        className="form-input"
                                        {...register("name", { required: true })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Languages used"
                                        className="form-input"
                                        {...register("languages", { required: true })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <textarea
                                        placeholder="Description"
                                        className="form-input textarea"
                                        {...register("details")}
                                    />
                                </div>
                                <div className="form-buttons">
                                    <button type="submit" className="submit-btn">
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setOpenRepo(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            {/* Developer-specific sections */}
            <div className="profile-section">
                {/* Experience section */}
                <h2>Experience</h2>
                <p className="profile-description">
                    {userData.experience} years of experience
                </p>

                {/* GitHub section */}
                {userData.git_name && (
                    <>
                        <h2>GitHub</h2>
                        <p className="profile-description">
                            <a
                                href={`https://github.com/${userData.git_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                @{userData.git_name}
                            </a>
                        </p>
                    </>
                )}

                {/* CV section */}
                {userData.cv_file && (
                    <div className="cv-section">
                        <h2>Resume / CV</h2>
                        <div className="cv-buttons">
                            <button onClick={handleViewCV} className="btn btn-primary">
                                View CV
                            </button>
                            <button onClick={handleDownloadCV} className="btn btn-secondary">
                                Download CV
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Projects section */}
            <div className="profile-section">
                <h2>Existing {userItemsType}</h2>
                <ul>
                    {existingDeliverables ? (
                        existingDeliverables.map((item) => (
                            <li key={item.id}>
                                {item.name}
                                <button
                                    onClick={() =>
                                        navigate(`/${item.username}/${userItemsType}/${item.id}`)
                                    }
                                >
                                    View
                                </button>
                                {isOwnProfile && (
                                    <>
                                        <Delete
                                            className="delete_btn"
                                            type={userItemsType}
                                            itemId={item.id}
                                            setIsChange={setIsChange}
                                            role={currentUser ? `/${currentUser.role}` : null}
                                        />
                                        <Update
                                            type={userItemsType}
                                            itemId={item.id}
                                            setIsChange={setIsChange}
                                            inputs={["name", "details"]}
                                            role={currentUser ? `/${currentUser.role}` : null}
                                        />
                                    </>
                                )}
                            </li>
                        ))
                    ) : (
                        <p>No {userItemsType} found</p>
                    )}
                </ul>

                {renderProjectManagement()}
            </div>
        </>
    );
}

export default DeveloperProfile;