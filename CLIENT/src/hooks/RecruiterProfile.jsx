import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFetchData } from "../hooks/fetchData";
import { useLogout } from "../hooks/LogOut";

export function useRecruiterProfile(currentUser, username, setIsChange) {
    const [openJobForm, setOpenJobForm] = useState(false);
    const fetchData = useFetchData();
    const logOut = useLogout();
    const { register, handleSubmit, reset } = useForm();

    async function onSubmit(data) {
        console.log("Adding job with data:", data);
        try {
            await fetchData({
                type: "jobs",
                role: "/recruiter",
                method: "POST",
                body: data,
                onSuccess: (result) => {
                    console.log("add successful:", result);
                    setOpenJobForm(false);
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

    function openAddForm() {
        setOpenJobForm(true);
        reset({
            username: currentUser.username,
            company_name: currentUser.company_name,
            requirements: "",
            experience: "",
            languages: "",
            details: "",
        });
    }

    const renderManagementSection = () => (
        <>
            <h2>jobs Management</h2>
            <div className="project-actions">
                <button
                    className="action-btn add-btn"
                    onClick={openAddForm}
                >
                    Add jobs
                </button>
            </div>

            {openJobForm && (
                <div className="projectsToAdd">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="project-form"
                    >
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Job title"
                                className="form-input"
                                {...register("name", { required: true })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Required experience (years)"
                                className="form-input"
                                {...register("experience", { required: true })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Programming languages required"
                                className="form-input"
                                {...register("languages", { required: true })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Job requirements"
                                className="form-input textarea"
                                {...register("requirements")}
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Job description"
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
                                onClick={() => setOpenJobForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );

    return {
        renderManagementSection,
        userItemsType: "jobs"
    };
}