import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Wind, BookOpen, Puzzle, Sparkles, Music, Play } from "lucide-react";
import ActivityModal from "@/components/ActivityModal";
import { useToast } from "@/hooks/use-toast";
import WordAssociationGame from "@/components/games/WordAssociationGame";

const activityIcons = {
  breathing: Wind,
  journaling: BookOpen,
  puzzle: Puzzle,
  mindfulness: Sparkles,
  music: Music,
  video: Play,
};

const Activities = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setActivities(data);
      // Open a specific activity if requested via URL
      const params = new URLSearchParams(window.location.search);
      const openType = params.get("open");
      if (openType) {
        const match = data.find((a) => a.type === openType || a.title?.toLowerCase().includes(openType));
        if (match) {
          setSelectedActivity(match);
          setIsModalOpen(true);
        }
      }
    }
  };

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleActivityComplete = () => {
    toast({
      title: "Activity completed! 🎉",
      description: "Great job on taking care of yourself!",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Wellness Activities
          </h1>
          <p className="text-muted-foreground">
            Discover activities tailored to boost your mood and wellbeing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || Sparkles;
            return (
              <Card
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className="p-6 hover:shadow-mood transition-smooth cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {activity.description}
                    </p>
                    {activity.mood_target && activity.mood_target.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {activity.mood_target.map((mood: string) => (
                          <span
                            key={mood}
                            className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground"
                          >
                            {mood}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Mini Games */}
        <div className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Mini Games</h2>
            <p className="text-muted-foreground">Quick mind exercises to shift your focus</p>
          </div>
          {/* Word Association inline */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <WordAssociationGame />
        </div>

        <ActivityModal
          activity={selectedActivity}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={handleActivityComplete}
        />

        {activities.length === 0 && (
          <Card className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No activities available yet. Check back soon!
            </p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Activities;