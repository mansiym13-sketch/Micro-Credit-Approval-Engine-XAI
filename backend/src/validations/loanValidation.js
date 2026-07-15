// Middleware to validate loan application input
// Runs before the controller — blocks bad data early

const REQUIRED_FIELDS = [
  "monthly_income",
  "monthly_expense",
  "existing_loans",
  "credit_history_months",
  "defaults",
];

// Fields that must be whole numbers (no decimals allowed)
const INTEGER_FIELDS = ["existing_loans", "defaults"];

const validateLoanInput = (req, res, next) => {
  const data = req.body;

  for (const field of REQUIRED_FIELDS) {
    // Rule 1: All fields are required
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      return res.status(400).json({ success: false, message: `${field} is required` });
    }

    // Rule 2: All values must be numbers
    if (typeof data[field] !== "number" || isNaN(data[field])) {
      return res.status(400).json({ success: false, message: `${field} must be a valid number` });
    }

    // Rule 3: Negative values are not allowed
    if (data[field] < 0) {
      return res.status(400).json({ success: false, message: `${field} cannot be negative` });
    }
  }

  // Rule 4: existing_loans and defaults must be integers (no decimals)
  for (const field of INTEGER_FIELDS) {
    if (!Number.isInteger(data[field])) {
      return res.status(400).json({ success: false, message: `${field} must be a whole number` });
    }
  }

  // All checks passed — move to the controller
  next();
};

module.exports = { validateLoanInput };
