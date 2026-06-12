import { authFetch } from "~/helpers/authHelper";
import type { User } from "~/lib/types";

const BASE_URL = "http://127.0.0.1:8000";

export async function fetchCurrentUser(): Promise<User> {
  const token = localStorage.getItem('token')

  const res = await authFetch(`${BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error("Unauthorized")
  }
  
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return res.json();
};
