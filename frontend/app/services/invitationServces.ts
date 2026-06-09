import { authFetch } from "~/helpers/authHelper";

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

const BASE_URL = "http://127.0.0.1:8000";

//Fetch reveiced invitation
export async function fetchUserInvitation() {
  const res = await authFetch(`${BASE_URL}/invitations/received`);

  if (res.status === 404) {
    return []
  }

  if (!res.ok) {
    throw new Error("Failed to fetch user invitations");
  }

  return res.json();
}

//Accept received invitation
export const acceptInvitation = async (token: string) => {
  const response = await authFetch(`${BASE_URL}/invitations/accept/${token}`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();

    console.error("Accept invitation error:", errorData);

    throw new Error(errorData.detail || "Failed to accept invitation");
  }

  return response.json();
};

//Reject received invitation
export const rejectInvitation = async (token: string) => {
  const response = await authFetch(`${BASE_URL}/invitations/reject/${token}`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();

    console.error("Rejecting invitation error:", errorData);

    throw new Error(errorData.detail || "Failed to reject invitation");
  }

  return response.json();
};

//Revoke sent invitation
export const revokeInvitation = async (token: string) => {
  const response = await authFetch(`${BASE_URL}/invitations/revoke/${token}`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();

    console.error("Revoke invitation error:", errorData);

    throw new Error(errorData.detail || "Failed to revoke invitation");
  }

  return response.json();
};

//Resend revoked invitation
export const resendInvitation = async (token: string) => {
  const response = await authFetch(`${BASE_URL}/invitations/resend/${token}`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();

    console.error("Resend invitation error:", errorData);

    throw new Error(errorData.detail || "Failed to resend invitation");
  }

  return response.json();
};

//Delete sent invitation
export const deleteInvitation = async (token: string) => {
  const response = await authFetch(`${BASE_URL}/invitations/delete/${token}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();

    console.error("Delete invitation error:", errorData);

    throw new Error(errorData.detail || "Failed to delete invitation");
  }

  return response.json();
};

//Fetch group invitation
export const fetchGroupInvitations = async () => {
  const response = await authFetch(`${BASE_URL}/invitations`, {
    method: "GET",
  });

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    throw new Error("Failed to fetch group invitations");
  }

  return response.json();
};
