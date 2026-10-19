# AI-Powered GitHub Repository Explorer

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000?logo=express&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?logo=googlegemini&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-Retrieval%20Augmented%20Generation-blue)

---

This project is a full-stack application that lets you explore GitHub repositories by asking questions in natural language. It uses **Retrieval-Augmented Generation (RAG)** to find relevant code snippets and generate answers grounded in the actual source code, with file and line references.

I built this project to learn Node.js and explore how LLMs, embeddings, and vector search can work together to solve a practical problem.

---

## 💡 Motivation

Understanding an unfamiliar codebase can take time, especially when you're trying to trace how different parts of an application work together.

I wanted to experiment with a simpler way to explore code: provide a GitHub repository, ask a question, and get an answer based on the implementation, instead of a generic explanation.

Building this project was also an opportunity to move beyond frontend development and get hands-on experience with backend development and RAG pipelines.

---

## ✨ Features

### 🔗 GitHub Repository Analysis
- Accept a public GitHub repository URL.
- Download the repository as a ZIP archive.
- Extract source files and filter out irrelevant files and directories.
- Process supported source-code file types.

### ✂️ Code Chunking
- Split source files into smaller, manageable chunks.
- Preserve file paths and original line numbers.
- Use overlapping chunks to retain context between neighboring sections.

### 🧠 Semantic Code Search
- Generate code embeddings using the Gemini API.
- Embed user questions using the same embedding model.
- Rank code chunks by cosine similarity.
- Retrieve the five most relevant chunks for each question.

### 💬 LLM-Powered Answers
- Pass retrieved code snippets to a Gemini LLM as context.
- Generate answers grounded in the retrieved repository content.
- Avoid sending the entire codebase to the LLM.

### 📍 Source References
- Preserve source file paths and line ranges throughout retrieval.
- Return relevant source references alongside generated answers.
- Make it easier to verify answers against the original code.

---

## 🔄 How It Works

```text
GitHub Repository URL
          |
          v
Download ZIP Archive
          |
          v
Extract and Filter Files
          |
          v
Split Code into Chunks
          |
          v
Generate Code Embeddings
          |
          v
Store Chunks and Embeddings
          |
          v
  Receive User Question
          |
          v
  Generate Question Embedding
          |
          v
 Cosine Similarity Search
          |
          v
 Retrieve Relevant Code Chunks
          |
          v
       Gemini LLM
          |
          v
   Answer + Source References
```

The key idea is that the LLM doesn't receive the entire repository. We first retrieve the code most relevant to the question and then use those snippets as context for answer generation.

---

## 🧩 Technical Highlights

- **Repository ingestion:** Downloads a repository archive and extracts files on the backend.
- **File filtering:** Excludes irrelevant directories, unsupported extensions, and oversized files according to the implemented rules.
- **Code chunking:** Splits source files into overlapping chunks while preserving line information.
- **Embedding generation:** Converts code chunks and user questions into vector representations.
- **Similarity search:** Uses cosine similarity to rank code chunks by relevance.
- **Context-aware generation:** Sends the most relevant chunks to the LLM instead of the full repository.
- **Source attribution:** Carries file paths and line ranges through the retrieval pipeline.

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **LLM:** Google Gemini API
- **Embeddings:** Gemini Embedding API
- **RAG:** Custom retrieval pipeline
- **Vector Search:** Cosine similarity
- **Repository Retrieval:** GitHub repository ZIP archive

---

## 🧠 Challenges & Lessons Learned

### 1. Downloading Repository Files Efficiently

One early design consideration was how to retrieve the files in a GitHub repository.

Fetching files individually would require multiple API requests and add unnecessary overhead. Instead, I used GitHub's repository archive endpoint to download the repository as a ZIP file in a single request, then extracted and processed the files on the backend.

This simplified repository ingestion and reduced the number of requests needed to retrieve the source files.

### 2. Debugging Empty Embeddings

During development, the retrieval pipeline failed with a vector dimension mismatch error:

```text
Vectors must have the same dimensions
```

At first, the question embedding and the inspected code embeddings appeared to have the same dimensionality. After logging and checking the embedding lengths, I discovered that some chunks had empty embedding arrays.

The issue was related to how multiple inputs were sent to the embedding API. I changed the batch request to send each text as a separate content item and added validation to ensure that the API returned the expected number of non-empty embeddings.

**Lesson learned:** An error reported during similarity search may originate earlier in the data pipeline. Validating external API responses helps catch malformed data before it reaches downstream logic.

### 3. Handling API and Model Availability Issues

During development, answer generation failed because the previously configured Gemini model was no longer available to new users.

I updated the generation model configuration and tested the question-answering flow again.

I also encountered API quota limits when processing larger repositories. This highlighted an important constraint of building AI applications on free API tiers: repository size and embedding usage need to be considered from the beginning.

**Potential improvements:** Smarter file prioritization, embedding caching, incremental indexing, and more efficient batching.

### 4. Keeping Answers Traceable

Generated answers are more useful when developers can check them against the original code.

To support this, each chunk retains its file path and start/end line numbers alongside its content and embedding. This metadata is preserved during retrieval and returned with the generated answer.

This reinforced the importance of treating source metadata as part of the retrieval pipeline rather than as information to reconstruct afterward.

---

## 🏗 Architecture Overview

The application is divided into two parts:

```text
github-code-explorer/
├── frontend/
│   └── Next.js + TypeScript
└── backend/
    └── Node.js + Express + TypeScript
```

- **Frontend:** Provides the interface for submitting repository URLs and asking questions.
- **Backend:** Handles repository downloads, file processing, chunking, embeddings, retrieval, and LLM-based answer generation.

Repository chunks and embeddings are currently stored in memory by the backend.

---

## ⚡ Getting Started

### Prerequisites

- Node.js 24 or a compatible version
- npm
- A Google Gemini API key
- A GitHub personal access token

### 1. Clone the repository

```bash
git clone https://github.com/Mahsa-Goudarzi/github-code-explorer.git
cd github-code-explorer
```

### 2. Install dependencies

Install the frontend dependencies:

```bash
cd frontend
npm install
```

In a separate terminal, install the backend dependencies:

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
SERVER_PORT=3001
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start the backend

From the `backend` directory, run:

```bash
npm run dev
```

The backend runs on `http://localhost:3001`.

### 5. Start the frontend

In a separate terminal, from the `frontend` directory, run:

```bash
npm run dev
```

Open `http://localhost:3000` or the local URL displayed by Next.js.

### 6. Try GitHub Code Explorer

1. Enter a public GitHub repository URL.
2. Wait for the repository to be analyzed and indexed.
3. Ask a question about the codebase.
4. Read the generated answer and inspect its source references.

---

## 📌 Current Limitations

- Repository chunks and embeddings are stored in memory and are lost when the backend restarts.
- Large repositories can take longer to process and may exceed API quotas or token limits.
- Retrieval quality depends on the chunking strategy, embedding model, and relevance of the retrieved context.
- The application relies on the availability and usage limits of the Gemini API.
- Only supported file extensions are indexed.

---

## 🚀 Potential Improvements

- Add persistent storage and embedding caching.
- Support incremental indexing for changed files.
- Improve file prioritization for large repositories.
- Add automated tests for chunking, retrieval, and API error handling.
- Evaluate retrieval relevance and answer quality.
- Deploy the application with appropriate rate limits and usage controls.

---

## 👤 Author

**Mahsa Goudarzi** | Software Developer

- **LinkedIn:** https://www.linkedin.com/in/MahsaGoudarzi
- **GitHub:** https://github.com/Mahsa-Goudarzi

---

## ⭐ If You Like This Project

Give it a star, or try it with a repository of your own and see what GitHub Code Explorer can find!
