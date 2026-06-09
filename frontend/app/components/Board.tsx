import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StageColumn from "./StageColumn";
import { useParams } from "react-router";

type WorkflowStage = { id: string; name: string; position: number };

type Props = {
  stages: WorkflowStage[];
  projectId: string;
  onAddStage: (name: string) => Promise<void>;
};

export default function Board({ stages, projectId, onAddStage }: Props) {
  const [isCreatingStage, setIsCreatingStage] = useState(false);
  const [stageName, setStageName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) return;
    await onAddStage(stageName);
    setStageName("");
    setIsCreatingStage(false);
  };

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 items-start scrollbar-thin scrollbar-thumb-slate-800">
      <AnimatePresence mode="popLayout">
        {stages.map((stage) => (
          <StageColumn key={stage.id} stage={stage} projectId={projectId} />
        ))}
      </AnimatePresence>

      {!isCreatingStage ? (
        <button
          onClick={() => setIsCreatingStage(true)}
          className="shrink-0 w-72 h-12 flex items-center justify-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:border-slate-600 transition-all"
        >
          + Add Stage Column
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="shrink-0 w-72 bg-slate-900 border border-blue-600/40 rounded-xl p-4 shadow-xl"
        >
          <input
            type="text"
            autoFocus
            placeholder="Stage identifier (e.g., QA Testing)..."
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3"
          />
          <div className="flex items-center gap-2 justify-end">
            <button type="button" onClick={() => setIsCreatingStage(false)} className="text-slate-400 text-xs px-2 py-1 hover:text-white">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-lg">
              Add Column
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}