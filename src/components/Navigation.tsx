import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Heart, BookHeart, Brain, Activity, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">MoodCare</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Heart className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/journal")}
              className="gap-2"
            >
              <BookHeart className="w-4 h-4" />
              Journal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/assistant")}
              className="gap-2"
            >
              <Brain className="w-4 h-4" />
              Assistant
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/activities")}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Activities
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;