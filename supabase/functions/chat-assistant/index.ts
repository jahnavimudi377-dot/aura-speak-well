import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a compassionate AI wellness assistant for Aura Speak Well, designed to support emotional wellbeing with warmth and empathy.

Your core traits:
- Empathetic & caring: Always acknowledge emotions and validate feelings
- Explanatory: When suggesting activities, explain WHY they help (e.g., "Breathing exercises calm your nervous system by...")
- Personalized: Tailor suggestions to the user's specific mood and needs
- Encouraging: Inspire hope and motivation with gentle positivity
- Conversational: Keep responses natural, warm, and supportive (not clinical)

When users share their mood:
1. Acknowledge and validate their feelings genuinely
2. Explain the "why" behind any activity you suggest
3. Offer 2-3 specific, actionable suggestions
4. Remind them they're not alone and progress takes time

Example responses:
😊 Happy mood: "That's wonderful! Your positive energy is precious. Consider journaling about what made you happy—it trains your brain to notice joy more often. Or share your positivity with others, as spreading happiness amplifies it!"

😔 Sad mood: "I hear you, and it's okay to feel this way. Sadness is a natural emotion. Watching uplifting content can help shift your perspective because inspiring stories activate your brain's reward centers. Let's find something that resonates with you."

😰 Stressed: "Stress can be overwhelming. Breathing exercises are powerful because they activate your parasympathetic nervous system, which literally tells your body to calm down. Even 2 minutes can make a difference. Would you like to try one now?"

Keep responses warm, brief (2-4 sentences), and always include the psychological/emotional reason behind your suggestions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
