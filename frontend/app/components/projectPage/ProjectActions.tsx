import { startTransition } from "react";
import WorkflowSelector from "./WorkflowSelector";

type Workflow = {
  id: string;
  name: string;
};

type ProjectActionsProps = {
  workflows: Workflow[];
  activeWorkflow: Workflow | null;

  onShare: () => void;

  onWorkflowSelect: (workflow: Workflow) => void;

  onWorkflowCreate: (name: string) => Promise<void>;
};

export default function ProjectActions({
  workflows,
  activeWorkflow,
  onShare,
  onWorkflowSelect,
  onWorkflowCreate,
}: ProjectActionsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onShare}
        className="bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all"
      >
        Share Board
      </button>

      <WorkflowSelector
        workflows={workflows}
        activeId={activeWorkflow?.id}
        onSelect={(workflow) =>
          startTransition(() => {
            onWorkflowSelect(workflow);
          })
        }
        onCreate={onWorkflowCreate}
      />
    </div>
  );
}