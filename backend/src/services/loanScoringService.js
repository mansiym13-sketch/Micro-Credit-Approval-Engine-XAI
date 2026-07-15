// Loan Scoring Engine
// Starts at 900 and deducts points based on risk rules.
// Some rules trigger an IMMEDIATE REJECT regardless of score.

// WHY DYNAMIC RULES?
// In banking, thresholds change based on RBI guidelines, market conditions,
// or product updates. A JSON config lets business teams update rules
// without touching code — no redeployment needed.
const rules = require("../config/rules.json");

// ─── EMI AFFORDABILITY CALCULATOR ────────────────────────────────────────────
// Standard EMI formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
// P = principal, r = monthly interest rate, n = tenure in months
const calculateEMIAffordability = (monthly_income, monthly_expense) => {
  const { annual_interest_rate, tenure_months, affordable_emi_percentage } = rules.loan;

  const r = annual_interest_rate / 12 / 100; // monthly rate = 1%

  // Step 1: What's left after expenses
  const disposable_income = monthly_income - monthly_expense;

  // Step 2: Applicant can afford 40% of disposable income as EMI
  const affordable_emi = parseFloat((affordable_emi_percentage * disposable_income).toFixed(2));

  // Step 3: Reverse the EMI formula to find max loan principal
  // P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  const factor = Math.pow(1 + r, tenure_months);
  const estimated_loan_eligibility = parseFloat(
    ((affordable_emi * (factor - 1)) / (r * factor)).toFixed(2)
  );

  return {
    affordable_emi,
    estimated_loan_eligibility,
    tenure_months,
    interest_rate: annual_interest_rate,
  };
};

const calculateLoanDecision = (data) => {
  const { monthly_income, monthly_expense, existing_loans, credit_history_months, defaults } = data;

  let score = 900;
  let immediateReject = false;
  const reasons = [];

  // ─── RULE 1: Income Check ─────────────────────────────────────────────────
  if (monthly_income < rules.minimum_income) {
    immediateReject = true;
    reasons.push({
      rule: "INCOME_CHECK",
      status: "FAIL",
      detail: `Income ₹${monthly_income} is below minimum threshold of ₹${rules.minimum_income}`,
    });
  } else {
    reasons.push({
      rule: "INCOME_CHECK",
      status: "PASS",
      detail: `Income ₹${monthly_income} meets the minimum requirement`,
    });
  }

  // ─── RULE 2: DTI (Debt-to-Income) Calculation ────────────────────────────
  // DTI tells us what % of income is already being spent
  const dti = parseFloat(((monthly_expense / monthly_income) * 100).toFixed(2));

  if (dti > rules.critical_dti) {
    score -= rules.score_deductions.high_dti + rules.score_deductions.critical_dti;
    reasons.push({
      rule: "DTI_CHECK",
      status: "FAIL",
      detail: `DTI is ${dti}% — exceeds ${rules.critical_dti}%, HIGH_RISK flag. Deducted ${rules.score_deductions.high_dti + rules.score_deductions.critical_dti} points`,
    });
  } else if (dti > rules.max_dti) {
    score -= rules.score_deductions.high_dti;
    reasons.push({
      rule: "DTI_CHECK",
      status: "FAIL",
      detail: `DTI is ${dti}% — exceeds ${rules.max_dti}%, HIGH_RISK flag. Deducted ${rules.score_deductions.high_dti} points`,
    });
  } else {
    reasons.push({
      rule: "DTI_CHECK",
      status: "PASS",
      detail: `DTI is ${dti}% — within acceptable range`,
    });
  }

  // ─── RULE 3: Defaults Check ───────────────────────────────────────────────
  if (defaults > rules.max_defaults) {
    immediateReject = true;
    score = 300; // hard floor for multiple defaults
    reasons.push({
      rule: "DEFAULTS_CHECK",
      status: "FAIL",
      detail: `${defaults} defaults on record — IMMEDIATE REJECT. Score set to 300`,
    });
  } else if (defaults === rules.max_defaults) {
    score -= rules.score_deductions.one_default;
    reasons.push({
      rule: "DEFAULTS_CHECK",
      status: "FAIL",
      detail: `1 default on record — Deducted ${rules.score_deductions.one_default} points`,
    });
  } else {
    reasons.push({
      rule: "DEFAULTS_CHECK",
      status: "PASS",
      detail: `No defaults on record`,
    });
  }

  // ─── RULE 4: Credit History Check ────────────────────────────────────────
  if (credit_history_months < rules.minimum_credit_history) {
    immediateReject = true;
    reasons.push({
      rule: "CREDIT_HISTORY_CHECK",
      status: "FAIL",
      detail: `Credit history is only ${credit_history_months} months — minimum ${rules.minimum_credit_history} months required. IMMEDIATE REJECT`,
    });
  } else if (credit_history_months <= rules.short_credit_history) {
    score -= rules.score_deductions.short_credit_history;
    reasons.push({
      rule: "CREDIT_HISTORY_CHECK",
      status: "FAIL",
      detail: `Credit history is ${credit_history_months} months — short history. Deducted ${rules.score_deductions.short_credit_history} points`,
    });
  } else {
    reasons.push({
      rule: "CREDIT_HISTORY_CHECK",
      status: "PASS",
      detail: `Credit history of ${credit_history_months} months is sufficient`,
    });
  }

  // ─── RULE 5: Existing Loans Check ────────────────────────────────────────
  if (existing_loans > rules.max_existing_loans) {
    score -= rules.score_deductions.excess_loans;
    reasons.push({
      rule: "EXISTING_LOANS_CHECK",
      status: "FAIL",
      detail: `${existing_loans} active loans — exceeds limit of ${rules.max_existing_loans}. Deducted ${rules.score_deductions.excess_loans} points`,
    });
  } else {
    reasons.push({
      rule: "EXISTING_LOANS_CHECK",
      status: "PASS",
      detail: `${existing_loans} active loan(s) — within acceptable limit`,
    });
  }

  // ─── DECISION LOGIC ───────────────────────────────────────────────────────
  // Clamp score between 300 and 900
  score = Math.min(900, Math.max(300, score));

  let decision;
  let risk_band;

  if (immediateReject) {
    decision = "REJECTED";
    risk_band = "HIGH";
  } else if (score >= rules.score_bands.low_risk_min) {
    decision = "APPROVED";
    risk_band = "LOW";
  } else if (score >= rules.score_bands.medium_risk_min) {
    decision = "APPROVED";
    risk_band = "MEDIUM";
  } else {
    decision = "REJECTED";
    risk_band = "HIGH";
  }

  // Recommended loan = multiplier x monthly income (only meaningful if approved)
  const recommended_loan_amount =
    decision === "APPROVED"
      ? monthly_income * rules.loan.recommended_loan_multiplier
      : 0;

  // EMI affordability — always calculated regardless of decision
  const emi_affordability = calculateEMIAffordability(monthly_income, monthly_expense);

  return {
    score,
    decision,
    risk_band,
    dti_percentage: dti,
    recommended_loan_amount,
    emi_affordability,
    reasons,
  };
};

module.exports = { calculateLoanDecision };
