const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../config/db");

// GET compliance page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/compliance.html"));
});

// API: GET compliance risk summary
router.get("/risk", (req, res) => {
  const query = `
    SELECT 
      f.name as floor,
      (f.current_workers / f.capacity * 100) as score,
      CASE 
        WHEN (f.current_workers / f.capacity) > 1.0 THEN 'High'
        WHEN (f.current_workers / f.capacity) > 0.8 THEN 'Medium'
        ELSE 'Low'
      END as risk_level
    FROM floors f
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

module.exports = router;