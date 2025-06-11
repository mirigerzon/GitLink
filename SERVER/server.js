const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./.env" });
const verifyToken = require("./middleware/verifyToken.js");
const authRoutes = require("./REST API/routes/auth.js");

const PORT = process.env.PORT || 3001;

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("", authRoutes);
app.use('/upload', express.static('./upload'));

const projectsRoutes = require("./REST API/routes/projects.js");
const developersRoutes = require("./REST API/routes/developers.js");
const recruitersRoutes = require("./REST API/routes/recruiters.js");
const jobsRoutes = require("./REST API/routes/jobs.js");
const usersRoutes = require("./REST API/routes/users.js");
app.use("/:role/jobs", verifyToken, jobsRoutes);
app.use("/:role/projects", verifyToken, projectsRoutes);
app.use("/:role/developers", verifyToken, developersRoutes);
app.use("/:role/recruiters", verifyToken, recruitersRoutes);
app.use("/:role/users", verifyToken, usersRoutes);

app.listen(PORT, () => {
    console.log(`The server runs on port: ${PORT}`);
});
