export const getApiUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_API_URL || "http://localhost:5000";
  }
  return process.env.VITE_API_URL || "http://localhost:5000";
};
