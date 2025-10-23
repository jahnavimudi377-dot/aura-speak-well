import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Activity, User as UserIcon } from "lucide-react";
import Navigation from "@/components/Navigation";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-16 h-16 text-primary animate-float" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Welcome to Aura Speak Well
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-powered emotion tracker that speaks to your mood and guides your mind toward positivity
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/journal")}
            className="shadow-soft"
          >
            Log Your Mood Today
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-primary" />}
            title="Mood Tracking"
            description="Log and visualize your emotional journey with intelligent insights"
            onClick={() => navigate("/journal")}
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-accent" />}
            title="AI Assistant"
            description="Get personalized support and emotional guidance anytime"
            onClick={() => navigate("/assistant")}
          />
          <FeatureCard
            icon={<Activity className="w-8 h-8 text-secondary" />}
            title="Wellness Activities"
            description="Discover calming exercises and mood-boosting activities"
            onClick={() => navigate("/activities")}
          />
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 shadow-mood">
          <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-muted-foreground mb-6">
            Track your mood, get AI-powered insights, and improve your emotional wellbeing
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/journal")} variant="default">
              Log Mood
            </Button>
            <Button onClick={() => navigate("/profile")} variant="outline">
              View Profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="p-6 rounded-xl border bg-card hover:shadow-card transition-smooth cursor-pointer group"
    >
      <div className="mb-4 group-hover:scale-110 transition-bounce">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default Home;