import { useContext, useState } from "react";
import { CurrentUser } from "../../../App";
import { useMessages } from "../../hooks/Messages";
import '../../style/Messages.css';
import { set } from "react-hook-form";

export const Messages = () => {
    const { currentUser } = useContext(CurrentUser);
    const { messages, hasUnread, markAllAsRead, deleteMessage } = useMessages(currentUser);
    const [open, setOpen] = useState(false);
    console.log("Current user in Messages:", currentUser);
    const toggleOpen = () => setOpen(prev => !prev);

    return (
        <>
            <button onClick={toggleOpen} className="messages-btn">
                🔔
                {hasUnread && (
                    <span className="badge">•</span>
                )}
            </button>
            {open && (
                <div className="messages-popup">
                    <div className="messages-content">
                        <div className="messages-header">
                            <h4>Messages</h4>
                            <button onClick={markAllAsRead} className="mark-read-btn">Mark all as read</button>
                        </div>
                        <ul className="messages-list">
                            {messages.map(msg => (
                                <li key={msg.id} className={`message-item ${msg.read ? '' : 'unread'}`}>
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
