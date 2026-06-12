import { useState } from "react";
import { motion } from "framer-motion";
import { useProject } from "~/context/ProjectContext";

type BoardCardProps = {
  id: string;
  title: string;
  gradientClass: string;
  onNavigate: () => void;
};

export default function BoardCard({ title, gradientClass, onNavigate }: BoardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(title);
  const { isAdmin } = useProject()

  const handleSaveSubmit = async (e: React.MouseEvent) => {
    
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={!isEditing ? onNavigate : undefined}
      className="group relative h-32 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col justify-between shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      {/* Decorative Gradient Tag Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-xl bg-linear-to-r ${gradientClass}`} />

      <div className="pt-2 w-full">
        {isEditing ? (
          <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
              autoFocus
            />
            <button onClick={handleSaveSubmit} className="text-xs text-emerald-500 font-bold px-1">Save</button>
            <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400 px-1">Cancel</button>
          </div>
        ) : (
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate pr-4">
            {title}
          </h3>
        )}
      </div>
    </motion.div>
  );
}