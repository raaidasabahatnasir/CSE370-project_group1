const express = require("express");
const router = express.Router();
const path = require("path");

// GET accidents page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/accidents.html"));
});

module.exports = router;
