import axios from "axios";

// A pre-configured axios instance so every other file just does
// `api.get("/tasks")` instead of repeating the full URL everywhere.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// An axios "interceptor" runs before every request goes out. Here we check
// localStorage for a saved token and, if one exists, attach it as the
// Authorization header automatically — so components never have to
// remember to do this themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
