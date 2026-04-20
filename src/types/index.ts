export interface Agent {
  id: string;
  name: string;
  description: string;
  personality: string;
  voiceId: string;
  voiceName: string;
  category: AgentCategory;
  systemPrompt: string;
  createdAt: string;
  lastUsed?: string;
  messageCount: number;
  avatarColor: string;
  tags: string[];
}

export type AgentCategory =
  | "assistant"
  | "customer-service"
  | "education"
  | "healthcare"
  | "sales"
  | "creative"
  | "technical";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  audioUrl?: string;
  isVoice?: boolean;
}

export interface Conversation {
  id: string;
  agentId: string;
  title?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Voice {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  accent: string;
  style: string;
  preview?: string;
  sampleText?: string;
}

export interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  totalAgents: number;
  dailyStats: DailyStat[];
  voiceUsage: VoiceUsageStat[];
  agentPerformance: AgentPerformanceStat[];
}

export interface DailyStat {
  date: string;
  conversations: number;
  messages: number;
  voiceRequests: number;
}

export interface VoiceUsageStat {
  voiceName: string;
  count: number;
  percentage: number;
}

export interface AgentPerformanceStat {
  agentName: string;
  conversations: number;
  avgResponseTime: number;
  satisfaction: number;
}

export interface UserSettings {
  theme: "dark" | "light" | "system";
  autoPlayVoice: boolean;
  voiceInputEnabled: boolean;
  defaultVoiceId: string;
  language: string;
  notificationsEnabled: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}
