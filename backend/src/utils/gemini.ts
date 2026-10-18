import { GoogleGenAI } from "@google/genai";

// constants
import { EMBEDDING_BATCH_SIZE } from "../const/const.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Create an embedding for a single text input
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
  });

  return response.embeddings?.[0]?.values ?? [];
}

// Create embeddings for multiple text inputs

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: batch,
    });

    const embeddings =
      response.embeddings?.map((embedding) => embedding.values ?? []) ?? [];

    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}
