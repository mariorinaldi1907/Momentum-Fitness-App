const express = require("express");
const db = require("../db");
const router = express.Router();

// GET - Show Activities Page with Recommended Workouts
router.get("/activities", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    const query = "SELECT * FROM activities";  // Fetch all activities

    db.all(query, [], (err, activities) => {
        if (err) {
            console.error("🔴 DATABASE ERROR:", err);
            return res.send("Error loading activities. Check the server logs.");
        }

        if (activities.length === 0) {
            console.log("⚠️ No activities found in the database.");
        } else {
            console.log("✅ Fetched activities:", activities);
        }

        // Organize workouts into categories based on predefined types
        const recommendedWorkouts = {
            highIntensity: activities.filter(a => a.category.toLowerCase() === "high-intensity"),
            strength: activities.filter(a => a.category.toLowerCase() === "strength"),
            functionality: activities.filter(a => a.category.toLowerCase() === "functionality"),
            cardio: activities.filter(a => a.category.toLowerCase() === "cardio")
        };

        // Render page with organized workout data
        res.render("activities", {
            activities,
            username: req.session.username,
            recommendedWorkouts
        });
    });
});

// POST - Log Activity Progress
router.post("/activities/log", (req, res) => {
    const { activityId, progress } = req.body;
    const userId = req.session.userId;

    db.run(`
        INSERT INTO user_activities (user_id, activity_id, progress, completed)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, activity_id) 
        DO UPDATE SET progress = ?`, 
        [userId, activityId, progress, false, progress], 
        (err) => {
            if (err) {
                console.error("Error logging activity:", err);
                return res.send("Error logging activity.");
            }
            res.redirect("/activities");
        }
    );
});

// POST - Mark Activity as Completed
router.post("/activities/complete", (req, res) => {
    const { activityId } = req.body;
    const userId = req.session.userId;

    db.run(`
        UPDATE user_activities 
        SET completed = ? 
        WHERE user_id = ? AND activity_id = ?`, 
        [true, userId, activityId], 
        (err) => {
            if (err) {
                console.error("Error marking activity as completed:", err);
                return res.send("Error marking activity as completed.");
            }
            res.redirect("/activities");
        }
    );
});

module.exports = router;
