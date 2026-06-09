import { Layout } from "lucide-react";

export const BrandLogo = () => {
  return (
    <a
      href="/dashboard"
      className="flex items-center gap-2 px-1 group"
    >
      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-colors duration-200">
        <Layout className="text-white" size={16} />
      </div>

      <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:flex">
        FlowState
      </span>
    </a>
  );
};