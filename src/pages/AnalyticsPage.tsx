import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { TrendingUp, MessageSquare, Clock, Bot, Mic, Trophy, Medal, Award, RefreshCw, Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { GlowCard } from "@/components/ui/glow-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { getAgents, getAnalytics } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { Agent } from "@/types";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

const COLORS = ["#7c3aed", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];
const RANK_ICONS = [Trophy, Medal, Award];
const RANK_COLORS = ["text-amber-400", "text-slate-400", "text-amber-700"];
const RANK_BG = ["bg-amber-400/10", "bg-slate-400/10", "bg-amber-700/10"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs border border-white/8 shadow-xl" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>
      <p className="mb-1.5 text-muted-foreground text-[11px]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

interface DailyPoint { date: string; label: string; messages: number; conversations: number; }

export function AnalyticsPage() {
  const data = getAnalytics();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalDbMessages, setTotalDbMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const allAgents = getAgents();
    setAgents(allAgents);

    const { data: convRows, error } = await supabase
      .from("conversations")
      .select("created_at, messages, message_count, agent_id")
      .order("created_at", { ascending: true });

    if (error) { console.error("[Analytics]", error); setLoading(false); return; }

    setTotalConversations(convRows?.length || 0);
    setTotalDbMessages(convRows?.reduce((s, r) => s + (r.message_count || 0), 0) || 0);

    const now = new Date();
    const last30: DailyPoint[] = Array.from({ length: 30 }, (_, i) => {
      const d = subDays(now, 29 - i);
      return { date: format(d, "yyyy-MM-dd"), label: format(d, "MMM d"), messages: 0, conversations: 0 };
    });

    convRows?.forEach((row) => {
      const day = row.created_at?.slice(0, 10);
      const idx = last30.findIndex((p) => p.date === day);
      if (idx !== -1) { last30[idx].conversations += 1; last30[idx].messages += row.message_count || 0; }
    });

    const thinned = last30.map((p, i) => ({ ...p, label: i % 5 === 0 || i === 29 ? p.label : "" }));
    setDailyData(thinned);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const agentBarData = agents
    .map((a) => ({ name: a.name.length > 10 ? a.name.slice(0, 10) + "…" : a.name, fullName: a.name, messages: a.messageCount, color: a.avatarColor }))
    .sort((a, b) => b.messages - a.messages);

  const top3 = agentBarData.slice(0, 3);

  const statCards = [
    { label: "Total Conversations", value: totalConversations || data.totalConversations, sub: "Cloud synced", icon: MessageSquare, color: "text-brand-400", bg: "bg-brand-500/10", glow: "#7c3aed" },
    { label: "Total Messages", value: totalDbMessages || data.totalMessages, sub: "All agents", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", glow: "#3b82f6" },
    { label: "Active Agents", value: agents.length, sub: `${agents.filter((a) => a.lastUsed && new Date(a.lastUsed) > new Date(Date.now() - 7 * 86400000)).length} this week`, icon: Bot, color: "text-violet-400", bg: "bg-violet-500/10", glow: "#8b5cf6" },
    { label: "Avg Response", value: data.avgResponseTime, suffix: "s", sub: "Auralis AI", icon: Clock, color: "text-green-400", bg: "bg-green-500/10", glow: "#10b981" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Analytics" subtitle="Performance metrics and usage insights"
        action={
          <button onClick={fetchAnalytics} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground bg-white/4 hover:bg-white/6 border border-white/8 transition-colors">
            <RefreshCw size={12} className={cn(loading && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <GlowCard key={stat.label} glowColor={stat.glow} intensity={0.2}>
              <div className="glass rounded-2xl p-5 border border-white/5 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                    <stat.icon size={18} className={stat.color} />
                  </div>
                </div>
                <p className="font-display font-bold text-2xl text-foreground">
                  {typeof stat.value === "number" ? (
                    <NumberTicker value={stat.value} suffix={"suffix" in stat ? (stat as { suffix?: string }).suffix || "" : ""} />
                  ) : stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* Leaderboard */}
        {top3.length > 0 && (
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={16} className="text-amber-400" />
              <h3 className="font-display font-semibold text-foreground">Agent Leaderboard</h3>
              <span className="ml-auto text-xs text-muted-foreground/60">Top 3 by messages</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {top3.map((agent, idx) => {
                const RankIcon = RANK_ICONS[idx];
                return (
                  <div key={agent.name}
                    className={cn("relative flex items-center gap-3 p-4 rounded-xl border transition-all",
                      idx === 0 ? "border-amber-500/25 bg-amber-500/4" : "border-white/6 bg-white/2")}>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", RANK_BG[idx])}>
                      <RankIcon size={18} className={RANK_COLORS[idx]} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{agent.fullName}</p>
                      <p className="text-xs text-muted-foreground/70">{agent.messages} messages</p>
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] font-bold text-muted-foreground/30">#{idx + 1}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-Agent Bar Chart */}
        {agentBarData.length > 0 && (
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-foreground">Messages per Agent</h3>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Total message count by agent</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agentBarData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="messages" name="Messages" radius={[6, 6, 0, 0]}>
                  {agentBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 30-Day Line Chart */}
        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-foreground">30-Day Activity</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Daily messages & conversations from cloud</p>
            </div>
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <RefreshCw size={11} className="animate-spin" />
                Loading…
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="lineMsg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="messages" name="Messages" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#7c3aed" }} />
              <Line type="monotone" dataKey="conversations" name="Conversations" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#0ea5e9" }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 justify-center">
            {[{ label: "Messages", color: "#7c3aed" }, { label: "Conversations", color: "#0ea5e9" }].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[11px] text-muted-foreground/60">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Usage Pie */}
        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-5">
            <Mic size={15} className="text-brand-400" />
            <h3 className="font-display font-semibold text-foreground">Voice Usage</h3>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full">
              <Sparkles size={9} /> Auralis AI
            </span>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={data.voiceUsage} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" paddingAngle={3}>
                  {data.voiceUsage.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {data.voiceUsage.map((v, i) => (
                <div key={v.voiceName} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground/70">{v.voiceName}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{v.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
