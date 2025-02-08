const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

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


// DASHBOARD - Protected Route
router.get("/dashboard", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    db.get("SELECT * FROM user_websites WHERE user_id = ?", [req.session.userId], (err, website) => {
        if (err) {
            console.error("Error fetching website:", err);
            return res.send("Error loading dashboard.");
        }

        res.render("dashboard", { website });
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
