import type { Agent, Conversation, UserSettings, AnalyticsData } from "@/types";
import { DEFAULT_AGENTS, MOCK_ANALYTICS, DEFAULT_SETTINGS } from "@/constants";

const KEYS = {
  AGENTS: "auralis_agents",
  CONVERSATIONS: "auralis_conversations",
  ANALYTICS: "auralis_analytics",
  SETTINGS: "auralis_settings",
};

// Agents
export function getAgents(): Agent[] {
  try {
    const raw = localStorage.getItem(KEYS.AGENTS);
    if (!raw) {
      localStorage.setItem(KEYS.AGENTS, JSON.stringify(DEFAULT_AGENTS));
      return DEFAULT_AGENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AGENTS;
  }
}

export function saveAgents(agents: Agent[]): void {
  localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents));
}

export function getAgent(id: string): Agent | undefined {
  return getAgents().find((a) => a.id === id);
}

export function createAgent(agent: Omit<Agent, "id" | "createdAt" | "messageCount">): Agent {
  const newAgent: Agent = {
    ...agent,
    id: `agent-${Date.now()}`,
    createdAt: new Date().toISOString(),
    messageCount: 0,
  };
  const agents = getAgents();
  saveAgents([...agents, newAgent]);
  return newAgent;
}

export function updateAgent(id: string, updates: Partial<Agent>): Agent | undefined {
  const agents = getAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  agents[idx] = { ...agents[idx], ...updates };
  saveAgents(agents);
  return agents[idx];
}

export function deleteAgent(id: string): void {
  const agents = getAgents().filter((a) => a.id !== id);
  saveAgents(agents);
}

// Conversations
export function getConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEYS.CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
}

export function getConversation(id: string): Conversation | undefined {
  return getConversations().find((c) => c.id === id);
}

export function getAgentConversations(agentId: string): Conversation[] {
  return getConversations().filter((c) => c.agentId === agentId);
}

export function createConversation(agentId: string): Conversation {
  const conv: Conversation = {
    id: `conv-${Date.now()}`,
    agentId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const convs = getConversations();
  saveConversations([...convs, conv]);
  return conv;
}

export function updateConversation(id: string, updates: Partial<Conversation>): void {
  const convs = getConversations();
  const idx = convs.findIndex((c) => c.id === id);
  if (idx !== -1) {
    convs[idx] = { ...convs[idx], ...updates, updatedAt: new Date().toISOString() };
    saveConversations(convs);
  }
}

// Analytics
export function getAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(KEYS.ANALYTICS);
    return raw ? JSON.parse(raw) : MOCK_ANALYTICS;
  } catch {
    return MOCK_ANALYTICS;
  }
}

// Settings
export function getSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}
