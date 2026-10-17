// constants
import { CODE_EXTENSIONS, IGNORED_PATHS } from "../const/const.js";

// types
import type {
  GitHubFileResponseType,
  GitHubTreeItemType,
  GitHubTreeResponseType,
} from "../types/types.js";

export async function getRepositoryFiles(
  owner: string,
  repo: string,
): Promise<GitHubTreeItemType[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = (await response.json()) as GitHubTreeResponseType;

  return data.tree;
}

export function filterCodeFiles(
  files: GitHubTreeItemType[],
): GitHubTreeItemType[] {
  return files.filter((file) => {
    if (file.type !== "blob") {
      return false;
    }

    if (IGNORED_PATHS.some((path) => file.path.startsWith(path))) {
      return false;
    }

    return CODE_EXTENSIONS.some((extension) => file.path.endsWith(extension));
  });
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = (await response.json()) as GitHubFileResponseType;

  if (data.encoding !== "base64") {
    throw new Error("Unexpected file encoding");
  }

  return Buffer.from(data.content, "base64").toString("utf-8");
}
