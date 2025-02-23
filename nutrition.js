const express = require("express");
const router = express.Router();

// Store logged meals in session
router.use((req, res, next) => {
  if (!req.session.loggedMeals) {
    req.session.loggedMeals = [];

    // Initialize progress data (current set to >0 to check if bar is showing)
    req.session.progressData = {
      calories: 100,
      carbs: 10,
      protein: 10,
      fats: 10,
      fibers: 10,
      sodium: 10,
    };
  }
  next();
});

// Dummy food items
const items = [
  {
    id: 1,
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    fibers: 0,
    sodium: 70,
  },
  {
    id: 2,
    name: "Brown Rice",
    calories: 215,
    protein: 5,
    carbs: 45,
    fats: 1.6,
    fibers: 3.5,
    sodium: 10,
  },
  {
    id: 3,
    name: "Broccoli",
    calories: 55,
    protein: 4,
    carbs: 11,
    fats: 0.5,
    fibers: 2.4,
    sodium: 30,
  },
];

const dailyGoal = {
  calories: 2000,
  carbs: 300,
  protein: 150,
  fats: 70,
  fibers: 30,
  sodium: 2300,
};

const allLoggedMeals = [
  { userId: 1, name: "Chicken Salad", calories: 350, date: "2025-02-01" },
  { userId: 2, name: "Grilled Fish", calories: 400, date: "2025-02-02" },
  { userId: 3, name: "Veggie Stir Fry", calories: 300, date: "2025-02-03" },
  { userId: 4, name: "Pasta Alfredo", calories: 600, date: "2025-02-04" },
  { userId: 1, name: "Fruit Bowl", calories: 200, date: "2025-02-05" },
];

// GET route
router.get("/nutrition", (req, res) => {    
  res.render("nutrition", {
      progressData: req.session.progressData,
      loggedMeals: req.session.loggedMeals || [],
      items,
      dailyGoal,
      allLoggedMeals,
  });
});

// POST route to log a meal and update progress
router.post("/log-meal", (req, res) => {
  const {
    mealName,
    selectedFoods,
    customName,
    customCalories,
    customProtein,
    customCarbs,
    customFats,
    customFibers,
    customSodium
  } = req.body;
  if (!mealName) return res.redirect("/nutrition");

  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFats = 0,
    totalFibers = 0,
    totalSodium = 0;
  const selectedIds = Array.isArray(selectedFoods)
    ? selectedFoods
    : [selectedFoods];

  selectedIds.forEach((id) => {
    const food = items.find((item) => item.id == id);
    if (food) {
      totalCalories += food.calories;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFats += food.fats;
      totalFibers += food.fibers;
      totalSodium += food.sodium;
    }
  });

  if (
    customName &&
    customCalories &&
    customProtein &&
    customCarbs &&
    customFats &&
    customFibers &&
    customSodium
  ) {
    totalCalories += parseInt(customCalories);
    totalProtein += parseInt(customProtein);
    totalCarbs += parseInt(customCarbs);
    totalFats += parseInt(customFats);
    totalFibers += parseInt(customFibers);
    totalSodium += parseInt(customSodium);
  }

  req.session.loggedMeals.push({
    name: mealName,
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fats: totalFats,
    fibers: totalFibers,
    sodium: totalSodium,
    date: new Date().toLocaleDateString(),
  });

  // Update progress data
  console.log("before loggin", req.session.progressData);

  req.session.progressData.calories += totalCalories;
  req.session.progressData.protein += totalProtein;
  req.session.progressData.carbs += totalCarbs;
  req.session.progressData.fats += totalFats;
  req.session.progressData.fibers += totalFibers;
  req.session.progressData.sodium += totalSodium;

  console.log("after logging", req.session.progressData);

  res.redirect("/nutrition");
});

module.exports = router;
