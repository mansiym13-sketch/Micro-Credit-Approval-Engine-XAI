const mysql = require("mysql2/promise");

// Create a connection pool — reuses connections instead of opening a new one per query
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// Test the connection on startup so we know immediately if DB config is wrong
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database Connected Successfully");
    connection.release(); // return connection back to the pool
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1); // stop the server — no point running without a DB
  }
};

module.exports = { pool, connectDB };
