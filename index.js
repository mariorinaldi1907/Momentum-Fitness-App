const express = require("express");
const router = express.Router();

// Route for the pre-login page (Homepage)
router.get("/", (req, res) => {
    res.render("prelogin"); // Ensure `views/prelogin.ejs` exists
});

let progressData = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fibers: 0,
    sodium: 0
};
// Dummy food items
const items = [
    { id: 1, name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { id: 2, name: "Brown Rice", calories: 215, protein: 5, carbs: 45, fats: 1.6 },
    { id: 3, name: "Broccoli", calories: 55, protein: 4, carbs: 11, fats: 0.5 },
];

// Temporary storage for logged meals (replace with database in future)
let loggedMeals = [];

const dailyGoal = {
    calories: 2000,
    carbs: 300,
    protein: 150,
    fats: 70,
    fibers: 30,
    sodium: 2300
};

const allLoggedMeals = [
    { userId: 1, name: "Chicken Salad", calories: 350, date: "2025-02-01" },
    { userId: 2, name: "Grilled Fish", calories: 400, date: "2025-02-02" },
    { userId: 3, name: "Veggie Stir Fry", calories: 300, date: "2025-02-03" },
    { userId: 4, name: "Pasta Alfredo", calories: 600, date: "2025-02-04" },
    { userId: 1, name: "Fruit Bowl", calories: 200, date: "2025-02-05" },
];

router.get("/nutrition", (req, res) => {
    console.log("Rendering Nutrition Page");
    
    res.render("nutrition", { progressData, loggedMeals, items, dailyGoal, allLoggedMeals});
});

module.exports = router;
