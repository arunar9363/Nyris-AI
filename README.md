# Nyris AI

Nyris helps you build a resume, tailor it to a job, review visible ATS issues, and export PDF, Word, or plain text. The public Resume Library has examples for eight applicant situations and three single-column layouts.

## Run locally

Use Node.js 22.3 or newer and a running MongoDB server. Run the backend and frontend in separate terminals.

**Backend**

```powershell
cd backend
npm.cmd ci
if (-not (Test-Path -LiteralPath .env)) { Copy-Item .env.example .env }
npm.cmd run dev
```

Set `JWT_SECRET` to a long, random value in `backend/.env`. Set `MONGODB_URI` to your local or Atlas database. The default API port is `5050`. Use `backend/.env.local` for machine-specific overrides. Existing shell variables take precedence.

**Frontend**

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open `http://127.0.0.1:5174` or go directly to `/resume-library`. Vite proxies `/api` to the local backend. Set `VITE_DEV_API_TARGET` and the API’s `FRONTEND_URL` if you use different local ports.

## Resume workflow

1. Choose a profile in the Resume Library. Each example shows a recommended order, the type of evidence to include, and a suggested length.
2. Upload a PDF, DOCX, or TXT resume or paste the source to auto-fill the Builder or Optimizer. Review the imported sections in the editable draft. In Projects, provide a demo or repository URL, accept one found in the source, or leave the fields blank.
3. Choose Classic, Clean, or Compact and US Letter or A4. Check the live page and text previews before saving. PDF and Word exports use selectable text and preserve the section order and bullets.
4. Use ATS Checker to check recognizable headings, contacts, dates, bullets, and matched terms from a target job. The result is an estimate based on the provided text.

Resume uploads accept text-based PDF, DOCX, or UTF-8 TXT up to 5 MB. Confirm the extracted text before using it in a review. PNG, JPG, and WEBP job-description screenshots use `GROQ_VISION_MODEL` for transcription. Paste the text from an image-only resume or a screenshot that cannot be read.
The resume editor also accepts pasted LaTeX source using headings and the reference resume macros. It reads those fields as text.

Builder, ATS Checker, and the core Roaster report run without Groq. ATS Checker shows job requirements alongside resume evidence, flags qualifications to verify manually, and explains how document checks contribute to the readiness estimate. The Roaster offers direct, coaching, and playful tones with feedback and rewrite prompts on individual bullets. Both reports can be downloaded as text and reopened from History. The optional Roaster coaching note and the Optimizer’s AI-assisted wording use `GROQ_API_KEY` and `GROQ_MODEL`. The Optimizer retains source wording and applies the selected section order when source-only mode is chosen or AI rewriting is unavailable.

If your deployment needs PDF characters outside the built-in fonts, set `RESUME_PDF_FONT` to the path of an embeddable TrueType font with the required glyphs. Word and plain text exports keep the original characters.

Signed-in users can reopen their outputs and reports from History. A guest Optimizer result stays downloadable from the result screen for up to 24 hours. Resume downloads require the account or guest access token associated with the record.

## Test and deploy

```powershell
cd backend
npm.cmd test
cd ../frontend
npm.cmd run build
```

- On the API host set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`. Set `TRUST_PROXY` to the number of trusted reverse-proxy hops for the deployment. The host may supply `PORT`.
- Set `VITE_API_URL` at frontend build time when the API has a separate origin. Use the API origin followed by `/api`. Configure the static host to rewrite app routes such as `/resume-library`, `/builder`, and `/history` to `/index.html`.
- Use `GET /api/health` for process liveness and `GET /api/ready` for database readiness. The readiness response reports whether a Groq key is configured.

## Resume guidance

- Use recognizable headings, readable contact details in the document body, and a simple one-column layout. [Greenhouse resume parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse)
- Tailor verified skills and achievements to the role. Lead with education when it is your strongest evidence, or recent experience when you have an established work history. [Harvard resume guide](https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/) · [National Careers Service CV guide](https://nationalcareers.service.gov.uk/careers-advice/cv-sections)
- Follow any special instructions in the posting for an academic CV or a federal application. [Yale CV guidance](https://ocs.yale.edu/resources/resume-to-cv-conversion/) · [USAJOBS federal resume guidance](https://help.usajobs.gov/faq/application/documents/resume/what-to-include)

[MIT License](LICENSE)
