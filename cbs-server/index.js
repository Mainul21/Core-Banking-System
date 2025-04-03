const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/openAccount");
const customerRoutes = require('./routes/deleteCustomerAccount');

const app = express();
const port = 5000||process.env.PORT;

// middleware


app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use('/api/customer', customerRoutes); //Delete customer account route

// customer info for employee dashboard
app.get("/api/customer-info", async (req, res) => {
  try{
    const result = await pool.query(`SELECT
              u.id,
              c.account_number, 
              c.balance,
              u.name,
              u.email 
       FROM users u
       LEFT JOIN customers c ON u.id = c.id
       where u.role = 'customer'`);
    res.json(result.rows);
  }catch(err){
    console.error(err.message);
    res.status(500).send("Database query failed");

  }
});


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