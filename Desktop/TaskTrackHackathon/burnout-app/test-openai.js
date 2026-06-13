const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function test() {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }]
    });
    console.log("Chat Success:", res.choices[0].message.content);
    
    console.log("Testing DALL-E...");
    const img = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A red apple",
      n: 1,
      size: "1024x1024"
    });
    console.log("DALL-E Success:", img.data[0].url);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
