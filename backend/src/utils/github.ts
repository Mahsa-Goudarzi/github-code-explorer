// zip files handling
import AdmZip from "adm-zip";

// constants
import {
  CODE_EXTENSIONS,
  IGNORED_FILES,
  IGNORED_PATHS,
  MAX_FILE_SIZE,
} from "../const/const.js";

// types
import type { CodeFileType } from "../types/types.js";

function normalizeArchivePath(path: string): string {
  const parts = path.split("/");

  // Remove the first directory, which is the repository name + commit hash.
  return parts.slice(1).join("/");
}

export async function getRepositoryArchive(
  owner: string,
  repo: string,
): Promise<AdmZip> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/zipball/HEAD`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2026-03-10",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub archive error: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  return new AdmZip(buffer);
}

export function getCodeFilesFromArchive(zip: AdmZip): CodeFileType[] {
  const entries = zip.getEntries();

  return entries
    .filter((entry) => {
      if (entry.isDirectory) {
        return false;
      }

      const path = normalizeArchivePath(entry.entryName);
      const fileName = path.split("/").pop() ?? "";

      if (IGNORED_PATHS.some((ignoredPath) => path.includes(ignoredPath))) {
        return false;
      }

      if (IGNORED_FILES.includes(fileName)) {
        return false;
      }

      if (entry.header.size > MAX_FILE_SIZE) {
        return false;
      }

      return CODE_EXTENSIONS.some((extension) => path.endsWith(extension));
    })
    .map((entry) => ({
      entry,
      path: normalizeArchivePath(entry.entryName),
    }));
}
