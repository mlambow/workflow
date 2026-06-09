import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, FolderPlus } from "lucide-react";

type Props = {
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
};

export function CreateProjectModal({ onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Bind close action directly to hardware escape keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSave(name, description);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop backdrop blur mask layout layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Main Focus Entry Modal Canvas Container sheet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-2xl rounded-xl overflow-hidden p-6 text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <FolderPlus size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Initialize Project</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Setup a secure shared tracking coordinate track.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-p-name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Project Identifier
            </label>
            <input
              id="modal-p-name"
              type="text"
              required
              autoFocus
              placeholder="e.g., Workflow Task Manager Architecture"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/60 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="modal-p-desc" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Context Matrix Details (Optional)
            </label>
            <textarea
              id="modal-p-desc"
              rows={3}
              placeholder="Provide clean explicit metadata rules tracking guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/60 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md shadow-blue-600/10 transition-colors"
            >
              {submitting ? "Building..." : "Build Workspace"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}