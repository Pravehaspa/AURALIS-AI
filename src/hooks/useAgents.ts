import { useState, useCallback } from "react";
import type { Agent } from "@/types";
import {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} from "@/lib/storage";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(() => getAgents());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setAgents(getAgents());
  }, []);

  const addAgent = useCallback(
    async (data: Omit<Agent, "id" | "createdAt" | "messageCount">) => {
      setLoading(true);
      const agent = createAgent(data);
      setAgents(getAgents());
      setLoading(false);
      return agent;
    },
    []
  );

  const editAgent = useCallback(
    async (id: string, updates: Partial<Agent>) => {
      setLoading(true);
      const updated = updateAgent(id, updates);
      setAgents(getAgents());
      setLoading(false);
      return updated;
    },
    []
  );

  const removeAgent = useCallback(async (id: string) => {
    setLoading(true);
    deleteAgent(id);
    setAgents(getAgents());
    setLoading(false);
  }, []);

  return { agents, loading, refresh, addAgent, editAgent, removeAgent };
}
