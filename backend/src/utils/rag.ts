// types
import type { ChunkOptionsType, CodeChunkType } from "../types/types.js";

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
