const swaggerJsdoc = require("swagger-jsdoc");

// swaggerJsdoc scans route files for JSDoc comments and builds the spec
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Loan Approval Engine API",
      version: "1.0.0",
      description: "Transparent micro-loan approval system with explainable credit scoring",
    },
    servers: [{ url: "http://localhost:5001" }],
  },
  // Tell swagger-jsdoc where to find the @swagger comments
  apis: ["./src/routes/loanRoutes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
