import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Wind, BookOpen, Puzzle, Sparkles, Music, Play } from "lucide-react";

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
    }
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