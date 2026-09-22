import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // defaults to GEMINI_API_KEY env if not passed

const schema = {
  type: Type.OBJECT,
  properties: {
    hooks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hookTitle: { type: Type.STRING },
        }
      }
    }
  }
};

async function main() {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'generate 1 hook for fitness',
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        }
    });
    console.log(response.text);
  } catch(e) {
    console.error(e);
  }
}
main();
