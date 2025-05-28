const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const getRoutes = require('./REST_API/routes/get.js');
const postRoutes = require('./REST_API/routes/post.js');
const putRoutes = require('./REST_API/routes/put.js');
const deleteRoutes = require('./REST_API/routes/delete.js');
const verifyToken = require('./REST_API/verifyToken.js');
const app = express();
const PORT = 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,               
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// app.use(verifyToken);
app.use('/', getRoutes);
// app.use('/', postRoutes);
// app.use('/', putRoutes);
// app.use('/', deleteRoutes);

app.listen(PORT, () => {
  console.log(`The server runs on port: ${PORT}`);
});
