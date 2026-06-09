type Props = {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    badge?: number;
    danger?: boolean;
  };
  
  export default function DropdownItem({
    icon,
    label,
    onClick,
    badge,
    danger,
  }: Props) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition
  
        ${
          danger
            ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400"
            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
  
        {badge !== undefined && badge > 0 && (
          <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  }