const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../config/db");

// GET workers page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/workers.html"));
});

// API: GET all workers data from MySQL
router.get("/data", (req, res) => {
  const query = `
    SELECT w.*, f.name as floor_name 
    FROM workers w 
    LEFT JOIN floors f ON w.floor_id = f.id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch workers" });
    }
    res.json(results);
  });
});

// API: Add new worker
router.post("/api/add", (req, res) => {
  const { name, workerid, floor_id, phonenumber } = req.body;

  if (!name || !workerid || !floor_id) {
    return res.status(400).json({ error: "Name, Worker ID, and Floor are required" });
  }

  // Check if floor can accept one more worker (Capacity + 1)
  db.query("SELECT current_workers, capacity FROM floors WHERE id = ?", [floor_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });
    if (results.length === 0) return res.status(404).json({ error: "Floor not found" });

    const { current_workers, capacity } = results[0];

    if (current_workers >= capacity + 1) {
      return res.status(400).json({ 
        error: `Floor capacity exceeded. You can only add up to ${capacity + 1} workers (Capacity + 1 extra).` 
      });
    }

    const query = "INSERT INTO workers (name, worker_id, floor_id, phone_number) VALUES (?, ?, ?, ?)";
    db.query(query, [name, workerid, floor_id, phonenumber], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to add worker: " + err.message });
      }

      // Increment current_workers on the floor
      db.query("UPDATE floors SET current_workers = current_workers + 1 WHERE id = ?", [floor_id], (err) => {
        if (err) console.error("Failed to update floor count:", err);
        res.json({ message: "Worker added successfully", workerId: result.insertId });
      });
    });
  });
});

// API: Remove worker
router.delete("/api/remove/:id", (req, res) => {
  const workerId = req.params.id;

  // 1. Get worker's floor_id first
  db.query("SELECT floor_id FROM workers WHERE id = ?", [workerId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });
    if (results.length === 0) return res.status(404).json({ error: "Worker not found" });

    const floorId = results[0].floor_id;

    // 2. Delete the worker
    db.query("DELETE FROM workers WHERE id = ?", [workerId], (err) => {
      if (err) return res.status(500).json({ error: "Failed to remove worker: " + err.message });

      // 3. Decrement current_workers on the floor
      db.query("UPDATE floors SET current_workers = GREATEST(0, current_workers - 1) WHERE id = ?", [floorId], (err) => {
        if (err) console.error("Failed to update floor count:", err);
        res.json({ message: "Worker removed successfully" });
      });
    });
  });
});

module.exports = router;