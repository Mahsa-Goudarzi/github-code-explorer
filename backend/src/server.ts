// Node.js server setup for the backend API
import express from "express";
import cors from "cors";

// utility functions to fetch repository files from GitHub
import {
  getRepositoryFiles,
  filterCodeFiles,
  getFileContent,
} from "./utils/github.js";

// rag utility function to chunk code files
import { chunkCode } from "./utils/rag.js";

// constants
import { MAX_FILES_PER_REQUEST } from "./const/const.js";

const PORT = process.env.SERVER_PORT || 3001;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);

app.use(express.json());

// Define a simple health check GET request
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Define a simple endpoint with a query parameter
app.get("/api/hello", (req, res) => {
  const name = req.query.name;

  if (typeof name !== "string" || name.trim() === "") {
    res.status(400).json({
      error: "Name is required",
    });

    return;
  }

  res.json({
    message: `Hello, ${name}!`,
  });
});

// Define a POST endpoint to receive a repository URL
app.post("/api/analyze", async (req, res) => {
  const { repoUrl } = req.body;

  if (typeof repoUrl !== "string" || repoUrl.trim() === "") {
    res.status(400).json({
      error: "Repository URL is required",
    });

    return;
  }

  try {
    const url = new URL(repoUrl);

    if (url.hostname !== "github.com") {
      res.status(400).json({
        error: "Only GitHub repository URLs are supported",
      });

      return;
    }

    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 2 || !parts[0] || !parts[1]) {
      res.status(400).json({
        error: "Invalid GitHub repository URL",
      });

      return;
    }

    const [owner, repo] = parts;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        res.status(404).json({
          error: "Repository not found",
        });

        return;
      }

      res.status(response.status).json({
        error: "Failed to fetch repository from GitHub",
      });

      return;
    }

    const repository = await response.json();

    const allFiles = await getRepositoryFiles(owner, repo);

    const files = filterCodeFiles(allFiles).slice(0, MAX_FILES_PER_REQUEST);

    const allChunks = [];

    for (const file of files) {
      const content = await getFileContent(owner, repo, file.path);

      const chunks = chunkCode(file.path, content);

      allChunks.push(...chunks);
    }

    res.json({
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      language: repository.language,
      stars: repository.stargazers_count,
      url: repository.html_url,
      files: files.length,
      chunks: allChunks,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong while analyzing the repository",
    });
  }
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
