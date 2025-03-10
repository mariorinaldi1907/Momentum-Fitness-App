const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// SIGNUP - Show Signup Page
router.get("/signup", (req, res) => {
    res.render("signup", { error: null });
});

router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the username or email already exists
    db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], async (err, user) => {
        if (err) {
            console.error("Error querying database:", err);
            return res.render("signup", { error: "An error occurred. Please try again." });
        }

        if (user) {
            return res.render("signup", { error: "Username or email already exists. Try another one." });
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
                    return res.render("signup", { error: "An error occurred while signing up." });
                }
                res.redirect("/login"); // Redirect to login page
            }
        );
    });
});

// LOGIN - Show Login Page
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) {
            console.error("Login error:", err);
            return res.render("login", { error: "An error occurred. Please try again." });
        }

        if (!user) {
            return res.render("login", { error: "User not found. Please check your username." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.user_id;
            req.session.username = user.username;

            // Fetch the communities the user has joined
            db.all(`
                SELECT c.id, c.name, uc.joined_at 
                FROM communities c
                JOIN user_communities uc ON c.id = uc.community_id
                WHERE uc.user_id = ?
            `, [user.user_id], (err, userCommunities) => {
                if (err) {
                    console.error("Error fetching user-joined communities:", err);
                    return res.render("login", { error: "Error loading dashboard." });
                }

                // Fetch the latest sleep entry for the logged-in user
                db.get(`
                    SELECT sleep_hours, sleep_quality, date_logged
                    FROM sleep_tracker
                    WHERE user_id = ?
                    ORDER BY date_logged DESC
                    LIMIT 1
                `, [user.user_id], (err, sleepData) => {
                    if (err) {
                        console.error("Error fetching sleep data:", err);
                        return res.render("login", { error: "Error loading dashboard." });
                    }

                    if (!sleepData) {
                        sleepData = { sleep_hours: "N/A", sleep_quality: "N/A", date_logged: "N/A" };
                    }

                    // Render dashboard with user communities and sleep data
                    res.render("dashboard", { 
                        username: user.username,
                        userCommunities: userCommunities || [],
                        sleepData: sleepData
                    });
                });
            });

        } else {
            return res.render("login", { error: "Incorrect password. Please try again." });
        }
    });
});

// DASHBOARD
router.get("/dashboard", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    // Fetch user_communities data
    db.all(`
        SELECT uc.id, uc.user_id, uc.community_id, uc.joined_at, c.name
        FROM user_communities uc
        JOIN communities c ON uc.community_id = c.id
        WHERE uc.user_id = ?
    `, [userId], (err, userCommunities) => {
        if (err) {
            console.error("Error fetching user_communities:", err);
            return res.render("dashboard", { error: "Error loading dashboard." });
        }

        // Fetch the latest sleep entry for the logged-in user
        db.get(`
            SELECT sleep_hours, sleep_quality, date_logged
            FROM sleep_tracker
            WHERE user_id = ?
            ORDER BY date_logged DESC
            LIMIT 1
        `, [userId], (err, sleepData) => {
            if (err) {
                console.error("Error fetching sleep data:", err);
                return res.render("dashboard", { error: "Error loading dashboard." });
            }

            if (!sleepData) {
                sleepData = { sleep_hours: "N/A", sleep_quality: "N/A", date_logged: "N/A" };
            }

            res.render("dashboard", { 
                username: req.session.username || "User",
                userCommunities: userCommunities || [],
                sleepData: sleepData
            });
        });
    });
});

// LOGOUT
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
