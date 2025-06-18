import { useState } from "react";
import { useForm } from "../../../node_modules/react-hook-form/dist";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";

function Add({ type, setIsChange, inputs = [], defaultValue = {}, name = "Add" }) {
    const { currentUser } = useCurrentUser();
    const [isScreen, setIsScreen] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = useFetchData();

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            ...defaultValue,
            ...(currentUser?.id && { userId: currentUser.id })
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
                    setIsChange(prev => prev + 1); // Improved state update
                    reset();
                    setIsScreen(0);
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
        setIsScreen(0);
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    if (!inputs.length) {
        return <div>No input fields to display</div>;
    }

    return (
        <>
            {isScreen === 0 && (
                <button
                    className="addBtn"
                    onClick={() => setIsScreen(1)}
                    disabled={isLoading}
                >
                    {name}
                </button>
            )}

            {isScreen === 1 && (
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
                                        message: `${input} cannot be empty`
                                    }
                                })}
                                placeholder={`Enter ${input}`}
                                disabled={isLoading}
                            />
                            {errors[input] && (
                                <span className="error-message">
                                    {errors[input].message}
                                </span>
                            )}
                        </div>
                    ))}

                    <div className="button-group">
                        <button
                            className="submit-btn"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Adding..." : "OK"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}

export default Add;