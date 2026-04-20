import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Square, Volume2, Settings2, Bot, Loader2, Sparkles, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WaveformVisualizer } from "@/components/features/WaveformVisualizer";
import { TopBar } from "@/components/layout/TopBar";
import { GlowCard } from "@/components/ui/glow-card";
import { generateAIResponse, speakText, stopSpeaking } from "@/lib/ai";
import { getAgents } from "@/lib/storage";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type AutoModeState = "idle" | "listening" | "processing" | "speaking";
interface SessionEntry { role: "user" | "assistant"; content: string; time: string; }

export function AutoModePage() {
  const [agents] = useState<Agent[]>(() => getAgents());
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || "");
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const [autoModeState, setAutoModeState] = useState<AutoModeState>("idle");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);

  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);
  const isSessionActiveRef = useRef(false);
  const autoModeStateRef = useRef<AutoModeState>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionLogRef = useRef<SessionEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const setStateAndRef = (state: AutoModeState) => { autoModeStateRef.current = state; setAutoModeState(state); };

  const addToLog = useCallback((entry: SessionEntry) => {
    sessionLogRef.current = [...sessionLogRef.current, entry];
    setSessionLog([...sessionLogRef.current]);
    setTimeout(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
  }, []);

  const startListeningCycle = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported. Try Chrome.");
      isSessionActiveRef.current = false;
      setIsSessionActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setStateAndRef("listening");

    recognition.onresult = (e) => {
      const current = Array.from(e.results).map((r) => r[0].transcript).join("");
      setTranscript(current);

      if (e.results[e.results.length - 1].isFinal && current.trim()) {
        const finalText = current.trim();
        setTranscript("");
        setStateAndRef("processing");
        addToLog({ role: "user", content: finalText, time: new Date().toISOString() });
        conversationHistoryRef.current = [...conversationHistoryRef.current, { role: "user", content: finalText }];

        const agent = agents.find((a) => a.id === selectedAgentId) || agents[0];
        generateAIResponse(finalText, agent.category, agent.name, agent.personality || "", agent.systemPrompt || "", conversationHistoryRef.current.slice(0, -1))
          .then((responseText) => {
            if (!isSessionActiveRef.current) return;
            conversationHistoryRef.current = [...conversationHistoryRef.current, { role: "assistant", content: responseText }];
            addToLog({ role: "assistant", content: responseText, time: new Date().toISOString() });
            setStateAndRef("speaking");
            speakText(responseText, agent.voiceName);
            const duration = Math.max(2500, responseText.length * 58);
            setTimeout(() => {
              if (!isSessionActiveRef.current) return;
              setStateAndRef("idle");
              setTimeout(() => { if (isSessionActiveRef.current) startListeningCycle(); }, 400);
            }, duration);
          })
          .catch((err) => {
            console.error("[AutoMode] AI error:", err);
            if (isSessionActiveRef.current) {
              toast.error("AI error. Listening again...");
              setStateAndRef("idle");
              setTimeout(() => { if (isSessionActiveRef.current) startListeningCycle(); }, 800);
            }
          });
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech" && isSessionActiveRef.current) {
        setTimeout(() => { if (isSessionActiveRef.current && autoModeStateRef.current === "listening") startListeningCycle(); }, 300);
      } else if (e.error !== "aborted") {
        setStateAndRef("idle");
      }
    };

    recognition.onend = () => {
      if (isSessionActiveRef.current && autoModeStateRef.current === "listening") {
        setTimeout(() => { if (isSessionActiveRef.current) startListeningCycle(); }, 200);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { console.error("[AutoMode] Start error:", e); }
  }, [agents, selectedAgentId, addToLog]);

  const startSession = () => {
    if (!selectedAgent) { toast.error("Please select an agent first"); return; }
    sessionLogRef.current = [];
    conversationHistoryRef.current = [];
    setSessionLog([]);
    isSessionActiveRef.current = true;
    setIsSessionActive(true);
    startListeningCycle();
    toast.success(`Auto Mode started with ${selectedAgent.name}`);
  };

  const stopSession = () => {
    isSessionActiveRef.current = false;
    recognitionRef.current?.abort();
    stopSpeaking();
    setIsSessionActive(false);
    setStateAndRef("idle");
    setTranscript("");
    toast.info("Auto Mode stopped");
  };

  const ORB_STATE = {
    idle: { label: isSessionActive ? "Ready — speak now" : "Tap to start", color: "text-muted-foreground", border: "border-white/10", bg: "bg-white/3", ring: "" },
    listening: { label: "Listening…", color: "text-green-400", border: "border-green-500/50", bg: "bg-green-500/8", ring: "shadow-green-500/20" },
    processing: { label: "AI is thinking…", color: "text-brand-400", border: "border-brand-500/50", bg: "bg-brand-500/8", ring: "shadow-brand-500/20" },
    speaking: { label: `${selectedAgent?.name || "Agent"} is speaking…`, color: "text-violet-400", border: "border-violet-500/50", bg: "bg-violet-500/8", ring: "shadow-violet-500/20" },
  };

  const config = ORB_STATE[autoModeState];

  if (!selectedAgent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl brand-gradient mx-auto mb-4 flex items-center justify-center">
            <Bot size={28} className="text-white" />
          </div>
          <p className="text-muted-foreground">No agents found. Create one first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Auto Voice Mode" subtitle="Hands-free AI-powered speech conversations" />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Agent Selector */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 size={15} className="text-brand-400" />
              <span className="text-sm font-medium text-foreground">Agent Configuration</span>
              {isSessionActive && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Session Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-muted-foreground/60 mb-1.5 block">Select Voice Agent</label>
                <Select value={selectedAgentId} onValueChange={(v) => { if (!isSessionActive) { setSelectedAgentId(v); conversationHistoryRef.current = []; } }} disabled={isSessionActive}>
                  <SelectTrigger className="bg-white/4 border-white/8 text-sm rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name} — {a.voiceName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedAgent && (
                <div className="flex items-center gap-2 mt-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: selectedAgent.avatarColor }}>
                    {selectedAgent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{selectedAgent.voiceName}</p>
                    <p className="text-[10px] text-muted-foreground/60">voice profile</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Orb */}
          <GlowCard glowColor={autoModeState === "listening" ? "#10b981" : autoModeState === "speaking" ? "#8b5cf6" : "#7c3aed"} intensity={0.3}>
            <div className="glass rounded-2xl p-10 flex flex-col items-center border border-white/5">
              {/* Rings */}
              <div className="relative flex items-center justify-center mb-8">
                {isSessionActive && (
                  <>
                    <div className={cn(
                      "absolute w-52 h-52 rounded-full border opacity-15 animate-ping",
                      autoModeState === "listening" ? "border-green-500" : autoModeState === "speaking" ? "border-violet-500" : "border-brand-500"
                    )} style={{ animationDuration: "2.5s" }} />
                    <div className={cn("absolute w-38 h-38 rounded-full border-2 opacity-30", config.border)}
                      style={{ width: "9.5rem", height: "9.5rem" }} />
                  </>
                )}

                {/* Orb button */}
                <button onClick={isSessionActive ? stopSession : startSession}
                  className={cn(
                    "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none shadow-2xl",
                    isSessionActive
                      ? cn(config.bg, "border-2", config.border, config.ring && `shadow-2xl ${config.ring}`)
                      : "brand-gradient border-2 border-brand-400/40 hover:scale-105 active:scale-95 shadow-brand-500/40"
                  )}>
                  {isSessionActive ? (
                    autoModeState === "listening" ? <Mic size={40} className="text-green-400" /> :
                    autoModeState === "speaking" ? <Volume2 size={40} className="text-violet-400" /> :
                    autoModeState === "processing" ? <Loader2 size={40} className="text-brand-400 animate-spin" /> :
                    <Square size={32} className="text-muted-foreground" />
                  ) : (
                    <Mic size={40} className="text-white" />
                  )}
                </button>
              </div>

              <p className={cn("font-display font-semibold text-lg mb-3", config.color)}>
                {config.label}
              </p>

              <div className="h-10 flex items-center">
                <WaveformVisualizer isActive={autoModeState === "listening" || autoModeState === "speaking"} size="md" />
              </div>

              {transcript && (
                <div className="mt-4 px-5 py-3 rounded-xl bg-green-500/8 border border-green-500/20 text-sm text-green-300 text-center max-w-xs animate-pulse">
                  "{transcript}"
                </div>
              )}

              {autoModeState === "processing" && (
                <div className="mt-4 flex items-center gap-2 text-xs text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
                  <Loader2 size={11} className="animate-spin" />
                  Generating via Auralis AI · Gemini 3 Flash
                </div>
              )}

              <p className="text-xs text-muted-foreground/50 mt-5 text-center max-w-xs leading-relaxed">
                {isSessionActive
                  ? "Tap to end session. AI maintains full conversation context."
                  : "Tap to start hands-free AI voice conversation."}
              </p>
            </div>
          </GlowCard>

          {/* Session Log */}
          {sessionLog.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-white/5 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Session Log</span>
                  <span className="text-xs text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                    <Zap size={9} className="inline mr-0.5" />AI
                  </span>
                </div>
                <span className="text-xs text-muted-foreground/60">
                  {Math.ceil(sessionLog.length / 2)} exchanges
                </span>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {sessionLog.map((entry, i) => (
                  <div key={i} className={cn("flex gap-3 animate-fade-in", entry.role === "user" ? "justify-end" : "justify-start")}>
                    {entry.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5 shadow-sm"
                        style={{ backgroundColor: selectedAgent?.avatarColor }}>
                        {selectedAgent?.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className={cn("px-3.5 py-2.5 rounded-xl text-sm max-w-[78%]",
                      entry.role === "user" ? "bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-tr-sm" : "glass text-foreground rounded-tl-sm border border-white/5")}>
                      <p className="leading-relaxed text-[13px]">{entry.content}</p>
                      <p className="text-[10px] opacity-40 mt-1.5">
                        {entry.role === "user" ? "🎤 You" : `🔊 ${selectedAgent?.name}`} · {formatDistanceToNow(new Date(entry.time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Mic, label: "Speak naturally", desc: "AI understands context", color: "text-green-400", bg: "bg-green-500/10" },
              { icon: Sparkles, label: "Real AI replies", desc: "Gemini 3 Flash", color: "text-brand-400", bg: "bg-brand-500/10" },
              { icon: MicOff, label: "Pause anytime", desc: "Tap orb to stop", color: "text-violet-400", bg: "bg-violet-500/10" },
            ].map((tip) => (
              <div key={tip.label} className="glass rounded-xl p-3.5 text-center border border-white/5">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2", tip.bg)}>
                  <tip.icon size={16} className={tip.color} />
                </div>
                <p className="text-xs font-medium text-foreground">{tip.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
