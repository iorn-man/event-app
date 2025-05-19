// Importing required modules 
const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const path = require("path");
const MongoStore = require('connect-mongo');

// Configure dotenv
dotenv.config();

// Import database connection
require("./config/conn");

// Import flash middleware
const flashmiddleware = require('./config/flash');

// Create an instance of an Express application
const app = express();

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
    require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// Configure static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_CONNECTION,
        ttl: 3600
    })
}));

// Use flash middleware
app.use(flash());
app.use(flashmiddleware.setflash);

// Configure body-parser for handling form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes for the Admin section
const adminRoutes = require("./routes/adminRoutes");
app.use(process.env.BASE_URL, adminRoutes);

// Routes for the API section
const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

// Routes for the Admin Api section
app.use('/admin/api', require('./routes/adminApiRoutes'));

//create server
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
});

