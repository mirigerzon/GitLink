const { Server } = require("socket.io");

let io;
function init(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("New client connected via Socket.IO:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized! Call init(server) first.");
    }
    return io;
}

module.exports = { init, getIO };
