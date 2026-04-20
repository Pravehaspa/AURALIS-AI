import { useState } from "react";
import { Play, Square, CheckCircle, Mic, Globe, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGENT_TEMPLATES } from "@/constants";
import { speakText, stopSpeaking } from "@/lib/ai";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TemplateGalleryProps {
  onCreateFromTemplate: (data: Omit<Agent, "id" | "createdAt" | "messageCount">) => void;
  onClose: () => void;
}

const GENDER_ICON: Record<string, string> = {
  female: "♀",
  male: "♂",
  neutral: "◎",
};

export function TemplateGallery({ onCreateFromTemplate, onClose }: TemplateGalleryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [createdIds, setCreatedIds] = useState<Set<string>>(new Set());

  const handlePlay = (template: typeof AGENT_TEMPLATES[0]) => {
    if (playingId === template.id) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }

    stopSpeaking();
    setPlayingId(template.id);
    const sampleText = `Hello! I'm ${template.name}. ${template.description}`;
    speakText(sampleText, template.voiceName);

    const duration = sampleText.length * 65 + 1000;
    setTimeout(() => {
      setPlayingId(null);
    }, duration);
  };

  const handleCreate = (template: typeof AGENT_TEMPLATES[0]) => {
    onCreateFromTemplate({
      name: template.name,
      description: template.description,
      personality: template.personality,
      category: template.category,
      voiceId: template.voiceId,
      voiceName: template.voiceName,
      systemPrompt: template.systemPrompt,
      avatarColor: template.avatarColor,
      tags: template.tags,
    });
    setCreatedIds((prev) => new Set([...prev, template.id]));
    toast.success(`${template.name} created from template`);
  };

  return (
    <div className="glass-strong rounded-2xl border border-brand-500/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">Agent Templates</h3>
            <p className="text-[11px] text-muted-foreground">6 pre-built experts — one click to deploy</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        {AGENT_TEMPLATES.map((template) => {
          const isPlaying = playingId === template.id;
          const isCreated = createdIds.has(template.id);

          return (
            <div
              key={template.id}
              className="relative glass rounded-xl p-4 flex flex-col gap-3 hover:border-brand-500/30 transition-all duration-200 group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: template.avatarColor + "22", border: `1px solid ${template.avatarColor}44` }}
                  >
                    {template.emoji}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">{template.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mic size={10} className="text-brand-400" />
                      <span className="text-[10px] text-muted-foreground">{template.voiceName}</span>
                    </div>
                  </div>
                </div>

                {/* Voice preview button */}
                <button
                  onClick={() => handlePlay(template)}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    isPlaying
                      ? "bg-brand-500/20 text-brand-400 border border-brand-500/40"
                      : "bg-secondary text-muted-foreground hover:text-brand-400 hover:bg-brand-500/10 opacity-0 group-hover:opacity-100"
                  )}
                  title={isPlaying ? "Stop preview" : "Preview voice"}
                >
                  {isPlaying ? <Square size={11} /> : <Play size={11} />}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-brand-500/10 text-brand-300 border-brand-500/20 px-2 py-0"
                >
                  {template.category.replace(/-/g, " ")}
                </Badge>
                {template.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 bg-secondary text-muted-foreground border-transparent">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Personality preview */}
              <p className="text-[11px] text-muted-foreground/70 italic line-clamp-1">
                "{template.personality}"
              </p>

              {/* Create button */}
              <Button
                onClick={() => handleCreate(template)}
                disabled={isCreated}
                size="sm"
                className={cn(
                  "w-full h-8 text-xs font-medium transition-all",
                  isCreated
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                    : "brand-gradient text-white hover:opacity-90"
                )}
              >
                {isCreated ? (
                  <><CheckCircle size={13} className="mr-1.5" /> Created</>
                ) : (
                  <><Globe size={13} className="mr-1.5" /> Deploy Agent</>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
