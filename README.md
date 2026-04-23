# WAVCAST - Podcast Hosting & Distribution Platform

WAVCAST is a full-stack, modern podcast hosting platform with a dark, editorial aesthetic. It features a persistent global audio player, custom canvas waveform visualizer, RSS feed generation, and creator dashboards.

## 🌟 Features

- **Global Persistent Audio Player**: Seamless playback across route navigation using React Context/Zustand and a root-level `<audio>` element.
- **Waveform Visualizer**: Custom HTML5 Canvas + Web Audio API visualizer with 64 amber frequency bars and CSS fallback animation.
- **Creator Dashboard**: Manage podcasts, upload episodes (Multer), and view basic stats.
- **RSS Feed Generation**: Valid XML RSS 2.0 feeds generated automatically for podcasts.
- **JWT Authentication**: Secure auth flow with access and refresh tokens.
- **Dark Editorial Aesthetic**: Bespoke design system utilizing deep blacks, off-whites, and electric amber/teal accents with subtle noise filters.

## 🏗️ Tech Stack

```text
+-----------------------+      +-----------------------+
|       FRONTEND        |      |        BACKEND        |
|-----------------------|      |-----------------------|
| React 18 (Vite)       |<---->| Node.js + Express.js  |
| Tailwind CSS          | REST | MongoDB (Mongoose)    |
| Zustand (State)       | API  | JWT Auth              |
| React Query           |      | Multer (Uploads)      |
| React Router v6       |      | Express Rate Limit    |
| Framer Motion         |      | bcryptjs              |
+-----------------------+      +-----------------------+
```

## 🛠️ Prerequisites

- Node.js 18+
- MongoDB (Running locally or MongoDB Atlas)
- npm or yarn

## 🚀 Setup Instructions

### 1. Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (copy from `.env.example` below):
   ```bash
   cp .env.example .env
   ```
4. Run the seed script to populate mock data (Optional but recommended):
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 📄 Environment Variables (`server/.env.example`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/wavcast
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## 🔌 API Documentation

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | Authenticate user & get tokens |
| `/api/auth/refresh-token` | POST | Public | Get new access token |
| `/api/auth/me` | GET | Private | Get current user |
| `/api/podcasts` | GET | Public | Get all podcasts (with filters) |
| `/api/podcasts/trending` | GET | Public | Top podcasts by subs |
| `/api/podcasts/:id` | GET | Public | Get single podcast |
| `/api/podcasts` | POST | Creator| Create podcast |
| `/api/podcasts/:id/rss` | GET | Public | Generate RSS XML feed |
| `/api/episodes/podcast/:id`| GET | Public | Get episodes for podcast |
| `/api/episodes` | POST | Creator| Upload episode (multipart) |
| `/api/episodes/:id/play` | POST | Public | Increment play count |
| `/api/subscriptions/my` | GET | Private | Get user subscriptions |
| `/api/subscriptions/:id` | POST | Private | Subscribe to podcast |

## 📸 Screenshots
*(Add your screenshots here)*
