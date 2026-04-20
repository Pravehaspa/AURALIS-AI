import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { AgentsPage } from "@/pages/AgentsPage";
import { ChatPage } from "@/pages/ChatPage";
import { AutoModePage } from "@/pages/AutoModePage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { VoicesPage } from "@/pages/VoicesPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AuthPage } from "@/pages/AuthPage";
import { LandingPage } from "@/pages/LandingPage";
import { NotFound } from "@/pages/NotFound";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { createAgent } from "@/lib/storage";
import { toast } from "sonner";

// Handles ?import=<encoded> share links to clone an agent
function ImportHandler() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const encoded = searchParams.get("import");
    if (!encoded) return;

    try {
      const json = decodeURIComponent(atob(encoded));
      const payload = JSON.parse(json);

      if (!payload.name || !payload.category) {
        toast.error("Invalid agent share link");
        return;
      }

      createAgent({
        name: `${payload.name} (imported)`,
        description: payload.description || "",
        personality: payload.personality || "",
        category: payload.category,
        voiceId: payload.voiceId || "",
        voiceName: payload.voiceName || "Default",
        systemPrompt: payload.systemPrompt || "",
        avatarColor: payload.avatarColor || "#7c3aed",
        tags: payload.tags || [],
        lastUsed: undefined,
      });

      toast.success(`"${payload.name}" imported successfully!`, {
        description: "Find it in your Agents list.",
        duration: 4000,
      });

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("import");
        return next;
      });
    } catch (e) {
      console.error("Import parse error:", e);
      toast.error("Could not import agent — invalid link");
    }
  }, []);

  return null;
}

function AppLayout() {
  const { user, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 rounded-full bg-brand-500/6 blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-brand-500/40">
            <span className="text-white font-bold text-2xl font-display">A</span>
          </div>
          <p className="text-foreground font-display font-semibold text-sm mb-3">Auralis AI</p>
          <div className="flex items-center gap-1.5 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
          <p className="text-muted-foreground/60 text-[11px] mt-2">Loading your voice AI platform…</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users who haven't clicked Get Started
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Show auth page once user clicks Get Started
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ImportHandler />
        <Routes>
          <Route path="/" element={<AgentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:agentId" element={<ChatPage />} />
          <Route path="/auto-mode" element={<AutoModePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/voices" element={<VoicesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "14px",
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
