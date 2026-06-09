import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mb-8 flex gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {(["light", "dark", "system"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={`rounded-full p-2 transition-all ${
            theme === t
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          {t === "light" && <Sun size={18} />}
          {t === "dark" && <Moon size={18} />}
          {t === "system" && <Monitor size={18} />}
        </button>
      ))}
    </div>
  );
}