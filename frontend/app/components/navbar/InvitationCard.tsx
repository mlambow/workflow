import React, { useState } from "react";
import { motion } from "framer-motion";

// 1. Theme Configuration Maps
const STATUS_THEMES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20",
  ACCEPTED: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20",
  EXPIRED: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20",
  REVOKED: "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20"
};

const ROLE_THEMES: Record<string, string> = {
  ADMIN: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20",
  MEMBER: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20",
  VIEWER: "bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20",
};

interface Invitation {
  id: string;
  project_name: string;
  role: string;
  status: string;
  token: string;
  email: string;
  invited_by_name: string;
  resent_at: string;
  expires_at: string;
  updated_at: string;

  view: 'Project Admin' | 'Member'
}

interface InvitationCardProps {
  invitation: Invitation;
  onAccept?: (token: string) => Promise<void>;
  onReject?: (token: string) => Promise<void>;
  onRevoke?: (token: string) => Promise<void>;
  onDelete?: (token: string) => Promise<void>;
  onResend?: (token: string) => Promise<void>;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onAccept,
  onReject,
  onDelete,
  onResend,
  onRevoke
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "reject" | "resend" | "delete" | "revoke" | null>(null);

  const handleAction = async (type: "accept" | "reject" | "resend" | "delete" | "revoke", callback: (token: string) => Promise<void>) => {
    setIsProcessing(true);
    setActionType(type);
    try {
      await callback(invitation.token);
    } catch (error) {
      // Errors can be handled globally via toast or bubbles up to parent component
      console.error(`Failed to ${type} invitation:`, error);
    } finally{
      setIsProcessing(false);
      setActionType(null);
    }
    
  };

  const formattedDate = new Date(invitation.expires_at).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedDate = new Date(invitation.updated_at).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const resentDate = new Date(invitation.resent_at).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-50/40 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700/80"
    >
      {/* Workspace / Project Title Head */}
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {invitation.project_name}
        </h4>
        
        {/* Status Pill Badge */}
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
          STATUS_THEMES[invitation.status.toUpperCase()] || "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        }`}>
          {invitation.status}
        </span>
      </div>

      {/* Meta Properties Row */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
          ROLE_THEMES[invitation.role.toUpperCase()] || "bg-slate-500/10 text-slate-400 border border-slate-500/20"
        }`}>
          Role: {invitation.role}
        </span>
      </div>

      {/* Technical/Meta Details Panel */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50 text-[11px] text-slate-400 dark:text-slate-500 space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span>Email</span>
          <span className="font-mono text-slate-400 max-w-40 truncate select-all">
            {invitation.email}
          </span>
        </div>
        {invitation.view === "Member" && (
          <>
            <div className="flex justify-between items-center">
              <span>Invited by</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">{invitation.invited_by_name}</span>
            </div>
          </>
        )}
        {invitation.status === "Pending" && (
          <>
            <div className="flex justify-between items-center">
              <span>Expires at</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">{formattedDate}</span>
            </div>
          </>
        )}
        {invitation.status === "Accepted" && (
          <>
            <div className="flex justify-between items-center">
              <span>Joined at</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">{updatedDate}</span>
            </div>
          </>
        )}

        {invitation.view === "Project Admin" &&
          ["Revoked", "Rejected"].includes(invitation.status) && (
            <div className="flex justify-between items-center">
              <span>
                {invitation.status === "Revoked"
                  ? "Revoked at"
                  : "Rejected at"
                }
              </span>

              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {updatedDate}
              </span>
            </div>
          )
        }

        {invitation.resent_at && invitation.status === "Pending" && (
          <div className="flex justify-between items-center">
            <span>Resent at</span>

            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {resentDate}
            </span>
          </div>
        )}
      </div>

      {/* Clean Dynamic Action Controls */}
      <div className="flex gap-2 mt-4">
        {invitation.view === "Member" && invitation.status === "Pending" && (
          <>
            <button
              onClick={() => onAccept && handleAction("accept", onAccept)}
              disabled={!onAccept || isProcessing}
              className="flex-1 justify-center cursor-pointer py-2 text-xs font-semibold rounded-xl bg-green-500 hover:bg-green-700 text-white shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {isProcessing && actionType === "accept" ? "Accepting..." : "Accept"}
            </button>

            <button
              onClick={() => onReject && handleAction("reject", onReject)}
              disabled={!onReject || isProcessing}
              className="flex-1 justify-center cursor-pointer py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-rose-500 dark:hover:bg-rose-700/80 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-40"
            >
              {isProcessing && actionType === "reject" ? "Declining..." : "Decline"}
            </button>
          </>
        )}

        {invitation.view === "Project Admin" && (
          <>
            {invitation.status === "Pending" && (
              <>
                <button
                  onClick={() => onRevoke && handleAction("revoke", onRevoke)}
                  disabled={!onRevoke || isProcessing}
                  className="flex-1 justify-center cursor-pointer py-2 text-xs font-semibold rounded-xl bg-blue-500 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  {isProcessing && actionType === "revoke" ? "Revoking..." : "Revoke"}
                </button>
              </>
            )}

            {["Revoked", "Rejected", "Expired"].includes(invitation.status) && (
              <>
                <button
                  onClick={() => onResend && handleAction("resend", onResend)}
                  disabled={!onResend || isProcessing}
                  className="flex-1 justify-center cursor-pointer py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-amber-600 dark:hover:bg-amber-700/80 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-40"
                >
                  {isProcessing && actionType === "resend" ? "Resending..." : "Resend"}
                </button>
              </>
            )}

            {["Revoked", "Rejected", "Expired", "Pending"].includes(invitation.status) && (
              <>
                <button
                  onClick={() => onDelete && handleAction("delete", onDelete)}
                  disabled={!onDelete || isProcessing}
                  className="flex-1 justify-center cursor-pointer py-2 text-xs font-semibold rounded-xl bg-red-400 hover:bg-red-600 dark:bg-rose-700 dark:hover:bg-rose-700/80 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-40"
                >
                  {isProcessing && actionType === "delete" ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
        </>
        )}
      </div>
    </motion.div>
  );
};