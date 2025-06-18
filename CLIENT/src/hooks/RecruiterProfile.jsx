import React, { useState } from "react";
import { useFetchData } from "./fetchData.js";
import { useLogout } from "../hooks/LogOut.js";
import { useForm } from "react-hook-form";
import Update from "../components/common/Update.jsx";
import Delete from "../components/common/Delete.jsx";

function RecruiterProfile({
    userData,
    currentUser,
    isOwnProfile,
    existingDeliverables,
    setIsChange,
    navigate,
    userItemsType
}) {
    const [openJobForm, setOpenJobForm] = useState(false);
    const fetchData = useFetchData();
    const logOut = useLogout();
    const { register, handleSubmit, reset } = useForm();

    // Submit new job
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

    // Open job form with pre-filled data
    function openAddForm() {
        setOpenJobForm(true);
        reset({
            title: "",
            username: userData.username,
            company_name: userData.company_name,
            requirements: "",
            experience: "",
            languages: "",
            details: "",
        });
    }

    // Render job management section
    const renderJobManagement = () => {
        if (!isOwnProfile) return null;

        return (
            <>
                <h2>Jobs Management</h2>
                <div className="project-actions">
                    <button
                        className="action-btn add-btn"
                        onClick={openAddForm}
                    >
                        Add Job
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
                                    {...register("title", { required: true })}
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
    };

    return (
        <>
            {/* Recruiter-specific sections */}
            <div className="profile-section">
                {/* Company section */}
                {userData.company_name && (
                    <>
                        <h2>Company</h2>
                        <p className="profile-description">{userData.company_name}</p>
                    </>
                )}
            </div>

            {/* Jobs section */}
            <div className="profile-section">
                <h2>Existing {userItemsType}</h2>
                <ul>
                    {existingDeliverables ? (
                        existingDeliverables.map((item) => (
                            <li key={item.id}>
                                {item.title}
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
                                            inputs={["title", "details"]}
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

                {renderJobManagement()}
            </div>
        </>
    );
}

export default RecruiterProfile;