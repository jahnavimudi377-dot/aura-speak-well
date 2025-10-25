import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Heart, BookHeart, Brain, Activity, User, LogOut, Music, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

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
            <span className="font-bold text-xl">Aura Speak Well</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/journal")}
              className="gap-2"
            >
              <BookHeart className="w-4 h-4" />
              <span className="hidden md:inline">Journal</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/assistant")}
              className="gap-2"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden md:inline">Assistant</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/activities")}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden md:inline">Activities</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/playlist")}
              className="gap-2"
            >
              <Music className="w-4 h-4" />
              <span className="hidden md:inline">Playlist</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/videos")}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              <span className="hidden md:inline">Videos</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;