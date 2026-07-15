# 🏦 Explainable AI Powered Micro Credit Approval Engine

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-black?logo=express)
![MySQL](https://img.shields.io/badge/Database-MySQL-blue?logo=mysql)
![Ollama](https://img.shields.io/badge/AI-Ollama-orange)
![Swagger](https://img.shields.io/badge/API-Swagger-green?logo=swagger)


An enterprise-inspired **AI-powered micro-credit loan approval system** that combines a deterministic credit scoring engine with **Explainable AI (XAI)** to generate transparent, auditable, and business-friendly lending decisions.

The application simulates how modern financial institutions evaluate micro-credit applications using financial risk analytics, business rules, AI-generated underwriting summaries, portfolio insights, and automated PDF reports.

---

# 🎯 Problem Statement

Financial institutions must make lending decisions that are:

- Fast
- Accurate
- Transparent
- Auditable
- Explainable

Traditional loan approval systems often provide only an approval or rejection without explaining **why** the decision was made.

This project addresses that challenge by combining:

- Rule-Based Credit Scoring
- Explainable AI (XAI)
- Financial Risk Analytics
- Automated Reporting
- Portfolio Management

to build a transparent loan underwriting platform.

---

# ✨ Key Features

## 🤖 Explainable AI

- Explainable AI (XAI) powered underwriting summaries
- Human-readable loan decision explanations
- Ollama Llama 3 integration
- Automatic fallback to deterministic explanations if AI model is unavailable
- AI layer never changes the loan decision—it only explains it

---

## 💳 Loan Evaluation Engine

- Rule-based credit scoring
- Debt-to-Income (DTI) calculation
- Risk band classification
- Credit history evaluation
- Existing loan assessment
- Default history analysis
- Recommended loan amount
- EMI affordability calculation

---

## 📊 Financial Analytics

- Live Credit Score Gauge
- Live DTI Visualization
- Risk Analysis Dashboard
- Portfolio Statistics
- Loan History
- Business Rule Evaluation

---

## 📄 Report Generation

- Downloadable PDF Loan Report
- AI Underwriting Summary
- Complete Rule Evaluation
- Audit-Friendly Report Format

---

## 🌐 REST API

- Loan Evaluation API
- Loan History API
- Portfolio Analytics API
- PDF Report API
- Swagger Documentation

---

## 🎨 User Interface

- Modern FinTech Dashboard
- Responsive Design
- Real-time Validation
- Interactive Charts
- Dark Theme UI

---

# 🏗️ System Architecture

```text
                    React + Vite Frontend
                             │
                             ▼
                   Express REST API Server
                             │
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
 Rule-Based Credit Engine               Explainable AI Layer
                                               │
                                               ▼
                                      Ollama (Llama 3)
                                               │
        └────────────────────┬──────────────────┘
                             ▼
                        MySQL Database
                             │
                             ▼
                   PDF Report Generation
```

---

# 🛠️ Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| AI | Ollama, Llama 3, Explainable AI |
| API | Swagger |
| HTTP Client | Axios |
| Reporting | PDFKit |
| Version Control | Git & GitHub |

---

# 📂 Project Structure

```text
Micro-Credit-Approval-Engine-XAI
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── routes
│   │   ├── services
│   │   ├── validations
│   │   └── app.js
│   │
│   ├── server.js
│   └── .env
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── layouts
│   │   ├── pages
│   │   └── assets
│   │
│   └── public
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/mansiym13-sketch/Micro-Credit-Approval-Engine-XAI.git

cd Micro-Credit-Approval-Engine-XAI
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

Backend runs at:

```
http://localhost:5000
```

Swagger Documentation:

```
http://localhost:5000/api-docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=loan_approval_engine
DB_PORT=3306

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

# 📡 REST APIs

| Method | Endpoint | Description |
|----------|--------------------------|--------------------------|
| POST | /api/loan/evaluate | Evaluate Loan |
| GET | /api/loan/history | Loan History |
| GET | /api/loan/portfolio/stats | Portfolio Analytics |
| GET | /api/loan/report/:id | Download PDF Report |

---

# 📈 Financial Metrics Used

- Monthly Income
- Monthly Expenses
- Debt-to-Income Ratio (DTI)
- Existing Loans
- Credit History
- Payment Defaults
- Credit Score
- Risk Band
- Recommended Loan Amount
- EMI Affordability

---

# 🧠 Explainable AI Workflow

1. User submits loan application.

2. Rule Engine evaluates:

- Income
- DTI
- Credit History
- Existing Loans
- Defaults

3. Credit score is generated.

4. Loan decision is made.

5. Explainable AI converts technical rules into a natural-language underwriting summary.

6. Loan application is stored in MySQL.

7. PDF report is generated.

---

# 💼 Skills Demonstrated

### Artificial Intelligence

- Explainable AI (XAI)
- Generative AI Integration
- Prompt Engineering
- AI-assisted Decision Support

### Full Stack Development

- React.js
- Node.js
- Express.js
- REST APIs
- Axios

### Database

- MySQL
- Database Design
- CRUD Operations

### Software Engineering

- MVC Architecture
- API Development
- Validation
- Error Handling
- Business Rule Engine

### Financial Technology (FinTech)

- Credit Scoring
- Risk Analytics
- Loan Underwriting
- Financial Decision Support
- Debt-to-Income Analysis

### Developer Tools

- Swagger
- Git
- GitHub
- VS Code
- Postman

---

# 🚀 Future Enhancements

- AI Agent-based Loan Underwriting
- Fraud Detection using Machine Learning
- Credit Bureau API Integration
- Cloud Deployment (AWS)
- Docker Containerization
- Kubernetes Deployment
- CI/CD using GitHub Actions
- User Authentication & Authorization
- Admin Dashboard
- Predictive Loan Default Models

---



# 🎯 Learning Outcomes

- Built a complete Full Stack FinTech application.
- Integrated Explainable AI with a deterministic rule engine.
- Designed REST APIs using Express.js.
- Implemented MySQL database connectivity.
- Generated AI-assisted underwriting summaries.
- Built interactive financial dashboards.
- Created downloadable PDF audit reports.
- Documented APIs using Swagger.

---

# 📌 Use Cases

- Digital Lending Platforms
- NBFC Loan Processing
- Banking Risk Assessment
- Financial Decision Support Systems
- Explainable AI Research
- FinTech Innovation Projects

---

# 👩‍💻 Author

## Mansi Ahirrao

- AWS Certified Cloud Practitioner and AI Practitioner 
- AI & Machine Learning Enthusiast
- Cloud Computing
- DevOps
- Full Stack Development
- Financial Technology (FinTech)

**GitHub**

https://github.com/mansiym13-sketch

**LinkedIn**

https://www.linkedin.com/in/mansi-ahirrao-7652992a8/

---

# ⭐ If you found this project useful, consider giving it a Star!
