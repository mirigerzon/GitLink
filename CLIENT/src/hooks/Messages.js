import { useState, useEffect, useCallback } from "react";
import { useFetchData } from "../hooks/fetchData.js";
import { useCurrentUser } from "../context.jsx";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

export const useMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isChange, setIsChange] = useState(0);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const fetchData = useFetchData();

    const { currentUser, setCurrentUser } = useCurrentUser();

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
                setHasUnread(data.some(msg => !msg.is_read));
                setLoading(false);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [currentUser.email, currentUser.role]);

    const markAllAsRead = () => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: "messages",
            method: "PUT",
            body: { is_read: true, email: currentUser.email },
            onSuccess: () => {
                setLoading(false);
                setIsChange(true);
                setHasUnread(false); 
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    };

    const markMessageAsRead = useCallback((messageId) => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: `messages/${messageId}`,
            method: "PUT",
            body: { is_read: true, email: currentUser.email },
            onSuccess: () => {
                setLoading(false);
                setIsChange(true);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [currentUser.email, currentUser.role]);

    const deleteMessage = useCallback((id) => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: `messages/${id}`,
            method: "DELETE",
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
    }, [currentUser.email, currentUser.role]);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            withCredentials: true,
        });

        socket.on("new_message", (message) => {
            if (message.email === currentUser.email) {
                setMessages((prevMessages) => {
                    const updated = [message, ...prevMessages];
                    setHasUnread(updated.some(msg => !msg.is_read));
                    return updated;
                });
            }
        });

        return () => socket.disconnect();
    }, [currentUser.email]);

    useEffect(() => {
        if (currentUser.email) {
            fetchMessages();
        }
    }, [isChange, currentUser.email, currentUser.initiatedAction]);

    return {
        messages,
        hasUnread,
        markAllAsRead,
        markMessageAsRead,
        loading,
        error,
        isVisible,
        setIsVisible,
        deleteMessage,
    };
};
