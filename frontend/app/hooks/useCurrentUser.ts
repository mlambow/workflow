import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { fetchCurrentUser } from "~/services/authServices";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => {
        if (err.message === "Unauthorized") {
          logout()
        }
        console.error("Could not load current user:", err)
      }
      );
  }, []);

  return user;
}