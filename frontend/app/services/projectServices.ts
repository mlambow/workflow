import { authFetch } from "~/helpers/authHelper";
import type { Project } from "~/lib/types";

const BASE_URL = "http://127.0.0.1:8000";

export async function fetchProjects(): Promise<Project[]> {
  const res = await authFetch(`${BASE_URL}/projects`);

  if (res.status === 404) {
    return []
  }

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  return res.json();
}

export async function createProject(data: {
  name: string;
  description: string;
}): Promise<Project> {
  const res = await authFetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create project");
  }

  return res.json();
}