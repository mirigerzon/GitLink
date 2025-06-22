const { CREATE } = require("./generic");
const { getIO } = require("../socket");

const createMessage = async (messageData) => {
    const result = await CREATE("messages", messageData);
    const newMessage = {
        id: result.insertId,
        ...messageData,
    };
    const io = getIO();
    io.emit("new_message", newMessage);
    return newMessage;
};

module.exports = {
    createMessage
};