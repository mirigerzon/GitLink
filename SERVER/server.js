const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./.env" });
const verifyToken = require("./rest_api/middlewares/verifyToken.js");
const authRoutes = require("./rest_api/routes/auth.js");
const path = require('path');
const { init } = require("./socket");
const { writeLog } = require('./common/logger.js');
const PORT = process.env.PORT || 3001;

const messagesRoutes = require("./rest_api/routes/messages.js");
const projectsRoutes = require("./rest_api/routes/projects.js");
const developersRoutes = require("./rest_api/routes/developers.js");
const recruitersRoutes = require("./rest_api/routes/recruiters.js");
const jobsRoutes = require("./rest_api/routes/jobs.js");
const job_applicationsRoutes = require("./rest_api/routes/job_applications.js");
const usersRoutes = require("./rest_api/routes/users.js");
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("", authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(verifyToken);
app.use("/:role/messages", messagesRoutes);
app.use("/:role/jobs", jobsRoutes);
app.use("/:role/job_applications", job_applicationsRoutes);
app.use("/:role/projects", projectsRoutes);
app.use("/:role/developers", developersRoutes);
app.use("/:role/recruiters", recruitersRoutes);
app.use("/:role/users", usersRoutes);
// app.use('*', (req, res) => {
//     res.status(404).json({ error: 'Path not found' });
// });
app.use((err, req, res, next) => {
    writeLog(`Error: ${err.message} - Stack: ${err.stack}`);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        error: {
            message: err.message || 'Internal server error',
            status: statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

const server = http.createServer(app);
const io = init(server);

server.listen(PORT, () => {
    console.log(`The server runs on port: ${PORT}`);
});

module.exports = { io };
