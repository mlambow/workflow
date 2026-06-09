import { useState } from "react";

type Workflow = {
  id: string;
  name: string;
};

type WorkflowBadgeProps = {
  workflow: Workflow;
  onRename: (name: string) => Promise<void>;
  onDelete: () => void;
};

export default function WorkflowBadge({
  workflow,
  onRename,
  onDelete,
}: WorkflowBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);

  const handleSave = async () => {
    if (!name.trim()) return;

    await onRename(name.trim());
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 mt-2 bg-slate-900/60 w-fit px-3 py-1 rounded-md border border-slate-800/80">
      {isEditing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded px-2 py-0.5 outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleSave}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            Save
          </button>

          <button
            onClick={() => {
              setName(workflow.name);
              setIsEditing(false);
            }}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="text-xs text-slate-400 font-medium">
            Active:
            <span className="text-slate-200 ml-1">
              {workflow.name}
            </span>
          </span>

          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Rename
          </button>

          <span className="text-slate-700 text-xs">|</span>

          <button
            onClick={onDelete}
            className="text-[10px] text-rose-400 hover:text-rose-300 underline underline-offset-2"
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}