import type { EmbeddedChunkType, RepositoryDataType } from "../types/types.js";

const repositories = new Map<string, RepositoryDataType>();

export function saveRepository(
  repoId: string,
  chunks: EmbeddedChunkType[],
): void {
  repositories.set(repoId, {
    chunks,
    indexedAt: Date.now(),
  });
}

export function getRepository(repoId: string): RepositoryDataType | undefined {
  return repositories.get(repoId);
}

export function deleteRepository(repoId: string): boolean {
  return repositories.delete(repoId);
}
