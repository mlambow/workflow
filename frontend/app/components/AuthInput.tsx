import React from "react";

type AuthInputProps = {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  icon: React.ReactNode;
  autoComplete?: string;
  minLength?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function AuthInput({
  label,
  name,
  type,
  placeholder,
  value,
  icon,
  autoComplete,
  minLength,
  onChange,
}: AuthInputProps) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative mt-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          minLength={minLength}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>
    </div>
  );
}