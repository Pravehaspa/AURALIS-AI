import { supabase } from "@/lib/supabase";
import type { Message, Conversation } from "@/types";

export interface DbConversation {
  id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  title?: string;
  messages: Message[];
  message_count: number;
  created_at: string;
  updated_at: string;
}

function toConversation(row: DbConversation): Conversation {
  return {
    id: row.id,
    agentId: row.agent_id,
    title: row.title,
    messages: row.messages || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function dbGetAgentConversations(
  agentId: string
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("agent_id", agentId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[conversationDb] getAgentConversations error:", error);
    return [];
  }

  return (data as DbConversation[]).map(toConversation);
}

export async function dbCreateConversation(
  agentId: string,
  agentName: string
): Promise<Conversation | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      agent_id: agentId,
      agent_name: agentName,
      messages: [],
      message_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("[conversationDb] createConversation error:", error);
    return null;
  }

  return toConversation(data as DbConversation);
}

export async function dbUpdateConversation(
  id: string,
  updates: { messages?: Message[]; title?: string }
): Promise<void> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.messages !== undefined) {
    payload.messages = updates.messages;
    payload.message_count = updates.messages.length;
  }
  if (updates.title !== undefined) {
    payload.title = updates.title;
  }

  const { error } = await supabase
    .from("conversations")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("[conversationDb] updateConversation error:", error);
  }
}

export async function dbDeleteConversation(id: string): Promise<void> {
  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) {
    console.error("[conversationDb] deleteConversation error:", error);
  }
}
