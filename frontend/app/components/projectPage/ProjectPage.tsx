import { useEffect, useState, startTransition } from "react";
import { useParams, Link } from "react-router";

import WorkflowSelector from "./WorkflowSelector";
import ProjectHeader from "./ProjectHeader";
//import Board from "./Board";
import EmptyWorkflowState from "./EmptyWorkflowState";
//import InviteMemberModal from "./InviteMemberModal";
import DeleteWorkflowModal from "./DeleteWorkflowModal";
//import { useProject } from "~/hooks/useProject";
import LoadingScreen from "../LoadingScreen";
import ErrorState from "../ErrorState";
import InviteMemberModal from "../InviteMemberModal";
import Board from "../Board";
import { authFetch } from "~/helpers/authHelper";
import { useProject } from "~/hooks/useProject";
import { Copy, Pencil, Share2Icon, Trash2, X } from "lucide-react";
import ProjectOptionsModal from "./ProjectOptionsModal";
import CreateWorkflowModal from "../CreateWorkflowModal";
import UpdateProjectModal from "./UpdateProjectModal";
import ActiveWorkflowBadge from "./ActiveWorkflowBadge";

type Workflow = { id: string; name: string; project_id?: string };
type WorkflowStage = { id: string; name: string; position: number; workflow_id: string };
type Project = { id: string; name: string; description: string; owner_id: string };

export default function ProjectPage() {
  const { id: projectId } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // ✅ MODAL & EDIT STATES
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editWorkflowName, setEditWorkflowName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createWorkflow, setCreateWorkflow] = useState(false);

  // const {
  //   project,
  //   workflows,
  //   activeWorkflow,
  //   setActiveWorkflow,
  //   stages,
  //   loading,
  //   error,
  
  //   createWorkflow,
  //   updateWorkflow,
  //   deleteWorkflow,
  //   createStage,
  
  //   isDeletingWorkflow,
  // } = useProject(projectId);

  // Initial Sync Pipeline
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);

    Promise.all([
      authFetch(`http://localhost:8000/projects/${projectId}`),
      authFetch(`http://localhost:8000/projects/${projectId}/workflows`),
    ])
      .then(async ([projectRes, workflowsRes]) => {
        if (!projectRes.ok || !workflowsRes.ok) throw new Error("Failed to load workspace data.");
        const projectData = await projectRes.json();
        const workflowsData = await workflowsRes.json();

        setProject(projectData);
        setWorkflows(workflowsData);
        if (workflowsData.length > 0) setActiveWorkflow(workflowsData[0]);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Sync Stages when active workflow alters
  useEffect(() => {
    if (!activeWorkflow) {
      setStages([]);
      return;
    }
    authFetch(`http://localhost:8000/workflows/${activeWorkflow.id}/stages`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: WorkflowStage[]) => setStages(data.sort((a, b) => a.position - b.position)))
      .catch((err) => console.error(err));
  }, [activeWorkflow]);

  const handleCreateWorkflow = async (name: string) => {
    const res = await authFetch(`http://localhost:8000/projects/${projectId}/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const saved = await res.json();
      setWorkflows((prev) => [...prev, saved]);
      setActiveWorkflow(saved);
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!activeWorkflow || !editWorkflowName.trim()) return;

    try {
      const res = await authFetch(`http://localhost:8000/workflows/${activeWorkflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editWorkflowName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update workflow metadata.");
      const updated = await res.json();

      setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setActiveWorkflow(updated);
      setIsEditingWorkflow(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ UPDATED: Clean, Modal-Driven Purge Trigger Function
  const handleConfirmDeleteWorkflow = async () => {
    if (!activeWorkflow) return;
    setIsDeleting(true);

    try {
      const res = await authFetch(`http://localhost:8000/workflows/${activeWorkflow.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to complete workflow purge sequence.");

      const remainingWorkflows = workflows.filter((w) => w.id !== activeWorkflow.id);
      setWorkflows(remainingWorkflows);
      setActiveWorkflow(remainingWorkflows.length > 0 ? remainingWorkflows[0] : null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateStage = async (name: string) => {
    if (!activeWorkflow) return;
    const res = await authFetch(`http://localhost:8000/workflows/${activeWorkflow.id}/stages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const saved = await res.json();
      setStages((prev) => [...prev, saved].sort((a, b) => a.position - b.position));
    }
  };

  const handleUpdateProjectName = async (name: string, description?: string) => {
    try {
      const res = await authFetch(`http://localhost:8000/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to update project name.");
      const freshData = await res.json();
      console.log(freshData)
      setProject((prev) =>
        prev
        ? { ...prev, name: freshData.name, description: freshData.description }
        : null
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenInvite = () => {
    setShowOptions(false); // Hide the options modal so they don't overlap
    setShowInviteModal(true);   // Open the invitation modal
  };

  const handleOpenCreateWorkflow = () => {
    setShowOptions(false);
    setCreateWorkflow(true);
  }

  const handleOpenUpdateProject = () => {
    setShowOptions(false);
    setIsEditingProject(true);
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-200">LOADING BOARD...</div>;
  if (error || !project) return <div className="text-center text-rose-400 p-20">Error context loaded: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-300">&larr; Workspace</Link>
            <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <WorkflowSelector 
              workflows={workflows} 
              activeId={activeWorkflow?.id} 
              onSelect={(wf) => startTransition(() => {
                setActiveWorkflow(wf);
                setIsEditingWorkflow(false);
              })} 
              onCreate={handleCreateWorkflow} 
            />
          </div>
          <button 
            className="rotate-90 text-sm text-slate-500 cursor-pointer hover:text-slate-300"
            onClick={() => setShowOptions(true)}
          >
            •••
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {activeWorkflow ? (
          <Board stages={stages} projectId={projectId!} onAddStage={handleCreateStage} />
        ) : (
          <div className="text-center py-20 text-slate-500 italic">No Workflows Available. Create one above.</div>
        )}
      </main>

      {/* ✅ NEW: THEME-ALIGNED CONFIRMATION DIALOG MODAL */}
      {showDeleteModal && activeWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100">Delete Workflow</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <span className="text-rose-400 font-semibold">"{activeWorkflow.name}"</span>? This will wipe out all corresponding columns, tracking states, and nested tasks.
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 px-4 py-2 rounded-lg border border-slate-700/50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteWorkflow}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-rose-600/10 active:scale-[0.98] disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Workflow"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOptions && projectId && (
        <ProjectOptionsModal
          open={showOptions}
          onClose={() => setShowOptions(false)}
          onShare={handleOpenInvite}
          onCreateWorkflow={handleOpenCreateWorkflow}
          onEdit={handleOpenUpdateProject}
          project={project}
        />
      )}

      {/* Share Board Invite Modal Layout */}
      {showInviteModal && projectId && (
        <InviteMemberModal projectId={projectId} onClose={() => setShowInviteModal(false)} />
      )}

      {/* Create Workflow */}
      {createWorkflow && projectId && (
        <CreateWorkflowModal 
          projectId={projectId} 
          onClose={() => setCreateWorkflow(false)}
          onCreate={handleCreateWorkflow}
        />
      )}

      {/* Update Workflow */}
      {isEditingProject && projectId && (
        <UpdateProjectModal 
          projectId={projectId}
          onClose={() => setIsEditingProject(false)}
          onEdit={handleUpdateProjectName}
        />
      )}
    </div>

  );
}

// export default function ProjectPage() {
//   const { id: projectId } = useParams();

//   const {
//     project,
//     workflows,
//     activeWorkflow,
//     setActiveWorkflow,
//     stages,
//     loading,
//     error,
//     createWorkflow,
//     updateWorkflow,
//     deleteWorkflow,
//     createStage,
//     isDeletingWorkflow,
//   } = useProject(projectId);

//   const [showInviteModal, setShowInviteModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   if (loading) return <LoadingScreen />;
//   if (error || !project) return <ErrorState error={error} />;

//   return (
//     <div className="min-h-screen bg-slate-950">
//       {/* <ProjectHeader
//         project={project}
//         activeWorkflow={activeWorkflow}
//         onOpenInviteModal={() => setShowInviteModal(true)}
//         onRenameWorkflow={async (name) =>
//           activeWorkflow &&
//           updateWorkflow(activeWorkflow.id, name)
//         }
//         onDeleteWorkflow={() =>
//           setShowDeleteModal(true)
//         }
//       /> */}

//       <main className="p-6 max-w-7xl mx-auto">
//         {activeWorkflow ? (
//           <Board
//             stages={stages}
//             projectId={projectId!}
//             onAddStage={createStage}
//           />
//         ) : (
//           <EmptyWorkflowState />
//         )}
//       </main>

//       {/* <InviteMemberModal
//         projectId={projectId!}
//         onClose={() => setShowInviteModal(false)}
//       /> */}

//       <DeleteWorkflowModal
//         open={showDeleteModal}
//         workflowName={activeWorkflow?.name}
//         loading={isDeletingWorkflow}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={() =>
//           activeWorkflow &&
//           deleteWorkflow(activeWorkflow.id)
//         }
//       />
//     </div>
//   );
// }