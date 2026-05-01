const express = require("express");
const router = express.Router();
const path = require("path");

// GET safe spots page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/safespots.html"));
});

module.exports = router;
