const express = require("express");
const router = express.Router();
const path = require("path");

// GET compliance page (static only)
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/compliance.html"));
});

module.exports = router;