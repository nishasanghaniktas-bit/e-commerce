import { API_BASE } from "./apiBase";

/**
 * Normalize any image path into a browser-ready URL.
 * - Preserves absolute http/https URLs
 * - Trims whitespace and strips leading slashes on relative paths
 * - Falls back to the API base for server-hosted assets
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const trimmed = String(imagePath).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^data:image\//i.test(trimmed)) return trimmed; // already a data URI

  // normalize slashes to avoid mixed separators from Windows paths
  const normalized = trimmed.replace(/^\/+/, "").replace(/\\/g, "/");
  // safely encode spaces and other URI components in the relative path
  const encoded = encodeURI(normalized);
  return `${API_BASE}/${encoded}`;
};

export const getPlaceholder = (text = "No Image") =>
  `https://dummyimage.com/300x300/cccccc/555555&text=${encodeURIComponent(text)}`;
