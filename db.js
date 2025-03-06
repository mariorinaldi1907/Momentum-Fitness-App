const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to the database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Create tables if they don't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS user_websites (
        website_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        website_url TEXT NOT NULL UNIQUE,
        website_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS logged_meals (
        meal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        meal_name TEXT NOT NULL,
        calories INTEGER DEFAULT 0,
        protein INTEGER DEFAULT 0,
        carbs INTEGER DEFAULT 0,
        fats INTEGER DEFAULT 0,
        fibers INTEGER DEFAULT 0,
        sodium INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`);

// Create activities table
db.run(`
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        duration INTEGER NOT NULL,
        difficulty TEXT NOT NULL
    )
`);

// Create user_activities table to track progress
db.run(`
    CREATE TABLE IF NOT EXISTS user_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    )
`);

// Create user_progress table
db.run(`
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    value REAL NOT NULL,
    date_logged TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)
`);    

db.run(`
CREATE TABLE IF NOT EXISTS sleep_tracker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date_logged DATETIME DEFAULT CURRENT_TIMESTAMP,
    sleep_hours REAL,
    sleep_quality INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)
`);

// Create Communities Table
db.run(`
    CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        max_pax INTEGER NOT NULL,
        created_by INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
    )
`);

// Create User_Communities Table
db.run(`
    CREATE TABLE IF NOT EXISTS user_communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        community_id INTEGER NOT NULL,
        joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    )
`);

// Ensure Default Communities Exist
db.get("SELECT COUNT(*) AS count FROM communities", (err, row) => {
    if (err) {
        console.error("Error checking communities:", err);
    } else if (row.count === 0) {
        console.log("No communities found. Inserting default communities...");
        db.run(`
            INSERT INTO communities (name, description, event_date, event_time, max_pax, created_by) VALUES 
            ('Strength Builders', 'A community focused on weight training and strength improvement.', '2025-04-10', '18:00', 30, 1),
            ('Cardio Warriors', 'For those who love running, cycling, and endurance training.', '2025-03-15', '07:00', 50, 1),
            ('Yoga & Mindfulness', 'A peaceful space to practice yoga, meditation, and mindfulness.', '2025-05-01', '10:00', 20, 1),
            ('Functional Fitness Crew', 'Improve flexibility, balance, and body control with functional training.', '2025-04-20', '16:00', 25, 1),
            ('HIIT Champions', 'A high-intensity interval training community for fat loss and endurance.', '2025-03-25', '19:00', 40, 1),
            ('Marathon Runners', 'Join us in preparing for upcoming marathons and long-distance running.', '2025-06-01', '06:30', 60, 1)
        `, (insertErr) => {
            if (insertErr) {
                console.error("Error inserting default communities:", insertErr);
            } else {
                console.log("Default communities inserted successfully.");
            }
        });
    } else {
        console.log("Communities already exist. No insertion needed.");
    }
});

module.exports = db;
