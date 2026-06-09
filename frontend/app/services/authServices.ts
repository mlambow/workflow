import { authFetch } from "~/helpers/authHelper";

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
};

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
}