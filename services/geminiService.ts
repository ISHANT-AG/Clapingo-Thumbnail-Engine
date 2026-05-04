
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

const headlines = [
  "Speak English with Pure Confidence",
  "Your Journey to English Fluency",
  "Master Natural Spoken English",
  "Confidence in Every English Word",
  "Real Conversations for Real Learners",
  "Unlock Your English Speaking Potential",
  "Speak English Naturally and Fearlessly",
  "Transform Your English Communication Skills"
];

const getRandomHeadline = () => {
  return headlines[Math.floor(Math.random() * headlines.length)];
};

export const generateThumbnail = async (
  leftTutorBase64: string,
  rightTutorBase64: string,
  logoBase64: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const headline = getRandomHeadline();

  const prompt = `
    Act as a world-class YouTube thumbnail designer for the English learning brand 'Clapingo'.
    Using the three provided images, generate ONE final 1280x720 thumbnail image.

    LAYOUT INSTRUCTIONS:
    1. LEFT TUTOR: Remove background from 'left_tutor_image' and place it on the left side.
    2. RIGHT TUTOR: Remove background from 'right_tutor_image' and place it on the right side.
    3. POSITIONING: Tutors should be large (occupying at least 40% of the canvas) and facing slightly toward the center.
    4. LOGO: Use the 'clapingo_logo' as-is. Place it in the top-right corner. It should be small (approx 8-10% of canvas width) and clearly visible.
    5. TEXT: Overlay the headline: "${headline}". Use bold, modern, sans-serif typography. The text must be highly readable and must NOT overlap the faces.
    6. BACKGROUND: Create a fresh, modern, high-contrast background (e.g., deep blue gradient or elegant studio setup) that complements the tutor images.
    7. STYLE: Professional, friendly, and trustworthy. No emojis, no clickbait words, no prices.

    Ensure natural skin tones and facial structures are preserved without distortion or beautification filters.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: leftTutorBase64 } },
          { inlineData: { mimeType: 'image/png', data: rightTutorBase64 } },
          { inlineData: { mimeType: 'image/png', data: logoBase64 } },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data returned from the model.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate thumbnail.");
  }
};
