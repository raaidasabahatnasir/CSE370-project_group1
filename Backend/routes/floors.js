const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all floors
router.get("/", (req, res) => {
  db.query("SELECT * FROM floors", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// GET all floors density data from MySQL
router.get("/density", (req, res) => {
  const query = `
    SELECT
      f.name as floor,
      f.current_workers,
      f.capacity,
      (f.current_workers / f.capacity * 100) as density,
      SUM(CASE WHEN a.accident_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH) THEN 1 ELSE 0 END) as accident_count,
      (CASE WHEN f.current_workers > f.capacity THEN 10 ELSE 0 END)
        + (SUM(CASE WHEN a.accident_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH) THEN 1 ELSE 0 END) * 10)
        as risk_score
    FROM floors f
    LEFT JOIN accidents a ON a.floor_id = f.id
    GROUP BY f.id, f.name, f.current_workers, f.capacity
    ORDER BY f.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch floor data" });
    }
    res.json(results);
  });
});

// GET summary for dashboard
router.get("/summary", (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_floors,
      SUM(current_workers) as total_workers,
      (SELECT COUNT(*) FROM floors WHERE current_workers > capacity) as overcrowded_count
    FROM floors
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results[0]);
  });
});

module.exports = router;