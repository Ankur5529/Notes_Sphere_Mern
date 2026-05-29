// In development, use local server. In production, use the deployed URL.
export const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://notes-sphere-mern.onrender.com");