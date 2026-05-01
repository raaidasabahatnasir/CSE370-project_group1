const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

// Create connection without database specified first
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  multipleStatements: true // Crucial for running the SQL file
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error: Make sure XAMPP MySQL is started!");
    return;
  }
  
  console.log("Connected to MySQL Server.");

  // 1. Create Database if not exists
  connection.query("CREATE DATABASE IF NOT EXISTS garment_factory_safety", (err) => {
    if (err) return console.error("Could not create database:", err.message);

      // 2. Switch to the database
      connection.changeUser({ database: "garment_factory_safety" }, async (err) => {
        if (err) return console.error("Could not switch to database:", err.message);

        // 3. Check if 'users' table exists. If not, import database.sql
        connection.query("SHOW TABLES LIKE 'users'", (err, results) => {
          if (err) return console.error("Table check error:", err.message);

          if (results.length === 0) {
            console.log("Database tables missing. Importing database.sql...");
            
            const sqlPath = path.join(__dirname, "../../database.sql");
            const sql = fs.readFileSync(sqlPath, "utf8");

            connection.query(sql, async (err) => {
              if (err) {
                console.error("Import Error:", err.message);
              } else {
                console.log("Database initialized successfully!");
              }
            });
          } else {
            console.log("Database 'garment_factory_safety' is ready.");
          }

          // Seed default admin if no users exist (Runs every time server starts)
          const bcrypt = require("bcryptjs");
          (async () => {
            const hashedPass = await bcrypt.hash("admin123", 10);
            
            connection.query("SELECT COUNT(*) as count FROM users", (err, results) => {
              if (!err && results && results[0] && results[0].count === 0) {
                connection.query(
                  "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                  ["System Admin", "admin@factory.com", hashedPass, "Admin"],
                  (err) => {
                    if (!err) console.log("Default Admin Seeded: admin@factory.com / admin123");
                  }
                );
              }
            });
          })();
        });
      });
  });
});

module.exports = connection;
