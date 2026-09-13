# 🚀 Job Hunt OS — Personal Career Search Command Center

> A full-stack web application designed to help job seekers organize applications, prepare for interviews, track resume versions, analyze skill matches, and visualize pipeline metrics—all backed by a secure **Node.js + Express + MongoDB** backend with **JWT authentication**.

---

## 📌 Table of Contents
- [✨ Key Use Cases & Problem Solved](#-key-use-cases--problem-solved)
- [⭐ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Architecture](#-project-architecture)
- [⚡ Quick Start & Setup Guide](#-quick-start--setup-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🔌 API Endpoint Reference](#-api-endpoint-reference)
- [🎨 Theme & Performance Features](#-theme--performance-features)
- [🌐 Deployment Guide](#-deployment-guide)
- [📄 License](#-license)

---

## ✨ Key Use Cases & Problem Solved

Job hunting across dozens of platforms (LinkedIn, Indeed, Glassdoor, referral links) quickly becomes chaotic. **Job Hunt OS** centralizes your entire job search into a single command center:

1. **Application Tracking**: Never lose track of where you applied, salary details, work modes (Remote/Hybrid/Onsite), job links, and current stage.
2. **Interview Management**: Schedule technical, HR, screening, or managerial interviews with interviewer names, meeting links, and prep notes.
3. **Skill Gap Analysis**: Paste any job description to instantly compare required skills against your personal profile and calculate a % match score.
4. **Resume Version Tracking**: Track which resume version was submitted to which company and monitor response rates per resume.
5. **Follow-up Reminders**: Keep track of pending emails, calls, and recruiter check-ins with an interactive notification panel.
6. **Data Privacy & Multi-Device Cloud Sync**: Secure JWT authentication with MongoDB cloud database storage and offline fallback.

---

## ⭐ Features

### 📋 Application Pipeline & Kanban View
- **List & Table Views**: Filter by status (*Saved, Applied, Screening, Interview, Offer, Rejected*), priority, work mode, and search query.
- **Interactive Kanban Board**: Drag-and-drop applications across pipeline columns with real-time status updates.
- **Detailed Application Cards**: Deep dive into application history, salary ranges, deadlines, notes, and connected resumes.

### 🎯 Interview Hub & Preparation
- **Interview Scheduling**: Track dates, times, interviewers, meeting URLs, and categories (*Technical, System Design, HR, Behavioral*).
- **Question Bank**: Organize prep questions by category with toggleable completion status and hidden answer notes.

### 🧠 AI Skill Gap Analyzer
- **Instant Match Scoring**: Extracts key skills from job descriptions and calculates a compatibility score (*Strong Match, Partial Match, Missing Skills*).
- **Visual Breakdown**: Color-coded category cards highlighting skills you already have vs. skills you need to learn.

### 📄 Resume Version Control
- **Resume Performance Analytics**: Calculate response rates per resume version to identify your top-performing resume formats.

### 🔔 Interactive Notification Panel
- **Overdue & Task Alerts**: Header bell notification dropdown with live badges for overdue follow-ups and upcoming interviews.
- **One-Click Actions**: Complete follow-up tasks or launch video meeting links directly from the notification popover.

### 🔐 Auth & Security
- **JWT Authentication**: Password hashing with `bcryptjs` and 2-hour expiring Bearer JWT tokens.
- **Automatic Logout Timer**: Background polling timer that logs out inactive users upon token expiration.
- **Demo Account Login**: 1-click Demo Account access for rapid testing.

---

## 🛠️ Tech Stack

### **Frontend**
- **Core**: React 19, TypeScript, Vite 8
- **Styling**: Vanilla CSS tokens & TailwindCSS v4 with custom dark/light theme tokens
- **State Management**: Zustand
- **Analytics & Charts**: Recharts
- **Icons**: Lucide React
- **Date Utilities**: Date-fns

### **Backend**
- **Runtime**: Node.js & Express 4 (ES Modules)
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Performance**: `compression` (gzip middleware) & `cors`

---

## 📁 Project Architecture

```
Job Hunt OS/
├── server/                    # Node.js + Express + MongoDB Backend
│   ├── config/
│   │   └── db.js              # Mongoose database connection
│   ├── controllers/           # API business logic
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── companyController.js
│   │   ├── followUpController.js
│   │   ├── interviewController.js
│   │   ├── questionController.js
│   │   └── resumeController.js
│   ├── middleware/            # Auth JWT validator & Error handlers
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/                # Mongoose Schema Definitions
│   │   ├── Application.js
│   │   ├── Company.js
│   │   ├── FollowUp.js
│   │   ├── Interview.js
│   │   ├── Question.js
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/                # Express API Route Handlers
│   ├── .env.example           # Server environment template
│   └── server.js              # Express app entry point
│
├── src/                       # React + TypeScript Frontend
│   ├── components/            # UI & Layout components
│   │   ├── applications/      # Forms & status badges
│   │   ├── auth/              # Auth modal
│   │   ├── job-analyzer/      # Skill analysis component
│   │   ├── kanban/            # Kanban board & cards
│   │   ├── layout/            # TopBar, Sidebar, GlobalSearch, QuickAdd
│   │   └── ui/                # Button, Card, Input, Modal, Badge
│   ├── pages/                 # Route Pages
│   │   ├── Analytics.tsx
│   │   ├── ApplicationDetails.tsx
│   │   ├── Applications.tsx
│   │   ├── Companies.tsx
│   │   ├── Dashboard.tsx
│   │   ├── InterviewPrep.tsx
│   │   ├── Interviews.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── Login.tsx
│   │   ├── Resumes.tsx
│   │   └── Settings.tsx
│   ├── services/              # API fetch client & storage helpers
│   ├── stores/                # Zustand client stores
│   ├── types/                 # TypeScript interfaces
│   ├── App.tsx                # React Router with Suspense lazy loading
│   ├── index.css              # Custom design system & theme tokens
│   └── main.tsx               # React entry point
│
├── index.html                 # HTML template with instant theme restoration script
├── vite.config.ts             # Vite config with manualChunks code-splitting
└── package.json
```

---

## ⚡ Quick Start & Setup Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB server running on `mongodb://localhost:27017` OR a **MongoDB Atlas** connection string)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the provided example:
   ```bash
   cp .env.example .env
   ```

4. Open `.env` and set your configuration variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/jobhuntos
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=2h
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000` with connected MongoDB logs.*

---

### 2. Frontend Setup

1. Open a new terminal window in the project root directory:
   ```bash
   cd "c:\Users\azhar\Repos\Job Hunt OS"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

### 3. Quick Demo Access
On the initial Sign In page:
- Click **"One-Click Demo Account Login"** to immediately sign into a pre-populated workspace with sample applications, interviews, companies, and prep questions.

---

## 🔑 Environment Variables

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `PORT` | Express server port | `5000` |
| `MONGODB_URI` | Connection URI for MongoDB Atlas or local MongoDB | `mongodb://127.0.0.1:27017/jobhuntos` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | `jobhuntos_jwt_secret_key_2026` |
| `JWT_EXPIRE` | Expiration time for JWT session tokens | `2h` |

---

## 🔌 API Endpoint Reference

### Authentication
- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Authenticate and receive JWT Bearer token
- `GET /api/auth/me` — Get current logged-in user profile
- `PUT /api/auth/profile` — Update profile details (Name, Email, Skills, Currency, Theme, Password)

### Applications
- `GET /api/applications` — Fetch user applications
- `POST /api/applications` — Create a new job application
- `PUT /api/applications/:id` — Update job application details or status
- `DELETE /api/applications/:id` — Delete a job application

### Interviews, Companies, Resumes & Follow-ups
- `GET /api/interviews` \| `POST /api/interviews` \| `PUT /api/interviews/:id` \| `DELETE /api/interviews/:id`
- `GET /api/companies` \| `POST /api/companies` \| `PUT /api/companies/:id` \| `DELETE /api/companies/:id`
- `GET /api/resumes` \| `POST /api/resumes` \| `PUT /api/resumes/:id` \| `DELETE /api/resumes/:id`
- `GET /api/followups` \| `POST /api/followups` \| `PUT /api/followups/:id` \| `DELETE /api/followups/:id`
- `GET /api/questions` \| `POST /api/questions` \| `PUT /api/questions/:id` \| `DELETE /api/questions/:id`

---

## 🎨 Theme & Performance Features

- **Instant Zero-Flash Theme Switching**: Saved theme preferences (`Light` / `Dark`) are restored via an inline head script before initial DOM render.
- **Route Code Splitting**: All pages use `React.lazy()` + `Suspense`, dropping the initial bundle size from ~960 kB down to **61 kB**.
- **Gzip Response Compression**: Server API payloads are compressed using `compression()` middleware.
- **Parallel Data Hydration**: Stores execute concurrent API requests using `Promise.allSettled()`.

---

## 🌐 Deployment Guide

This project consists of a **Node.js/Express Backend** and a **React/Vite Frontend**. Here is the recommended step-by-step production deployment strategy using free tier hosting services (**MongoDB Atlas + Render/Railway + Vercel/Netlify**).

---

### Step 1: Database Deployment (MongoDB Atlas)

1. Sign up / Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user with a secure password.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** → **Drivers** and copy your MongoDB connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/jobhuntos?retryWrites=true&w=majority
   ```

---

### Step 2: Backend Deployment (Render or Railway)

#### Option A: Deploy on [Render](https://render.com)
1. Push your repository to GitHub.
2. Log into Render dashboard and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add **Environment Variables**:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string from Step 1*
   - `JWT_SECRET`: *A strong random string (e.g. `prod_jwt_secret_998877`)*
   - `JWT_EXPIRE`: `2h`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. Note down your backend live URL (e.g., `https://jobhuntos-api.onrender.com`).

---

### Step 3: Frontend Deployment (Vercel or Netlify)

#### Option A: Deploy on [Vercel](https://vercel.com)
1. Log into Vercel and click **Add New** → **Project**.
2. Import your GitHub repository.
3. Keep root directory as `./`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://jobhuntos-api.onrender.com/api` *(Replace with your live backend URL)*
5. Click **Deploy**.
   - *Note: `vercel.json` rewrite configuration is already included in the project for seamless SPA routing.*

#### Option B: Deploy on [Netlify](https://www.netlify.com)
1. Log into Netlify and click **Add new site** → **Import an existing project**.
2. Select your repository.
3. Set build settings:
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://jobhuntos-api.onrender.com/api`
5. Click **Deploy Site**.
   - *Note: `public/_redirects` configuration is already included for SPA routing.*

---

## 📄 License

Distributed under the **MIT License**. Free for personal and commercial use.
