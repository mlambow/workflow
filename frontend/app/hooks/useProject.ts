import { useEffect, useState } from "react";
import { authFetch } from "~/helpers/authHelper";
import type { Project, Workflow, WorkflowStage } from "~/lib/types";

export function useProject(projectId?: string) {
  const [project, setProject] = useState<Project | null>(null);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);

  const [stages, setStages] = useState<WorkflowStage[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeletingWorkflow, setIsDeletingWorkflow] =
    useState(false);

  // ==========================
  // Load Project + Workflows
  // ==========================

  const refreshProject = async () => {
    if (!projectId) return;

    setLoading(true);

    try {
      const [projectRes, workflowsRes] = await Promise.all([
        authFetch(`http://localhost:8000/projects/${projectId}`),
        authFetch(`http://localhost:8000/projects/${projectId}/workflows`),
      ]);

      if (!projectRes.ok || !workflowsRes.ok) {
        throw new Error("Failed to load project.");
      }

      const projectData = await projectRes.json();
      const workflowData = await workflowsRes.json();

      setProject(projectData);
      setWorkflows(workflowData);

      if (workflowData.length > 0) {
        setActiveWorkflow(workflowData[0]);
      }

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Load Stages
  // ==========================

  const refreshStages = async (workflowId?: string) => {
    if (!workflowId) {
      setStages([]);
      return;
    }

    try {
      const res = await authFetch(
        `http://localhost:8000/workflows/${workflowId}/stages`
      );

      if (!res.ok) {
        throw new Error("Failed to load stages.");
      }

      const data = await res.json();

      setStages(
        data.sort(
          (a: WorkflowStage, b: WorkflowStage) =>
            a.position - b.position
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshProject();
  }, [projectId]);

  useEffect(() => {
    refreshStages(activeWorkflow?.id);
  }, [activeWorkflow]);

  // ==========================
  // Workflow Actions
  // ==========================

  const createWorkflow = async (name: string) => {
    if (!projectId) return;

    const res = await authFetch(
      `http://localhost:8000/projects/${projectId}/workflows`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create workflow.");
    }

    const workflow = await res.json();

    setWorkflows((prev) => [...prev, workflow]);
    setActiveWorkflow(workflow);

    return workflow;
  };

  const updateWorkflow = async (
    workflowId: string,
    name: string
  ) => {
    const res = await authFetch(
      `http://localhost:8000/workflows/${workflowId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update workflow.");
    }

    const updated = await res.json();

    setWorkflows((prev) =>
      prev.map((workflow) =>
        workflow.id === updated.id
          ? updated
          : workflow
      )
    );

    setActiveWorkflow(updated);

    return updated;
  };

  const deleteWorkflow = async (
    workflowId: string
  ) => {
    setIsDeletingWorkflow(true);

    try {
      const res = await authFetch(
        `http://localhost:8000/workflows/${workflowId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete workflow.");
      }

      const remaining = workflows.filter(
        (workflow) => workflow.id !== workflowId
      );

      setWorkflows(remaining);

      setActiveWorkflow(
        remaining.length > 0
          ? remaining[0]
          : null
      );
    } finally {
      setIsDeletingWorkflow(false);
    }
  };

  // ==========================
  // Stage Actions
  // ==========================

  const createStage = async (
    name: string
  ) => {
    if (!activeWorkflow) return;

    const res = await authFetch(
      `http://localhost:8000/workflows/${activeWorkflow.id}/stages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create stage.");
    }

    const stage = await res.json();

    setStages((prev) =>
      [...prev, stage].sort(
        (a, b) => a.position - b.position
      )
    );

    return stage;
  };

  return {
    project,

    workflows,
    activeWorkflow,
    setActiveWorkflow,

    stages,

    loading,
    error,

    isDeletingWorkflow,

    refreshProject,
    refreshStages,

    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    createStage,
  };
}