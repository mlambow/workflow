import { Search } from "lucide-react";

export const NavbarSearch = () => {
  return (
    <div className="relative w-48 sm:w-80 md:w-md lg:w-xl transition-all duration-300">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        size={15}
      />

      <input
        type="text"
        placeholder="Search global projects, cards, matrices..."
        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none border border-transparent focus:border-blue-500/40 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder-slate-400 dark:placeholder-slate-600 shadow-inner"
      />
    </div>
  );
};