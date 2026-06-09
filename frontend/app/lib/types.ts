export type Project = {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    created_at: string;
};
  
export type Workflow = {
    id: string;
    name: string;
    project_id?: string;
};
  
export type WorkflowStage = {
    id: string;
    name: string;
    position: number;
    workflow_id: string;
};

