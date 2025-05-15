import { API_URL } from "./config";

export const fetchWithBaseUrl = (input, options = {}) => {
  const fullUrl = input.startsWith("http")
    ? input
    : `${API_URL}${input.startsWith("/") ? "" : "/"}${input}`;
  return fetch(fullUrl, options);
};
