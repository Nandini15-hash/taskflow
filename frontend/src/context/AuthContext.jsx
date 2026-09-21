import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

// createContext gives us a "box" that any descendant component can read
// from, without us having to pass `user`/`login`/`logout` down as props
// through every level of the component tree.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we've checked for a saved session

  // Runs once, when the app first loads. If a token was saved from a
  // previous visit, ask the backend "who does this token belong to?" so a
  // page refresh doesn't log the user out.
  useEffect(() => {
    const token = localStorage.getItem("taskflow_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("taskflow_token")) // token expired/invalid
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("taskflow_token", res.data.token);
    setUser(res.data);
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("taskflow_token", res.data.token);
    setUser(res.data);
  }

  function logout() {
    localStorage.removeItem("taskflow_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook: components call useAuth() instead of importing AuthContext
// and useContext separately every time.
export function useAuth() {
  return useContext(AuthContext);
}
