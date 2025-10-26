import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToAI = () => {
    setIsOpen(false);
    navigate("/assistant");
  };

  return (
    <>
      {/* Floating AI Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-float hover:shadow-glow transition-spring z-50 animate-float"
        size="icon"
      >
        <Brain className="w-8 h-8 animate-pulse-glow" />
      </Button>

      {/* Quick AI Popup */}
      {isOpen && (
        <Card className="fixed bottom-28 right-8 w-80 p-6 glass-premium shadow-glow animate-slide-up z-50 border-primary/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary animate-pulse-glow" />
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Your wellness companion</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            I'm here to support your emotional wellness journey. How can I help you today?
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={handleNavigateToAI}
              className="w-full transition-smooth"
            >
              Start Conversation
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/journal");
                }}
                className="text-xs"
              >
                Log Mood
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/activities");
                }}
                className="text-xs"
              >
                Activities
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
