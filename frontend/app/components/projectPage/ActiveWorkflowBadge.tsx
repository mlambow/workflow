interface ActiveWorkflowBadgeProps {
    activeWorkflow: {
      name: string;
    } | null;
    isEditingWorkflow: boolean;
    editWorkflowName: string;
    setEditWorkflowName: (value: string) => void;
    setIsEditingWorkflow: (value: boolean) => void;
    handleUpdateWorkflow: () => void;
    setShowDeleteModal: (value: boolean) => void;
}
  
export default function ActiveWorkflowBadge({
    activeWorkflow,
    isEditingWorkflow,
    editWorkflowName,
    setEditWorkflowName,
    setIsEditingWorkflow,
    handleUpdateWorkflow,
    setShowDeleteModal,
  }: ActiveWorkflowBadgeProps) {
    if (!activeWorkflow) return null;
  
    return (
      <div className="flex items-center gap-2 mt-2 bg-slate-900/60 w-fit px-3 py-1 rounded-md border border-slate-800/80">
        {isEditingWorkflow ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={editWorkflowName}
              onChange={(e) => setEditWorkflowName(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded px-2 py-0.5 outline-none focus:border-indigo-500"
              autoFocus
            />
  
            <button
              onClick={handleUpdateWorkflow}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-1"
            >
              Save
            </button>
  
            <button
              onClick={() => setIsEditingWorkflow(false)}
              className="text-xs text-slate-400 hover:text-slate-300 px-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span className="text-xs text-slate-400 font-medium">
              Active:{" "}
              <span className="text-slate-200">{activeWorkflow.name}</span>
            </span>
  
            <button
              onClick={() => {
                setEditWorkflowName(activeWorkflow.name);
                setIsEditingWorkflow(true);
              }}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-2"
            >
              Rename
            </button>
  
            <span className="text-slate-700 text-xs">|</span>
  
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-[10px] text-rose-400 hover:text-rose-300 underline underline-offset-2"
            >
              Delete
            </button>
          </>
        )}
      </div>
    );
  }