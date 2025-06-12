import { useState, useEffect, useCallback, useContext } from "react";
import { useFetchData } from "./FetchData.js";
import { CurrentUser } from "../../App.jsx";
export const useMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isChange, setIsChange] = useState(0);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const fetchData = useFetchData();
    const { currentUser, setCurrentUser } = useContext(CurrentUser);

    const fetchMessages = useCallback(() => {
        setLoading(true);
        setIsChange(0);
        setCurrentUser(prevUser => ({
            ...prevUser,
            initiatedAction: false
        }));
        fetchData({
            role: `/${currentUser.role}`,
            type: `messages`,
            method: "GET",
            params: { email: currentUser.email },
            onSuccess: (data) => {
                setMessages(data);
                setLoading(false);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [currentUser.email, currentUser.role, currentUser.initiatedAction]);

    const hasUnread = messages?.some((msg) => !msg.is_read);

    const markAllAsRead = () => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: "messages",
            method: "PUT",
            body: { is_read: true },
            params: { email: currentUser.email },
            onSuccess: () => {
                setLoading(false);
                setIsChange(true);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    };

    useEffect(() => {
        if (currentUser.email) {
            fetchMessages();
        }
    }, [isChange, currentUser.email, currentUser.initiatedAction]);

    const deleteMessage = useCallback((id) => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: `messages/${id}`,
            method: "DELETE",
            params: { email: currentUser.email },
            onSuccess: (data) => {
                setLoading(false);
                setIsChange(true);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [currentUser.email, currentUser.role]);

    return {
        messages,
        hasUnread,
        markAllAsRead,
        loading,
        error,
        isVisible,
        setIsVisible,
        deleteMessage,
    };
};
