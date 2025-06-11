import { useState, useEffect, useCallback } from "react";
import { useFetchData } from "./FetchData.js";

export const useMessages = (user) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isChange, setIsChange] = useState(0);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const fetchData = useFetchData();

    const fetchMessages = useCallback(() => {
        setLoading(true);
        fetchData({
            role: `/${user.role}`,
            type: `messages`,
            method: "GET",
            params: { email: user.email },
            onSuccess: (data) => {
                setMessages(data);
                setLoading(false);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [user.email, user.role, isChange]);

    const hasUnread = messages?.some((msg) => !msg.read);

    const markAllAsRead = () => {
        setLoading(true);
        fetchData({
            role: `/${user.role}`,
            type: "messages",
            method: "PUT",
            body: { read: true },
            params: { email: user.email },
            onSuccess: () => {
                fetchMessages();
                setLoading(false);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    };

    useEffect(() => {
        if (user.email) {
            fetchMessages();
        }
    }, [fetchMessages, user.email]);

    const deleteMessage = useCallback((id) => {
        setLoading(true);
        fetchData({
            role: `/${user.role}`,
            type: `messages/${id}`,
            method: "DELETE",
            params: { email: user.email },
            onSuccess: (data) => {
                setLoading(false);
                setIsChange(1);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [user.email, user.role]);


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
