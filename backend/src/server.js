require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const app = require("./app");
const { connectDB } = require("./config/db");
const { initDatabase } = require("./config/initDatabase");

const PORT = process.env.PORT || 5000;

// Connect to DB first, then start the server
const start = async () => {
  await connectDB();
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
