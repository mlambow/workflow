import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, AlignLeft } from "lucide-react";
import { authFetch } from "~/helpers/authHelper"; // Using your exact helper path alias

// TypeScript structural typing matching your backend TaskRead Pydantic schema
type Task = {
  id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High" |"Urgent";
  status: string;
  stage_id: string;
  created_at: string;
};

type WorkflowStage = { id: string; name: string; position: number };

type Props = {
  stage: WorkflowStage;
  projectId: string;
};

export default function StageColumn({ stage, projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Interactive Composition States
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");

  const [isEditingStage, setIsEditingStage] = useState(false);
  const [editStageName, setStageName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Step 1: Query tasks pipeline tied to this stage identifier on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    authFetch(`http://localhost:8000/stages/${stage.id}/tasks?project_id=${projectId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.text();
          console.log("BACKEND ERROR:", err);
          throw new Error(err);
        }
        return res.json()
      })
      .then((data: Task[]) => {
        if (isMounted) setTasks(data);
      })
      .catch((err) => console.error("Error synchronizing task lists:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stage.id]);

  // Step 2: Handle dispatching new task context items to your FastAPI pipeline
  const handleTaskSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      // ✅ Sticking exactly to your hierarchy: stage.id targets the currently opened workflow stage
      const res = await authFetch(`http://localhost:8000/stages/${stage.id}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          priority: taskPriority,
        }),
      });

      if (!res.ok) throw new Error("Backend failed to construct task row.");
      const savedTask: Task = await res.json();

      // Append immediately to state array
      setTasks((prev) => [...prev, savedTask]);
      
      // Flush compose forms clean
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("Medium");
      setIsComposeOpen(false);
    } catch (err) {
      console.error("Failed to append task record card:", err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col shrink-0 w-72 bg-slate-900 border border-slate-800/80 rounded-xl p-4 max-h-[78vh] shadow-xl"
    >
      {/* COLUMN HEADER ATTRIBUTES */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-3">
        <div className="flex items-center gap-2 max-w-[75%]">
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider truncate">
            {stage.name}
          </h3>
          <span className="text-[10px] bg-slate-950 font-bold border border-slate-800/80 rounded-md px-1.5 py-0.5 text-slate-400">
            {tasks.length}
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800/50">
          POS-{stage.position}
        </span>
      </div>

      {/* CORE INTERACTIVE TASK CONTAINER CANVAS */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 min-h-37.5 scrollbar-thin scrollbar-thumb-slate-950">
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={task.id}
              className="w-full bg-slate-950 border border-slate-800/70 hover:border-slate-700 p-3.5 rounded-lg shadow-sm group transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2 relative overflow-hidden"
            >
              {/* Dynamic Priority Pill Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    task.priority === "Urgent"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : task.priority === "High"
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : task.priority === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              {/* Task Core Description Metadata strings */}
              <div>
                <h4 className="font-medium text-xs text-slate-200 group-hover:text-blue-400 transition-colors tracking-wide leading-snug">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-normal flex items-start gap-1">
                    <AlignLeft size={12} className="shrink-0 mt-0.5 opacity-60" />
                    <span>{task.description}</span>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* LOADING ANIME MASK TRANSITION */}
        {loading && (
          <div className="text-center py-6 text-[10px] tracking-widest font-semibold text-slate-500 animate-pulse uppercase">
            Syncing lists...
          </div>
        )}

        {/* EMPTY TRACK STATE DESCRIPTOR LAYOUT SHEET */}
        {tasks.length === 0 && !loading && !isComposeOpen && (
          <div className="text-center text-[10px] text-slate-500 py-8 border border-dashed border-slate-800/40 rounded-lg italic">
            No active records found
          </div>
        )}
      </div>

      {/* EXPANDABLE INLINE COMPOSE FORM MATRIX SHEET */}
      <div className="mt-3">
        <AnimatePresence initial={false}>
          {!isComposeOpen ? (
            <motion.button
              onClick={() => setIsComposeOpen(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 p-2 rounded-lg transition-all cursor-pointer shadow-inner"
            >
              <Plus size={14} />
              <span>Add task record</span>
            </motion.button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleTaskSubmission}
              className="bg-slate-950 border border-blue-500/40 rounded-lg p-3 space-y-2.5 shadow-xl overflow-hidden"
            >
              <input
                type="text"
                autoFocus
                required
                placeholder="Write task objective header..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />

              <textarea
                placeholder="Add secondary descriptive notes... (optional)"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />

              {/* Priority Select Selector Segment */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Priority:</span>
                <div className="flex uppercase gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                  {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskPriority(p)}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                        taskPriority === p
                          ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Interface Section */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-900 hover:cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
                <button
                  type="submit"
                  disabled={!taskTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-[11px] px-3 py-1 rounded hover:cursor-pointer transition-colors"
                >
                  Save Card
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}