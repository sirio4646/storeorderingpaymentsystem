import axios from "axios";
import { API_BASE } from "../../utils/apiBase";

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
    const response = await axios.post<UserProfileToken>(
      `${API_BASE}auth/login`,
      {
        username,
        password,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};
