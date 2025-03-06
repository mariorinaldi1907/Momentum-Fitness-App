const express = require("express");
const db = require("../db");
const router = express.Router();

// GET - Show Communities Page
router.get("/communities", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    db.all("SELECT * FROM communities", [], (err, allCommunities) => {
        if (err) {
            console.error("Error fetching communities:", err);
            return res.send("Error loading communities.");
        }

        db.all(`
            SELECT c.id, c.name, c.description, c.event_date, c.event_time, c.max_pax
            FROM communities c
            JOIN user_communities uc ON c.id = uc.community_id
            WHERE uc.user_id = ?
        `, [userId], (err, joinedCommunities) => {
            if (err) {
                console.error("Error fetching joined communities:", err);
                return res.send("Error loading joined communities.");
            }

            const joinedCommunityIds = new Set(joinedCommunities.map(c => c.id));

            res.render("communities", { allCommunities, joinedCommunities, joinedCommunityIds });
        });
    });
});

// ✅ FIX: Handle POST Request to Join a Community
router.post("/join-community", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { communityId } = req.body;

    // Check if user is already in the community
    db.get("SELECT * FROM user_communities WHERE user_id = ? AND community_id = ?", 
    [userId, communityId], (err, row) => {
        if (row) {
            return res.redirect("/communities"); // ✅ Stay on Communities page
        }

        // Insert user into community
        db.run("INSERT INTO user_communities (user_id, community_id) VALUES (?, ?)", 
        [userId, communityId], (err) => {
            if (err) {
                console.error("Error joining community:", err);
                return res.send("Error joining community.");
            }
            res.redirect("/communities"); // ✅ Redirect to Communities page, NOT Dashboard
        });
    });
});


// ✅ FIX: Handle POST Request to Leave a Community
router.post("/leave-community", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { communityId } = req.body;

    // Remove the user from the community
    db.run("DELETE FROM user_communities WHERE user_id = ? AND community_id = ?", 
    [userId, communityId], (err) => {
        if (err) {
            console.error("Error leaving community:", err);
            return res.send("Error leaving community.");
        }
        res.redirect("/communities"); // Redirect to update the dashboard dynamically
    });
});

module.exports = router;
