const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Factories route" });
});

module.exports = router;
