const { pool } = require("../config/db");

// Saves the loan application input + scoring result + AI explanation into MySQL.
// `aiExplanation` is optional so existing callers (and tests) that don't pass
// it still work — the column simply stores NULL in that case.
const saveLoanApplication = async (applicantId, input, result, aiExplanation = null) => {
  const insertQuery = `
    INSERT INTO loan_applications (
      applicant_id,
      monthly_income,
      monthly_expense,
      existing_loans,
      credit_history_months,
      defaults_count,
      score,
      decision,
      risk_band,
      dti_percentage,
      recommended_loan_amount,
      reasons,
      affordable_emi,
      estimated_loan_eligibility,
      ai_explanation,
      ai_explanation_source,
      ai_explanation_model
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // ? placeholders prevent SQL injection — values are passed separately
  // reasons is stored as JSON string so it can be parsed back when generating PDF
  const values = [
    applicantId,
    input.monthly_income,
    input.monthly_expense,
    input.existing_loans,
    input.credit_history_months,
    input.defaults,
    result.score,
    result.decision,
    result.risk_band,
    result.dti_percentage,
    result.recommended_loan_amount,
    JSON.stringify(result.reasons),
    result.emi_affordability.affordable_emi,
    result.emi_affordability.estimated_loan_eligibility,
    aiExplanation?.ai_explanation ?? null,
    aiExplanation?.ai_explanation_source ?? null,
    aiExplanation?.ai_explanation_model ?? null,
  ];

  await pool.query(insertQuery, values);
};

module.exports = { saveLoanApplication };
