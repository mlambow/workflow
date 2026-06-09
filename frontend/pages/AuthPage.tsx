
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { useNavigate } from "react-router";
import { useAuth } from "../app/context/AuthContext";

import AuthInput from "../app/components/AuthInput";
import ThemeToggle from "../app/components/ThemeToggle";

type FormData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);

    setError("");

    setFormData((prev) => ({
      ...prev,
      password: "",
    }));
  };

  const isFormInvalid =
    loading ||
    !formData.email ||
    !formData.password ||
    (!isLogin &&
      (!formData.first_name || !formData.last_name));

  const buttonText = loading
    ? isLogin
      ? "Signing in..."
      : "Creating account..."
    : isLogin
    ? "Sign In"
    : "Register";

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(
          formData.email,
          formData.password
        );
      } else {
        await register(
          formData.email,
          formData.password,
          formData.first_name,
          formData.last_name
        );
      }

      navigate("/dashboard", { replace: true });

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 transition-colors duration-500 dark:bg-slate-950">

      <ThemeToggle />

      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="p-8">

          <header className="mb-8 text-center">
            <motion.h1
              layout="position"
              className="text-3xl font-bold text-slate-800 dark:text-white"
            >
              {isLogin
                ? "Welcome Back"
                : "Create Account"}
            </motion.h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {isLogin
                ? "Log in to your account"
                : "Sign up to get started"}
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <AnimatePresence
              mode="popLayout"
              initial={false}
            >
              {!isLogin && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -20,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -20,
                  }}
                  className="space-y-4 overflow-hidden"
                >

                  <AuthInput
                    label="First Name"
                    name="first_name"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    autoComplete="given-name"
                    icon={<User size={18} />}
                  />

                  <AuthInput
                    label="Last Name"
                    name="last_name"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    autoComplete="family-name"
                    icon={<User size={18} />}
                  />

                </motion.div>
              )}
            </AnimatePresence>

            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              icon={<Mail size={18} />}
            />

            <AuthInput
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              minLength={5}
              onChange={handleChange}
              autoComplete={
                isLogin
                  ? "current-password"
                  : "new-password"
              }
              icon={<Lock size={18} />}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isFormInvalid}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white shadow-lg transition
              
              ${
                isFormInvalid
                  ? "cursor-not-allowed bg-gray-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50"
              }`}
            >
              {buttonText}

              {loading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <ArrowRight size={18} />
              )}
            </motion.button>

            {error && (
              <div className="flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 py-3 text-red-500 dark:text-red-400">
                {error}
              </div>
            )}
          </form>

          <footer className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </footer>

        </div>
      </motion.div>
    </div>
  );
}

