// Node.js server setup for the backend API
import express from "express";
import cors from "cors";

// utility functions to fetch repository files from GitHub
import {
  getRepositoryArchive,
  getCodeFilesFromArchive,
} from "./utils/github.js";

// rag utility function to chunk code files
import {
  chunkCode,
  cosineSimilarity,
  retrieveRelevantChunks,
} from "./utils/rag.js";

// emdedding utility function to create embeddings for code chunks
import { createEmbedding, createEmbeddings } from "./utils/gemini.js";

// answer utility function to answer questions based on code chunks
import { answerQuestion } from "./utils/answer.js";

// constants
import { MAX_FILES_PER_REQUEST } from "./const/const.js";

// types
import type {
  CodeChunkType,
  EmbeddedChunkType,
  AskRequestType,
} from "./types/types.js";

// store
import { saveRepository, getRepository } from "./store/repositoryStore.js";

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

    // 1. Download repository archive
    const archive = await getRepositoryArchive(owner, repo);

    // 2. Select useful code files
    const files = getCodeFilesFromArchive(archive).slice(
      0,
      MAX_FILES_PER_REQUEST,
    );

    // 3. Turn files into chunks
    const allChunks: CodeChunkType[] = [];

    for (const file of files) {
      const content = file.entry.getData().toString("utf8");

      const chunks = chunkCode(file.path, content);

      allChunks.push(...chunks);
    }

    // 4. Create embeddings for all chunks
    const texts: string[] = allChunks.map((chunk) => chunk.content);

    const embeddings: number[][] = await createEmbeddings(texts);

    const embeddedChunks: EmbeddedChunkType[] = allChunks.map(
      (chunk, index) => ({
        ...chunk,
        embedding: embeddings[index] || [],
      }),
    );

    // 5. Save the repository embedded data in memory
    const repoId = `${owner}/${repo}`;

    saveRepository(repoId, embeddedChunks);

    res.json({
      owner,
      repo,
      files: files.length,
      chunks: embeddedChunks.length,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong while analyzing the repository",
    });
  }
});

app.post("/api/ask", async (req, res) => {
  const { owner, repo, question } = req.body as AskRequestType;

  if (
    typeof owner !== "string" ||
    typeof repo !== "string" ||
    typeof question !== "string" ||
    !owner.trim() ||
    !repo.trim() ||
    !question.trim()
  ) {
    res.status(400).json({
      error: "owner, repo, and question are required.",
    });
    return;
  }

  const repoId = `${owner.trim()}/${repo.trim()}`;
  const repository = getRepository(repoId);

  if (!repository) {
    res.status(404).json({
      error: "Repository has not been indexed in this session.",
    });
    return;
  }

  try {
    const questionEmbedding = await createEmbedding(question.trim());

    const relevantChunks = retrieveRelevantChunks(
      questionEmbedding,
      repository.chunks,
      5,
    );

    const answer = await answerQuestion(question.trim(), relevantChunks);

    res.json({
      answer,
      sources: relevantChunks.map((chunk) => ({
        filePath: chunk.filePath,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
      })),
    });
  } catch (error) {
    console.error("Error answering question:", error);

    res.status(500).json({
      error: "Failed to answer the question.",
    });
  }
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
