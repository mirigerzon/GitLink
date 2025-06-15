import { useState } from "react";
import { useFetchData } from "./fetchData";
import { useLogout } from "./LogOut";
import { useForm } from "react-hook-form";

export function useDeveloperProfile(currentUser, username, setIsChange) {
    const [projectsToAdd, setProjectToAdd] = useState(null);
    const [openRepo, setOpenRepo] = useState(null);
    const fetchData = useFetchData();
    const logOut = useLogout();
    const { register, handleSubmit, reset } = useForm();

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

    function openAddForm(repo) {
        setOpenRepo(repo);
        reset({
            git_name: currentUser.git_name,
            username: currentUser.username,
            name: repo.name,
            forks_count: repo.forks_count,
            url: repo.html_url,
            languages: repo.languages,
            details: repo.details || "",
        });
    }

    const renderManagementSection = (existingDeliverables, userData) => (
        <>
            <h2>projects Management</h2>
            <div className="project-actions">
                <button
                    className="action-btn add-btn"
                    onClick={() => getGithubRepoNames(userData.git_name)}
                >
                    Add projects
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
                                            add
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

    return {
        renderManagementSection,
        userItemsType: "projects"
    };
}