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
            console.error("DATABASE ERROR:", err);
            return res.send("Error loading activities. Check the server logs.");
        }

        if (activities.length === 0) {
            console.log("No activities found in the database.");
        } else {
            console.log("Fetched activities:", activities);
        }

        // Organize workouts into categories based on predefined types
        const recommendedWorkouts = {
            highIntensity: activities.filter(a => a.category.toLowerCase() === "high-intensity"),
            strength: activities.filter(a => a.category.toLowerCase() === "strength"),
            functionality: activities.filter(a => a.category.toLowerCase() === "functionality"),
            cardio: activities.filter(a => a.category.toLowerCase() === "cardio")
        };

        // Fetch user progress data
        db.all("SELECT * FROM user_progress WHERE user_id = ?", [userId], (err, progressData) => {
            if (err) {
                console.error("Error fetching progress data:", err);
                return res.send("Error loading progress.");
            }

            res.render("activities", {
                activities,
                username: req.session.username,
                recommendedWorkouts,
                progressData
            });
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
            res.send('<script>alert("Successfully Logged!"); window.location="/your-progress";</script>');
        }
    );
});



// GET - Fetch Workout Data
router.get("/workouts", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    // Fetch all workouts from the user_progress table
    db.all(`SELECT * FROM user_progress WHERE user_id = ? AND category IN ('Cardio', 'Strength', 'Flexibility', 'Other')`, 
        [userId], 
        (err, progressData) => {
            if (err) {
                console.error("Error fetching progress data:", err);
                return res.send("Error fetching workout data.");
            }

            db.all(`SELECT * FROM user_progress WHERE user_id = ? ORDER BY date_logged DESC`, 
                [userId], 
                (err, workouts) => {
                    if (err) {
                        console.error("Error fetching workouts:", err);
                        return res.send("Error fetching workouts.");
                    }

                    res.render("workout", { workouts, progressData });
                }
            );
        }
    );
});


// POST - Log a New Workout
router.post("/log/workout", (req, res) => {
    const { category, duration, calories_burned } = req.body;
    const userId = req.session.userId;

    db.run(
        `INSERT INTO user_progress (user_id, category, value, date_logged) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, category, duration],
        (err) => {
            if (err) {
                console.error("Error logging workout:", err);
                return res.send("Error logging workout.");
            }
            res.redirect("/workouts");
        }
    );
});



// GET - Sleep Tracker Page
router.get("/sleep-tracker", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const query = `
        SELECT sleep_hours, sleep_quality, date_logged 
        FROM sleep_tracker 
        ORDER BY date_logged DESC
    `;

    db.all(query, [], (err, sleepData) => {
        if (err) {
            console.error("SQL Error fetching sleep data:", err.message);
            return res.send("Error fetching sleep data: " + err.message);
        }

        if (!sleepData || sleepData.length === 0) {
            console.warn("No sleep data found.");
        } else {
            console.log("Fetched sleep data:", sleepData);
        }

        // Calculate average values
        const avgSleepHours = sleepData.length > 0 
            ? (sleepData.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / sleepData.length).toFixed(1) 
            : "0.0";

        const avgSleepQuality = sleepData.length > 0 
            ? (sleepData.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / sleepData.length).toFixed(1) 
            : "0.0";

        res.render("sleep_tracker", { sleepData, avgSleepHours, avgSleepQuality });
    });
});


// POST - Log Sleep Data
router.post("/log/sleep", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const { sleep_hours, sleep_quality } = req.body;

    if (isNaN(sleep_hours) || sleep_hours < 0 || sleep_hours > 24) {
        return res.send("Invalid sleep hours. Must be between 0 and 24.");
    }

    if (isNaN(sleep_quality) || sleep_quality < 1 || sleep_quality > 10) {
        return res.send("Invalid sleep quality. Must be between 1 and 10.");
    }

    const date_logged = new Date().toISOString();

    const query = `
        INSERT INTO sleep_tracker (sleep_hours, sleep_quality, date_logged)
        VALUES (?, ?, ?)
    `;

    db.run(query, [sleep_hours, sleep_quality, date_logged], (err) => {
        if (err) {
            console.error("SQL Error logging sleep data:", err.message);
            return res.send("Error logging sleep data: " + err.message);
        }
        res.redirect("/sleep-tracker");
    });
});


// GET - Show Body Measurements Logging Page
router.get("/body-measurements", (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const userId = req.session.userId;

    // Fetch ALL progress data for the user
    const query = `
        SELECT category, value, date_logged 
        FROM user_progress 
        WHERE user_id = ? 
        AND category IN ('weight', 'bmi', 'bodyFat', 'muscleMass')
        ORDER BY date_logged DESC
    `;

    db.all(query, [userId], (err, progressData) => {
        if (err) {
            console.error("Error fetching progress data:", err);
            return res.send("Error fetching progress data.");
        }

        console.log("Data sent to frontend:", progressData);
        res.render("body_measurements", { progressData });
    });
});



// POST - Log Body Measurements
router.post("/log/body", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { weight, bmi, bodyFat, muscleMass } = req.body;

    if (!weight || !bmi || !bodyFat || !muscleMass) {
        return res.send("All fields are required!");
    }

    const query = `
        INSERT INTO user_progress (user_id, category, value, date_logged)
        VALUES 
            (?, 'weight', ?, datetime('now')),
            (?, 'bmi', ?, datetime('now')),
            (?, 'bodyFat', ?, datetime('now')),
            (?, 'muscleMass', ?, datetime('now'))
    `;

    db.run(query, [userId, weight, userId, bmi, userId, bodyFat, userId, muscleMass], (err) => {
        if (err) {
            console.error("Error logging body measurements:", err);
            return res.send("Error logging body measurements.");
        }
        res.redirect("/body-measurements");
    });
});


//workouts data
const workouts = {
    highIntensity: {
        name: "High-Intensity Workout",
        level: "Advanced",
        duration: "30 min",
        calories: "400 kcal",
        description: "A fast-paced workout designed to increase endurance and strength.",
        exercises: [
            { name: "Burpees", reps: "3 sets of 12 reps" },
            { name: "Jump Squats", reps: "3 sets of 15 reps" },
            { name: "Mountain Climbers", reps: "3 sets of 40 seconds" }
        ]
    },
    strength: {
        name: "Strength Training",
        level: "Intermediate",
        duration: "45 min",
        calories: "300 kcal",
        description: "Build muscle with strength training exercises.",
        exercises: [
            { name: "Deadlifts", reps: "3 sets of 8 reps" },
            { name: "Bench Press", reps: "3 sets of 10 reps" },
            { name: "Squats", reps: "3 sets of 12 reps" }
        ]
    },
    functionality: {
        name: "Functionality Fitness",
        level: "Beginner",
        duration: "40 min",
        calories: "350 kcal",
        description: "Improve flexibility and mobility with functional exercises.",
        exercises: [
            { name: "Lunges", reps: "3 sets of 10 reps" },
            { name: "Planks", reps: "3 sets of 40 seconds" },
            { name: "Resistance Band Exercises", reps: "3 sets of 15 reps" }
        ]
    },
    cardio: {
        name: "Cardio Workout",
        level: "All Levels",
        duration: "35 min",
        calories: "500 kcal",
        description: "Increase your heart rate with cardio exercises.",
        exercises: [
            { name: "Jump Rope", reps: "3 sets of 2 minutes" },
            { name: "Running", reps: "20 minutes" },
            { name: "Cycling", reps: "30 minutes" }
        ]
    }
};


// Route to get workout details
router.get("/workout-details", (req, res) => {
    const workoutId = req.query.id;
    const workout = workouts[workoutId];

    if (!workout) {
        return res.status(404).send("Workout not found.");
    }

    res.render("workout_details", { workout });
});



router.post("/mark-completed", async (req, res) => {
    const { workout } = req.body;
    const userId = req.session.userId;  // Ensure user is logged in

    if (!userId) {
        return res.status(403).json({ success: false, message: "User not authenticated" });
    }

    try {

        // Insert completion record into database
        await db.run(
            `INSERT INTO workout_progress (user_id, workout, completed_at) VALUES (?, ?, datetime('now', 'localtime'))`,
            [userId, workout]
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Error marking workout as completed:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.get("/activities", async (req, res) => {
    const userId = req.session.userId; // Ensure the user is logged in

    if (!userId) {
        return res.redirect("/login");
    }

    try {
        // Fetch completed workout counts
        const completedWorkouts = await db.all(
            `SELECT workout, COUNT(*) as count FROM workout_progress WHERE user_id = ? GROUP BY workout`,
            [userId]
        );

        const progressData = {};
        completedWorkouts.forEach(row => {
            progressData[row.workout] = Math.min(row.count * 20, 100); // Example: 5 completions = 100%
        });

        res.render("activities", { progressData });
    } catch (error) {
        console.error("Error fetching progress data:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
