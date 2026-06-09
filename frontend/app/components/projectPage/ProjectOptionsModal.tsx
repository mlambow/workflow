import { Pencil, Plus, Share2Icon, Trash2, Users, X } from "lucide-react";
import ActionButton from "../ActionButton";

type Project = { 
    id: string; 
    name: string; 
    description: string; 
    owner_id: string 
};

type ProjectOptionsModalProps = {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  //onDelete?: () => void;
  onCreateWorkflow?: () => void;
  project: Project | null
};

export default function ProjectOptionsModal({
  open,
  project,
  onClose,
  onEdit,
  onShare,
  //onDelete,
  onCreateWorkflow,
}: ProjectOptionsModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* Modal Container with subtle gradient border glow */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 p-px shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200">
        {/* Inner Content Wrapper */}
        <div className="rounded-[15px] bg-slate-950/90 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="text-sm font-medium tracking-tight text-slate-100">
                {project?.name} Options
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage your project configurations.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-900 hover:text-slate-200 transition-all active:scale-95"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Actions List */}
          <div className="px-3 pb-4 pt-1 space-y-0.5">
            <ActionButton
              icon={Plus}
              label="New Workflow"
              onClick={onCreateWorkflow}
            />

            <ActionButton
              icon={Users}
              label="Project Members"
            />

            <ActionButton
              icon={Pencil}
              label="Edit Project"
              onClick={onEdit}
            />

            <ActionButton
              icon={Share2Icon}
              label="Share Project"
              onClick={onShare}
            />

            <div className="my-1.5 border-t border-slate-900" />

            <ActionButton
              icon={Trash2}
              label="Delete Project"
              danger
            />
          </div>
        </div>
      </div>
    </div>
  );
}
