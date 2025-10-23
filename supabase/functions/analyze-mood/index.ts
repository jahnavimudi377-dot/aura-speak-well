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
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an emotion detection expert. Analyze the emotional tone of the user's text and provide a brief, supportive response.",
          },
          {
            role: "user",
            content: `Analyze this text and detect the emotion: "${text}"\n\nProvide a JSON response with: emotion (happy/sad/anxious/calm/stressed/angry/neutral), confidence (0-1), and suggestion (a brief supportive message or activity suggestion).`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_emotion",
              description: "Analyze emotional content and provide supportive suggestions",
              parameters: {
                type: "object",
                properties: {
                  emotion: {
                    type: "string",
                    enum: ["happy", "sad", "anxious", "calm", "stressed", "angry", "neutral"],
                  },
                  confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                  },
                  suggestion: {
                    type: "string",
                    description: "A supportive message or activity suggestion",
                  },
                },
                required: ["emotion", "confidence", "suggestion"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_emotion" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      throw new Error("AI service error");
    }

    const result = await response.json();
    const toolCall = result.choices[0]?.message?.tool_calls?.[0];
    
    if (toolCall && toolCall.function.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({
        emotion: "neutral",
        confidence: 0.5,
        suggestion: "Thanks for sharing. How can I support you today?",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Mood analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
