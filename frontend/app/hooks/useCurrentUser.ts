import { useEffect, useState } from "react";
import { useAuth } from "~/context/AuthContext";
import type { User } from "~/lib/types";
import { fetchCurrentUser } from "~/services/authServices";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
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