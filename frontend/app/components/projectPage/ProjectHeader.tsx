import { Link } from "react-router";
import WorkflowBadge from "./WorkflowBadge";
import ProjectActions from "./ProjectActions";

type Project = { id: string; name: string; description: string; owner_id: string };

type Workflow = {
  id: string;
  name: string;
};

type ProjectHeaderProps = {
  project: Project;

  workflows: Workflow[];

  activeWorkflow: Workflow | null;

  onOpenInviteModal: () => void;

  onWorkflowSelect: (workflow: Workflow) => void;

  onWorkflowCreate: (name: string) => Promise<void>;

  onRenameWorkflow: (name: string) => Promise<void>;

  onDeleteWorkflow: () => void;
};

export default function ProjectHeader({
  project,
  workflows,
  activeWorkflow,
  onOpenInviteModal,
  onWorkflowSelect,
  onWorkflowCreate,
  onRenameWorkflow,
  onDeleteWorkflow,
}: ProjectHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/40 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
        <Link to="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-300">&larr; Workspace</Link>
            <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
            <p className="text-xs font-semibold text-slate-500">{project?.description}</p>

          {/* {activeWorkflow && (
            <WorkflowBadge
              workflow={activeWorkflow}
              onRename={onRenameWorkflow}
              onDelete={onDeleteWorkflow}
            />
          )} */}


        </div>

        
      </div>
    </header>
  );
}