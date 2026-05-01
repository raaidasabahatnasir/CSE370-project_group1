const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "garment_factory_safety"
});

connection.connect((err) => {
  if (err) process.exit(1);
  connection.query("SHOW TABLES", (err, results) => {
    if (err) console.error(err);
    else console.log(results);
    connection.end();
  });
});
