const express = require("express");
const router = express.Router();
const db = require("../db");

// Store logged meals in session
router.use((req, res, next) => {
  if (!req.session.loggedMeals) {
    req.session.loggedMeals = [];
    req.session.progressData = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fats: 0,
      fibers: 0,
      sodium: 0,
    };
  }
  next();
});

// GET route
router.get("/nutrition", (req, res) => {
  const currentUserId = req.session.userId || 1;

  // First, get the current user's meals
  const userMealsQuery = `
      SELECT * FROM logged_meals
      WHERE user_id = ?
      ORDER BY created_at DESC
  `;

  // Then, get other users' meals
  const otherMealsQuery = `
      SELECT u.username, lm.*
      FROM logged_meals lm
      JOIN users u ON lm.user_id = u.user_id
      WHERE lm.user_id != ?
      ORDER BY lm.created_at DESC
  `;

  db.all(userMealsQuery, [currentUserId], (err, loggedMeals) => {
    if (err) {
      console.error("Error fetching user's meals:", err);
      return res.send("An error occurred while fetching your meals.");
    }

    console.log("Fetched user meals:", loggedMeals);

    db.all(otherMealsQuery, [currentUserId], (err, otherUsersMeals) => {
      if (err) {
        console.error("Error fetching other users' meals:", err);
        return res.send("An error occurred while fetching other users' meals.");
      }

      console.log("Fetched meals by other users:", otherUsersMeals);

      // Progress data
      let progressData = {
        calories: 0,
        carbs: 0,
        protein: 0,
        fats: 0,
        fibers: 0,
        sodium: 0,
      };

      // Sum up nutritional values from logged meals
      loggedMeals.forEach((meal) => {
        progressData.calories += meal.calories || 0;
        progressData.carbs += meal.carbs || 0;
        progressData.protein += meal.protein || 0;
        progressData.fats += meal.fats || 0;
        progressData.fibers += meal.fibers || 0;
        progressData.sodium += meal.sodium || 0;
      });

      res.render("nutrition", {
        loggedMeals,
        otherUsersMeals,
        progressData,
        dailyGoal: {
          calories: 2000,
          carbs: 300,
          protein: 150,
          fats: 70,
          fibers: 30,
          sodium: 2300,
        },
      });
    });
  });
});

// POST route to log a meal
router.post("/log-meal", (req, res) => {
  const { mealName, calories, protein, carbs, fats, fibers, sodium } = req.body;
  const userId = req.session.userId || 1;

  const query = `
      INSERT INTO logged_meals 
      (user_id, meal_name, calories, protein, carbs, fats, fibers, sodium)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [userId, mealName, calories, protein, carbs, fats, fibers, sodium],
    function (err) {
      if (err) {
        console.error("Error logging meal:", err);
        return res.send("An error occurred while logging the meal.");
      }
      console.log("Meal logged with ID:", this.lastID);
      res.redirect("/nutrition");
    }
  );
});

// Edit a Meal
router.post("/edit-meal/:mealId", (req, res) => {
  const mealId = req.params.mealId;
  const { mealName, calories, protein, carbs, fats, fibers, sodium } = req.body;

  const query = `
      UPDATE logged_meals 
      SET meal_name = ?, calories = ?, protein = ?, carbs = ?, fats = ?, fibers = ?, sodium = ?
      WHERE meal_id = ?
  `;

  db.run(
    query,
    [mealName, calories, protein, carbs, fats, fibers, sodium, mealId],
    function (err) {
      if (err) {
        console.error("Error updating meal:", err);
        return res.send("An error occurred while updating the meal.");
      }
      res.redirect("/nutrition");
    }
  );
});

// Delete a Meal
router.post("/delete-meal/:mealId", (req, res) => {
  const mealId = req.params.mealId;

  const query = `DELETE FROM logged_meals WHERE meal_id = ?`;

  db.run(query, [mealId], function (err) {
    if (err) {
      console.error("Error deleting meal:", err);
      return res.send("An error occurred while deleting the meal.");
    }
    res.redirect("/nutrition");
  });
});

// Get Progress Data
router.get("/progress-data", (req, res) => {
  const currentUserId = req.session.userId || 1;

  const query = `
      SELECT 
          SUM(calories) AS calories,
          SUM(protein) AS protein,
          SUM(carbs) AS carbs,
          SUM(fats) AS fats,
          SUM(fibers) AS fibers,
          SUM(sodium) AS sodium
      FROM logged_meals
      WHERE user_id = ?
  `;

  db.get(query, [currentUserId], (err, progressData) => {
    if (err) {
      console.error("Error fetching progress data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching progress data." });
    }
    res.json(progressData);
  });
});

module.exports = router;
