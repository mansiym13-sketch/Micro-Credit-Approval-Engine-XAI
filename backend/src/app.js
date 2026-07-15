const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const loanRoutes = require("./routes/loanRoutes");

const app = express();

// CORS — allows the frontend (different port) to call this backend
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Swagger UI — interactive API docs at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check route — confirms the server is running
app.get("/health", (req, res) => {
  res.json({ message: "Loan Approval Engine Running" });
});

// All loan-related routes are prefixed with /api/loan
app.use("/api/loan", loanRoutes);

module.exports = app;
