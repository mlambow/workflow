import { useNavigate } from "react-router";
import BoardCard from "./BoardCard";

type Project = {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
};

type Props = {
  projects: Project[];
  onRenameProject: (id: string, updatedName: string) => Promise<void>;
  onDeleteTrigger: (project: Project) => void;
};

export function ProjectList({ projects, onRenameProject, onDeleteTrigger }: Props) {
  const navigate = useNavigate();

  const gradients = [
    "from-blue-600 to-indigo-600",
    "from-purple-600 to-fuchsia-600",
    "from-emerald-600 to-teal-600",
    "from-rose-600 to-pink-600",
  ];

  return (
    <>
      {projects.map((project, index) => (
        <BoardCard
          key={project.id}
          id={project.id}
          title={project.name}
          gradientClass={gradients[index % gradients.length]}
          onNavigate={() => navigate(`/projects/${project.id}`)}
          onRename={(newName) => onRenameProject(project.id, newName)}
          onDelete={() => onDeleteTrigger(project)}
        />
      ))}
    </>
  );
}