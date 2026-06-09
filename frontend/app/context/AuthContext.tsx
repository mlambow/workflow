import { createContext, useContext, useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, first_name: string, last_name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
};

// type AuthContextType = {
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (
//     email: string,
//     password: string,
//     first_name: string,
//     last_name: string
//   ) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
//   loading: boolean;
// };

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true)

  // ✅ Load token on app start
  useEffect(() => {
    const stored = localStorage.getItem("token");
  
    if (!stored) {
      setLoading(false);
      return;
    }
  
    try {
      const decoded: any = jwtDecode(stored);
  
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setToken(null);
      } else {
        setToken(stored);
      }
    } catch {
      localStorage.removeItem("token");
      setToken(null);
    }
  
    setLoading(false);
  }, []);
  
  const register = async (email: string, password: string, first_name: string, last_name:string) => {
    const res = await fetch("http://127.0.0.1:8000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password,
      }),
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.detail || "Registration failed");
    }
  
    // auto login after register
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.location.href = "/"; // redirect to login
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        register,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};