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

router.get("/nutrition", (req, res) => {
    console.log("Rendering Nutrition Page");
    
    res.render("nutrition", { progressData, loggedMeals, items });
});

module.exports = router;
