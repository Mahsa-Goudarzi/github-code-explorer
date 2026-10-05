"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");

  async function checkBackend() {
    const response = await fetch(
      `http://localhost:${process.env.NEXT_PUBLIC_SERVER_PORT}/api/health`,
    );

    const data = await response.json();

    setMessage(data.status);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">GitHub Code Explorer</h1>

      <button
        onClick={checkBackend}
        className="rounded-lg bg-black px-5 py-3 text-white"
      >
        Check Backend
      </button>

      {message && <p>Backend status: {message}</p>}
    </main>
  );
}
