const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./.env" });
const verifyToken = require("./rest api/middleware/verifyToken.js");
const authRoutes = require("./rest api/routes/auth.js");
const path = require('path');
const { init } = require("./socket");
const { writeLog } = require('./log/log.js');
const PORT = process.env.PORT || 3001;
const messagesRoutes = require("./rest api/routes/messages.js");
const projectsRoutes = require("./rest api/routes/projects.js");
const developersRoutes = require("./rest api/routes/developers.js");
const recruitersRoutes = require("./rest api/routes/recruiters.js");
const jobsRoutes = require("./rest api/routes/jobs.js");
const job_applicationsRoutes = require("./rest api/routes/job_applications.js");
const usersRoutes = require("./rest api/routes/users.js");
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

const server = http.createServer(app);
const io = init(server);

server.listen(PORT, () => {
    console.log(`The server runs on port: ${PORT}`);
});

module.exports = { io };
