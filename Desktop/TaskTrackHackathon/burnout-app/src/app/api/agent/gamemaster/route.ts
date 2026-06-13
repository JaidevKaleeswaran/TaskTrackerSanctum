import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Mock Response to bypass OpenAI 429 Quota Error
    const isCrisis = Math.random() > 0.5;

    if (isCrisis) {
      return NextResponse.json({
        type: "crisis",
        message: "A horde of slacker-goblins saw you working hard and got jealous! Defend the village!",
        costOrRewardAmount: 250
      });
    } else {
      return NextResponse.json({
        type: "reward",
        message: "Your incredible productivity attracted a traveling merchant. He gifts you gold!",
        costOrRewardAmount: 500
      });
    }
  } catch (error) {
    console.error("Game Master Error:", error);
    return NextResponse.json({ error: 'Failed to run game master' }, { status: 500 });
  }
}
