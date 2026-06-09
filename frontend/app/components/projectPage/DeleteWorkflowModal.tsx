type DeleteWorkflowModalProps = {
    open: boolean;
    workflowName?: string;
    loading: boolean;
  
    onClose: () => void;
    onConfirm: () => void;
  };
  
  export default function DeleteWorkflowModal({
    open,
    workflowName,
    loading,
    onClose,
    onConfirm,
  }: DeleteWorkflowModalProps) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">
              Delete Workflow
            </h3>
  
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete
              <span className="text-rose-400 font-semibold mx-1">
                "{workflowName}"
              </span>
              ? This will remove all related columns,
              tasks, and workflow data.
            </p>
          </div>
  
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
  
            <button
              onClick={onConfirm}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white px-4 py-2 rounded-lg"
            >
              {loading
                ? "Deleting..."
                : "Delete Workflow"}
            </button>
          </div>
        </div>
      </div>
    );
  }