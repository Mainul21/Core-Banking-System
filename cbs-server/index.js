const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/auth");

const app = express();
const port = 5000||process.env.PORT;

// middleware


app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("CBS SERVER IS RUNNING");
});

app.get("/test-db", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW();"); // Fetch current timestamp
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Database query failed");
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});