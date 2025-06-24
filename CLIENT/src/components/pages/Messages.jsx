import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "../../context.jsx";
import { useMessages } from "../../hooks/Messages";
import useSound from 'use-sound';
import { BsChatDots } from "react-icons/bs";
import { FaTrash, FaCheck, FaTimes, FaBell } from "react-icons/fa";
import { MdMarkEmailRead } from "react-icons/md";
import '../../style/Messages.css';
import Delete from '../common/Delete.jsx'

const Messages = () => {
    const { currentUser } = useCurrentUser();
    const { messages, hasUnread, markAllAsRead, markMessageAsRead, setIsChange } = useMessages();
    const [open, setOpen] = useState(false);
    const [newMessageAlert, setNewMessageAlert] = useState(false);
    const [play] = useSound('/sounds/notification.mp3');
    const messagesRef = useRef(null);

    const toggleOpen = () => setOpen(prev => !prev);

    useEffect(() => {
        if (currentUser?.initiatedAction) {
            setNewMessageAlert(true);
            play();
        }
    }, [currentUser?.initiatedAction, play]);

    return (
        <>
            <div className="icon">
                <button onClick={toggleOpen} className="messages-btn">
                    <BsChatDots />
                    {hasUnread && <span className="new-messages"></span>}
                </button>
            </div>

            {newMessageAlert && hasUnread && !open && (
                <div
                    className="new-message-alert"
                    onClick={() => {
                        setNewMessageAlert(false);
                        setOpen(true);
                    }}
                >
                    <p>
                        <FaBell className={'bell-icon'} />
                        You have a new message
                    </p>
                </div>
            )}

            {open && (
                <div className="messages-popup" ref={messagesRef}>
                    <div className="messages-content">
                        <div className="messages-header">
                            <button onClick={markAllAsRead} className="mark-read-btn">
                                <MdMarkEmailRead />
                                mark all as read
                            </button>
                            <button className="close-btn" onClick={() => setOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <ul className="messages-list">
                            {messages.slice().reverse().map(msg => (
                                <li
                                    key={msg.id}
                                    className={`message-item ${msg.is_read ? 'read' : 'unread'}`}
                                    style={!msg.is_read ? { '--unread-color': '#221089' } : {}}
                                >
                                    {!msg.is_read && (
                                        <div
                                            className="unread-indicator"
                                        ></div>
                                    )}

                                    <strong>{msg.title}</strong>
                                    <p>date: {msg.created_at}</p>
                                    <p>{msg.content}</p>

                                    <div className="message-actions">
                                        <Delete
                                            className="action-btn delete-btn"
                                            type="messages"
                                            itemId={msg.id}
                                            setIsChange={setIsChange}
                                            role={currentUser ? `/${currentUser.role}` : null}
                                        />
                                        {!msg.is_read && (
                                            <button
                                                onClick={() => markMessageAsRead(msg.id)}
                                                className="action-btn mark-btn"
                                                title="Mark as read"
                                            >
                                                <FaCheck />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};

export default Messages;