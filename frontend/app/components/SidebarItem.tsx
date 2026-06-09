import { useEffect, useState, type FormEvent, type ReactNode } from "react";

const SidebarItem = (
    {
        icon,
        label,
        active = false,
      }: {
        icon: ReactNode;
        label: string;
        active?: boolean;
      }
) => {
  return (
    <button
        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        {icon}
        {label}
      </button>
  )
}

export default SidebarItem