const {Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
  // user: process.env.DB_USER,
  // password: process.env.DB_PASS,
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT,
  // database: process.env.DB_NAME
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
  max: 5, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds    
  connectionTimeoutMillis: 5000, // return an error after 2 seconds if connection could not be established
});

//check if the connection is successful
pool
    .connect()
    .then(() => console.log("Postgres connected"))
    .catch((err) => console.error("Postgres connection error", err));

module.exports = pool;