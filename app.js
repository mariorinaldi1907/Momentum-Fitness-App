const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Set up EJS as the template engine
app.set("view engine", "ejs");

// Serve static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
}));

// Import routes
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/index");
const nutritionRoutes = require("./routes/nutrition");
const communityRoutes = require("./routes/community");
const adminRoutes = require("./routes/admin");

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", nutritionRoutes);
app.use("/", communityRoutes);
app.use("/", adminRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
