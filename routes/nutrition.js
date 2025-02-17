const express = require("express");
const router = express.Router();

// Store logged meals in session
router.use((req, res, next) => {
    if (!req.session.loggedMeals) {
        req.session.loggedMeals = [];
    }
    next();
});

// Dummy food items
const items = [
    { id: 1, name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { id: 2, name: "Brown Rice", calories: 215, protein: 5, carbs: 45, fats: 1.6 },
    { id: 3, name: "Broccoli", calories: 55, protein: 4, carbs: 11, fats: 0.5 },
];

// GET route
router.get("/nutrition", (req, res) => {
    res.render("nutrition", { progressData, loggedMeals, mealPlans, items: nutritionData });
});


let progressData = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fibers: 0,
    sodium: 0
};

// POST route to log a meal
router.post("/log-meal", (req, res) => {
    const { mealName, selectedFoods, customName, customCalories, customProtein, customCarbs, customFats } = req.body;

    if (!mealName) {
        return res.redirect("/nutrition");
    }

    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    const selectedIds = Array.isArray(selectedFoods) ? selectedFoods : selectedFoods ? [selectedFoods] : [];

    selectedIds.forEach(foodId => {
        const foodItem = items.find(item => item.id == foodId);
        if (foodItem) {
            totalCalories += foodItem.calories;
            totalProtein += foodItem.protein;
            totalCarbs += foodItem.carbs;
            totalFats += foodItem.fats;
        }
    });

    if (customName && customCalories && customProtein && customCarbs && customFats) {
        const newFoodItem = {
            id: items.length + 1,
            name: customName,
            calories: parseInt(customCalories),
            protein: parseInt(customProtein),
            carbs: parseInt(customCarbs),
            fats: parseInt(customFats),
        };

        items.push(newFoodItem);

        totalCalories += newFoodItem.calories;
        totalProtein += newFoodItem.protein;
        totalCarbs += newFoodItem.carbs;
        totalFats += newFoodItem.fats;
    }

    loggedMeals.push({ name: mealName, calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fats: totalFats, date: new Date().toLocaleDateString() });

    // Update progressData
    progressData.calories += totalCalories;
    progressData.protein += totalProtein;
    progressData.carbs += totalCarbs;
    progressData.fats += totalFats;

    res.redirect("/nutrition");
});

module.exports = router;
