"use client";

import { useState, JSX } from "react";

export default function Home(): JSX.Element {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function analyzeRepository() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:${process.env.NEXT_PUBLIC_SERVER_PORT}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoUrl,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error);
        return;
      }

      setMessage(data.message);
    } catch (error) {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">GitHub Code Explorer</h1>

          <p className="mt-2 text-gray-600">
            Explore and understand a GitHub repository with AI.
          </p>
        </div>

        <div className="space-y-3">
          <label className="font-medium">GitHub repository URL</label>

          <input
            type="url"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/user/project"
            className="w-full rounded-lg border p-3"
          />

          <button
            onClick={analyzeRepository}
            disabled={loading || !repoUrl.trim()}
            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze repository"}
          </button>
        </div>

        {message && <div className="rounded-lg border p-4">{message}</div>}
      </div>
    </main>
  );
}
