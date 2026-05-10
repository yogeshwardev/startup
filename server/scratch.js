import { GoogleGenAI } from "@google/genai";
async function test() {
try {
  const apiKey = "AIzaSyCgu_-lW6sQF4g2YHMOBT1oYK_eNeZKwyw";
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: "hi" });
  console.log("Success:", res.text);
} catch(e) {
  console.error("Error:", e);
}
}
test();
