import axios from "axios";

// Use Vite env variable VITE_API_URL when provided (e.g. set in Vercel),
// otherwise fall back to the current origin + '/api/'.
const api =
  (import.meta.env.VITE_API_URL as string) || `${window.location.origin}/api/`;

export interface UserProfileToken {
  token: string;
  username: string;
  role: string;
}

export const loginApi = async (
  username: string,
  password: string
): Promise<UserProfileToken | null> => {
  try {
    const response = await axios.post<UserProfileToken>(api + "auth/login", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};
