const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../config/db");

// GET accidents page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/accidents.html"));
});

// API: GET floors list for logging
router.get("/floors", (req, res) => {
  const query = "SELECT id, name FROM floors ORDER BY name";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch floors" });
    }
    res.json(results);
  });
});

// API: GET accident injury/fatality rates per floor (last 12 months)
router.get("/summary", (req, res) => {
  const query = `
    SELECT
      f.id,
      f.name AS floor,
      COUNT(a.id) AS accident_count,
      COALESCE(SUM(a.injury_count), 0) AS injury_count,
      COALESCE(SUM(a.fatality_count), 0) AS fatality_count,
      CASE
        WHEN COUNT(a.id) = 0 THEN 0
        ELSE ROUND(SUM(a.injury_count) / COUNT(a.id), 2)
      END AS injury_rate,
      CASE
        WHEN COUNT(a.id) = 0 THEN 0
        ELSE ROUND(SUM(a.fatality_count) / COUNT(a.id), 2)
      END AS fatality_rate
    FROM floors f
    LEFT JOIN accidents a
      ON a.floor_id = f.id
      AND a.accident_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
    GROUP BY f.id, f.name
    ORDER BY f.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch accident summary" });
    }
    res.json(results);
  });
});

// API: GET recent accidents list
router.get("/list", (req, res) => {
  const query = `
    SELECT
      a.id,
      f.name AS floor,
      a.injury_count,
      a.fatality_count,
      a.description,
      a.accident_date
    FROM accidents a
    LEFT JOIN floors f ON a.floor_id = f.id
    ORDER BY a.accident_date DESC
    LIMIT 50
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch accidents list" });
    }
    res.json(results);
  });
});

// API: Log a new accident
router.post("/log", (req, res) => {
  const { floor_id, injury_count, fatality_count, description } = req.body;

  if (!floor_id) {
    return res.status(400).json({ error: "Floor is required" });
  }

  const injuries = Number(injury_count) || 0;
  const fatalities = Number(fatality_count) || 0;

  if (injuries < 0 || fatalities < 0) {
    return res.status(400).json({ error: "Counts cannot be negative" });
  }

  db.query("SELECT id FROM floors WHERE id = ?", [floor_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to validate floor" });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid floor" });
    }

    const query = `
      INSERT INTO accidents (floor_id, injury_count, fatality_count, description)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [floor_id, injuries, fatalities, description || null], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to log accident" });
      }

      res.json({ message: "Accident logged", id: result.insertId });
    });
  });
});

module.exports = router;
