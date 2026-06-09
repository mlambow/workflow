import { useState } from "react";

type Workflow = { id: string; name: string };

type Props = {
  workflows: Workflow[];
  activeId?: string;
  onSelect: (workflow: Workflow) => void;
  onCreate: (name: string) => Promise<void>;
};

export default function WorkflowSelector({ workflows, activeId, onSelect, onCreate }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name);
    setName("");
    setIsCreating(false);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {workflows.map((wf) => (
        <button
          key={wf.id}
          onClick={() => onSelect(wf)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeId === wf.id
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
        >
          {wf.name}
        </button>
      ))}

      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 border border-dashed border-slate-700 text-slate-400 hover:text-white transition-all"
        >
          + New Workflow
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            autoFocus
            placeholder="Workflow title..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-900 border border-blue-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
          />
          <button type="submit" className="bg-blue-600 text-white px-2 py-1 text-xs rounded-lg">Save</button>
          <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 text-xs px-1">Cancel</button>
        </form>
      )}
    </div>
  );
}