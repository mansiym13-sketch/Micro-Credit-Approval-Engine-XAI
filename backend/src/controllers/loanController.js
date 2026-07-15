const { randomUUID } = require("crypto");
const { calculateLoanDecision } = require("../services/loanScoringService");
const { saveLoanApplication } = require("../services/loanDatabaseService");
const { generateLoanPDF } = require("../services/pdfReportService");
const { generateAIExplanation } = require("../services/xaiService");
const { pool } = require("../config/db");

const applyForLoan = async (req, res) => {
  try {
    // Step 1: Generate unique ID for this application
    const applicant_id = randomUUID();

    // Step 2: Run the deterministic scoring engine with validated input.
    // This is the ONLY thing that decides APPROVED/REJECTED — it is fully
    // rule-based and fully auditable.
    const result = calculateLoanDecision(req.body);

    // Step 3: Explainable AI (XAI) interpretation layer.
    // Takes the structured, already-decided scoring payload and produces a
    // natural-language explanation for auditability/transparency. This call
    // NEVER influences the decision itself and NEVER throws — if the local
    // LLM is unreachable it transparently falls back to a deterministic
    // template so the API response is always complete.
    const aiExplanation = await generateAIExplanation({
      decision: result.decision,
      score: result.score,
      risk_band: result.risk_band,
      dti_percentage: result.dti_percentage,
      recommended_loan_amount: result.recommended_loan_amount,
      emi_affordability: result.emi_affordability,
      reasons: result.reasons,
    });

    // Step 4: Save to database — wrapped in try/catch so a DB failure
    // never blocks the API response (reliability over persistence)
    try {
      await saveLoanApplication(applicant_id, req.body, result, aiExplanation);
    } catch (dbError) {
      console.error("DB Save Failed:", dbError.message);
    }

    // Step 5: Return the final response
    const statusCode = result.decision === "APPROVED" ? 200 : 422;

    // Audit metadata — required in banking to trace every decision
    // back to the exact rule version and time it was made
    res.status(statusCode).json({
      applicant_id,
      score: result.score,
      decision: result.decision,
      risk_band: result.risk_band,
      reasons: result.reasons,
      dti_percentage: result.dti_percentage,
      recommended_loan_amount: result.recommended_loan_amount,
      emi_affordability: result.emi_affordability,
      ai_explanation: aiExplanation.ai_explanation,
      ai_explanation_source: aiExplanation.ai_explanation_source,
      ai_explanation_model: aiExplanation.ai_explanation_model,
      rule_engine_version: "v1.0",
      evaluation_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getLoanHistory = async (req, res) => {
  try {
    // Select only the fields needed — keeps response lightweight
    // ORDER BY created_at DESC — latest applications come first
    const [rows] = await pool.query(`
      SELECT applicant_id, score, decision, risk_band,
             DATE(created_at) AS created_at
      FROM loan_applications
      ORDER BY created_at DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch loan history" });
  }
};

const getPortfolioStats = async (req, res) => {
  try {
    // Single query using conditional aggregation — one DB call for all stats
    // CASE WHEN counts only rows matching a condition, else 0
    const [rows] = await pool.query(`
      SELECT
        COUNT(*)                                              AS total_applications,
        SUM(CASE WHEN decision = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN decision = 'REJECTED' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN risk_band = 'LOW'     THEN 1 ELSE 0 END) AS low_risk_count,
        SUM(CASE WHEN risk_band = 'MEDIUM'  THEN 1 ELSE 0 END) AS medium_risk_count,
        SUM(CASE WHEN risk_band = 'HIGH'    THEN 1 ELSE 0 END) AS high_risk_count,
        ROUND(AVG(score), 0)                                  AS average_credit_score
      FROM loan_applications
    `);

    const stats = rows[0];
    const total = parseInt(stats.total_applications);
    const approved = parseInt(stats.approved);

    // Calculate approval rate as a percentage string
    const approval_rate = total > 0 ? `${((approved / total) * 100).toFixed(1)}%` : "0%";

    res.status(200).json({
      total_applications: total,
      approved,
      rejected: parseInt(stats.rejected),
      approval_rate,
      low_risk_count: parseInt(stats.low_risk_count),
      medium_risk_count: parseInt(stats.medium_risk_count),
      high_risk_count: parseInt(stats.high_risk_count),
      average_credit_score: parseInt(stats.average_credit_score) || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch portfolio stats" });
  }
};

const downloadLoanReport = async (req, res) => {
  try {
    const { applicantId } = req.params;

    // Fetch the full application record from DB using applicant_id
    const [rows] = await pool.query(
      "SELECT * FROM loan_applications WHERE applicant_id = ? LIMIT 1",
      [applicantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Applicant not found" });
    }

    // Pass the record to the PDF service — it streams the file directly to res
    generateLoanPDF(res, rows[0], applicantId);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate report" });
  }
};

module.exports = { applyForLoan, getLoanHistory, getPortfolioStats, downloadLoanReport };
