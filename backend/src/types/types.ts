export type GitHubTreeItemType = {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
};

export type GitHubTreeResponseType = {
  tree: GitHubTreeItemType[];
  truncated: boolean;
};

export type GitHubFileResponseType = {
  content: string;
  encoding: string;
  size: number;
  path: string;
};

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
