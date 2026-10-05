import express from "express";
import cors from "cors";

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
app.post("/api/analyze", (req, res) => {
  const { repoUrl } = req.body;

  if (typeof repoUrl !== "string" || repoUrl.trim() === "") {
    res.status(400).json({
      error: "Repository URL is required",
    });

    return;
  }

  res.json({
    message: "Repository received!",
    repoUrl,
  });
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
