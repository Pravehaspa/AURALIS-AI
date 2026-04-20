import { useState } from "react";
import { X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Agent, AgentCategory } from "@/types";
import { VOICES, AGENT_CATEGORIES, AGENT_COLORS, PROMPT_TEMPLATES } from "@/constants";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Agent, "id" | "createdAt" | "messageCount">) => void;
  editAgent?: Agent | null;
}

export function CreateAgentModal({ isOpen, onClose, onSave, editAgent }: CreateAgentModalProps) {
  const [name, setName] = useState(editAgent?.name || "");
  const [description, setDescription] = useState(editAgent?.description || "");
  const [personality, setPersonality] = useState(editAgent?.personality || "");
  const [category, setCategory] = useState<AgentCategory>(editAgent?.category || "assistant");
  const [voiceId, setVoiceId] = useState(editAgent?.voiceId || "v1");
  const [systemPrompt, setSystemPrompt] = useState(editAgent?.systemPrompt || "");
  const [avatarColor, setAvatarColor] = useState(editAgent?.avatarColor || AGENT_COLORS[0]);
  const [tags, setTags] = useState(editAgent?.tags?.join(", ") || "");

  const selectedVoice = VOICES.find((v) => v.id === voiceId);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      personality: personality.trim(),
      category,
      voiceId,
      voiceName: selectedVoice?.name || "Aurora",
      systemPrompt: systemPrompt.trim(),
      avatarColor,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    onClose();
  };

  const applyTemplate = (templatePrompt: string) => {
    setSystemPrompt(templatePrompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground">
                {editAgent ? "Edit Agent" : "Create New Agent"}
              </h2>
              <p className="text-xs text-muted-foreground">Configure your AI voice agent</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
            <X size={18} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Color & Name */}
          <div className="grid grid-cols-[auto_1fr] gap-4 items-end">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Avatar Color</Label>
              <div className="flex gap-2">
                {AGENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAvatarColor(color)}
                    className="w-7 h-7 rounded-lg transition-all"
                    style={{
                      backgroundColor: color,
                      outline: avatarColor === color ? `2px solid ${color}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Agent Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aria, Max, Luna..."
                className="bg-secondary border-border"
              />
            </div>
          </div>

          {/* Description & Personality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
                className="bg-secondary border-border resize-none h-20"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Personality</Label>
              <Textarea
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="e.g., Professional, warm, concise..."
                className="bg-secondary border-border resize-none h-20"
              />
            </div>
          </div>

          {/* Category & Voice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AgentCategory)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Voice</Label>
              <Select value={voiceId} onValueChange={setVoiceId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} — {v.accent}, {v.style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* System Prompt with Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">System Prompt</Label>
              <div className="flex gap-1.5 flex-wrap">
                {PROMPT_TEMPLATES.slice(0, 3).map((t) => (
                  <button
                    key={t.name}
                    onClick={() => applyTemplate(t.prompt)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition-colors"
                  >
                    <Sparkles size={8} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define the agent's behavior, tone, and expertise..."
              className="bg-secondary border-border resize-none h-28"
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., support, helpful, technical"
              className="bg-secondary border-border"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="flex-1 brand-gradient text-white hover:opacity-90"
            >
              {editAgent ? "Save Changes" : "Create Agent"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
