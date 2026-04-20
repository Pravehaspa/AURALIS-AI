import { useState, useEffect } from "react";
import { Play, Square, Mic, Volume2, User, Globe, Star, CheckCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VOICES } from "@/constants";
import { speakText, stopSpeaking } from "@/lib/ai";
import { cn } from "@/lib/utils";

const GENDER_COLORS: Record<string, string> = {
  female: "text-pink-400 bg-pink-500/10",
  male: "text-blue-400 bg-blue-500/10",
  neutral: "text-violet-400 bg-violet-500/10",
};

const STYLE_COLORS: Record<string, string> = {
  Professional: "bg-blue-500/10 text-blue-300",
  Calm: "bg-teal-500/10 text-teal-300",
  Friendly: "bg-green-500/10 text-green-300",
  Authoritative: "bg-red-500/10 text-red-300",
  Neutral: "bg-gray-500/10 text-gray-300",
  Warm: "bg-orange-500/10 text-orange-300",
  Energetic: "bg-yellow-500/10 text-yellow-300",
  Expressive: "bg-purple-500/10 text-purple-300",
  Formal: "bg-indigo-500/10 text-indigo-300",
  Dynamic: "bg-cyan-500/10 text-cyan-300",
};

export function VoicesPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [availableSpeechVoices, setAvailableSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [filter, setFilter] = useState<"all" | "female" | "male" | "neutral">("all");

  useEffect(() => {
    const loadVoices = () => {
      if ("speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableSpeechVoices(voices);
      }
    };

    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      stopSpeaking();
    };
  }, []);

  const handlePlay = (voiceId: string, voiceName: string, sampleText: string) => {
    if (playingId === voiceId) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }

    stopSpeaking();
    setPlayingId(voiceId);
    speakText(sampleText, voiceName);

    const duration = sampleText.length * 65 + 800;
    setTimeout(() => {
      setPlayingId(null);
    }, duration);
  };

  const getBestMatchVoice = (voiceName: string): string | null => {
    const lowerName = voiceName.toLowerCase();
    const match = availableSpeechVoices.find(
      (v) => v.name.toLowerCase().includes(lowerName) || v.name.toLowerCase().includes(voiceName.split(" ")[0].toLowerCase())
    );
    return match ? match.name : null;
  };

  const filtered = filter === "all" ? VOICES : VOICES.filter((v) => v.gender === filter);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar
        title="Voice Profiles"
        subtitle="Preview and test all available AI voices"
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero banner */}
          <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-5 border border-brand-500/20 relative overflow-hidden">
            <div className="absolute inset-0 brand-gradient opacity-5" />
            <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center flex-shrink-0">
              <Mic size={24} className="text-white" />
            </div>
            <div className="flex-1 relative z-10">
              <h2 className="font-display font-bold text-xl text-foreground mb-1">10 Premium Voice Profiles</h2>
              <p className="text-sm text-muted-foreground">
                Each voice synthesized via the Web Speech API. Click any card to preview the voice in real-time. Assign voices to agents during creation.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-right relative z-10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe size={12} className="text-brand-400" />
                <span>5 accents</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User size={12} className="text-brand-400" />
                <span>3 genders</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star size={12} className="text-brand-400" />
                <span>10 styles</span>
              </div>
            </div>
          </div>

          {/* Gender filter */}
          <div className="flex gap-2 mb-6">
            {(["all", "female", "male", "neutral"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize",
                  filter === g ? "brand-gradient text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {g === "all" ? "All Voices" : g}
              </button>
            ))}
          </div>

          {/* Voice Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((voice) => {
              const isPlaying = playingId === voice.id;
              const matchedBrowserVoice = getBestMatchVoice(voice.name);

              return (
                <div
                  key={voice.id}
                  className={cn(
                    "glass rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-pointer group",
                    isPlaying
                      ? "border-brand-500/50 bg-brand-500/5"
                      : "hover:border-brand-500/25"
                  )}
                  onClick={() => handlePlay(voice.id, voice.name, voice.sampleText || `Hi! I'm ${voice.name}, your AI voice companion.`)}
                >
                  {/* Avatar & Name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold transition-all",
                        isPlaying ? "brand-gradient text-white scale-110" : "bg-secondary text-muted-foreground group-hover:bg-brand-500/20"
                      )}>
                        {voice.name.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-foreground text-sm">{voice.name}</p>
                        <p className="text-[10px] text-muted-foreground">{voice.accent}</p>
                      </div>
                    </div>

                    {/* Play indicator */}
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                      isPlaying
                        ? "bg-brand-500 text-white"
                        : "bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100"
                    )}>
                      {isPlaying ? <Square size={11} /> : <Play size={11} />}
                    </div>
                  </div>

                  {/* Style badge */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", STYLE_COLORS[voice.style] || "bg-secondary text-muted-foreground")}>
                      {voice.style}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium capitalize", GENDER_COLORS[voice.gender])}>
                      {voice.gender}
                    </span>
                  </div>

                  {/* Sample text preview */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 italic">
                    "{voice.sampleText?.slice(0, 65)}..."
                  </p>

                  {/* Playing waveform OR browser match */}
                  {isPlaying ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 4, 3, 2, 1].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-brand-400 rounded-full animate-pulse"
                          style={{
                            height: `${8 + Math.random() * 16}px`,
                            animationDelay: `${i * 0.08}s`,
                            animationDuration: "0.6s",
                          }}
                        />
                      ))}
                      <span className="ml-2 text-[10px] text-brand-400 font-medium">Speaking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {matchedBrowserVoice ? (
                        <><CheckCircle size={10} className="text-green-400" /> Browser voice matched</>
                      ) : (
                        <><Volume2 size={10} /> Click to preview</>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info note */}
          <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Note:</strong> Voice playback uses your browser's built-in Web Speech API. Voice quality and availability vary by browser and operating system. Chrome on macOS/Windows provides the best voice selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
