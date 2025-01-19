const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000; // Change this to 80 if running directly without reverse proxy
const API_KEY = "shfshdy77sd-68sd6f6df^&";
const rateLimit = require('express-rate-limit');

// Middleware
app.use(bodyParser.json());

// MySQL Connection

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: "Too many requests, please try again later." }
  });
const db = mysql.createConnection({
  host: "109.71.252.46", // Change to your server IP if remote
  user: "roblox_app",
  password: "VeryStrongPassword123!",
  database: "roblox_licensing",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

function checkApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== API_KEY) {
      return res.status(403).json({ error: "Forbidden: Invalid API key" });
    }
  
    next();  // Allow the request to proceed
  }
  
  // Use this middleware for the `add` route
  app.get("/add", checkApiKey, limiter, (req, res) => {
    const { user, product } = req.query;
  
    if (!user || !product) {
      return res.status(400).json({ error: "Missing user or product in query." });
    }
  
    const sql = "INSERT INTO licenses (userID, productName) VALUES (?, ?)";
    db.query(sql, [user, product], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to insert data." });
      }
      res.json({ message: "Data inserted successfully!", id: result.insertId });
    });
  });

// API Endpoint to Retrieve User's Products
app.get("/user", (req, res) => {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing user in query." });
  }

  const sql = "SELECT * FROM licenses WHERE userID = ?";
  db.query(sql, [user], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve data." });
    }
    res.json(results);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
