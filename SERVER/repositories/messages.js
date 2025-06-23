const { CREATE } = require("./generic");
const { getIO } = require("../socket");

const createMessage = async (messageData) => {
    if (!messageData) {
        throw new Error('Message data is required');
    }

    if (!messageData.user_id || !messageData.email || !messageData.title || !messageData.content) {
        throw new Error('User ID, email, title, and content are required');
    }

    try {
        const result = await CREATE("messages", messageData);

        const newMessage = {
            id: result.insertId,
            ...messageData,
        };

        try {
            const io = getIO();
            io.emit("new_message", newMessage);
        } catch (socketError) {
            console.warn('Socket emission failed:', socketError.message);
        }

        return newMessage;
    } catch (error) {
        console.error('Error in createMessage:', error.message);
        throw new Error(`Failed to create message: ${error.message}`);
    }
};

module.exports = {
    createMessage
};