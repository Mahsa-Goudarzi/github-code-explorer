import { GoogleGenAI } from "@google/genai";

// types
import type { RetrievedChunkType } from "../types/types.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function answerQuestion(
  question: string,
  chunks: RetrievedChunkType[],
): Promise<string> {
  const context = chunks
    .map(
      (chunk) =>
        `File: ${chunk.filePath}\n` +
        `Lines: ${chunk.startLine}-${chunk.endLine}\n` +
        chunk.content,
    )
    .join("\n\n---\n\n");

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: `
        You are GitHub Code Explorer, an assistant that explains code repositories.

        Answer the user's question using only the provided code context.
        If the context is insufficient, clearly say so.
        Do not invent files, functions, or implementation details.
        When making a claim about the code, cite the file path and line range.

        Code context:
        ${context}

        User question:
        ${question}
        `,
  });

  return response.text ?? "I couldn't generate an answer.";
}
