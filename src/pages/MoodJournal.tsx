import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Smile, Meh, Frown, Heart, Zap, Cloud } from "lucide-react";

type MoodType = "amazing" | "happy" | "okay" | "sad" | "stressed" | "anxious";

const moodOptions = [
  { type: "amazing" as MoodType, emoji: "😊", icon: Heart, color: "text-warm", label: "Amazing" },
  { type: "happy" as MoodType, emoji: "😄", icon: Smile, color: "text-accent", label: "Happy" },
  { type: "okay" as MoodType, emoji: "😐", icon: Meh, color: "text-secondary", label: "Okay" },
  { type: "sad" as MoodType, emoji: "😢", icon: Frown, color: "text-primary", label: "Sad" },
  { type: "stressed" as MoodType, emoji: "😰", icon: Zap, color: "text-destructive", label: "Stressed" },
  { type: "anxious" as MoodType, emoji: "😟", icon: Cloud, color: "text-muted-foreground", label: "Anxious" },
];

const MoodJournal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
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
      fetchMoodHistory();
    }
  }, [user]);

  const fetchMoodHistory = async () => {
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setMoodHistory(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("mood_entries").insert({
        user_id: user.id,
        mood_type: selectedMood,
        notes,
      });

      if (error) throw error;

      toast({
        title: "Mood logged!",
        description: "Your mood has been recorded successfully.",
      });

      setSelectedMood(null);
      setNotes("");
      fetchMoodHistory();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mood Journal
          </h1>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>

        <Card className="p-8 mb-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-lg mb-4 block">Select your mood</Label>
              <div className="grid grid-cols-3 gap-4">
                {moodOptions.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.type}
                      type="button"
                      onClick={() => setSelectedMood(mood.type)}
                      className={`p-6 rounded-xl border-2 transition-smooth hover:scale-105 ${
                        selectedMood === mood.type
                          ? "border-primary bg-primary/10 shadow-mood"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`w-12 h-12 mx-auto mb-2 ${mood.color}`} />
                      <p className="font-medium">{mood.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="What's on your mind today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-32"
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedMood || loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Log Mood"}
            </Button>
          </form>
        </Card>

        {/* Mood History */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Entries</h2>
          {moodHistory.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No entries yet. Start logging your mood!
            </Card>
          ) : (
            moodHistory.map((entry) => {
              const mood = moodOptions.find((m) => m.type === entry.mood_type);
              const Icon = mood?.icon || Heart;
              return (
                <Card key={entry.id} className="p-4 hover:shadow-card transition-smooth">
                  <div className="flex items-start gap-4">
                    <Icon className={`w-8 h-8 ${mood?.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{mood?.label}</p>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-muted-foreground text-sm">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default MoodJournal;