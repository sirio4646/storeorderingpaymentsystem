// Central API base for frontend requests. Uses Vite build-time env var when set,
// otherwise falls back to the current origin + /api/ so local dev and production
// both work without hard-coded hostnames.
export const API_BASE = (import.meta.env.VITE_API_URL as string) || `${window.location.origin}/api/`;
