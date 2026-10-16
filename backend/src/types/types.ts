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
