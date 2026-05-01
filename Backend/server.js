const express = require("express");
const app = express();
const path = require("path");

const cors = require("cors");

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/workers", require("./routes/workers"));
app.use("/incidents", require("./routes/incidents"));
app.use("/accidents", require("./routes/accidents"));
app.use("/compliance", require("./routes/compliance"));
app.use("/training", require("./routes/training"));
app.use("/emergency", require("./routes/emergency"));
app.use("/floors", require("./routes/floors"));
app.use("/alerts", require("./routes/alerts"));
app.use("/factories", require("./routes/factories"));
app.use("/machines", require("./routes/machines"));

// Static files (Moved below routes to prevent conflicts)
app.use(express.static(path.join(__dirname, "../Frontend")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// 404 Handler (JSON)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler (JSON)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(3000, () => {
  console.log("-----------------------------------------");
  console.log("SERVER VERSION: 2.1 (FIXED ROUTING)");
  console.log("Running on: http://localhost:3000");
  console.log("-----------------------------------------");
});