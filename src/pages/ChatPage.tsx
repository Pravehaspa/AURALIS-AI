import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send, Volume2, VolumeX, Plus, ArrowLeft, Bot, History, X,
  MessageSquare, Clock, Mic, MicOff, Loader2, Sparkles, Trash2, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WaveformVisualizer } from "@/components/features/WaveformVisualizer";
import { TypingIndicator, ShimmerSkeleton } from "@/components/ui/glow-card";
import { useConversation } from "@/hooks/useConversation";
import { getAgent, getAgents } from "@/lib/storage";
import { dbDeleteConversation } from "@/lib/conversationDb";
import type { Agent, Conversation } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  "Hello! What can you do?",
  "Tell me about yourself",
  "How can you help me today?",
];

export function ChatPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [input, setInput] = useState("");
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [micState, setMicState] = useState<"idle" | "listening" | "processing">("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedAgent = agent || agents[0];

  const {
    messages, isGenerating, isSpeaking, agentConversations,
    startConversation, newConversation, loadConversation,
    refreshConversations, sendMessage, stopVoice,
  } = useConversation(selectedAgent!, autoPlayVoice);

  useEffect(() => {
    const all = getAgents();
    setAgents(all);
    const target = agentId ? getAgent(agentId) : all[0];
    if (target) setAgent(target);
    else if (all.length > 0) setAgent(all[0]);
  }, [agentId]);

  useEffect(() => {
    if (selectedAgent) startConversation();
  }, [selectedAgent?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedAgent || isGenerating) return;
    setInput("");
    await sendMessage(text, false);
    await refreshConversations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleNewConversation = async () => { await newConversation(); setShowHistory(false); };

  const handleLoadConversation = (conv: Conversation) => { loadConversation(conv); setShowHistory(false); };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    await dbDeleteConversation(convId);
    await refreshConversations();
    toast.success("Conversation deleted");
  };

  const toggleMic = useCallback(() => {
    if (micState !== "idle") {
      recognitionRef.current?.stop();
      setMicState("idle");
      setLiveTranscript("");
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) { toast.error("Speech recognition not supported. Try Chrome."); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setMicState("listening");

    recognition.onresult = (e) => {
      const interim = Array.from(e.results).map((r) => r[0].transcript).join("");
      setLiveTranscript(interim);
      if (e.results[e.results.length - 1].isFinal) {
        const final = interim.trim();
        setLiveTranscript("");
        setMicState("processing");
        if (final && selectedAgent) {
          sendMessage(final, true).then(async () => {
            setMicState("idle");
            await refreshConversations();
          });
        } else {
          setMicState("idle");
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== "aborted") toast.error("Microphone error. Please try again.");
      setMicState("idle");
      setLiveTranscript("");
    };

    recognition.onend = () => { if (micState === "listening") setMicState("idle"); setLiveTranscript(""); };
    recognitionRef.current = recognition;
    recognition.start();
  }, [micState, selectedAgent, sendMessage, refreshConversations]);

  if (!selectedAgent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-brand-500/30">
            <Bot size={36} className="text-white" />
          </div>
          <h3 className="font-display font-semibold text-xl text-foreground mb-2">No agents yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Create a voice agent to start chatting.</p>
          <Button onClick={() => navigate("/")} className="brand-gradient text-white gap-2 rounded-xl">
            <Plus size={15} /> Create an Agent
          </Button>
        </div>
      </div>
    );
  }

  const getConvPreview = (conv: Conversation) => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    return lastMsg ? lastMsg.content.slice(0, 55) + (lastMsg.content.length > 55 ? "…" : "") : "No messages";
  };

  return (
    <div className="flex-1 flex min-h-0">
      {/* Agent Selector */}
      <div className="w-52 border-r border-white/6 flex flex-col bg-card/60 flex-shrink-0">
        <div className="p-3 border-b border-white/6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-xs h-8">
            <ArrowLeft size={12} /> All Agents
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {agents.map((a) => (
            <button key={a.id} onClick={() => { setAgent(a); navigate(`/chat/${a.id}`); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition-all duration-200",
                selectedAgent.id === a.id
                  ? "bg-brand-500/15 border border-brand-500/25"
                  : "hover:bg-white/4 border border-transparent"
              )}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm"
                style={{ backgroundColor: a.avatarColor }}>
                {a.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={cn("text-[12px] font-medium truncate leading-tight", selectedAgent.id === a.id ? "text-brand-300" : "text-foreground")}>
                  {a.name}
                </p>
                <p className="text-[10px] text-muted-foreground/60 truncate leading-tight mt-0.5">{a.voiceName}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-white/6 flex items-center justify-between bg-background/70 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ring-1 ring-white/10"
              style={{ backgroundColor: selectedAgent.avatarColor, boxShadow: `0 4px 14px ${selectedAgent.avatarColor}50` }}>
              {selectedAgent.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-display font-semibold text-[14px] text-foreground leading-tight">{selectedAgent.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-muted-foreground/70">
                  {selectedAgent.voiceName} · {selectedAgent.category}
                </p>
                {(isGenerating || isSpeaking) && (
                  <span className="flex items-center gap-1 text-[10px] text-brand-400">
                    <span className="w-1 h-1 rounded-full bg-brand-400 animate-pulse" />
                    {isGenerating ? "thinking…" : "speaking…"}
                  </span>
                )}
              </div>
            </div>
            {isSpeaking && <div className="ml-1"><WaveformVisualizer isActive={true} size="sm" /></div>}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mr-1">
              <Zap size={10} className="text-brand-400" />
              <span className="text-[10px] text-brand-300 font-medium">Gemini 3</span>
            </div>
            <Button variant="ghost" size="icon"
              className={cn("h-8 w-8 rounded-xl", autoPlayVoice ? "text-brand-400 bg-brand-500/10" : "text-muted-foreground hover:bg-white/5")}
              onClick={() => { if (autoPlayVoice) stopVoice(); setAutoPlayVoice(!autoPlayVoice); }}>
              {autoPlayVoice ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </Button>
            <Button variant="ghost" size="icon"
              className={cn("h-8 w-8 rounded-xl", showHistory ? "text-brand-400 bg-brand-500/10" : "text-muted-foreground hover:bg-white/5")}
              onClick={() => setShowHistory(!showHistory)}>
              <History size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNewConversation}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 hidden sm:flex h-8 rounded-xl hover:bg-white/5">
              <Plus size={13} /> New
            </Button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-2xl"
                  style={{ backgroundColor: selectedAgent.avatarColor, boxShadow: `0 12px 40px ${selectedAgent.avatarColor}50` }}>
                  {selectedAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  Chat with {selectedAgent.name}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-10">
                  {selectedAgent.description || `Your ${selectedAgent.category} AI voice agent`}
                </p>
                {/* Suggested prompts */}
                <div className="flex flex-wrap gap-2.5 justify-center max-w-sm">
                  {SUGGESTED_PROMPTS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="px-4 py-2.5 rounded-xl text-sm glass border border-white/8 hover:border-brand-500/40 hover:bg-brand-500/8 hover:text-brand-300 transition-all duration-200 text-muted-foreground">
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/50 mt-8 flex items-center gap-1.5">
                  <Sparkles size={10} className="text-brand-400" />
                  Powered by Auralis AI · Gemini 3 Flash · Cloud synced
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}
                className={cn("flex gap-3 transition-all duration-200 animate-fade-in", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-md"
                    style={{ backgroundColor: selectedAgent.avatarColor, boxShadow: `0 2px 10px ${selectedAgent.avatarColor}60` }}>
                    {selectedAgent.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={cn("max-w-[74%] flex flex-col gap-1.5", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-tr-md"
                      : "glass text-foreground rounded-tl-md border border-white/5"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 px-1 flex items-center gap-1">
                    {msg.isVoice && <Mic size={8} className="text-brand-400" />}
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                  </span>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0 mt-0.5">
                    You
                  </div>
                )}
              </div>
            ))}

            {/* Animated typing indicator */}
            {isGenerating && (
              <div className="animate-fade-in">
                <TypingIndicator agentName={selectedAgent.name} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="w-72 border-l border-white/6 flex flex-col bg-card/60 flex-shrink-0">
              <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">History</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{agentConversations.length} sessions · cloud synced</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setShowHistory(false)}>
                  <X size={13} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1.5">
                {agentConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare size={24} className="text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground">No past sessions yet</p>
                  </div>
                ) : (
                  agentConversations.map((conv) => (
                    <div key={conv.id} onClick={() => handleLoadConversation(conv)}
                      className="group/item relative w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/8 cursor-pointer">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-muted-foreground/50 flex-shrink-0" />
                          <span className="text-[11px] text-muted-foreground/60">{format(new Date(conv.createdAt), "MMM d, h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {conv.messages.length}
                          </span>
                          <button onClick={(e) => handleDeleteConversation(e, conv.id)}
                            className="opacity-0 group-hover/item:opacity-100 w-5 h-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-red-400 transition-all">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[12px] text-foreground/60 leading-relaxed line-clamp-2">{getConvPreview(conv)}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-white/6">
                <Button onClick={handleNewConversation} className="w-full brand-gradient text-white text-xs h-9 rounded-xl gap-1.5">
                  <Plus size={13} /> New Session
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/6 bg-background/70 backdrop-blur-xl">
          {/* Live transcript */}
          {liveTranscript && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-0.5 bg-green-400 rounded-full animate-bounce" style={{ height: "10px", animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <p className="text-sm text-green-300 italic flex-1 truncate">"{liveTranscript}"</p>
            </div>
          )}

          <div className="flex items-center gap-2.5 glass rounded-2xl px-3.5 py-2.5 border border-white/6 focus-within:border-brand-500/30 transition-colors duration-200">
            {/* Mic button */}
            <button onClick={toggleMic}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
                micState === "listening"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/20 animate-pulse"
                  : micState === "processing"
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/40"
                  : "text-muted-foreground/60 hover:text-brand-400 hover:bg-brand-500/10 border border-transparent"
              )}>
              {micState === "listening" ? <MicOff size={16} /> : micState === "processing" ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
            </button>

            <Input
              value={micState === "listening" ? liveTranscript || "Listening..." : input}
              onChange={(e) => { if (micState === "idle") setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selectedAgent.name}…`}
              className="border-0 bg-transparent focus-visible:ring-0 text-sm flex-1 px-0 placeholder:text-muted-foreground/40 text-foreground"
              disabled={isGenerating || micState !== "idle"}
            />

            <Button onClick={handleSend}
              disabled={!input.trim() || isGenerating || micState !== "idle"}
              size="icon"
              className="h-9 w-9 rounded-xl brand-gradient text-white hover:opacity-90 disabled:opacity-25 flex-shrink-0 shadow-md">
              <Send size={14} />
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
            {micState === "listening" ? "🎤 Listening — speak now" : micState === "processing" ? "⚡ Processing…" : "Enter to send · Mic for voice · Synced to cloud"}
          </p>
        </div>
      </div>
    </div>
  );
}
