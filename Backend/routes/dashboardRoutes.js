const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

console.log("DEBUG protect:", authMiddleware.protect);
console.log("DEBUG getDashboard:", dashboardController.getDashboard);

router.get(
  "/",
  authMiddleware.protect,
  dashboardController.getDashboard
);

module.exports = router;
