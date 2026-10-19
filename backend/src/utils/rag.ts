// types
import type {
  ChunkOptionsType,
  CodeChunkType,
  EmbeddedChunkType,
  RelevantChunkType,
} from "../types/types.js";

// constants
import { DEFAULT_CHUNK_OPTIONS } from "../const/const.js";

function findNaturalBoundary(
  lines: string[],
  start: number,
  end: number,
): number {
  const searchStart = Math.max(
    start + 1,
    end - DEFAULT_CHUNK_OPTIONS.overlapLines,
  );

  for (let i = end - 1; i >= searchStart; i--) {
    if (lines?.[i]?.trim() === "") {
      return i;
    }
  }

  return end;
}

export function chunkCode(
  filePath: string,
  content: string,
  options: ChunkOptionsType = {},
): CodeChunkType[] {
  const {
    maxLines = DEFAULT_CHUNK_OPTIONS.maxLines,
    overlapLines = DEFAULT_CHUNK_OPTIONS.overlapLines,
  } = options;

  const lines = content.split("\n");

  const chunks: CodeChunkType[] = [];

  let start = 0;

  while (start < lines.length) {
    let end = Math.min(start + maxLines, lines.length);

    // Try to find a natural boundary near the end of the chunk.
    if (end < lines.length) {
      const boundary = findNaturalBoundary(lines, start, end);

      if (boundary > start) {
        end = boundary;
      }
    }

    const chunkContent = lines.slice(start, end).join("\n");

    chunks.push({
      id: `${filePath}:${start + 1}-${end}`,
      filePath,
      content: chunkContent,
      startLine: start + 1,
      endLine: end,
    });

    if (end >= lines.length) {
      break;
    }

    // Move forward, but keep some previous lines as context for the next chunk.
    start = Math.max(end - overlapLines, start + 1);
  }

  return chunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  if (a.length === 0 || b.length === 0) {
    throw new Error("Vectors must not be empty");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    const valueA = a[i] ?? 0;
    const valueB = b[i] ?? 0;

    dotProduct += valueA * valueB;
    magnitudeA += valueA ** 2;
    magnitudeB += valueB ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

export function retrieveRelevantChunks(
  questionEmbedding: number[],
  chunks: EmbeddedChunkType[],
  topK = 5,
): RelevantChunkType[] {
  const invalidChunks = chunks.filter(
    (chunk) => chunk.embedding.length !== questionEmbedding.length,
  );

  if (invalidChunks.length > 0) {
    console.error(
      "Invalid chunk embeddings:",
      invalidChunks.map((chunk) => ({
        id: chunk.id,
        dimensions: chunk.embedding.length,
      })),
    );

    throw new Error(
      `Found ${invalidChunks.length} chunks with invalid embedding dimensions.`,
    );
  }

  return chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
