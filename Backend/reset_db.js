const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error:", err.message);
    process.exit(1);
  }

  console.log("Connected to MySQL. Starting Hard Reset...");

  // 1. Drop the entire database
  connection.query("DROP DATABASE IF EXISTS garment_factory_safety", (err) => {
    if (err) {
      console.error("Error dropping database:", err.message);
      process.exit(1);
    }
    console.log("Database dropped.");

    // 2. Re-create the database
    connection.query("CREATE DATABASE garment_factory_safety", (err) => {
      if (err) {
        console.error("Error creating database:", err.message);
        process.exit(1);
      }
      console.log("Database created.");

      // 3. Switch to the database
      connection.changeUser({ database: "garment_factory_safety" }, (err) => {
        if (err) {
          console.error("Error switching database:", err.message);
          process.exit(1);
        }

        // 4. Read and execute database.sql
        const sqlPath = path.join(__dirname, "../database.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        connection.query(sql, (err) => {
          if (err) {
            console.error("Error importing SQL:", err.message);
          } else {
            console.log("Database schema initialized successfully from database.sql!");
          }
          connection.end();
        });
      });
    });
  });
});
