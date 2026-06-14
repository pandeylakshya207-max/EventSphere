import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const generateEventDescription = async (title: string, category: string) => {
  if (!apiKey) return "AI description unavailable.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a compelling and professional event description for an event titled "${title}" in the category of "${category}". Keep it under 150 words.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error generating description.";
  }
};
