export const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

export const API_URL = DEV_MODE
  ? "http://localhost:5000/api"
  : `${import.meta.env.VITE_API_URL}/api`;
