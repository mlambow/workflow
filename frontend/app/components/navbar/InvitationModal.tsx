import ModalShell from "./ModalShell";
import { InvitationCard } from "./InvitationCard";
import type { Invitation } from "~/services/invitationServces";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  invitations: Invitation[];
  view: "received" | "sent";

  onAccept?: (token: string) => Promise<void>;
  onReject?: (token: string) => Promise<void>;
  onRevoke?: (token: string) => Promise<void>;
  onResend?: (token: string) => Promise<void>;
  onDelete?: (token: string) => Promise<void>;
};

export default function InvitationModal({
  open,
  onClose,
  title,
  subtitle,
  invitations,
  view,
  ...actions
}: Props) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth={view === "sent" ? "max-w-xl" : "max-w-md"}
    >
      <div className="space-y-3">
        {invitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            invitation={{
              ...invitation,
              view,
            }}
            onAccept={actions.onAccept}
            onReject={actions.onReject}
            onRevoke={actions.onRevoke}
            onResend={actions.onResend}
            onDelete={actions.onDelete}
          />
        ))}
      </div>
    </ModalShell>
  );
}