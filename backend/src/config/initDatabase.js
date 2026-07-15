const { pool } = require("./db");

const initDatabase = async () => {
  // Create table if it doesn't exist yet
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loan_applications (
      id                        INT PRIMARY KEY AUTO_INCREMENT,
      applicant_id              VARCHAR(100) NOT NULL,
      monthly_income            DECIMAL(10,2) NOT NULL,
      monthly_expense           DECIMAL(10,2) NOT NULL,
      existing_loans            INT NOT NULL,
      credit_history_months     INT NOT NULL,
      defaults_count            INT NOT NULL,
      score                     INT NOT NULL,
      decision                  VARCHAR(20) NOT NULL,
      risk_band                 VARCHAR(20) NOT NULL,
      dti_percentage            DECIMAL(5,2),
      recommended_loan_amount   DECIMAL(10,2),
      reasons                   JSON,
      affordable_emi            DECIMAL(10,2),
      estimated_loan_eligibility DECIMAL(10,2),
      ai_explanation             TEXT,
      ai_explanation_source      VARCHAR(20),
      ai_explanation_model       VARCHAR(100),
      created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safely add new columns to existing table if they don't exist yet
  // This handles cases where the table was created before these columns were added
  const newColumns = [
    "ALTER TABLE loan_applications ADD COLUMN reasons JSON",
    "ALTER TABLE loan_applications ADD COLUMN affordable_emi DECIMAL(10,2)",
    "ALTER TABLE loan_applications ADD COLUMN estimated_loan_eligibility DECIMAL(10,2)",
    // XAI audit-trail columns — added via migration so existing deployments
    // upgrade cleanly without losing historical loan_applications data
    "ALTER TABLE loan_applications ADD COLUMN ai_explanation TEXT",
    "ALTER TABLE loan_applications ADD COLUMN ai_explanation_source VARCHAR(20)",
    "ALTER TABLE loan_applications ADD COLUMN ai_explanation_model VARCHAR(100)",
  ];

  for (const query of newColumns) {
    try {
      await pool.query(query);
    } catch (err) {
      // Error 1060 = column already exists — safe to ignore
      if (err.errno !== 1060) throw err;
    }
  }

  console.log("Loan Applications Table Ready");
};

module.exports = { initDatabase };
