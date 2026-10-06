import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://taskflow-backend1-0k9q.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("task_manager_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses/errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("task_manager_token");
      localStorage.removeItem("task_manager_user");

      if (!window.location.pathname.includes("/login")) {
        window.location.assign("/login?expired=1");
      }
    }

    return Promise.reject(error);
  }
);

// Normal API error message
export const apiMessage = (
  error,
  fallback = "Something went wrong."
) => {
  return error?.response?.data?.message || fallback;
};

// AI error message
export const aiMessage = (error) => {
  const code = error?.response?.data?.code || error?.code;

  if (code === "AI_RATE_LIMITED") {
    return "AI Assistant is temporarily busy. Please try again in a moment.";
  }

  if (code === "AI_UNAVAILABLE") {
    return "AI Assistant is temporarily unavailable. Please try again later.";
  }

  if (code === "TASK_ERROR") {
    return "The task operation could not be completed. Please try again.";
  }

  if (code === "TASK_NOT_FOUND") {
    return "I couldn't find that task.";
  }

  if (code === "TASK_AMBIGUOUS") {
    return "I found multiple matching tasks. Please specify the task ID or a more specific title.";
  }

  if (code === "AI_INVALID_REQUEST") {
    return "I couldn't understand that task. Please try again with a clear title.";
  }

  if (!error?.response) {
    return "Unable to connect to the AI service. Please check your connection and try again.";
  }

  return "AI Assistant is temporarily unavailable. Please try again later.";
};

export default api;