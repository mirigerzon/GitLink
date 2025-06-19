import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import Modal from "../common/Modal.jsx";
import "../../style/Update.css";

function Add({ type, setIsChange, inputs = [], defaultValue = {}, name = "Add" }) {
    const { currentUser } = useCurrentUser();
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = useFetchData();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            ...defaultValue,
            ...(currentUser?.id && { userId: currentUser.id }),
        },
    });

    const addFunc = async (data) => {
        setIsLoading(true);
        try {
            await fetchData({
                type,
                method: "POST",
                body: data,
                onSuccess: (result) => {
                    console.log("Add successful:", result);
                    setIsChange((prev) => prev + 1);
                    reset();
                    setShowModal(false);
                },
                onError: (error) => {
                    console.error("Add failed:", error);
                },
            });
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
        setShowModal(false);
    };

    if (!currentUser) return null;
    if (!inputs.length) return null;

    return (
        <>
            <button className="btn-primary" onClick={() => setShowModal(true)} disabled={isLoading}>
                {name}
            </button>

            {showModal && (
                <Modal onClose={handleCancel}>
                    <form onSubmit={handleSubmit(addFunc)} className="add-form">
                        {inputs.map((input) => (
                            <div key={input} className="input-group">
                                <label htmlFor={input}>
                                    {input.charAt(0).toUpperCase() + input.slice(1)}
                                </label>
                                <input
                                    id={input}
                                    {...register(input, {
                                        required: `${input} is required`,
                                        minLength: {
                                            value: 1,
                                            message: `${input} cannot be empty`,
                                        },
                                    })}
                                    placeholder={`Enter ${input}`}
                                    disabled={isLoading}
                                />
                                {errors[input] && (
                                    <span className="error-message">{errors[input].message}</span>
                                )}
                            </div>
                        ))}

                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button type="submit" value="OK" disabled={isLoading}>
                                {isLoading ? "Adding..." : "OK"}
                            </button>
                            <button type="button" value="cancel" onClick={handleCancel} disabled={isLoading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}

export default Add;
