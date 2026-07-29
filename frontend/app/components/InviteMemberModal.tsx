import { useState } from "react";
import { authFetch } from "~/helpers/authHelper";


type Props = {
  projectId: string;
  onClose: () => void;
};

export default function InviteMemberModal({ projectId, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | 'idle' | string>('idle')

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      // Passes dependencies check: require_project_admin header validation via params
      const res = await authFetch(`http://localhost:8000/invitations/invite?project_id=${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "An error occurred while dispatching invitation profile.");
      }

      setMessage(`Success! Invitation profile successfully generated for ${email}`);
      setEmail("");
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
          <h3 className="font-bold text-base text-white">Invite Project Collaborator</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">&times;</button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Enter a user's email address to invite them to this workspace. They will receive an authorization validation token to join as a team member.
        </p>

        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {message && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">{message}</div>}
          {error && <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition-colors">Close</button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors"
            >
              {submitting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}