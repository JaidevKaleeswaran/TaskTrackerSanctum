import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { inventory } = await req.json();
    
    const prompt = `An incredibly beautiful, vibrant, pixel-art isometric village map. 
The village contains a central town hall, ${inventory.farms} farms, ${inventory.stores} general stores, and ${inventory.guard_towers} guard towers. 
The buildings are placed harmoniously along dirt paths with lush green grass, trees, and small details like barrels and carts.
The style should be premium, colorful 2D isometric video game art, similar to Stardew Valley or classic RPGs.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json({ url: response.data?.[0]?.url || null });
  } catch (error) {
    console.error("DALL-E Error:", error);
    return NextResponse.json({ error: 'Failed to generate map' }, { status: 500 });
  }
}
