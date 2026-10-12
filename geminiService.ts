
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ArticleData } from "./types";

// Always initialize with the exact process.env.API_KEY string
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEncyclopediaEntry = async (query: string): Promise<ArticleData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a comprehensive encyclopedia entry for: "${query}".`,
    config: {
      systemInstruction: "You are Encarto, a high-end multimedia encyclopedia. Provide structured knowledge with a main summary and detailed sections. Be scholarly yet engaging.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["heading", "content"]
            }
          },
          relatedTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          suggestedPrompts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "summary", "sections", "relatedTopics", "suggestedPrompts"]
      }
    }
  });

  // Access the text property directly and trim it before parsing JSON
  const text = response.text || "{}";
  return JSON.parse(text.trim());
};

export const generateBrandMascot = async (): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: "A neon-lit bear wearing a high-tech gaming headset, holding a futuristic glowing plate with the word 'ENCARTO' written in stylized neon letters. Professional mascot design, clean white background, cinematic lighting, esports aesthetic, high contrast." }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No mascot generated");
};

export const generateTopicImage = async (topic: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A professional, high-quality documentary-style photographic illustration of: ${topic}. Cinematic lighting, educational context.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  // Iterate through parts to find the image part as recommended
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateSpeech = async (text: string): Promise<Uint8Array> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read the following with a calm, intellectual, and clear documentary narrator voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // Kore, Puck, Charon, and Fenrir are available. Using Charon for narrator voice.
          prebuiltVoiceConfig: { voiceName: 'Charon' }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  // Manual base64 decoding following the SDK guidelines
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// PCM Decoding logic for the raw audio stream returned by the TTS model
export const decodePCM = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const numChannels = 1;
  const sampleRate = 24000;
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
