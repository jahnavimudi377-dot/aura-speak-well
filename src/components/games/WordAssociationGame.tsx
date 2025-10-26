import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, CheckCircle2, XCircle } from "lucide-react";

interface Puzzle {
  clue: string;
  answer: string; // lowercase
  hint?: string;
}

const DEFAULT_PUZZLES: Puzzle[] = [
  { clue: "Sun : Day :: Moon : ?", answer: "night", hint: "Opposite of day" },
  { clue: "Doctor : Hospital :: Teacher : ?", answer: "school" },
  { clue: "Book : Read :: Music : ?", answer: "listen" },
  { clue: "Brain : Think :: Heart : ?", answer: "feel" },
  { clue: "Happy : Smile :: Sad : ?", answer: "cry" },
  { clue: "Question : Answer :: Problem : ?", answer: "solution" },
];

export default function WordAssociationGame({ puzzles = DEFAULT_PUZZLES }: { puzzles?: Puzzle[] }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const current = useMemo(() => puzzles[index % puzzles.length], [puzzles, index]);

  const check = () => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return;
    if (normalized === current.answer) {
      setStatus("correct");
      setTimeout(() => {
        setIndex((i) => i + 1);
        setInput("");
        setStatus("idle");
      }, 900);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("idle"), 900);
    }
  };

  return (
    <Card className="p-6 glass-card shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Word Association</h3>
      </div>
      <p className="text-muted-foreground mb-4">Type the missing associated word to complete the analogy.</p>
      <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 mb-4">
        <p className="text-base font-medium">{current.clue}</p>
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your answer..."
          onKeyDown={(e) => e.key === "Enter" && check()}
          className="flex-1"
          aria-label="Word association answer"
        />
        <Button onClick={check} variant="default">Check</Button>
      </div>
      <div className="h-8 mt-3">
        {status === "correct" && (
          <div className="text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Correct!</div>
        )}
        {status === "wrong" && (
          <div className="text-red-600 flex items-center gap-2"><XCircle className="w-4 h-4" /> Try again</div>
        )}
      </div>
      {current.hint && (
        <p className="text-xs text-muted-foreground mt-2">Hint: {current.hint}</p>
      )}
    </Card>
  );
}
