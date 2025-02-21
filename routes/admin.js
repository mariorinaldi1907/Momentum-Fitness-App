const express = require("express");
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

module.exports = router;
