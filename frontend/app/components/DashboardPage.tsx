import { useEffect, useState, startTransition, type FormEvent } from "react";
import { Clock, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./navbar/Navbar";
import { Sidebar } from "./Sidebar";
import { ProjectList } from "./ProjectList";
import { fetchProjects, createProject } from "../services/projectServices";
import { CreateProjectModal } from "./CreateProjectDialog";
import { authFetch } from "~/helpers/authHelper";
import type { Project } from "~/lib/types";

export default function DashboardPage() {
  const [project, setProject] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: MANAGE LOGIC STATE STRINGS
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync projects pipeline
  useEffect(() => {
    fetchProjects()
      .then((data) => setProject(data))
      .catch((err) => console.error("Workspace sync error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const newProject = await createProject({ name, description });
      setProject((prev) => [...prev, newProject]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to append project:", err);
    }
  };

  // ✅ NEW: HANDLER FOR RE-SAVING UPDATED LOCAL RENAME DATA
  const handleUpdateProjectName = async (id: string, updatedName: string) => {
    try {
      const res = await authFetch(`http://localhost:8000/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: updatedName }),
      });
      if (!res.ok) throw new Error("Failed to sync structural edit changes.");
      const freshData = await res.json();
      setProject((prev) => prev.map((p) => (p.id === id ? { ...p, name: freshData.name } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ NEW: HANDLER TO PURGE SELECTED BOARD PROJECT
  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`http://localhost:8000/projects/${projectToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Purge error context received.");
      setProject((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex gap-8 p-6 lg:p-8 h-[calc(100vh-80px)]">
        <div className="hidden sm:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <Clock className="text-slate-400 dark:text-slate-500" size={18} />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recently Viewed Hub
              </h2>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="sm:hidden bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="h-32 w-full rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/20 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:border-blue-500 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className="text-xs font-semibold tracking-wide">Create brand new project</span>
            </motion.button>

            {loading ? (
              <div className="h-32 flex items-center justify-center text-xs font-medium tracking-widest text-slate-400 animate-pulse uppercase">
                Syncing workspace...
              </div>
              ) : project.length === 0 ? (
                <div className="h-32 flex items-center justify-center font-medium tracking-widest uppercase text-xs text-slate-400">
                  No projects to show, create one.
                </div>
              ) : (
                <ProjectList
                  projects={project}
                  onRenameProject={handleUpdateProjectName}
                  onDeleteTrigger={(target) => setProjectToDelete(target)}
                />
              )
            }
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateProjectModal
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateProject}
          />
        )}
      </AnimatePresence>

      {/* ✅ NEW: THEME-ALIGNED REUSABLE CONFIRMATION MODAL */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Project Workspace</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <span className="text-rose-500 font-semibold">"{projectToDelete.name}"</span>? This will entirely purge all child workflows, column states, and custom tasks attached to this workspace block.
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProject}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-rose-600/10 active:scale-[0.98] disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}