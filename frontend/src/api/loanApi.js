import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const evaluateLoan = async (payload) => {
  const { data } = await apiClient.post('/api/loan/evaluate', payload);
  return data;
};

export const getLoanHistory = async () => {
  const { data } = await apiClient.get('/api/loan/history');
  return data;
};

export const getPortfolioStats = async () => {
  const { data } = await apiClient.get('/api/loan/portfolio/stats');
  return data;
};

// Returns a URL — browser opens it to trigger PDF download
export const getPDFReportUrl = (applicantId) =>
  `http://localhost:5000/api/loan/report/${applicantId}`;

export default apiClient;
