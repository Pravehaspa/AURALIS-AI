import { useState } from "react";
import { Volume2, Mic, Bell, Globe, Trash2, Download, Sun, Moon, Monitor, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopBar } from "@/components/layout/TopBar";
import { GlowCard } from "@/components/ui/glow-card";
import { getSettings, saveSettings } from "@/lib/storage";
import { VOICES } from "@/constants";
import type { UserSettings } from "@/types";
import type { Theme } from "@/contexts/ThemeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ icon: Icon, label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={15} className="text-brand-400" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "dark", label: "Dark", icon: Moon, desc: "Deep purple glass" },
  { value: "light", label: "Light", icon: Sun, desc: "Soft white & violet" },
  { value: "system", label: "System", icon: Monitor, desc: "Follows OS" },
];

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const { theme: currentTheme, setTheme } = useTheme();

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleExport = () => {
    const data = {
      agents: localStorage.getItem("auralis_agents"),
      settings: localStorage.getItem("auralis_settings"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auralis-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleClear = () => {
    if (confirm("Are you sure? This will delete all agents and settings.")) {
      localStorage.clear();
      toast.success("All data cleared. Refreshing...");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Settings" subtitle="Customize your Auralis AI experience" />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Theme Switcher */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-semibold text-foreground mb-1">Appearance</h3>
            <p className="text-[11px] text-muted-foreground/60 mb-5">Changes apply instantly.</p>

            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map(({ value, label, icon: Icon, desc }) => {
                const isActive = currentTheme === value;
                return (
                  <GlowCard key={value} glowColor="#7c3aed" intensity={isActive ? 0.3 : 0.1}>
                    <button
                      onClick={() => { setTheme(value); toast.success(`${label} theme applied`); }}
                      className={cn(
                        "w-full flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-center",
                        isActive ? "border-brand-500/50 bg-brand-500/8" : "border-white/6 bg-white/2 hover:border-brand-500/30 hover:bg-brand-500/4"
                      )}>
                      {/* Preview swatch */}
                      <div className={cn("w-full h-14 rounded-xl overflow-hidden border flex items-end justify-center pb-2",
                        value === "dark" ? "bg-[#0d0b15] border-[#2a2640]" : value === "light" ? "bg-[#f5f3ff] border-[#ddd6fe]" : "border-white/10")}
                        style={value === "system" ? { background: "linear-gradient(135deg, #0d0b15 50%, #f5f3ff 50%)" } : undefined}>
                        <div className={cn("w-3 h-8 rounded mr-1", value === "dark" ? "bg-[#7c3aed]/60" : value === "light" ? "bg-[#7c3aed]/40" : "bg-[#7c3aed]/50")} />
                        <div className="flex flex-col gap-1">
                          {[3, 2, 2.5].map((w, i) => (
                            <div key={i} className={cn("h-1 rounded-full", value === "dark" ? "bg-white/15" : "bg-[#4f46e5]/25")} style={{ width: `${w * 5}px` }} />
                          ))}
                        </div>
                      </div>
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isActive ? "bg-brand-500/20" : "bg-white/5")}>
                        <Icon size={16} className={isActive ? "text-brand-400" : "text-muted-foreground/60"} />
                      </div>
                      <div>
                        <p className={cn("text-sm font-semibold", isActive ? "text-brand-300" : "text-foreground/80")}>{label}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{desc}</p>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    </button>
                  </GlowCard>
                );
              })}
            </div>
          </div>

          {/* Voice Settings */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-semibold text-foreground mb-1">Voice Settings</h3>
            <p className="text-[11px] text-muted-foreground/60 mb-4">Configure audio preferences</p>
            <SettingRow icon={Volume2} label="Auto-play Voice" description="Automatically speak agent responses">
              <Switch checked={settings.autoPlayVoice} onCheckedChange={(v) => update("autoPlayVoice", v)} />
            </SettingRow>
            <SettingRow icon={Mic} label="Voice Input" description="Enable microphone for voice messages">
              <Switch checked={settings.voiceInputEnabled} onCheckedChange={(v) => update("voiceInputEnabled", v)} />
            </SettingRow>
            <SettingRow icon={Volume2} label="Default Voice" description="Fallback voice for new agents">
              <Select value={settings.defaultVoiceId} onValueChange={(v) => update("defaultVoiceId", v)}>
                <SelectTrigger className="w-36 bg-white/4 border-white/8 text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </SettingRow>
          </div>

          {/* App Settings */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-semibold text-foreground mb-1">App Settings</h3>
            <p className="text-[11px] text-muted-foreground/60 mb-4">Interface and notification preferences</p>
            <SettingRow icon={Bell} label="Notifications" description="Enable in-app notifications">
              <Switch checked={settings.notificationsEnabled} onCheckedChange={(v) => update("notificationsEnabled", v)} />
            </SettingRow>
            <SettingRow icon={Globe} label="Language" description="Speech recognition language">
              <Select value={settings.language} onValueChange={(v) => update("language", v)}>
                <SelectTrigger className="w-36 bg-white/4 border-white/8 text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </div>

          {/* Data Management */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-semibold text-foreground mb-1">Data Management</h3>
            <p className="text-[11px] text-muted-foreground/60 mb-4">Export or clear your data</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExport} className="flex-1 gap-2 text-sm rounded-xl border-white/10 hover:border-white/20">
                <Download size={14} /> Export Data
              </Button>
              <Button variant="destructive" onClick={handleClear} className="flex-1 gap-2 text-sm rounded-xl">
                <Trash2 size={14} /> Clear All Data
              </Button>
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-foreground">Auralis AI</h3>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Version 1.0.0 · Major Project 2026</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Sparkles size={11} className="text-brand-400" />
                  <p className="text-xs text-brand-400 font-medium">Auralis AI</p>
                </div>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">React + TypeScript + Gemini 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
