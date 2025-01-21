const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const uploadRoutes = require('./routes/upload'); // Import the file upload logic
const uploadProf=require('./routes/uploadProf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');

require('dotenv/config');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Mount the upload routes at the desired path (e.g., '/upload')
app.use('/upload', uploadRoutes); // Handle upload at '/upload' route
app.use('/uploadProf',uploadProf);
app.use('/', router);

// MongoDB connection
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));

// Start the server
const port = process.env.PORT || 7000; // Default to 7000 if no port is defined in .env
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

module.exports = app;
