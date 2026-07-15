import axios from "axios";

// All API calls go through this instance — base URL points to backend
const api = axios.create({
  baseURL: "http://localhost:5001",
});

export default api;
