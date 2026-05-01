const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "garment_factory_safety"
});

connection.connect((err) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  
  connection.query("DESCRIBE workers", (err, results) => {
    if (err) {
      console.error("Query error:", err);
    } else {
      console.table(results);
    }
    connection.end();
  });
});
