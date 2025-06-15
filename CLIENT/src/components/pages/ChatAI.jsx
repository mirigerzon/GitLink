import { useState, useRef, useEffect } from 'react';
import '../../style/ChatAI.css';

const ChatAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello! How can I help you today?', sender: 'gpt', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus on input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    // Send message to OpenAI
    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);

        try {
            // Using OpenAI API directly
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${'sk - proj - Unr_ClahlcLQIqgk7dOhzVRBSWQco4PGLNRnxfPTDf5iywkuwvhey3ZdMglYyCNKDwHk1Wsnt7T3BlbkFJlK9siN_Wglz4K6y2HjidmukTjMvXNvLUpGkCWZslrAkq_L8Z7VCxoBlTiWSChEZsQqjcjI4dIA'}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: currentInput }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const gptMessage = {
                id: Date.now() + 1,
                text: data.choices[0].message.content,
                sender: 'gpt',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, gptMessage]);
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'gpt',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Format timestamp
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="gpt-chat-widget">
            {/* Toggle button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="chat-toggle-btn"
                    aria-label="Open chat"
                >
                    💬
                    <span className="chat-notification">1</span>
                </button>
            )}

            {/* Chat window */}
            {isOpen && (
                <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-title">
                            <div className="status-indicator"></div>
                            <h3>GPT Assistant</h3>
                        </div>
                        <div className="chat-controls">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="control-btn"
                                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                            >
                                {isMinimized ? '🔲' : '➖'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="control-btn close-btn"
                                aria-label="Close chat"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages area */}
                    {!isMinimized && (
                        <>
                            <div className="messages-container">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.sender === 'user' ? 'user-message' : 'gpt-message'}`}
                                    >
                                        <div className="message-bubble">
                                            <p>{message.text}</p>
                                            <span className="message-time">
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading animation */}
                                {isLoading && (
                                    <div className="message gpt-message">
                                        <div className="message-bubble loading">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            <div className="input-container">
                                <div className="input-wrapper">
                                    <textarea
                                        ref={inputRef}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="message-input"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputText.trim() || isLoading}
                                        className="send-btn"
                                        aria-label="Send message"
                                    >
                                        ➤
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatAI;