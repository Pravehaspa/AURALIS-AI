import { useNavigate } from "react-router-dom";
import { Bot, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-6 animate-float">
          <Bot size={36} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-4xl gradient-text mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist in Auralis AI</p>
        <Button onClick={() => navigate("/")} className="brand-gradient text-white gap-2">
          <Home size={15} />
          Back to Agents
        </Button>
      </div>
    </div>
  );
}
