🏦 Micro Credit Approval Engine

A full-stack web application designed to evaluate, score, and manage micro-credit loan applications. This system features a dynamic, rule-based scoring engine, real-time financial metrics visualization, and automated report generation, providing a complete solution for processing micro-loans.

## 🚀 Features

* **Dynamic Loan Evaluation:** An interactive `LoanForm` combined with a robust backend `loanScoringService` to evaluate applications based on configurable rules (`rules.json`).
* **Explainable AI (XAI) Layer:** A new `xaiService` translates the deterministic rule engine's output (score, DTI, triggered rules) into a plain-English, auditable underwriting summary. It calls a locally hosted LLM via the Ollama REST API (data never leaves the machine) and transparently falls back to a deterministic natural-language template if no local model is available — the decision itself always stays 100% rule-based, the AI layer only explains it.
* **Real-Time Visualizations:** Includes a `LiveDTIBar` (Debt-to-Income) and `ScoreGauge` to give immediate visual feedback on an applicant's financial health, plus an `AIInsightCard` showing the AI-generated explanation with outcome-aware styling.
* **Automated PDF Reports:** Generates downloadable, detailed PDF summaries of loan decisions using the backend `pdfReportService`, including a dedicated "AI Underwriting Summary" section for the audit trail.
* **Comprehensive Dashboards:** Dedicated pages for evaluating new loans (`LoanEvaluator`), reviewing past decisions (`History`), and managing active loans (`Portfolio`).
* **API Documentation:** Built-in Swagger API documentation for easy backend testing and integration.
* **Responsive UI:** A modern, clean frontend built with React, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**
* React (with Vite)
* Tailwind CSS (for styling)
* Axios (for API communication)

**Backend:**
* Node.js & Express.js
* Custom Rule-Based Engine (`rules.json`)
* PDF Generation Service
* Swagger UI (for API Docs)

## 📂 Project Structure

```text
Micro--Credit-Approval-Engine/
│
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── config/           # DB setup, rules.json, Swagger config
│   │   ├── controllers/      # API logic (loanController.js)
│   │   ├── routes/           # API endpoints (loanRoutes.js)
│   │   ├── services/         # Scoring, database, and PDF services
│   │   └── validations/      # Request validation logic
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
│
└── frontend/                 # React UI
    ├── public/
    └── src/
        ├── api/              # Axios instance and API calls
        ├── components/       # Reusable UI components (Form, Gauges, Badges)
        ├── layouts/          # Main application layout
        └── pages/            # Main views (Evaluator, History, Portfolio)
⚙️ Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js (v16 or higher recommended)

npm or yarn package manager

1. Backend Setup
Open a terminal and navigate to the backend directory:

Bash
cd Micro--Credit-Approval-Engine/backend
Install backend dependencies:

Bash
npm install
Start the backend development server:

Bash
npm run dev
# Note: Ensure you have your environment variables (.env) configured if required by db.js
The API will typically run on http://localhost:5000 or the port specified in your server configuration. You can access the Swagger UI at /api-docs.

2. Frontend Setup
Open a new terminal window and navigate to the frontend directory:

Bash
cd Micro--Credit-Approval-Engine/frontend
Install frontend dependencies:

Bash
npm install
Start the Vite development server:

Bash
npm run dev
The frontend application will typically be accessible at http://localhost:5173.

📚 API Documentation
This project uses Swagger for API documentation. Once the backend server is running, navigate to the designated Swagger endpoint (usually http://localhost:5000/api-docs depending on your swagger.js config) to explore and test the available loan evaluation and portfolio endpoints.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.
