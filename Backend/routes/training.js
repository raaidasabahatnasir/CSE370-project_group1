const express = require("express");
const router = express.Router();
const path = require("path");

// GET training page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/training.html"));
});

module.exports = router;
