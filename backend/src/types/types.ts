import type AdmZip from "adm-zip";

export type ChunkOptionsType = {
  maxLines?: number;
  overlapLines?: number;
};

export type CodeChunkType = {
  id: string;
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
};

export type CodeFileType = {
  entry: AdmZip.IZipEntry;
  path: string;
};

export type EmbeddedChunkType = CodeChunkType & {
  embedding: number[];
};

export type RelevantChunkType = EmbeddedChunkType & {
  score: number;
};
