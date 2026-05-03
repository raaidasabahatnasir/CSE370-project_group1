const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../config/db");

// GET safe spots page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/safespots.html"));
});

// API: GET floors list
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

// API: GET all safe spots
router.get("/spots", (req, res) => {
  const query = `
    SELECT s.id, s.floor_id, f.name as floor, s.location, s.instructions, s.updated_at
    FROM safe_spots s
    LEFT JOIN floors f ON s.floor_id = f.id
    ORDER BY f.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch safe spots" });
    }
    res.json(results);
  });
});

// API: UPSERT safe spot for a floor
router.post("/spots", (req, res) => {
  const { floor_id, location, instructions } = req.body;

  if (!floor_id || !location) {
    return res.status(400).json({ error: "Floor and location are required" });
  }

  const query = `
    INSERT INTO safe_spots (floor_id, location, instructions)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      location = VALUES(location),
      instructions = VALUES(instructions)
  `;

  db.query(query, [floor_id, location, instructions || null], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to save safe spot" });
    }
    res.json({ message: "Safe spot saved" });
  });
});

// API: GET active safe spot based on latest accident (last 12 months)
router.get("/active", (req, res) => {
  const query = `
    SELECT
      a.id as accident_id,
      a.accident_date,
      f.id as floor_id,
      f.name as floor,
      s.location,
      s.instructions
    FROM accidents a
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN safe_spots s ON s.floor_id = f.id
    WHERE a.accident_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
    ORDER BY a.accident_date DESC
    LIMIT 1
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch active safe spot" });
    }
    res.json(results[0] || null);
  });
});

// API: GET safe spot for a specific floor
router.get("/spot/:floorId", (req, res) => {
  const { floorId } = req.params;
  const query = `
    SELECT s.id, s.floor_id, f.name as floor, s.location, s.instructions
    FROM safe_spots s
    LEFT JOIN floors f ON s.floor_id = f.id
    WHERE s.floor_id = ?
    LIMIT 1
  `;

  db.query(query, [floorId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch safe spot" });
    }
    res.json(results[0] || null);
  });
});

module.exports = router;
