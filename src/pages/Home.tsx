import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Brain, Activity, TrendingUp, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MOOD_COLORS: Record<string, string> = {
  happy: "hsl(29, 92%, 72%)",
  calm: "hsl(201, 87%, 77%)",
  energetic: "hsl(158, 77%, 67%)",
  anxious: "hsl(261, 51%, 71%)",
  sad: "hsl(220, 60%, 65%)",
  stressed: "hsl(0, 84%, 70%)",
};

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      fetchMoodAnalytics();
    }
  }, [user]);

  const fetchMoodAnalytics = async () => {
    setLoading(true);
    
    // Fetch last 30 days of mood entries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user?.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (!error && data) {
      // Process data for line chart (last 7 days)
      const last7Days = data.slice(-7).map((entry) => ({
        date: new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: entry.mood_score || getMoodScore(entry.mood_type),
      }));

      // Process data for pie chart (mood distribution)
      const moodCounts: Record<string, number> = {};
      data.forEach((entry) => {
        moodCounts[entry.mood_type] = (moodCounts[entry.mood_type] || 0) + 1;
      });

      const distribution = Object.entries(moodCounts).map(([mood, count]) => ({
        name: mood,
        value: count,
        color: MOOD_COLORS[mood] || "hsl(261, 51%, 71%)",
      }));

      setMoodData(last7Days);
      setMoodDistribution(distribution);
    }
    
    setLoading(false);
  };

  const getMoodScore = (moodType: string): number => {
    const scores: Record<string, number> = {
      happy: 9,
      energetic: 8,
      calm: 7,
      anxious: 4,
      stressed: 3,
      sad: 2,
    };
    return scores[moodType] || 5;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-up">
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

        {/* Mood Analytics Dashboard */}
        {!loading && moodData.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12 animate-slide-up">
            {/* Mood Trend Chart */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">7-Day Mood Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={moodData}>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Mood Distribution */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">Mood Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {moodDistribution.map((mood) => (
                  <div key={mood.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mood.color }}></div>
                    <span className="text-xs text-muted-foreground capitalize">{mood.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

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
