import { useState, useMemo } from "react";
import { Plus, Bot, Zap, Search, SlidersHorizontal, X, Sparkles, ChevronDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/layout/TopBar";
import { AgentCard } from "@/components/features/AgentCard";
import { CreateAgentModal } from "@/components/features/CreateAgentModal";
import { TemplateGallery } from "@/components/features/TemplateGallery";
import { GlowCard } from "@/components/ui/glow-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useAgents } from "@/hooks/useAgents";
import type { Agent } from "@/types";
import { SORT_OPTIONS } from "@/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "assistant", label: "Assistant" },
  { value: "customer-service", label: "Support" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "sales", label: "Sales" },
  { value: "creative", label: "Creative" },
  { value: "technical", label: "Technical" },
];

const STAT_COLORS = [
  { text: "text-violet-400", bg: "bg-violet-500/10", glow: "#7c3aed", icon: Bot },
  { text: "text-blue-400", bg: "bg-blue-500/10", glow: "#3b82f6", icon: Zap },
  { text: "text-emerald-400", bg: "bg-emerald-500/10", glow: "#10b981", icon: TrendingUp },
];

export function AgentsPage() {
  const { agents, addAgent, editAgent, removeAgent } = useAgents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastUsed");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filtered = useMemo(() => {
    let result = [...agents];
    if (categoryFilter !== "all") result = result.filter((a) => a.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.voiceName.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      if (sortBy === "lastUsed") return new Date(b.lastUsed || 0).getTime() - new Date(a.lastUsed || 0).getTime();
      if (sortBy === "messageCount") return b.messageCount - a.messageCount;
      if (sortBy === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return result;
  }, [agents, categoryFilter, searchQuery, sortBy]);

  const handleSave = async (data: Omit<Agent, "id" | "createdAt" | "messageCount">) => {
    if (editingAgent) { await editAgent(editingAgent.id, data); toast.success("Agent updated"); }
    else { await addAgent(data); toast.success("Agent created"); }
    setEditingAgent(null);
  };

  const handleEdit = (agent: Agent) => { setEditingAgent(agent); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { await removeAgent(id); toast.success("Agent deleted"); };
  const handleModalClose = () => { setIsModalOpen(false); setEditingAgent(null); };

  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy);

  const statsData = [
    { label: "Total Agents", value: agents.length },
    { label: "Total Messages", value: agents.reduce((s, a) => s + a.messageCount, 0) },
    { label: "Active Today", value: agents.filter((a) => a.lastUsed && new Date(a.lastUsed) > new Date(Date.now() - 86400000)).length },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar
        title="Voice Agents"
        subtitle={`${agents.length} agent${agents.length !== 1 ? "s" : ""} configured`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}
              className={cn("gap-2 text-sm h-9 rounded-xl border-white/10 hover:border-brand-500/40 transition-all", showTemplates && "border-brand-500/40 text-brand-300 bg-brand-500/8")}>
              <Sparkles size={13} /> Templates
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="brand-gradient text-white hover:opacity-90 h-9 gap-2 rounded-xl shadow-lg shadow-brand-500/20">
              <Plus size={14} /> New Agent
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statsData.map((stat, i) => {
            const meta = STAT_COLORS[i];
            return (
              <GlowCard key={stat.label} glowColor={meta.glow} intensity={0.2}>
                <div className="glass rounded-xl p-4 flex items-center gap-3 border border-white/5">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", meta.bg)}>
                    <meta.icon size={16} className={meta.text} />
                  </div>
                  <div>
                    <p className="text-[22px] font-display font-bold text-foreground leading-none">
                      <NumberTicker value={stat.value} />
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">{stat.label}</p>
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>

        {/* Template Gallery */}
        {showTemplates && (
          <div className="mb-6 animate-fade-in">
            <TemplateGallery
              onCreateFromTemplate={async (data) => {
                await addAgent(data);
                toast.success(`${data.name} created from template`);
                setShowTemplates(false);
              }}
              onClose={() => setShowTemplates(false)}
            />
          </div>
        )}

        {/* Search + Filter Bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents, voices, tags…"
              className="pl-8 h-9 bg-white/4 border-white/8 text-sm rounded-xl focus-visible:border-brand-500/40 focus-visible:ring-0 placeholder:text-muted-foreground/40" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin flex-1">
            {CATEGORY_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setCategoryFilter(f.value)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  categoryFilter === f.value
                    ? "brand-gradient text-white shadow-md shadow-brand-500/20"
                    : "bg-white/4 text-muted-foreground/70 hover:text-foreground hover:bg-white/6 border border-white/5"
                )}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-muted-foreground/70 hover:text-foreground text-xs transition-colors">
              <SlidersHorizontal size={11} />
              {currentSort?.label}
              <ChevronDown size={10} className={cn("transition-transform", showSortMenu && "rotate-180")} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 glass-strong rounded-xl shadow-xl z-20 overflow-hidden border border-white/8">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm transition-colors",
                      sortBy === opt.value ? "text-brand-300 bg-brand-500/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        {(searchQuery || categoryFilter !== "all") && (
          <p className="text-xs text-muted-foreground/60 mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        )}

        {/* Agent Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((agent, i) => (
              <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s`, animationFillMode: "both" }}>
                <AgentCard agent={agent} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            ))}

            {/* Create Card */}
            {!searchQuery && categoryFilter === "all" && (
              <button onClick={() => setIsModalOpen(true)}
                className="glass rounded-2xl p-5 flex flex-col items-center justify-center gap-3 border-dashed border border-white/8 hover:border-brand-500/40 hover:bg-brand-500/4 transition-all duration-300 min-h-[200px] group">
                <div className="w-12 h-12 rounded-xl bg-brand-500/15 group-hover:bg-brand-500/25 flex items-center justify-center transition-colors">
                  <Plus size={22} className="text-brand-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground/80 text-sm">Create New Agent</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Build a custom voice assistant</p>
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mb-4 shadow-xl shadow-brand-500/30">
              <Search size={26} className="text-white" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">No agents found</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              {searchQuery ? `No agents match "${searchQuery}". Try a different search.` : "Create your first voice agent"}
            </p>
            <div className="flex gap-3">
              {searchQuery && <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl">Clear Search</Button>}
              <Button onClick={() => setIsModalOpen(true)} className="brand-gradient text-white gap-2 rounded-xl">
                <Plus size={14} /> Create Agent
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateAgentModal isOpen={isModalOpen} onClose={handleModalClose} onSave={handleSave} editAgent={editingAgent} />
    </div>
  );
}
