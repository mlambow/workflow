export type Project = {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at?: string;
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

export type Member = {
  id: string;
  email: string;
  role: string;
};

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
};

export type Invitation = {
  id: string;
  project_id: string;
  project_name: string;
  email: string;
  role: string;
  status: string;
  token: string;
  invited_by_name: string;
  resent_at: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
};