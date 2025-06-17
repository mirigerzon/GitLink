import { useContext, useState, useEffect } from "react";
import { useCurrentUser } from "../../context.jsx";
import { useMessages } from "../../hooks/Messages";
import useSound from 'use-sound';
import '../../style/Messages.css';

export const Messages = () => {
    const { currentUser } = useCurrentUser();
    const { messages, hasUnread, markAllAsRead, deleteMessage } = useMessages();
    const [open, setOpen] = useState(false);
    const [newMessageAlert, setNewMessageAlert] = useState(false);
    const [play] = useSound('/sounds/notification.mp3');

    const toggleOpen = () => setOpen(prev => !prev);

    useEffect(() => {
        if (currentUser?.initiatedAction) {
            setNewMessageAlert(true);
            play();
        }
    }, [currentUser?.initiatedAction]);

    return (
        <>
            <div className="icon">
                <button onClick={toggleOpen} className="messages-btn">
                    🔔
                    {hasUnread && <span className="new-messages"></span>}
                </button>
            </div>
            {newMessageAlert && hasUnread && !open && (
                <div className="new-message-alert" onClick={() => { setNewMessageAlert(false); setOpen(true); }}>
                    <p>🔵 You have a new message</p>
                </div>
            )}
            {open && (
                <div className="messages-popup">
                    <div className="messages-content">
                        <div className="messages-header">
                            <h4>Messages</h4>
                            <button onClick={markAllAsRead} className="mark-read-btn">Mark all as read</button>
                        </div>
                        <ul className="messages-list">
                            {messages.slice().reverse().map(msg => (
                                <li key={msg.id} className={`message-item ${msg.is_read ? '' : 'unread'}`}>
                                    <strong>{msg.title}</strong>
                                    <p>date: {msg.created_at}</p>
                                    <p>{msg.content}</p>
                                    <button onClick={() => deleteMessage(msg.id)}>delete</button>
                                </li>
                            ))}
                        </ul>
                        <button className="close-btn" onClick={() => setOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};
