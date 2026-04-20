import { useState, useCallback, useRef } from "react";
import type { Message, Conversation, Agent } from "@/types";
import {
  dbGetAgentConversations,
  dbCreateConversation,
  dbUpdateConversation,
} from "@/lib/conversationDb";
import { updateAgent } from "@/lib/storage";
import { generateAIResponse, speakText, stopSpeaking } from "@/lib/ai";

export function useConversation(agent: Agent, autoPlayVoice = true) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentConversations, setAgentConversations] = useState<Conversation[]>([]);
  const convIdRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);

  const refreshConversations = useCallback(async () => {
    if (!agent?.id) return;
    const convs = await dbGetAgentConversations(agent.id);
    setAgentConversations(convs);
    return convs;
  }, [agent?.id]);

  const startConversation = useCallback(async () => {
    if (!agent?.id) return;
    const convs = await dbGetAgentConversations(agent.id);
    setAgentConversations(convs);

    if (convs.length > 0) {
      const latest = convs[0]; // already sorted by updated_at desc
      setConversation(latest);
      setMessages(latest.messages);
      messagesRef.current = latest.messages;
      convIdRef.current = latest.id;
    } else {
      // Create new
      const conv = await dbCreateConversation(agent.id, agent.name);
      if (conv) {
        setConversation(conv);
        setMessages([]);
        messagesRef.current = [];
        convIdRef.current = conv.id;
        setAgentConversations([conv]);
      }
    }
  }, [agent?.id, agent?.name]);

  const loadConversation = useCallback((conv: Conversation) => {
    setConversation(conv);
    setMessages(conv.messages);
    messagesRef.current = conv.messages;
    convIdRef.current = conv.id;
  }, []);

  const newConversation = useCallback(async () => {
    if (!agent?.id) return;
    const conv = await dbCreateConversation(agent.id, agent.name);
    if (conv) {
      setConversation(conv);
      setMessages([]);
      messagesRef.current = [];
      convIdRef.current = conv.id;
      // Refresh list
      const convs = await dbGetAgentConversations(agent.id);
      setAgentConversations(convs);
    }
  }, [agent?.id, agent?.name]);

  const sendMessage = useCallback(
    async (content: string, isVoice = false) => {
      if (!convIdRef.current || !agent) return;

      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
        isVoice,
      };

      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;
      setIsGenerating(true);

      await dbUpdateConversation(convIdRef.current, { messages: updatedMessages });

      const history = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const responseText = await generateAIResponse(
        content,
        agent.category,
        agent.name,
        agent.personality || "",
        agent.systemPrompt || "",
        history
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      messagesRef.current = finalMessages;
      setIsGenerating(false);

      await dbUpdateConversation(convIdRef.current, { messages: finalMessages });
      updateAgent(agent.id, {
        messageCount: (agent.messageCount || 0) + 2,
        lastUsed: new Date().toISOString(),
      });

      if (autoPlayVoice) {
        setIsSpeaking(true);
        speakText(responseText, agent.voiceName);
        const duration = Math.max(2000, responseText.length * 55);
        setTimeout(() => setIsSpeaking(false), duration);
      }

      return assistantMsg;
    },
    [agent, autoPlayVoice]
  );

  const stopVoice = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    conversation,
    messages,
    isGenerating,
    isSpeaking,
    agentConversations,
    startConversation,
    newConversation,
    loadConversation,
    refreshConversations,
    sendMessage,
    stopVoice,
  };
}
