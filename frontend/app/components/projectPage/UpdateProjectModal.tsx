import { useState } from "react";

type Props = {
  projectId: string;
  onClose: () => void;
  onEdit: (name: string, description?: string) => void;
};

export default function UpdateProjectModal({
  projectId,
  onClose,
  onEdit,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("")
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setMessage(null);
    setError(null);

    try {
      setSubmitting(true);
      onEdit(name, description);

      setMessage(`Project name ${name} updated successfully!`);
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
            Update Project Name
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Enter a new name for your project.
        </p>

        <form onSubmit={handleUpdateProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              required
              placeholder="Updated project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
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
              {submitting ? "Updating..." : "Update Name"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
