import { useState } from "react";

type Props = {
  projectId: string;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export default function CreateWorkflowModal({
  projectId,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setMessage(null);
    setError(null);

    try {
      setSubmitting(true);
      onCreate(name);

      setMessage(`Workflow ${name} created successfully!`);
      setName("");
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-white">
            Create Project Workflow
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Enter name of the workflow you wish to create for the project.
        </p>

        <form onSubmit={handleCreateWorkflowSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Workflow Name
            </label>
            <input
              type="text"
              required
              placeholder="Workflow name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {message && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors"
            >
              {submitting ? "Creating..." : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
