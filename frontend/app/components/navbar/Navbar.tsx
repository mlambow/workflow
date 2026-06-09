import { useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "~/context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import { NavbarSearch } from "./NavbarSearch";
import InvitationModal from "./InvitationModal";
import { UserDropdown } from "./UserDropdown";
import { useInvitations } from "~/hooks/useInvitations";
import { useCurrentUser } from "~/hooks/useCurrentUser";

export const Navbar = () => {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [isGroupInvitationModalOpen, setIsGroupInvitationModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    invitations,
    groupInvitations,
    accept,
    reject,
    revoke,
    resend,
    remove,
    refreshInvitations,
    refreshGroupInvitations
  } = useInvitations();
  const user = useCurrentUser();
  
  const visibleGroupInvitations = useMemo(() => {
    return groupInvitations.filter(inv => inv.status.toUpperCase() !== "ACCEPTED");
  }, [groupInvitations]);

  // Close the custom dropdown dynamically if clicking anywhere outside the component canvas
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center mt-4 mb-8 px-4 border-b border-slate-200/60 dark:border-slate-900 pb-5 bg-transparent relative z-40">
      <BrandLogo />

      <NavbarSearch />

      <UserDropdown
        user={user}
        invitationCount={invitations.length}
        groupInvitationCount={visibleGroupInvitations.length}
        onOpenInvitations={() => {
          setIsInvitationModalOpen(true);
          refreshInvitations();
        }}
        onOpenGroupInvitations={() => {
          setIsGroupInvitationModalOpen(true);
          refreshGroupInvitations();
        }}
        onLogout={logout}
      />

      <InvitationModal
        open={isInvitationModalOpen}
        onClose={() => setIsInvitationModalOpen(false)}
        title="Project Invitations"
        subtitle="Review your incoming team requests"
        invitations={invitations}
        view="received"
        onAccept={accept}
        onReject={reject}
      />

      <InvitationModal
        open={isGroupInvitationModalOpen}
        onClose={() => setIsGroupInvitationModalOpen(false)}
        title="Project Invitations"
        subtitle="Review your project requests"
        invitations={groupInvitations}
        view="sent"
        onRevoke={revoke}
        onResend={resend}
        onDelete={remove}
      />
    </header>
  );
};
