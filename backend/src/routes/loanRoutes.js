const express = require("express");
const router = express.Router();
const { validateLoanInput } = require("../validations/loanValidation");
const { applyForLoan, getLoanHistory, getPortfolioStats, downloadLoanReport } = require("../controllers/loanController");

/**
 * @swagger
 * /api/loan/evaluate:
 *   post:
 *     summary: Evaluate a loan application
 *     description: Runs the credit scoring engine and returns APPROVED or REJECTED with transparent reasons.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             monthly_income: 50000
 *             monthly_expense: 20000
 *             existing_loans: 1
 *             credit_history_months: 24
 *             defaults: 0
 *     responses:
 *       200:
 *         description: Loan APPROVED
 *         content:
 *           application/json:
 *             example:
 *               applicant_id: "550e8400-e29b-41d4-a716-446655440000"
 *               score: 900
 *               decision: "APPROVED"
 *               risk_band: "LOW"
 *               dti_percentage: 40
 *               recommended_loan_amount: 75000
 *               emi_affordability:
 *                 affordable_emi: 4800
 *                 estimated_loan_eligibility: 54000
 *                 tenure_months: 12
 *                 interest_rate: 12
 *               rule_engine_version: "v1.0"
 *               evaluation_timestamp: "2026-05-14T10:32:45.123Z"
 *               reasons:
 *                 - rule: "INCOME_CHECK"
 *                   status: "PASS"
 *                   detail: "Income ₹50000 meets the minimum requirement"
 *       422:
 *         description: Loan REJECTED
 *         content:
 *           application/json:
 *             example:
 *               applicant_id: "550e8400-e29b-41d4-a716-446655440000"
 *               score: 300
 *               decision: "REJECTED"
 *               risk_band: "HIGH"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "monthly_income is required"
 */
router.post("/evaluate", validateLoanInput, applyForLoan);

/**
 * @swagger
 * /api/loan/history:
 *   get:
 *     summary: Get all past loan evaluations
 *     description: Returns all loan applications sorted by latest first.
 *     responses:
 *       200:
 *         description: List of loan applications
 *         content:
 *           application/json:
 *             example:
 *               - applicant_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 score: 720
 *                 decision: "APPROVED"
 *                 risk_band: "LOW"
 *                 created_at: "2026-05-14"
 *               - applicant_id: "661f9511-f30c-52e5-b827-557766551111"
 *                 score: 300
 *                 decision: "REJECTED"
 *                 risk_band: "HIGH"
 *                 created_at: "2026-05-13"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to fetch loan history"
 */
router.get("/history", getLoanHistory);

/**
 * @swagger
 * /api/loan/portfolio/stats:
 *   get:
 *     summary: Get portfolio analytics
 *     description: Returns aggregate statistics across all loan applications.
 *     responses:
 *       200:
 *         description: Portfolio statistics
 *         content:
 *           application/json:
 *             example:
 *               total_applications: 10
 *               approved: 7
 *               rejected: 3
 *               approval_rate: "70.0%"
 *               low_risk_count: 4
 *               medium_risk_count: 3
 *               high_risk_count: 3
 *               average_credit_score: 720
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to fetch portfolio stats"
 */
router.get("/portfolio/stats", getPortfolioStats);

/**
 * @swagger
 * /api/loan/report/{applicantId}:
 *   get:
 *     summary: Download PDF report for a loan application
 *     description: Generates and downloads a PDF assessment report for the given applicant ID.
 *     parameters:
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the applicant
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Applicant not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Applicant not found"
 */
router.get("/report/:applicantId", downloadLoanReport);

module.exports = router;
