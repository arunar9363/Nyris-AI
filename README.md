# Nyris AI

Nyris AI helps you build a resume, tailor it to a job posting, and review how clearly it presents your experience. Import an existing resume or start from scratch, edit the draft beside a live preview, and export PDF, Word, or plain text.

## What you can do

| Tool | What it does | Access |
| --- | --- | --- |
| Resume Builder `/builder` | Auto-fills contact details and resume sections from a file or pasted text. Edit details, bullets, and optional project links before saving. | Account required |
| Resume Optimizer `/optimizer` | Compares your resume with a job description and lets you review and edit a tailored draft. AI wording suggestions are optional. | Guest or signed in |
| ATS Checker `/ats` | Checks readable sections and contact details, compares required and preferred job terms with resume evidence, and explains its readiness estimate. | Account required |
| Resume Roaster `/roaster` | Reviews bullets for specific actions, scope, outcomes, and job relevance. Choose direct, coaching, or playful feedback. | Account required |
| Resume Library `/resume-library` | Shows fictional examples for eight career situations and lets you compare the Classic, Clean, and Compact layouts. | Public |
| History `/history` | Reopens your most recent saved resumes and reports. You can favorite or delete entries. | Account required |

## Build and export a resume

1. Upload a text-based PDF, DOCX, or UTF-8 TXT file up to 5 MB, or paste the resume text. The Builder also supports manual entry. You can paste LaTeX source that uses the supported section and resume commands.
2. Review the imported fields and edit the draft. Add a live demo or repository URL per project, accept a link found in the source, or leave the fields blank.
3. Choose a career profile, a single-column layout, and US Letter or A4 paper. Review the page preview and use the text preview to check reading order.
4. Save and download the format requested by the employer. PDF and DOCX exports use selectable text. ATS and Roaster reports can be downloaded as text.

The ATS score is a Nyris estimate based on the supplied resume and job description. Guest Optimizer downloads are available from the result screen for up to 24 hours.

## Run locally

Use Node.js 22.x with version 22.3 or later, npm, and a running MongoDB instance. Run the API and frontend in separate terminals. The commands below use PowerShell. On macOS or Linux, use `npm` in place of `npm.cmd`.

### Start the API

Create `backend/.env` with these settings. Use your MongoDB connection string and a unique JWT secret.

```dotenv
NODE_ENV=development
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/nyris_local
JWT_SECRET=replace-with-a-random-secret
```

Generate a secret for `JWT_SECRET` with Node.js.

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

From the repository root, install dependencies and start the API.

```powershell
cd backend
npm.cmd ci
npm.cmd run dev
```

### Start the frontend

From the repository root in a second terminal, run the Vite dev server.

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open the local app. Vite forwards `/api` requests to `http://127.0.0.1:5050`. [Local app](http://127.0.0.1:5174) · [API readiness](http://127.0.0.1:5174/api/ready)

## Environment variables

| Location | Variable | Purpose |
| --- | --- | --- |
| Backend | `MONGODB_URI` | Required MongoDB connection string. |
| Backend | `JWT_SECRET` | Required secret for account and guest access tokens. |
| Backend | `NODE_ENV`, `PORT` | Runtime mode and listen port. The port defaults to `5050`. |
| Backend | `FRONTEND_URL` | Comma-separated frontend origins allowed to call the API. |
| Backend | `TRUST_PROXY` | Number of trusted reverse-proxy hops. Set this to match your deployment when a reverse proxy forwards requests to Express. |
| Backend | `GROQ_API_KEY`, `GROQ_MODEL` | Enable and configure optional AI wording suggestions and Roaster coaching. |
| Backend | `GROQ_VISION_MODEL` | Optional model override for transcribing PNG, JPG, and WEBP job-description screenshots with Groq. |
| Backend | `RESUME_PDF_FONT` | Optional path to an embeddable TrueType font for characters outside the built-in PDF fonts. |
| Frontend | `VITE_API_URL` | API base URL used at build time. Defaults to `/api`. Set `/api` explicitly in `frontend/.env.local` to use the local proxy when overriding a hosted API URL. |
| Frontend | `VITE_DEV_API_TARGET` | Vite proxy target when your local API uses a different origin. |

Resume import, draft editing, standard Optimizer mode, ATS checks, and the core Roaster review work without a Groq key. For backend configuration, existing shell variables take precedence over `backend/.env.local`, which takes precedence over `backend/.env`. Keep API keys and database credentials in backend configuration.

## Test and build

From the repository root with dependencies installed, run the backend tests and build the frontend.

```powershell
cd backend
npm.cmd test
cd ../frontend
npm.cmd run build
```

The backend suite covers uploads, resume import, preview and export rendering, ATS analysis, and Roaster feedback. The frontend build writes to `frontend/dist`.

## Deploy

1. On the API host, run `npm ci` and `npm start` from `backend/`. Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL` for the deployed frontend. Use the port supplied by the host if it sets one.
2. On the frontend host, run `npm ci` and `npm run build` from `frontend/`. Publish `dist/`. For a separately hosted API, set `VITE_API_URL` to its full API base, such as `https://api.example.com/api`, before building.
3. Configure the static host to serve `index.html` for client-side routes such as `/builder` and `/history`. With a same-origin API, forward `/api/*` to Express before the frontend route fallback.
4. Check `GET /api/health` for API liveness and `GET /api/ready` for MongoDB readiness. The readiness response also shows whether a Groq key is configured.

### Render backend

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm ci --include=optional` |
| Start Command | `npm start` |
| Health Check Path | `/api/ready` |

The backend's Node.js version range selects Node 22.x. Any `NODE_VERSION` configured in the Render dashboard takes precedence. PDF export runs server-side without a browser install. [Render Node.js versions](https://render.com/docs/node-version)

For `ENOTFOUND` during MongoDB startup, confirm the Atlas cluster is active and compare the host in Render's `MONGODB_URI` with the cluster's current connection details. If SRV resolution fails for the active cluster, copy its standard `mongodb://` connection string from Atlas, preserve the database name and connection options, and save the updated variable with a deploy. [Atlas connection troubleshooting](https://www.mongodb.com/docs/atlas/troubleshoot-connection/) · [Render environment settings](https://render.com/docs/configure-environment-variables)

## Project structure

| Path | Contains |
| --- | --- |
| `frontend/src/pages/` | React screens for building, reviewing, and browsing resumes. |
| `frontend/src/components/` | Shared editors, previews, upload controls, and layout. |
| `backend/src/routes/` and `backend/src/controllers/` | Express routes and request handlers. |
| `backend/src/services/` | Resume import, formatting, export, analysis, and optional Groq integration. |
| `backend/src/models/` | Mongoose models for users, resumes, and feedback. |
| `backend/test/` | Backend tests run with Node's test runner. |

The frontend uses React, Vite, Tailwind CSS, and Zustand. The API uses Node.js, Express, MongoDB, and Mongoose.

## Resume formatting references

- Keep contact information in the document body and use recognizable section headings. Check the order of copied text before submitting. [Greenhouse resume parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse)
- Use readable typography, consistent dates, and results you can verify. Follow the employer's requested file format. [UC Berkeley résumé guidance](https://career.berkeley.edu/prepare-for-success/resumes/)

## License

[MIT](LICENSE)
