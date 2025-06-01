const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: './.env' });
const verifyToken = require('./REST_API/verifyToken.js');
const authRoutes = require('./REST_API/routes/auth.js');
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));
app.use('/', authRoutes);

const guestGetRoutes = require('./REST_API/routes/guest/get.js');
const guestPostRoutes = require('./REST_API/routes/guest/post.js');
app.use('/guest', guestGetRoutes);
app.use('/guest', guestPostRoutes);

const devGetRoutes = require('./REST_API/routes/developer/get.js');
const devPostRoutes = require('./REST_API/routes/developer/post.js');
app.use('/developer', verifyToken, devGetRoutes);
app.use('/developer', verifyToken, devPostRoutes);

const recruiterGetRoutes = require('./REST_API/routes/recruiter/get.js');
const recruiterPostRoutes = require('./REST_API/routes/recruiter/post.js');
app.use('/recruiter', verifyToken, recruiterGetRoutes);
app.use('/recruiter', verifyToken, recruiterPostRoutes);

app.listen(PORT, () => {
  console.log(`The server runs on port: ${PORT}`);
});
