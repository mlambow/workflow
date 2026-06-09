import { Layout, Star, Clock } from "lucide-react";
import SidebarItem from "./SidebarItem";

export const Sidebar = () => {
  return (
    <aside className="w-40 md:w-64 h-[75vh] border-r border-slate-200/60 dark:border-slate-900 flex flex-col pr-4">
      <nav className="space-y-1">
        <SidebarItem
          icon={<Layout size={16} />}
          label="Boards Matrix"
          active
        />
        <SidebarItem
          icon={<Star size={16} />}
          label="Highlights Track"
        />
        <SidebarItem
          icon={<Clock size={16} />}
          label="Recent Syncs"
        />
      </nav>
    </aside>
  );
};