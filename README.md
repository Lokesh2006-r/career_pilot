# CareerPilot (Student AI Twin)

CareerPilot is a premium, AI-powered academic and career mentorship platform designed to act as your personalized professional clone. It provides a comprehensive technical suite built on modern artificial intelligence to help students secure high-growth career options.

## 📱 Download APK

[⬇️ Download CareerPilot APK](./CareerPilot.apk)

## 🚀 Key Features

*   **Personal AI RAG Twin Agent**: Synthesizes a custom conversational agent trained on your project files, coding ratings, and work history. Built using ChromaDB for Retrieval-Augmented Generation (RAG) and Google Gemini AI.
*   **ATS Resume Lab**: Instantly scores resumes, maps missing keywords, and matches specific job listings with high accuracy. Powered by automated PDF parsing and AI-driven skill mapping.
*   **Real-time AI Mock Interviews**: Simulates coding and behavioral interview loops using voice synthesis. Tracks confidence, voice modulations, and correct concept coverage with real-time diagnostic scoring.
*   **Coding Mastery Analytics**: Automatically syncs LeetCode, Codeforces, and CodeChef metrics. Uncovers weak technical sub-concepts and tracks daily practice streak heatmaps.
*   **Daily Practice Cockpit**: Includes daily CS brainteasers, customizable practice checklists, and a built-in Pomodoro focus timer to log daily consistency metrics.
*   **Sleek & Dynamic UI**: Built with modern web design principles featuring glassmorphism, dynamic mesh glows, and smooth micro-animations.

## 💻 Tech Stack

**Frontend (Client)**
*   Framework: Next.js (App Router), React 19
*   Styling: Tailwind CSS v4
*   Animations: Framer Motion
*   Authentication: Firebase / Next-Auth
*   Icons: FontAwesome & Lucide React

**Backend (Server)**
*   Runtime: Node.js with Express & TypeScript
*   Database: MongoDB (Mongoose)
*   AI Engine: `@google/genai` (Gemini Models)
*   Vector DB: ChromaDB (for AI Twin RAG capabilities)
*   File Processing: `multer`, `pdf-parse`

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v20 or higher)
*   MongoDB instance (local or Atlas)
*   Google Gemini API Key
*   Firebase project credentials

### 1. Server Setup
Navigate to the server directory, install dependencies, and start the development server:
```bash
cd server
npm install
# Create a .env file and add your MongoDB URI, Gemini API Key, and Firebase Admin credentials
npm run dev
```

### 2. Client Setup
Navigate to the client directory, install dependencies, and start the frontend application:
```bash
cd client
npm install
# Create a .env.local file for Firebase client configuration and API endpoints
npm run dev
```

## 🧠 Architecture Overview
The platform uses a decoupled architecture. The Next.js frontend handles the interactive dashboard, resume builder, and mock interview interfaces. The Express backend serves as an AI orchestration layer—processing uploaded resumes, syncing third-party coding platform APIs, querying the ChromaDB vector database for user-specific context, and streaming responses from Google Gemini.

## 📄 License
© 2026 CareerPilot. All rights reserved.
