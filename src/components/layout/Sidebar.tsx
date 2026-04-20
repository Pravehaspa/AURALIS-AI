import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  Mic,
  Sparkles,
  Volume2,
  LogOut,
  UserCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

const NAV_ITEMS = [
  { to: "/", icon: Bot, label: "Agents", description: "Manage voice agents" },
  { to: "/chat", icon: MessageSquare, label: "Chat", description: "Live conversations" },
  { to: "/auto-mode", icon: Mic, label: "Auto Mode", description: "Hands-free voice" },
  { to: "/voices", icon: Volume2, label: "Voices", description: "Voice profiles" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", description: "Usage metrics" },
  { to: "/settings", icon: Settings, label: "Settings", description: "Preferences" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const isProfileActive = location.pathname === "/profile";

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen border-r border-white/6 relative overflow-hidden"
      style={{ background: "hsl(var(--card))" }}>
      {/* Subtle gradient at top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/6 relative">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-brand-500/30 ring-1 ring-brand-500/20">
          <img src={logoImg} alt="Auralis AI" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-display font-bold text-[17px] text-foreground leading-none tracking-tight">
            Auralis
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 opacity-70">Voice AI Platform</p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-500/15 text-brand-300 border border-brand-500/25">
            <Sparkles size={8} />
            AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "text-brand-300 bg-brand-500/12 border border-brand-500/25"
                  : "text-muted-foreground hover:bg-white/4 hover:text-foreground border border-transparent"
              )}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-400 rounded-full" />
              )}

              <item.icon
                size={17}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive
                    ? "text-brand-400"
                    : "text-muted-foreground/70 group-hover:text-foreground"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className={cn("text-[13px] font-medium leading-none", isActive ? "text-brand-200" : "")}>
                  {item.label}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-none">{item.description}</p>
              </div>
              {isActive && (
                <ChevronRight size={13} className="text-brand-400/60 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/6 space-y-2">
        {/* User profile card */}
        {user && (
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              isProfileActive
                ? "bg-brand-500/12 border border-brand-500/25"
                : "bg-white/3 hover:bg-white/5 border border-white/5"
            )}
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/10">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full brand-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{user.username.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn("text-[12px] font-semibold truncate leading-none", isProfileActive ? "text-brand-300" : "text-foreground")}>
                {user.username}
              </p>
              <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 leading-none">{user.email}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <UserCircle size={13} className={cn("transition-colors", isProfileActive ? "text-brand-400" : "text-muted-foreground/50")} />
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut size={11} />
              </button>
            </div>
          </Link>
        )}

        {/* OnSpace AI status badge */}
        <div className="glass rounded-xl p-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center flex-shrink-0">
              <Zap size={11} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-foreground leading-none">OnSpace AI</p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-none">Gemini 3 Flash · Active</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
