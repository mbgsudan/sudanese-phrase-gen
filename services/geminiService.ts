import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Category, PhraseData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSudanesePhrase = async (category: Category): Promise<PhraseData> => {
  let contextPrompt = "";
  
  switch (category) {
    case Category.DAILY:
      contextPrompt = "daily life situations, greetings, expressing feelings, or common street slang";
      break;
    case Category.SALES:
      contextPrompt = "persuasive sales pitches, negotiating prices, greeting customers in a shop, or closing a deal";
      break;
    case Category.CONVERSATION:
      contextPrompt = "casual conversation starters (Wansa), asking about family, funny remarks, or deep questions between friends";
      break;
  }

  const prompt = `You are a native Sudanese Arabic speaker from Khartoum with a thick local dialect. 
  Generate a unique, authentic, and useful phrase in Sudanese Arabic (Darji) related to: ${contextPrompt}.
  
  The phrase should be distinctively Sudanese (using words like 'ya zol', 'hassi', 'kef', 'da', 'shino' where appropriate).
  
  Return the result in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            arabicText: {
              type: Type.STRING,
              description: "The phrase in Arabic script using Sudanese dialect vocabulary.",
            },
            phonetic: {
              type: Type.STRING,
              description: "The pronunciation written in Latin characters (Franco-Arabic or phonetic English).",
            },
            englishTranslation: {
              type: Type.STRING,
              description: "The meaning in English.",
            },
            usageContext: {
              type: Type.STRING,
              description: "A brief explanation of when to use this phrase.",
            }
          },
          required: ["arabicText", "phonetic", "englishTranslation", "usageContext"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as PhraseData;
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Error generating phrase:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    // Note: While we request a Sudanese accent, the TTS model has predefined voices.
    // We use 'Zephyr' or 'Kore' for a clear voice, aiming for the best Arabic approximation available.
    const prompt = `Say the following text in Arabic with a natural flow: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: prompt,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      throw new Error("No audio data generated");
    }

    return audioData;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};