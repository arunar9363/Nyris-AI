<div align="center">

<img src="frontend/src/assets/logos/logo-full.png" alt="Nyris AI Logo" width="200"/>

# ✦ Nyris AI

### AI-Powered Resume Optimizer · Builder · ATS Checker · Roaster

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Powered by Groq](https://img.shields.io/badge/AI-Groq-F55036?style=flat-square&logo=groq&logoColor=white)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br/>

> **Land your dream job.** Nyris uses blazing-fast Groq AI to optimize your resume against any job description, score it against ATS systems, build it from scratch, or roast it with brutal honesty.

<br/>

[🚀 Live Demo](#) · [📖 Docs](#) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

</div>

---

## ✨ Features

| Feature | Auth | Description |
|---|---|---|
| 🎯 **JD Optimizer** | Free | 5-step AI resume optimizer — paste any job description and get a tailored resume |
| 🏗️ **Resume Builder** | ✅ | Build from scratch with AI-powered suggestions and 3 stunning templates |
| 📊 **ATS Checker** | ✅ | Real ATS score, keyword gap analysis, and actionable fixes |
| 🔥 **Resume Roaster** | ✅ | Brutally honest + funny AI feedback that actually helps |
| 📁 **Dashboard** | ✅ | Resume history, favorites, and personal stats |

---

## 🛠️ Tech Stack

**Frontend**
- ⚡ React 18 + Vite
- 🎨 Tailwind CSS + Framer Motion
- 🐻 Zustand (state management)
- 📡 Axios + React Router v6
- 📂 React Dropzone

**Backend**
- 🟢 Node.js + Express.js
- 🍃 MongoDB + Mongoose
- 🔐 JWT + Bcrypt
- 🤖 Groq SDK (LLaMA 3)
- 🖨️ Puppeteer (PDF generation)
- 📄 pdf-parse + Multer

---

## 📁 Project Structure

```
nyris/
├── frontend/                   # React + Vite app
│   └── src/
│       ├── assets/             # Logos & images
│       ├── components/
│       │   ├── layout/         # Navbar, Layout wrapper
│       │   └── ui/             # ATSCircle, FileDropzone, etc.
│       ├── pages/              # All route pages
│       ├── store/              # Zustand stores
│       ├── lib/                # Axios instance
│       └── styles/             # globals.css
│
└── backend/                    # Node.js + Express API
    ├── src/
    │   ├── controllers/        # Auth, Resume, ATS, Roaster, User
    │   ├── routes/             # Express route definitions
    │   ├── models/             # MongoDB schemas
    │   ├── middleware/         # Auth guard, file upload
    │   ├── services/           # Groq AI, PDF generation
    │   ├── utils/              # PDF parser helper
    │   └── config/             # DB connection
    └── templates/
        ├── minimal.html        # Clean ATS-friendly layout
        ├── modern.html         # Blue sidebar, two-column
        └── creative.html       # Dark gradient header
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- Free Groq API Key → [console.groq.com](https://console.groq.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nyris.git
cd nyris
```

---

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit your `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nyris
JWT_SECRET=your_super_secret_key_at_least_32_chars_long
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
# Backend running at http://localhost:5000
```

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

### 4. Get Your Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (100% free)
3. Go to **API Keys → Create Key**
4. Paste it into `.env` as `GROQ_API_KEY`

---

## 🎨 Resume Templates

HTML templates live in `backend/templates/`. Each uses `{{variable}}` syntax for dynamic data injection.

| Template | Style |
|---|---|
| `minimal.html` | Clean, classic — maximum ATS compatibility |
| `modern.html` | Blue sidebar accent, two-column layout |
| `creative.html` | Dark gradient header, chip-style skills |

**Adding a custom template:**
1. Create `backend/templates/yourname.html`
2. Use `{{firstName}}`, `{{summary}}`, `{{experience}}` etc. for placeholders
3. Register it in `frontend/src/pages/OptimizerPage.jsx`

---

## 🔒 Security

- JWT authentication with 7-day expiry
- Bcrypt password hashing (12 salt rounds)
- Rate limiting — 100 req/15min general, 10 req/min AI endpoints
- Helmet.js security headers
- CORS restricted to frontend origin
- Max upload size: **5MB** (PDF and TXT only)

---

## 🚀 Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Start backend in production
cd ../backend && npm start
```

> **Linux Users:** Puppeteer requires Chromium. Run this once:
> ```bash
> npx puppeteer browsers install chrome
> ```

> **Production Tips:**
> - Use **MongoDB Atlas** instead of local MongoDB
> - Store uploaded PDFs on **AWS S3** instead of local disk (`backend/uploads/pdfs/`)
> - Set `NODE_ENV=production` in your environment

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Built with ❤️ by [Arun](https://github.com/your-username)

⭐ Star this repo if Nyris helped you land a job!

</div>