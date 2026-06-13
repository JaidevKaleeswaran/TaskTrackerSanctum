import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are the problem-generation engine for an isometric village productivity app. You take the user's mental health data and translate it into thematic village crises.

You will receive a JSON payload containing:
1. "user_check_in": Text of how the user is feeling.
2. "burnout_score": A calculated number from 0-100.

Analyze the payload and return ONLY a valid JSON object matching the schema below. Do not use markdown blocks.

- If the burnout_score is low (<40), generate mild resource issues.
- If the burnout_score is high (>70), generate critical systemic emergencies.

Output Schema:
{
  "target_building": "string (Must match exactly: 'shops', 'stores', 'police_station', or 'defense_walls')",
  "problem_description": "string (A short, descriptive sentence of what is wrong, e.g., 'Power outage cutting off supply chains')",
  "currency_cost_to_fix": number (An integer cost proportional to the severity)
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.user_check_in || body.burnout_score === undefined) {
      return NextResponse.json({ error: "Missing required payload fields" }, { status: 400 });
    }

    const prompt = `Input Payload:\n${JSON.stringify(body, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return NextResponse.json(JSON.parse(response.text));
    } else {
      return NextResponse.json({ error: "No response text generated." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in Village Crisis API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
