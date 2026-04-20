import { Bell, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-background/70 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-semibold text-[19px] text-foreground leading-tight">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-none opacity-70">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground h-8 w-8 rounded-xl hover:bg-white/5"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-400" />
        </Button>
        {user && (
          <div className="flex items-center gap-2 glass rounded-xl px-2.5 py-1.5 border border-white/6 hover:border-brand-500/25 transition-colors cursor-pointer">
            <div className="w-5 h-5 rounded-full brand-gradient flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.username} />
              ) : (
                <User size={10} className="text-white" />
              )}
            </div>
            <span className="text-[12px] font-medium text-foreground hidden md:block max-w-24 truncate">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  );
}
