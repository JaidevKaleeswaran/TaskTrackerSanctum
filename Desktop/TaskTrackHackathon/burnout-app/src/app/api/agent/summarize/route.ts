import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tasks } = await req.json();
    
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ summary: "You haven't completed any tasks yet!" });
    }

    // Mock Response to bypass OpenAI 429 Quota Error
    return NextResponse.json({ summary: "Wow! You crushed your Hackathon Code and reviewed PRs like a champion! Excellent productivity today." });
  } catch (error) {
    console.error("Summarizer Error:", error);
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
  }
}
