import express from "express";

const app = express();

const PORT = process.env.SERVER_PORT || 3001;

// Define a simple health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
