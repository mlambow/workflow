import { useEffect, useState, useCallback } from "react";
import type { Invitation } from "~/lib/types";
import {
  fetchUserInvitation,
  fetchGroupInvitations,
  acceptInvitation,
  rejectInvitation,
  revokeInvitation,
  resendInvitation,
  deleteInvitation,
} from "~/services/invitationServces";

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [groupInvitations, setGroupInvitations] = useState<Invitation[]>([]);
  const [processingToken, setProcessingToken] = useState<string | null>(null);

  // -----------------------------
  // Fetch functions
  // -----------------------------
  const refreshInvitations = useCallback(async () => {
    try {
      const data = await fetchUserInvitation();
      setInvitations(data);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  }, []);

  const refreshGroupInvitations = useCallback(async () => {
    try {
      const data = await fetchGroupInvitations();
      setGroupInvitations(data);
    } catch (err) {
      console.error("Failed to fetch group invitations:", err);
    }
  }, []);

  useEffect(() => {
    refreshInvitations();
    refreshGroupInvitations();
  }, [refreshInvitations, refreshGroupInvitations]);

  const withProcessing = useCallback(
    async (token: string, fn: () => Promise<void>) => {
      setProcessingToken(token);
      try {
        await fn();
      } catch (err) {
        console.error("Invitation action failed:", err);
      } finally {
        setProcessingToken(null);
      }
    },
    []
  );

  const accept = useCallback(
    (token: string) =>
      withProcessing(token, async () => {
        await acceptInvitation(token);

        setInvitations((prev) =>
          prev.map((inv) =>
            inv.token === token
              ? { ...inv, status: "ACCEPTED" }
              : inv
          )
        );
      }),
    [withProcessing]
  );

  const reject = useCallback(
    (token: string) =>
      withProcessing(token, async () => {
        await rejectInvitation(token);

        setInvitations((prev) =>
          prev.map((inv) =>
            inv.token === token
              ? { ...inv, status: "REJECTED" }
              : inv
          )
        );
      }),
    [withProcessing]
  );

  const revoke = useCallback(
    (token: string) =>
      withProcessing(token, async () => {
        await revokeInvitation(token);

        setGroupInvitations((prev) =>
          prev.map((inv) =>
            inv.token === token
              ? { ...inv, status: "REVOKED" }
              : inv
          )
        );
      }),
    [withProcessing]
  );

  const resend = useCallback(
    (token: string) =>
      withProcessing(token, async () => {
        await resendInvitation(token);

        setGroupInvitations((prev) =>
          prev.map((inv) =>
            inv.token === token
              ? { ...inv, status: "PENDING" }
              : inv
          )
        );
      }),
    [withProcessing]
  );

  const remove = useCallback(
    (token: string) =>
      withProcessing(token, async () => {
        await deleteInvitation(token);

        setGroupInvitations((prev) =>
          prev.filter((inv) => inv.token !== token)
        );
      }),
    [withProcessing]
  );

  const visibleGroupInvitations = groupInvitations.filter(
    (inv) => inv.status !== "ACCEPTED"
  );

  return {
    // data
    invitations,
    groupInvitations,
    visibleGroupInvitations,

    // loading
    processingToken,

    // actions
    accept,
    reject,
    revoke,
    resend,
    remove,

    // refresh
    refreshInvitations,
    refreshGroupInvitations,
  };
}