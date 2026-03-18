const stripTrailingSlash = (val = "") => val.replace(/\/+$/, "");

const apiBaseFromEnv = stripTrailingSlash(import.meta.env.VITE_API_URL || "");
const frontendUrlFromEnv = stripTrailingSlash(
  import.meta.env.VITE_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")
);

if (!apiBaseFromEnv) {
  // Keep dev builds working, but make it obvious that the .env entry is missing
  console.warn("VITE_API_URL is not set; falling back to http://localhost:5000");
}

export const API_BASE = apiBaseFromEnv || "http://localhost:5000";
export const FRONTEND_URL = frontendUrlFromEnv;

export const ENV = {
  API_BASE,
  FRONTEND_URL,
};
