import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

function apiErrorMessage(data) {
  if (!data || typeof data !== "object") return undefined;
  return data.error || data.msg || data.message;
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("frpews_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Let the browser set multipart boundaries; a bare Content-Type breaks Flask parsing.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (err) => {
    const data = err.response?.data;
    if (data && typeof data === "object") {
      const message = apiErrorMessage(data);
      if (message) data.error = message;
    }
    const url = err.config?.url || "";
    const isAuthAttempt = url.includes("/auth/login") || url.includes("/auth/register");
    if (err.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem("frpews_token");
    }
    return Promise.reject(err);
  }
);

export default client;
