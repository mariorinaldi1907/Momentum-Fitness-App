const express = require("express");
const db = require("../db");

const router = express.Router();

// Get all available communities and the user's joined communities
router.get("/communities", (req, res) => {
    const userId = req.session.userId; // Ensure user session exists

    db.all("SELECT * FROM communities", [], (err, communities) => {
        if (err) {
            console.error("Error fetching communities:", err);
            return res.send("Error loading communities.");
        }

        if (!userId) {
            return res.render("community", { communities, myCommunities: [] }); // If not logged in, show only available communities
        }

        db.all(
            `SELECT c.* FROM communities c
             JOIN user_communities uc ON c.community_id = uc.community_id
             WHERE uc.user_id = ?`,
            [userId],
            (err, myCommunities) => {
                if (err) {
                    console.error("Error fetching user communities:", err);
                    return res.send("Error loading your communities.");
                }

                res.render("community", { communities, myCommunities });
            }
        );
    });
});


// Join a community
router.post("/join-community", (req, res) => {
    const userId = req.session.userId;
    const { communityId } = req.body;

    if (!userId) {
        return res.redirect("/login");
    }

    db.run(
        "INSERT INTO user_communities (user_id, community_id) VALUES (?, ?)",
        [userId, communityId],
        (err) => {
            if (err) {
                console.error("Join Community Error:", err);
                return res.send("You have already joined this community.");
            }
            res.redirect("/communities");
        }
    );
});

// Get user’s joined communities
router.get("/my-communities", (req, res) => {
    const userId = req.session.userId;

    db.all(
        `SELECT c.* FROM communities c
         JOIN user_communities uc ON c.community_id = uc.community_id
         WHERE uc.user_id = ?`,
        [userId],
        (err, myCommunities) => {
            if (err) {
                console.error("Error fetching user communities:", err);
                return res.send("Error loading your communities.");
            }
            res.render("my_communities", { myCommunities });
        }
    );
});

// Get community leaderboard
router.get("/community-leaderboard/:id", (req, res) => {
    const { id } = req.params;

    db.all(
        `SELECT u.username, SUM(a.points) AS total_points
         FROM activities a
         JOIN users u ON a.user_id = u.user_id
         WHERE a.community_id = ?
         GROUP BY u.user_id
         ORDER BY total_points DESC`,
        [id],
        (err, leaderboard) => {
            if (err) {
                console.error("Error fetching leaderboard:", err);
                return res.send("Error loading leaderboard.");
            }
            res.render("leaderboard", { leaderboard });
        }
    );
});

module.exports = router;
