import { useNavigate } from "react-router-dom";
import {
  Sparkles, Mic, MessageSquare, BarChart3, Bot, Zap, Shield,
  Star, ChevronRight, Volume2, Play, ArrowRight, Wand2, Brain, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { WordPullUp, TypingText } from "@/components/ui/animated-text";
import { GridPattern } from "@/components/ui/grid-pattern";
import { SpotlightBeam } from "@/components/ui/spotlight";
import { GlowCard } from "@/components/ui/glow-card";
import logoImg from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { cn } from "@/lib/utils";

const HERO_WORDS = ["Customer Support", "Sales Assistants", "Tutors", "Health Guides", "Code Reviewers", "Creative Writers"];

const FEATURES = [
  {
    icon: Brain,
    title: "Gemini 3 Intelligence",
    description: "Context-aware conversations powered by Google's most advanced model. Your agents remember every exchange, every nuance.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "#7c3aed",
    span: "lg:col-span-2",
  },
  {
    icon: Mic,
    title: "Voice Synthesis",
    description: "10 premium voices rendered via Web Speech API. Real-time, expressive, natural.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    glow: "#ec4899",
    span: "",
  },
  {
    icon: Wand2,
    title: "Agent Builder",
    description: "Create custom AI personalities with system prompts, voice profiles, and category tags.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "#3b82f6",
    span: "",
  },
  {
    icon: Zap,
    title: "Auto Voice Mode",
    description: "Hands-free speech-to-speech flow. Just talk — no typing needed.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "#f59e0b",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time metrics from cloud-synced conversation data with interactive charts.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "#10b981",
    span: "",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "OTP auth, Google OAuth, Supabase RLS — enterprise-grade data isolation.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "#06b6d4",
    span: "",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen", role: "Product Designer", avatar: "SC", color: "#7c3aed",
    text: "Auralis AI completely changed how I prototype conversational experiences. The voice quality is stunning.", stars: 5,
  },
  {
    name: "Marcus Rivera", role: "EdTech Founder", avatar: "MR", color: "#0ea5e9",
    text: "We deployed a Tutor agent in minutes. Students love the natural voice. This is the future of learning.", stars: 5,
  },
  {
    name: "Priya Nair", role: "Customer Success Lead", avatar: "PN", color: "#10b981",
    text: "Our support agent handles 40% of queries autonomously. The AI context retention is exceptional.", stars: 5,
  },
  {
    name: "David Kim", role: "AI Researcher", avatar: "DK", color: "#f59e0b",
    text: "The OnSpace AI integration under the hood is brilliant. Gemini 3 Flash responses feel truly intelligent.", stars: 5,
  },
  {
    name: "Elena Kowalski", role: "Content Creator", avatar: "EK", color: "#ec4899",
    text: "I created a Writer agent that helps with scripts. The personality customization is incredibly detailed.", stars: 5,
  },
  {
    name: "Raj Mehta", role: "Healthcare Developer", avatar: "RM", color: "#6366f1",
    text: "Built a healthcare assistant with appropriate guardrails. The system prompt engineering is powerful.", stars: 5,
  },
];

const MARQUEE_AGENTS = [
  { name: "Support Pro", category: "Customer Service", color: "#7c3aed" },
  { name: "TutorBot", category: "Education", color: "#10b981" },
  { name: "SalesGenie", category: "Sales", color: "#f59e0b" },
  { name: "MedAdvisor", category: "Healthcare", color: "#ef4444" },
  { name: "WriteAssist", category: "Creative", color: "#ec4899" },
  { name: "DevBot", category: "Technical", color: "#0ea5e9" },
  { name: "Legal Eagle", category: "Assistant", color: "#8b5cf6" },
  { name: "Finance Guru", category: "Assistant", color: "#14b8a6" },
];

const STATS = [
  { value: "10+", label: "Voice profiles" },
  { value: "Gemini 3", label: "AI model" },
  { value: "∞", label: "Conversations" },
  { value: "100%", label: "Cloud synced" },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="mx-3 w-72 flex-shrink-0 glass rounded-2xl p-5 border border-white/8 hover:border-brand-500/25 transition-all duration-300 group">
      <StarRating count={t.stars} />
      <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-4 group-hover:text-foreground/80 transition-colors">
        "{t.text}"
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md"
          style={{ backgroundColor: t.color }}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Sticky Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/6 bg-background/70 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-brand-500/40 ring-1 ring-brand-500/20">
            <img src={logoImg} alt="Auralis AI" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">Auralis AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Testimonials", "Dashboard"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex"
            onClick={onGetStarted}
          >
            Sign In
          </Button>
          <Button
            onClick={onGetStarted}
            className="brand-gradient text-white hover:opacity-90 text-sm gap-2 shadow-lg shadow-brand-500/30 h-9 px-5 rounded-xl"
          >
            <Sparkles size={13} />
            Start Free
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />

        {/* Animated grid */}
        <GridPattern className="opacity-40" squares={[[2,2],[5,4],[8,2],[12,5],[3,8],[10,8]]} />

        {/* Spotlight beam */}
        <SpotlightBeam className="opacity-60" />

        {/* Floating orbs */}
        <div className="absolute top-1/3 left-1/5 w-80 h-80 rounded-full bg-violet-600/8 blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-1/4 right-1/5 w-60 h-60 rounded-full bg-indigo-500/8 blur-3xl animate-pulse" style={{ animationDuration: "7s" }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-10 animate-fade-in"
            style={{
              background: "rgba(124,58,237,0.12)",
              borderColor: "rgba(124,58,237,0.3)",
              color: "#c4b5fd",
              animationDelay: "0.1s",
              animationFillMode: "both",
            }}
          >
            <Sparkles size={13} />
            Powered by OnSpace AI · Gemini 3 Flash
            <ArrowRight size={12} className="opacity-60" />
          </div>

          {/* Main headline */}
          <h1
            className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.05] mb-6 animate-fade-in"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            Build AI Voice Agents
            <br />
            <span className="block mt-2">
              for{" "}
              <TypingText
                words={HERO_WORDS}
                className="gradient-text"
              />
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in"
            style={{ animationDelay: "0.4s", animationFillMode: "both" }}
          >
            Create, deploy, and analyze intelligent voice assistants with real-time AI responses,
            expressive voice synthesis, and cloud-synced conversation history.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in"
            style={{ animationDelay: "0.55s", animationFillMode: "both" }}
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="brand-gradient text-white text-base h-14 px-10 gap-3 shadow-2xl shadow-brand-500/30 hover:opacity-90 hover:scale-[1.02] active:scale-[0.99] transition-all duration-150 rounded-2xl"
            >
              <Zap size={18} />
              Get Started Free
              <ChevronRight size={16} className="ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onGetStarted}
              className="text-base h-14 px-8 gap-3 border-white/12 bg-white/4 hover:bg-white/8 hover:border-brand-500/40 hover:text-brand-300 rounded-2xl backdrop-blur-sm transition-all duration-200"
            >
              <Play size={16} />
              View Dashboard
            </Button>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 animate-fade-in"
            style={{ animationDelay: "0.7s", animationFillMode: "both" }}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-display font-bold text-foreground text-base">{stat.value}</span>
                <span className="opacity-60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee showcase ── */}
      <section className="py-10 border-y border-white/6 overflow-hidden bg-background/60">
        <Marquee duration={30} pauseOnHover fade fadeAmount={12}>
          {MARQUEE_AGENTS.map((agent) => (
            <div
              key={agent.name}
              className="mx-4 flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-white/6 flex-shrink-0 hover:border-brand-500/30 transition-all duration-200"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md"
                style={{ backgroundColor: agent.color }}
              >
                {agent.name.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground">{agent.category}</p>
              </div>
              <Volume2 size={12} className="text-brand-400 ml-1 opacity-60" />
            </div>
          ))}
        </Marquee>
      </section>

      {/* ── Bento Feature Grid ── */}
      <section id="features" className="py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-sm mb-6">
            <Layers size={13} />
            Everything you need
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            Built for Voice AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every tool you need to create, deploy, and analyze intelligent voice agents — in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <GlowCard
              key={f.title}
              className={cn("h-full", f.span)}
              glowColor={f.glow}
              intensity={0.25}
            >
              <div
                className={cn(
                  "glass h-full rounded-2xl p-7 flex flex-col gap-4 border hover:border-brand-500/20 transition-all duration-300",
                  f.border
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", f.bg, f.border)}>
                  <f.icon size={22} className={f.color} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section id="dashboard" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            Powerful Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Real-time analytics, cloud-synced history, and agent management — all in one place.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-500/10 group hover:border-white/15 transition-all duration-500">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover" }} />
          <div className="relative p-6 md:p-10" style={{ background: "rgba(13,11,21,0.88)", backdropFilter: "blur(20px)" }}>
            {/* Window controls */}
            <div className="flex items-center gap-2 mb-6">
              {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.6 }} />
              ))}
              <div className="ml-3 flex-1 h-6 max-w-xs rounded-lg bg-white/5 border border-white/8" />
            </div>
            <div className="flex gap-5">
              {/* Sidebar mock */}
              <div className="hidden md:flex flex-col gap-2 w-44 flex-shrink-0">
                <div className="h-9 rounded-xl bg-brand-500/25 border border-brand-500/30 flex items-center gap-2 px-3">
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                  <div className="flex-1 h-2 rounded bg-brand-400/50" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 rounded-xl bg-white/3 border border-white/5 flex items-center gap-2 px-3">
                    <div className="w-2 h-2 rounded-full bg-white/15" />
                    <div className="flex-1 h-2 rounded bg-white/8" />
                  </div>
                ))}
              </div>
              {/* Content mock */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Agents", value: "6", col: "#7c3aed" },
                    { label: "Messages", value: "1.2k", col: "#3b82f6" },
                    { label: "Sessions", value: "48", col: "#10b981" },
                    { label: "Response", value: "0.8s", col: "#8b5cf6" },
                  ].map((card) => (
                    <div key={card.label} className="glass rounded-xl p-3 border border-white/6">
                      <div className="text-lg font-display font-bold text-white">{card.value}</div>
                      <div className="text-[11px] text-white/40">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-xl p-4 border border-white/6">
                  <div className="h-2 w-24 rounded bg-white/8 mb-4" />
                  <div className="flex items-end gap-1.5 h-20">
                    {[35, 60, 45, 75, 55, 90, 65, 80, 55, 70, 95, 45].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(to top, #7c3aed, #4f46e5)`,
                          opacity: 0.4 + (i / 12) * 0.5,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Support Pro", msgs: 240, color: "#7c3aed" },
                    { name: "TutorBot", msgs: 180, color: "#10b981" },
                  ].map((a) => (
                    <div key={a.name} className="glass rounded-xl p-3 border border-white/6 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: a.color }}>
                        {a.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white/80">{a.name}</div>
                        <div className="text-[10px] text-white/35">{a.msgs} msgs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Overlay CTA on hover */}
          <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/4 transition-colors duration-500 flex items-center justify-center">
            <Button
              onClick={onGetStarted}
              className="brand-gradient text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 shadow-2xl shadow-brand-500/40 gap-2 rounded-xl"
            >
              <Play size={14} />
              Open Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 overflow-hidden">
        <div className="text-center mb-14 px-6">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Loved by builders
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join developers and product teams building the next generation of voice AI.
          </p>
        </div>
        <Marquee duration={45} pauseOnHover fade fadeAmount={10}>
          {TESTIMONIALS.map((t) => <TestimonialCard key={t.name} t={t} />)}
        </Marquee>
        <div className="mt-4">
          <Marquee duration={38} direction="right" pauseOnHover fade fadeAmount={10}>
            {[...TESTIMONIALS].reverse().map((t) => <TestimonialCard key={t.name + "_r"} t={t} />)}
          </Marquee>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <GlowCard glowColor="#7c3aed" intensity={0.2}>
            <div className="relative glass-strong rounded-3xl p-14 border border-brand-500/20 overflow-hidden">
              <GridPattern className="opacity-30" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl brand-gradient mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-brand-500/40">
                  <Mic size={30} className="text-white" />
                </div>
                <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
                  Start Building Today
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                  Create your first voice agent in minutes. No credit card required.
                </p>
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="brand-gradient text-white text-lg h-16 px-12 gap-3 shadow-2xl shadow-brand-500/40 hover:opacity-90 hover:scale-[1.02] active:scale-[0.99] transition-all duration-150 rounded-2xl"
                >
                  <Sparkles size={20} />
                  Get Started Free
                </Button>
                <p className="text-xs text-muted-foreground mt-6 opacity-60">
                  Free · No credit card · Powered by OnSpace AI
                </p>
              </div>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/6 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              <img src={logoImg} alt="Auralis AI" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-foreground">Auralis AI</span>
          </div>
          <p className="text-xs text-muted-foreground opacity-60">
            © 2026 Auralis AI · Major Project · React + OnSpace AI + Supabase
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
