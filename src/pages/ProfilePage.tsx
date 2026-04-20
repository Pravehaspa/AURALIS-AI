import { useState } from "react";
import {
  User,
  Mail,
  Edit3,
  Save,
  X,
  Bot,
  MessageSquare,
  Calendar,
  Sparkles,
  Shield,
  Camera,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getAgents } from "@/lib/storage";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  "linear-gradient(135deg, #db2777 0%, #9333ea 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
  "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
];

function AvatarDisplay({
  user,
  size = "lg",
}: {
  user: { username: string; avatar?: string };
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeMap = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-20 h-20 text-2xl",
    xl: "w-28 h-28 text-4xl",
  };

  const initials = user.username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center font-display font-bold text-white flex-shrink-0 overflow-hidden",
        sizeMap[size]
      )}
      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);

  const agents = getAgents();
  const totalMessages = agents.reduce((sum, a) => sum + a.messageCount, 0);
  const activeAgents = agents.filter(
    (a) => a.lastUsed && new Date(a.lastUsed) > new Date(Date.now() - 7 * 86400000)
  ).length;

  // Get join date from user metadata or creation timestamp
  const joinDate = user
    ? (user as unknown as { created_at?: string }).created_at
      ? new Date((user as unknown as { created_at: string }).created_at)
      : new Date()
    : new Date();

  const handleSave = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { username: newUsername.trim() },
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    // Update local auth state
    if (data.user && user) {
      login({
        ...user,
        username: newUsername.trim(),
      });
    }
    toast.success("Display name updated");
    setIsEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setNewUsername(user?.username || "");
    setIsEditing(false);
  };

  if (!user) return null;

  const stats = [
    {
      icon: Bot,
      label: "Agents Created",
      value: agents.length,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      suffix: "agents",
    },
    {
      icon: MessageSquare,
      label: "Total Messages",
      value: totalMessages,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      suffix: "messages",
    },
    {
      icon: TrendingUp,
      label: "Active This Week",
      value: activeAgents,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      suffix: "active",
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: format(joinDate, "MMM yyyy"),
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      suffix: "",
      isText: true,
    },
  ];

  const recentAgents = [...agents]
    .filter((a) => a.lastUsed)
    .sort(
      (a, b) =>
        new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime()
    )
    .slice(0, 5);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Profile" subtitle="Manage your account and preferences" />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Hero card */}
          <div className="glass-strong rounded-2xl overflow-hidden">
            {/* Banner */}
            <div
              className="h-28 w-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.6) 0%, rgba(79,70,229,0.4) 50%, rgba(168,85,247,0.3) 100%)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Decorative circles */}
              <div className="relative h-full overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-violet-500/10 border border-violet-500/20" />
                <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-500/20" />
                <div className="absolute -bottom-6 left-1/3 w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/20" />
              </div>
            </div>

            {/* Profile info */}
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  <div className="ring-4 ring-card rounded-2xl">
                    <AvatarDisplay user={user} size="xl" />
                  </div>
                  {/* Verified badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                    <Shield size={13} className="text-white" />
                  </div>
                </div>

                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 text-sm border-border hover:border-brand-500/50 hover:text-brand-300"
                  >
                    <Edit3 size={13} />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="text-muted-foreground"
                    >
                      <X size={13} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="brand-gradient text-white gap-2"
                    >
                      <Save size={13} />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 max-w-xs">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Display Name
                    </Label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        className="pl-9 bg-secondary border-border"
                        placeholder="Your display name"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="font-display font-bold text-2xl text-foreground">
                    {user.username}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={13} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/25">
                      <Sparkles size={10} />
                      Auralis AI Member
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Active
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-4 flex flex-col gap-3 hover:border-border/60 transition-all duration-200"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    stat.bg
                  )}
                >
                  <stat.icon size={17} className={stat.color} />
                </div>
                <div>
                  <p
                    className={cn(
                      "font-display font-bold",
                      stat.isText ? "text-xl" : "text-2xl",
                      "text-foreground"
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Account details */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield size={16} className="text-brand-400" />
              Account Details
            </h3>
            <div className="space-y-3">
              {[
                { label: "User ID", value: user.id.slice(0, 8) + "..." + user.id.slice(-4), mono: true },
                { label: "Email", value: user.email, mono: false },
                {
                  label: "Account Type",
                  value: user.avatar?.includes("google") ? "Google OAuth" : "Email + Password",
                  mono: false,
                },
                {
                  label: "Member Since",
                  value: format(joinDate, "MMMM d, yyyy"),
                  mono: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span
                    className={cn(
                      "text-sm text-foreground",
                      item.mono && "font-mono text-xs bg-secondary px-2 py-0.5 rounded"
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent agent activity */}
          {recentAgents.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock size={16} className="text-brand-400" />
                Recent Agent Activity
              </h3>
              <div className="space-y-3">
                {recentAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: agent.avatarColor }}
                    >
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.messageCount} messages · {agent.voiceName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(agent.lastUsed!), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievement card */}
          <div className="glass rounded-2xl p-5 border border-brand-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
                <Award size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  Auralis AI Explorer
                </h3>
                <p className="text-xs text-muted-foreground">
                  Building the future of voice AI
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                  Active
                </span>
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { label: "Agents", pct: Math.min((agents.length / 10) * 100, 100) },
                {
                  label: "Messages",
                  pct: Math.min((totalMessages / 100) * 100, 100),
                },
              ].map((bar) => (
                <div key={bar.label} className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{bar.label}</span>
                    <span>{Math.round(bar.pct)}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full brand-gradient rounded-full transition-all duration-700"
                      style={{ width: `${bar.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
