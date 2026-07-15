// ─────────────────────────────────────────────────────────────────────────
// Explainable AI (XAI) Service
// ─────────────────────────────────────────────────────────────────────────
// Purpose:
//   The deterministic `loanScoringService` produces a fully auditable,
//   rule-based decision (score, DTI, triggered rules, etc). That output is
//   correct but written in engineering language ("DTI exceeds 45%, HIGH_RISK
//   flag"). This service converts that structured payload into a natural
//   language explanation a bank customer, credit officer, or regulator can
//   actually read — without ever changing the underlying decision.
//
//   IMPORTANT: The AI layer is purely an INTERPRETATION layer. It never
//   re-scores, overrides, or influences APPROVED/REJECTED — that stays 100%
//   deterministic and auditable in `loanScoringService`. This keeps the
//   system compliant: a regulator can always trace the decision back to the
//   exact rule that fired, and the AI text is clearly labeled as a
//   generated explanation, not a decision-maker.
//
// Design:
//   - Primary path: call a locally hosted LLM via the Ollama REST API
//     (http://localhost:11434/api/generate). This keeps applicant financial
//     data on-premises — critical for banking data-residency requirements.
//   - Resilience: underwriting APIs cannot depend on an optional local model
//     being online. If Ollama is unreachable, times out, or errors, this
//     service falls back to a deterministic natural-language generator built
//     from the same structured payload, so the API response and PDF report
//     ALWAYS contain a usable explanation.
//   - Every explanation is tagged with its `source` ("llm" | "template") and
//     `model` for audit purposes.
// ─────────────────────────────────────────────────────────────────────────

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const AI_TIMEOUT_MS = parseInt(process.env.AI_EXPLANATION_TIMEOUT_MS || "8000", 10);

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────────────
// Strict, role-boxed prompt. The model is explicitly told it is an
// interpreter of an already-made decision, not a decision-maker — this is
// the key compliance guardrail for a regulated lending use case.
const SYSTEM_PROMPT = `You are a senior credit underwriting analyst at a regulated micro-lending institution. Your ONLY job is to translate a structured, already-finalized credit decision (produced by a deterministic rule engine) into a short, professional, empathetic, customer-facing explanation.

STRICT RULES:
1. The decision (APPROVED or REJECTED) is FINAL and was made by a deterministic rule engine before you were called. You do not have the authority to change it, question it, or suggest it might be wrong.
2. Base your explanation ONLY on the structured data provided. Never invent numbers, rules, or facts that are not present in the payload.
3. Write in plain, professional English suitable for a bank customer with no financial background. Avoid jargon like "DTI" or "immediate reject" unless you immediately explain it in plain terms.
4. Be empathetic but factual, especially for rejections — explain what specifically drove the outcome and, where the data allows it, what would need to change.
5. Keep the response to 3-5 sentences. No greetings, no sign-offs, no markdown, no bullet points, no headers — plain prose only.
6. Never mention that you are an AI, a language model, or that this text was generated. Write as the underwriting summary itself.
7. Focus on transparency and auditability: a reader should understand exactly which factors mattered most.`;

// ─── HELPER: build the user-turn prompt from the structured payload ───────
const buildUserPrompt = (payload) => {
  const {
    decision,
    score,
    risk_band,
    dti_percentage,
    recommended_loan_amount,
    emi_affordability,
    reasons,
  } = payload;

  const failedRules = reasons.filter((r) => r.status === "FAIL");
  const passedRules = reasons.filter((r) => r.status === "PASS");

  const failedSummary = failedRules.length
    ? failedRules.map((r) => `- ${r.rule}: ${r.detail}`).join("\n")
    : "- None. All risk checks passed.";

  const passedSummary = passedRules.length
    ? passedRules.map((r) => `- ${r.rule}: ${r.detail}`).join("\n")
    : "- None.";

  return `Generate the underwriting explanation for this credit decision.

DECISION: ${decision}
CREDIT SCORE: ${score} (range 300-900)
RISK BAND: ${risk_band}
DEBT-TO-INCOME RATIO: ${dti_percentage}%
RECOMMENDED LOAN AMOUNT: ${decision === "APPROVED" ? `Rs. ${recommended_loan_amount}` : "N/A — application rejected"}
AFFORDABLE MONTHLY EMI: Rs. ${emi_affordability?.affordable_emi ?? "N/A"}
ESTIMATED LOAN ELIGIBILITY: Rs. ${emi_affordability?.estimated_loan_eligibility ?? "N/A"}

RULES THAT FAILED (drove the risk score down or caused rejection):
${failedSummary}

RULES THAT PASSED (positive factors):
${passedSummary}

Write the 3-5 sentence underwriting summary now.`;
};

// ─── PRIMARY PATH: local LLM via Ollama REST API ───────────────────────────
const callOllama = async (payload) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        options: { temperature: 0.3, num_predict: 300 },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(payload) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.message?.content?.trim();

    if (!text) {
      throw new Error("Ollama returned an empty response");
    }

    return { text, source: "llm", model: OLLAMA_MODEL };
  } finally {
    clearTimeout(timeout);
  }
};

// ─── FALLBACK PATH: deterministic natural-language template generator ─────
// Guarantees the API and PDF always ship a coherent explanation, even when
// no local LLM runtime is available (e.g. Ollama not installed on this
// machine, or the model has not been pulled yet). This is what keeps the
// XAI layer "production-grade" rather than a demo that breaks without a
// GPU/LLM runtime.
const generateTemplateExplanation = (payload) => {
  const { decision, score, risk_band, dti_percentage, recommended_loan_amount, reasons } = payload;
  const failedRules = reasons.filter((r) => r.status === "FAIL");

  const formatCurrency = (n) =>
    typeof n === "number" ? `Rs. ${n.toLocaleString("en-IN")}` : "Rs. 0";

  if (decision === "APPROVED") {
    const strengthNote =
      risk_band === "LOW"
        ? "This applicant demonstrates strong, low-risk financial health across every checked factor."
        : "This applicant clears all mandatory checks, though a few factors placed them in a moderate-risk band rather than the lowest tier.";

    const softNotes = failedRules.length
      ? ` A minor point worth noting: ${failedRules
          .map((r) => r.detail.toLowerCase())
          .join("; ")}. None of these were severe enough to affect eligibility.`
      : "";

    return (
      `This application has been approved with a credit score of ${score} out of 900, placing it in the ${risk_band} risk category. ` +
      `${strengthNote} The debt-to-income ratio of ${dti_percentage}% falls within an acceptable range, indicating the applicant has sufficient disposable income to comfortably service new debt. ` +
      `Based on this profile, a loan amount of ${formatCurrency(recommended_loan_amount)} is recommended as a responsible lending limit.${softNotes}`
    );
  }

  // REJECTED path
  if (failedRules.length === 0) {
    return (
      `This application has been declined. The final credit score of ${score} out of 900 fell below the minimum threshold required for approval, placing the applicant in the ${risk_band} risk category. ` +
      `While no single rule triggered an automatic rejection, the combination of risk factors reduced the overall score below our lending policy's minimum bar. ` +
      `We encourage the applicant to review their financial profile and consider reapplying once their credit standing improves.`
    );
  }

  const primaryReasons = failedRules
    .map((r) => r.detail.replace(/\.$/, ""))
    .join("; ");

  const isHardStop = failedRules.some((r) => /IMMEDIATE REJECT/i.test(r.detail));

  const guidance = isHardStop
    ? "This outcome was driven by a policy threshold that applies regardless of other positive factors on the application, so it could not be offset by strengths elsewhere in the profile."
    : "Addressing these specific factors — for example, reducing monthly debt obligations or building a longer track record of on-time repayments — would materially improve the outcome of a future application.";

  return (
    `This application has been declined with a resulting credit score of ${score} out of 900, placing it in the ${risk_band} risk category. ` +
    `The primary driver${failedRules.length > 1 ? "s" : ""} behind this outcome: ${primaryReasons}. ` +
    `${guidance} We understand this may be disappointing, and we want the applicant to have full clarity on exactly what influenced this decision.`
  );
};

// ─── PUBLIC ENTRYPOINT ──────────────────────────────────────────────────────
// Always resolves — never throws — so a slow/offline LLM can never block or
// fail the loan evaluation API response. Returns a structured object so the
// controller and PDF service can both consume text + audit metadata.
const generateAIExplanation = async (scoringPayload) => {
  try {
    const { text, source, model } = await callOllama(scoringPayload);
    return {
      ai_explanation: text,
      ai_explanation_source: source, // "llm"
      ai_explanation_model: model,
      ai_explanation_generated_at: new Date().toISOString(),
    };
  } catch (error) {
    // Local LLM unavailable, timed out, or errored — degrade gracefully.
    console.warn("[xaiService] Falling back to template explanation:", error.message);
    return {
      ai_explanation: generateTemplateExplanation(scoringPayload),
      ai_explanation_source: "template",
      ai_explanation_model: "rule-based-nlg-v1",
      ai_explanation_generated_at: new Date().toISOString(),
    };
  }
};

module.exports = { generateAIExplanation };
