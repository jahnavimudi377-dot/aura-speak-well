import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wind, BookOpen, Puzzle, Music, Play, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ActivityModalProps {
  activity: any;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const ActivityModal = ({ activity, isOpen, onClose, onComplete }: ActivityModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [isOpen]);

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete?.();
      onClose();
    }, 1500);
  };

  if (!activity) return null;

  const renderContent = () => {
    const content = activity.content || {};

    switch (activity.type) {
      case "breathing":
        return <BreathingExercise steps={content.steps || []} currentStep={currentStep} setCurrentStep={setCurrentStep} onComplete={handleComplete} />;
      
      case "journaling":
        return <JournalingPrompt prompts={content.prompts || []} currentStep={currentStep} setCurrentStep={setCurrentStep} onComplete={handleComplete} />;
      
      case "puzzle":
        return <PuzzleActivity puzzle={content.puzzle || {}} onComplete={handleComplete} />;
      
      case "music":
        return <MusicSuggestion tracks={content.tracks || []} onComplete={handleComplete} />;
      
      case "video":
        return <VideoActivity video={content.video || {}} onComplete={handleComplete} />;
      
      default:
        return <div className="text-center py-8 text-muted-foreground">Activity content coming soon!</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{activity.title}</DialogTitle>
          <DialogDescription>{activity.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {isCompleted ? (
            <div className="text-center py-12 animate-fade-in">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-glow" />
              <h3 className="text-xl font-semibold mb-2">Activity Completed! 🎉</h3>
              <p className="text-muted-foreground">Great job on taking care of yourself</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Breathing Exercise Component
const BreathingExercise = ({ steps, currentStep, setCurrentStep, onComplete }: any) => {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [counter, setCounter] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          if (phase === "inhale") {
            setPhase("hold");
            return 4;
          } else if (phase === "hold") {
            setPhase("exhale");
            return 6;
          } else {
            setCurrentStep((s: number) => s + 1);
            setPhase("inhale");
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div
          className={`w-32 h-32 mx-auto rounded-full transition-all duration-1000 ${
            phase === "inhale" ? "scale-150 bg-primary/30" : phase === "hold" ? "scale-150 bg-accent/30" : "scale-100 bg-secondary/30"
          }`}
        />
      </div>
      <h3 className="text-3xl font-bold mb-4 capitalize">{phase}</h3>
      <p className="text-5xl font-bold text-primary mb-8">{counter}</p>
      <p className="text-muted-foreground mb-4">Round {currentStep + 1} of 3</p>
      {currentStep >= 2 && (
        <Button onClick={onComplete} className="mt-4">
          Complete Exercise
        </Button>
      )}
    </div>
  );
};

// Journaling Prompt Component
const JournalingPrompt = ({ prompts, currentStep, setCurrentStep, onComplete }: any) => {
  const [response, setResponse] = useState("");
  const prompt = prompts[currentStep] || "What's on your mind today?";

  const handleNext = () => {
    if (currentStep < prompts.length - 1) {
      setCurrentStep(currentStep + 1);
      setResponse("");
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-primary/5 rounded-lg">
        <BookOpen className="w-8 h-8 text-primary mb-4" />
        <p className="text-lg font-medium">{prompt}</p>
      </div>
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your thoughts here..."
        className="w-full min-h-[200px] p-4 rounded-lg border bg-background"
      />
      <Button onClick={handleNext} className="w-full" disabled={!response.trim()}>
        {currentStep < prompts.length - 1 ? "Next Prompt" : "Finish Journaling"}
      </Button>
    </div>
  );
};

// Puzzle Activity Component
const PuzzleActivity = ({ puzzle, onComplete }: any) => {
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-accent/5 rounded-lg">
        <Puzzle className="w-8 h-8 text-accent mb-4" />
        <h3 className="text-xl font-semibold mb-4">{puzzle.question || "What has keys but no locks?"}</h3>
        {!showAnswer ? (
          <>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer..."
              className="w-full p-3 rounded-lg border bg-background"
            />
            <Button onClick={() => setShowAnswer(true)} variant="outline" className="w-full mt-4">
              Show Answer
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-lg mb-2">Answer: <span className="font-bold text-primary">{puzzle.answer || "A Piano"}</span></p>
            <Button onClick={onComplete} className="mt-4">
              Complete Puzzle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Music Suggestion Component
const MusicSuggestion = ({ tracks, onComplete }: any) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Music className="w-8 h-8 text-primary" />
        <h3 className="text-xl font-semibold">Recommended for your mood</h3>
      </div>
      {tracks.length > 0 ? (
        tracks.map((track: any, i: number) => (
          <div key={i} className="p-4 border rounded-lg hover:bg-accent/5 transition-smooth cursor-pointer">
            <p className="font-semibold">{track.title}</p>
            <p className="text-sm text-muted-foreground">{track.artist}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No tracks available yet</p>
        </div>
      )}
      <Button onClick={onComplete} className="w-full mt-4">
        Done Listening
      </Button>
    </div>
  );
};

// Video Activity Component
const VideoActivity = ({ video, onComplete }: any) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Play className="w-8 h-8 text-primary" />
        <h3 className="text-xl font-semibold">{video.title || "Motivational Video"}</h3>
      </div>
      {video.url ? (
        <div className="aspect-video bg-black rounded-lg">
          <iframe
            src={video.url}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Video content coming soon</p>
        </div>
      )}
      <Button onClick={onComplete} className="w-full">
        Complete Activity
      </Button>
    </div>
  );
};

export default ActivityModal;
