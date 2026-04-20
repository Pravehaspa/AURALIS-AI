import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

export async function generateAIResponse(
  userMessage: string,
  agentCategory: string,
  agentName: string,
  agentPersonality: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const messages = [
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const { data, error } = await supabase.functions.invoke("auralis-ai-chat", {
      body: {
        messages,
        systemPrompt,
        agentName,
        agentCategory,
        agentPersonality,
      },
    });

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          errorMessage = `[Code: ${statusCode}] ${textContent || error.message}`;
        } catch {
          errorMessage = error.message || "Failed to read response";
        }
      }
      console.error("[ai.ts] Edge function error:", errorMessage);
      return getFallbackResponse(agentName, agentCategory);
    }

    return data?.content || getFallbackResponse(agentName, agentCategory);
  } catch (err) {
    console.error("[ai.ts] generateAIResponse error:", err);
    return getFallbackResponse(agentName, agentCategory);
  }
}

function getFallbackResponse(agentName: string, category: string): string {
  return `I'm ${agentName}, your ${category.replace(/-/g, " ")} assistant. I'm having a moment of difficulty connecting. Could you please try again?`;
}

export function speakText(text: string, voiceName: string): void {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const setVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    const lowerName = voiceName.toLowerCase();
    // Try exact match first
    let matched = voices.find((v) => v.name.toLowerCase().includes(lowerName));
    // Fallback: English voice
    if (!matched) matched = voices.find((v) => v.lang.startsWith("en") && !v.name.includes("Google"));
    // Last resort
    if (!matched) matched = voices.find((v) => v.lang.startsWith("en"));

    if (matched) utterance.voice = matched;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
  } else {
    setVoiceAndSpeak();
  }
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function previewVoice(text: string, voiceName: string): void {
  speakText(text, voiceName);
}
