import { GoogleGenAI, Part, Content } from "@google/genai";
import type { ChatMessage, Citation } from '../types.ts';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  // This is a client-side app, so we can't throw an error that stops the server.
  // We'll let the user know through an alert.
  alert("API_KEY environment variable is not set. Please follow setup instructions.");
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey });

const convertHistoryToContents = (history: ChatMessage[]): Content[] => {
  const contents: Content[] = [];
  for (const message of history) {
    const parts: Part[] = [];
    for (const part of message.parts) {
      if (part.type === 'text') {
        parts.push({ text: part.content });
      } else if (part.type === 'image') {
        const match = part.content.match(/^data:(.*);base64,(.*)$/);
        if (match) {
          const mimeType = match[1];
          const data = match[2];
          parts.push({ inlineData: { mimeType, data } });
        }
      }
    }
    if (parts.length > 0) {
      contents.push({ role: message.role, parts });
    }
  }
  return contents;
};

export const sendMessageToGemini = async (
  history: ChatMessage[]
): Promise<ChatMessage> => {
  try {
    const model = ai.models;
    
    const contents = convertHistoryToContents(history);
    
    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are Multimodal, a helpful and professional AI assistant from GreenGamesStudio. Do not mention that you are a Google model. Be concise and friendly.",
        tools: [{ googleSearch: {} }],
      },
    });

    const modelResponseText = response.text;
    
    const modelMessage: ChatMessage = {
      role: 'model',
      parts: [
        { type: 'text', content: modelResponseText, citations: [] }
      ]
    };

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      const citations: Citation[] = groundingMetadata.groundingChunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri,
        }));
      
      if (citations.length > 0) {
        modelMessage.parts.push({ type: 'citation', content: '', citations: citations });
      }
    }
    
    return modelMessage;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      role: 'model',
      parts: [
        { type: 'text', content: `Error: Could not get response from the model. ${errorMessage}`, citations: [] }
      ]
    };
  }
};