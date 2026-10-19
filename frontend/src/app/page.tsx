"use client";
import { useState, JSX } from "react";

// helper functions
import { getRepositoryInfo } from "@/utils/utils";

export default function Home(): JSX.Element {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<
    { filePath: string; startLine: number; endLine: number }[]
  >([]);
  const [asking, setAsking] = useState<boolean>(false);
  const [indexed, setIndexed] = useState<boolean>(false);

  const analyzeButtonDisabled = loading || !repoUrl.trim();
  const askButtonDisabled = asking || !question.trim() || !indexed;

  async function analyzeRepository() {
    setIndexed(false);
    setAnswer("");
    setQuestion("");
    setSources([]);
    setMessage("");

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analyze`,
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

      setIndexed(true);
      setAnswer("");
      setSources([]);
      setMessage(
        `Repository analyzed: ${data.files} files, ${data.chunks} chunks.`,
      );
    } catch (error) {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function askQuestion() {
    setAsking(true);
    setAnswer("");
    setSources([]);
    setMessage("");

    const { owner, repo } = getRepositoryInfo(repoUrl);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner: owner,
            repo: repo,
            question,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Failed to answer the question.");
        return;
      }

      setAnswer(data.answer);
      setSources(data.sources ?? []);
    } catch {
      setMessage("Something went wrong while asking the question.");
    } finally {
      setAsking(false);
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
            disabled={analyzeButtonDisabled}
            className={`rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50 ${analyzeButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {loading ? "Analyzing..." : "Analyze repository"}
          </button>
        </div>

        {indexed && (
          <div className="space-y-4">
            <label className="font-medium">
              Ask a question about the repository
            </label>

            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="How does state management work?"
              className="w-full rounded-lg border p-3"
              rows={3}
            />

            <button
              onClick={askQuestion}
              disabled={askButtonDisabled}
              className={`rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50 ${askButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              {asking ? "Thinking..." : "Ask Code Explorer"}
            </button>

            {answer && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 font-semibold">Answer</h2>
                <p className="whitespace-pre-wrap">{answer}</p>

                {sources.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Sources</h3>
                    <ul className="mt-2 space-y-1">
                      {sources.map((source) => (
                        <li key={`${source.filePath}:${source.startLine}`}>
                          <code>
                            {source.filePath}:{source.startLine}–
                            {source.endLine}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {message && <div className="rounded-lg border p-4">{message}</div>}
      </div>
    </main>
  );
}
