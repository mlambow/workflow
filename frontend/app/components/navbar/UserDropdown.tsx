import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MailPlus,
  UsersIcon,
  User as UserIcon,
  LogOut,
  Shield,
  ChessKing,
} from "lucide-react";

type UserDropdownProps = {
  user: {
    first_name: string;
    last_name: string;
    role: string;
  } | null;
  invitationCount: number;
  groupInvitationCount: number;
  onOpenInvitations: () => void;
  onOpenGroupInvitations: () => void;
  onLogout: () => void;
};

export const UserDropdown = ({
  user,
  invitationCount,
  groupInvitationCount,
  onOpenInvitations,
  onOpenGroupInvitations,
  onLogout
}: UserDropdownProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userInitial = user?.first_name
  ? user.first_name.charAt(0).toUpperCase()
  : "U";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="h-9 w-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20 hover:border-blue-500/40 flex items-center justify-center cursor-pointer transition-all uppercase shadow-sm"
      >
        {userInitial}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-2xl rounded-xl p-3 text-left overflow-hidden origin-top-right"
          >
              {/* Profile Card Summary Context Block */}
            <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              {user?.role && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                  {user.role === "Super Admin" ? <ChessKing size={10} className="text-blue-500"/> : <Shield size={10} className="text-blue-500" />}
                  <span>{user.role}</span>
                </div>
              )}
            </div>

              {/* Action Menu List Nodes */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenInvitations();
                }}
                className="w-full flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <MailPlus size={14} />
                  My Invitations
                </div>

                {invitationCount > 0 && (
                  <span className="min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">
                    {invitationCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenGroupInvitations();
                }}
                className="w-full flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <UsersIcon size={14} />
                  Group Invitations
                </div>

                {groupInvitationCount > 0 && (
                  <span className="min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">
                    {groupInvitationCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all text-left"
              >
                <UserIcon size={14} className="text-slate-400" />
                Account Settings
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-left border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20"
              >
                <LogOut size={14} />
                Sign Out of Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
};