export const MAX_FILES_PER_REQUEST = 100;

export const MAX_FILE_SIZE = 100_000;

export const EMBEDDING_BATCH_SIZE = 5;

export const CODE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".java",
  ".go",
  ".rs",
  ".cpp",
  ".c",
  ".cs",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".md",
];

export const IGNORED_PATHS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
];

export const IGNORED_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
];

export const DEFAULT_CHUNK_OPTIONS = {
  maxLines: 50,
  overlapLines: 10,
};
