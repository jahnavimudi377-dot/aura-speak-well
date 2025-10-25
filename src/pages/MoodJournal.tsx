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
import { Smile, Meh, Frown, Heart, Zap, Cloud, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [analyzing, setAnalyzing] = useState(false);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [detectedEmotion, setDetectedEmotion] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
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

  const analyzeWithAI = async () => {
    if (!notes.trim()) {
      toast({
        title: "No text to analyze",
        description: "Please write something first.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-mood", {
        body: { text: notes },
      });

      if (error) throw error;

      setDetectedEmotion(data.emotion);
      setAiSuggestion(data.suggestion);

      toast({
        title: "AI Analysis Complete",
        description: `Detected emotion: ${data.emotion}`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
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
        detected_emotion: detectedEmotion || null,
        ai_suggestion: aiSuggestion || null,
      });

      if (error) throw error;

      toast({
        title: "Mood logged!",
        description: "Your mood has been recorded successfully.",
      });

      setSelectedMood(null);
      setNotes("");
      setDetectedEmotion("");
      setAiSuggestion("");
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

        <Card className="p-8 mb-8 shadow-card transition-smooth hover:shadow-mood">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-lg mb-4 block font-semibold">Select your mood</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {moodOptions.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.type}
                      type="button"
                      onClick={() => setSelectedMood(mood.type)}
                      className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                        selectedMood === mood.type
                          ? "border-primary bg-primary/10 shadow-mood ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      aria-label={`Select ${mood.label} mood`}
                    >
                      <Icon className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 ${mood.color} transition-transform ${
                        selectedMood === mood.type ? "animate-pulse-glow" : ""
                      }`} />
                      <p className="font-medium text-sm md:text-base">{mood.label}</p>
                      <span className="text-2xl block mt-1">{mood.emoji}</span>
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
                onChange={(e) => {
                  setNotes(e.target.value);
                  setDetectedEmotion("");
                  setAiSuggestion("");
                }}
                className="mt-2 min-h-32"
              />
            </div>

            {detectedEmotion && (
              <div className="p-4 bg-primary/10 rounded-lg animate-fade-in border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
                  <span className="font-semibold text-sm">AI Detected:</span>
                  <Badge variant="secondary" className="capitalize">{detectedEmotion}</Badge>
                </div>
                {aiSuggestion && (
                  <p className="text-sm text-muted-foreground mt-2">{aiSuggestion}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={analyzeWithAI}
                disabled={analyzing || !notes.trim()}
                variant="outline"
                className="flex-1"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
              <Button
                type="submit"
                disabled={!selectedMood || loading}
                className="flex-1"
              >
                {loading ? "Saving..." : "Log Mood"}
              </Button>
            </div>
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold">{mood?.label}</p>
                        {entry.detected_emotion && entry.detected_emotion !== entry.mood_type && (
                          <Badge variant="outline" className="text-xs">
                            AI: {entry.detected_emotion}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-muted-foreground text-sm mb-2">{entry.notes}</p>
                      )}
                      {entry.ai_suggestion && (
                        <div className="text-xs text-primary/80 italic border-l-2 border-primary/30 pl-2 mt-2">
                          💡 {entry.ai_suggestion}
                        </div>
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
