const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../config/db");

// GET risk scoring page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/incidents.html"));
});

// API: GET latest incidents from MySQL
router.get("/data", (req, res) => {
  const query = `
    SELECT i.*, f.name as floor_name 
    FROM incidents i 
    LEFT JOIN floors f ON i.floor_id = f.id 
    ORDER BY incident_date DESC 
    LIMIT 10
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

module.exports = router;
