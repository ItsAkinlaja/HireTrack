import { LayoutDashboard, Users, GitBranch, LogOut, BriefcaseBusiness } from 'lucide-react';
import { cn } from '@/lib/utils';

const GREEN = '#575E44';
const BROWN = '#B27E55';
const CREAM = '#EEE8E2';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: { name: string; email: string };
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'pipeline',   label: 'Pipeline',   icon: GitBranch },
];

export function Sidebar({ activePage, onNavigate, user, onLogout }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex flex-col w-56 bg-white border-r border-gray-100">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
        <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GREEN }}>
          <BriefcaseBusiness className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight" style={{ color: GREEN }}>HireTrack</span>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active ? 'text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
              style={active ? { backgroundColor: GREEN } : {}}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-5 pt-3 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: BROWN }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: GREEN }} />
              <span className="text-[10px] text-gray-400">Online</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
