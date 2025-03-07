const express = require("express");
const router = express.Router();

// Route for the pre-login page (Homepage)
router.get("/", (req, res) => {
    res.render("prelogin");
});

module.exports = router;
