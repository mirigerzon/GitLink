const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: './.env' });
const verifyToken = require('./middleware/verifyToken.js');
const authRoutes = require('./routes/auth.js');
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

const guestGetRoutes = require('./routes/guest/get.js');
const guestPostRoutes = require('./routes/guest/post.js');
app.use('/guest', guestGetRoutes);
app.use('/guest', guestPostRoutes);

const devGetRoutes = require('./routes/developer/get.js');
const devPostRoutes = require('./routes/developer/post.js');
app.use('/developer', verifyToken, devGetRoutes);
app.use('/developer', verifyToken, devPostRoutes);

const recruiterGetRoutes = require('./routes/recruiter/get.js');
const recruiterPostRoutes = require('./routes/recruiter/post.js');
app.use('/recruiter', verifyToken, recruiterGetRoutes);
app.use('/recruiter', verifyToken, recruiterPostRoutes);

app.listen(PORT, () => {
  console.log(`The server runs on port: ${PORT}`);
});
