type ActionButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  danger?: boolean;
};

export default function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ${
        danger
          ? "text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
          : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
      }`}
    >
      <Icon
        className={`h-4 w-4 transition-colors ${
          danger
            ? "text-rose-500/70 group-hover:text-rose-400"
            : "text-slate-500 group-hover:text-slate-300"
        }`}
      />
      <span>{label}</span>
    </button>
  );
};
