import ProjectPage from "~/components/projectPage/ProjectPage";
import type { Route } from "./+types/projectPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Project() {
  return <ProjectPage />;
}