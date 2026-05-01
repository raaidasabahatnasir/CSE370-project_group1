const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("../config/db"); // Import MySQL connection

// GET login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/login.html"));
});

// GET register page
router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/pages/register.html"));
});

// API: Register logic
router.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database Error: " + err.message });
      if (results.length > 0) return res.status(400).json({ error: "User already exists" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: "Registration Error: " + err.message });

        console.log("New User Registered in MySQL:", { name, email });
        res.json({ 
          message: "Registration successful",
          token: "fake-jwt-token",
          user: { name, email, role: "Manager" }
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// API: Login logic
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Login DB Error: " + err.message });
      if (results.length === 0) {
        console.log(`LOGIN FAILED: User not found (${email})`);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const user = results[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`LOGIN FAILED: Incorrect password for ${email}`);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      console.log("----------------------------");
      console.log("MYSQL LOGIN DETECTED");
      console.log("Name: ", user.name);
      console.log("Email:", user.email);
      console.log("----------------------------");

      res.json({ 
        token: "fake-jwt-token", 
        user: { name: user.name, email: user.email, role: user.role } 
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
