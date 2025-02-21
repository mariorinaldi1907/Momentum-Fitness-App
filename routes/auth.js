const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();


// Middleware to check if user is an admin
function isAdmin(req, res, next) {
    if (req.session.userId && req.session.isAdmin) { 
        return next();
    }
    res.redirect("/login"); // Redirect non-admin users
}

// Admin Panel - Manage Communities
router.get("/admin/communities", isAdmin, (req, res) => {
    db.all("SELECT * FROM communities", [], (err, communities) => {
        if (err) {
            console.error("Error fetching communities:", err);
            return res.send("Error loading admin panel.");
        }
        res.render("admin_communities", { communities });
    });
});

// Add a new community (Admin only)
router.post("/admin/communities/add", isAdmin, (req, res) => {
    const { name, description, image_url } = req.body;
    const createdBy = req.session.userId;

    db.run(
        "INSERT INTO communities (name, description, image_url, created_by) VALUES (?, ?, ?, ?)",
        [name, description, image_url, createdBy],
        (err) => {
            if (err) {
                console.error("Error adding community:", err);
                return res.send("Community name already exists or invalid data.");
            }
            res.redirect("/admin/communities");
        }
    );
});

// LOGIN - Show Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// Handle login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) {
            console.error("Login error:", err);
            return res.send("An error occurred.");
        }

        if (!user) {
            return res.send("User not found.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.user_id;
            req.session.isAdmin = user.is_admin === 1; // Store admin status

            if (user.is_admin) {
                res.redirect("/admin/communities"); // Redirect admin to panel
            } else {
                res.redirect("/dashboard"); // Regular users go to dashboard
            }
        } else {
            res.send("Incorrect password.");
        }
    });
});

// SIGNUP - Show Signup Page
router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the username or email already exists
    db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], async (err, user) => {
        if (err) {
            console.error("Error querying database:", err);
            return res.send("An error occurred.");
        }

        if (user) {
            // If user exists, send a friendly error message
            return res.send("Username or email already exists. Please choose a different one.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        db.run(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword],
            (err) => {
                if (err) {
                    console.error("Signup error:", err);
                    return res.send("An error occurred while signing up.");
                }
                res.redirect("/login"); // Redirect to login page
            }
        );
    });
});


// LOGIN - Show Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) {
            console.error("Login error:", err);
            return res.send("An error occurred.");
        }

        if (!user) {
            return res.send("User not found.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.user_id;
            res.render("dashboard", { username: user.username }); // Pass username to the dashboard
        } else {
            res.send("Incorrect password.");
        }
    });
});


router.get("/dashboard", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login"); // Redirect if user is not logged in
    }

    db.get("SELECT username FROM users WHERE user_id = ?", [req.session.userId], (err, user) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.send("Error loading dashboard.");
        }

        if (!user) {
            return res.redirect("/login"); // If user doesn't exist, force re-login
        }

        res.render("dashboard", { username: user.username }); // Pass username to the template
    });
});


// LOGOUT - Destroy Session and Redirect
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.send("An error occurred while logging out.");
        }
        res.redirect("/"); // Redirect to pre-login page
    });
});

module.exports = router;
