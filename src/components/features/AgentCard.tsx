import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Mic,
  MoreVertical,
  Trash2,
  Edit3,
  Clock,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  assistant: "Assistant",
  "customer-service": "Customer Service",
  education: "Education",
  healthcare: "Healthcare",
  sales: "Sales",
  creative: "Creative",
  technical: "Technical",
};

const CATEGORY_COLORS: Record<string, string> = {
  assistant: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  "customer-service": "bg-blue-500/10 text-blue-300 border-blue-500/20",
  education: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  healthcare: "bg-red-500/10 text-red-300 border-red-500/20",
  sales: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  creative: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  technical: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
};

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const initials = agent.name.slice(0, 2).toUpperCase();
  const categoryClass =
    CATEGORY_COLORS[agent.category] ||
    "bg-brand-500/10 text-brand-300 border-brand-500/20";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Encode agent config (exclude runtime stats)
    const sharePayload = {
      name: agent.name,
      description: agent.description,
      personality: agent.personality,
      category: agent.category,
      voiceId: agent.voiceId,
      voiceName: agent.voiceName,
      systemPrompt: agent.systemPrompt,
      avatarColor: agent.avatarColor,
      tags: agent.tags,
    };

    const encoded = btoa(encodeURIComponent(JSON.stringify(sharePayload)));
    const shareUrl = `${window.location.origin}/?import=${encoded}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success("Share link copied!", {
        description: "Anyone with this link can import your agent.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="glass rounded-2xl p-5 hover:border-brand-500/30 transition-all duration-200 group cursor-pointer relative overflow-hidden"
      onClick={() => navigate(`/chat/${agent.id}`)}
    >
      {/* Subtle top-right gradient blob */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${agent.avatarColor}22 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar with subtle glow on hover */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0 shadow-lg transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: agent.avatarColor,
              boxShadow: `0 4px 16px ${agent.avatarColor}40`,
            }}
          >
            {initials}
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-base leading-tight group-hover:text-brand-200 transition-colors">
              {agent.name}
            </h3>
            <Badge
              variant="secondary"
              className={cn("text-[10px] mt-1 border", categoryClass)}
            >
              {CATEGORY_LABELS[agent.category] || agent.category}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
            >
              <MoreVertical size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat/${agent.id}`);
              }}
            >
              <ExternalLink size={14} className="mr-2 text-brand-400" /> Open Chat
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(agent);
              }}
            >
              <Edit3 size={14} className="mr-2" /> Edit Agent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share2 size={14} className="mr-2 text-emerald-400" /> Share Agent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(agent.id);
              }}
            >
              <Trash2 size={14} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {agent.description}
      </p>

      {/* Voice + Tags row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground">
          <Mic size={11} className="text-brand-400" />
          {agent.voiceName}
        </div>
        {agent.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full bg-secondary/60 text-[11px] text-muted-foreground border border-border/50"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare size={12} />
            <span className="font-medium">{agent.messageCount}</span>
            <span>msgs</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Share quick button */}
          <button
            onClick={handleShare}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
              copied
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-secondary text-muted-foreground hover:text-brand-400 hover:bg-brand-500/10"
            )}
            title="Copy share link"
          >
            {copied ? <Check size={12} /> : <Share2 size={12} />}
          </button>

          {agent.lastUsed && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} />
              <span>{formatDistanceToNow(new Date(agent.lastUsed), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
