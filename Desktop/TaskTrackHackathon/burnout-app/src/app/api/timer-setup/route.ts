import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are the Stamina Calculator Agent for a burnout prevention app. 
Your job is to analyze the user's upcoming task and their historical break habits, and determine the optimal "Burnout Time Limit" (in minutes) for this specific session.

You will receive a JSON payload containing:
1. "task_title": The name of the task they are starting.
2. "estimated_minutes": The total time they expect this task to take.
3. "past_break_intervals": An array of integers representing the number of minutes the user focused BEFORE manually deciding to take a break or stop in the past.

Rules for calculating the limit:
- If the estimated time is less than 30 minutes, just return the estimated time.
- If the estimated time is > 30 minutes, you must set a burnout break limit.
- If the "past_break_intervals" array contains data, use it! For example, if they consistently pause around 22 minutes, recommend a break around 22 minutes.
- If they have no past data, default to 30 minutes for a long task.
- Factor in the "task_title". If it sounds incredibly grueling (e.g., "Calculus final exam prep"), you might suggest an earlier break (e.g., 25 mins). If it sounds light (e.g., "reading articles"), you could stretch it to 45 mins.

Output Schema:
Strictly return ONLY a JSON object matching this exact schema:
{
  "recommended_break_time": number,
  "reasoning": "string (a brief 1-sentence explanation of why you chose this time)"
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.task_title || !body.estimated_minutes) {
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
    console.error("Error in Timer Setup API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
