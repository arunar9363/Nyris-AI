const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { resumeImport } = require('../src/services/resumeImport');
const { createDocument, renderHtml, renderText } = require('../src/services/resumeDocument');
const { renderPdf } = require('../src/services/pdf.service');
const { renderDocx } = require('../src/services/docx.service');
const { readDocument } = require('../src/utils/pdfParser');

const latex = String.raw`\documentclass{article}
\begin{document}
\begin{center}
\textbf{\Huge \scshape \color{darkblue} Morgan Rivera} \\ \vspace{1pt}
\small +91 98000 12345 $|$ \href{mailto:morgan@example.test}{\underline{morgan@example.test}} $|$
\href{https://www.linkedin.com/in/morgan}{\underline{LinkedIn}} $|$
\href{https://github.com/morgan}{\underline{GitHub}} $|$
\href{https://morgan.example.test/}{\underline{Portfolio}} $|$ Gurugram, India
\end{center}
\section{Professional Summary}
\small{Software engineer with experience building data pipelines.}
\section{Education}
\resumeSubheading{Cedar College of Technology}{Greater Noida, India}{Bachelor of Technology in Information Technology}{2022 -- 2026}
\section{Experience}
\resumeSubheading{Software Engineer / AI Specialist}{May 2026 -- Nov 2026}{Bright Labs}{Gurugram, India}
\resumeItem{Evaluated model responses and audited annotation quality.}
\resumeSubheading{Web Development Intern}{Remote}{ExampleSoft (4-Week Virtual Internship)}{}
\resumeItem{Built reusable JavaScript components.}
\section{Projects}
\resumeProjectHeading{\textbf{Monitoring Console} $|$ \emph{React.js, Python, SQL}}{}
\resumeItem{Developed a dashboard for 12 teams.}
\resumeItem{\textbf{Links:} \href{https://console.example.test/}{\underline{Live Demo}} $|$ \href{https://github.com/morgan/console}{\underline{GitHub}}}
\resumeProjectHeading{\textbf{Audio Analysis} $|$ \emph{Python, NLP}}{}
\resumeItem{Orchestrated separate sentiment models.}
\section{Technical Skills}
\begin{itemize}
\small{\item{
\textbf{Programming Languages}{: Python, JavaScript, C++, SQL} \\
\textbf{AI \& LLMs}{: NLP, model evaluation}
}}
\end{itemize}
\section{Certifications}
\small{\item{
\textbullet\ Cloud Fundamentals -- Cedar Academy \href{https://academy.example.test/credential}{\textcolor{blue}{\faGlobe}} \\
\textbullet\ Database Developer -- Cedar Academy
}}
\end{document}`;

test('imports the reference LaTeX structure, retaining contact links and offering project URLs for review', () => {
  const { text, draft, sections, warnings } = resumeImport(latex);
  assert.equal(draft.name, 'Morgan Rivera');
  assert.equal(draft.email, 'morgan@example.test');
  assert.equal(draft.phone, '+91 98000 12345');
  assert.equal(draft.location, 'Gurugram, India');
  assert.equal(draft.linkedin, 'https://www.linkedin.com/in/morgan');
  assert.equal(draft.github, 'https://github.com/morgan');
  assert.equal(draft.portfolio, 'https://morgan.example.test/');
  assert.equal(draft.summary, 'Software engineer with experience building data pipelines.');
  assert.equal(draft.education[0].degree, 'Bachelor of Technology in Information Technology');
  assert.equal(draft.education[0].location, 'Greater Noida, India');
  assert.equal(draft.experience[0].dates, 'May 2026 -- Nov 2026');
  assert.equal(draft.experience[1].company, 'ExampleSoft (4-Week Virtual Internship)');
  assert.equal(draft.experience[1].location, 'Remote');
  assert.equal(draft.experience[1].dates, '');
  assert.equal(draft.projects[0].tech, 'React.js, Python, SQL');
  assert.deepEqual(draft.projects[0].linkSuggestions, {
    live: 'https://console.example.test/', github: 'https://github.com/morgan/console',
  });
  assert.equal(draft.projects[0].live, '');
  assert.equal(draft.projects[0].github, '');
  assert.deepEqual(draft.projects[1].linkSuggestions, {});
  assert.deepEqual(draft.skills.categories.map(category => category.label), ['Programming Languages', 'AI & LLMs']);
  assert.equal(draft.certifications[0].name, 'Cloud Fundamentals');
  assert.equal(draft.certifications[0].link, 'https://academy.example.test/credential');
  assert.equal(draft.certifications[1].issuer, 'Cedar Academy');
  assert.deepEqual(sections, ['Professional Summary', 'Education', 'Experience', 'Projects', 'Technical Skills', 'Certifications']);
  assert.deepEqual(warnings, []);
  assert.equal(resumeImport(text).draft.name, draft.name);
});

test('keeps undated entries and preserves unmatched bullets and other recognized sections', () => {
  const { draft } = resumeImport([
    'Morgan Rivera', 'morgan@example.test', 'Education', 'Cedar College | 2022', 'Bachelor of Technology',
    'Experience', 'Developer | Example Studio', '- Integrated a reporting API.', 'Analyst | Cedar Labs | 2024',
    '- Wrote validation tests.', 'Projects', '- Audited results for a research group.', 'Languages', 'Spanish and English',
  ].join('\n'));
  assert.deepEqual(draft.experience.map(entry => entry.title), ['Analyst', 'Developer']);
  assert.equal(draft.education[0].dates, '2022');
  const text = renderText(createDocument(draft));
  assert.match(text, /OTHER PROJECTS\n- Audited results for a research group/);
  assert.match(text, /LANGUAGES\nSpanish and English/);
});

test('imports hidden Word and PDF contact links and keeps project hyperlinks out of preview until chosen', async () => {
  const document = createDocument({
    name: 'Morgan Rivera',
    email: 'morgan@example.test',
    location: 'Austin, Texas',
    linkedin: 'https://linkedin.com/in/morgan',
    projects: [{ name: 'Monitoring Console', tech: 'React.js, Python', live: 'https://console.example.test/', bullets: ['Built a reporting page.'] }],
  });
  const files = [
    ['sample.pdf', await renderPdf(document)],
    ['sample.docx', await renderDocx(document)],
  ];
  for (const [originalname, buffer] of files) {
    const text = await readDocument({ originalname, buffer }, undefined, { label: 'resume', includeLinks: true });
    const { draft } = resumeImport(text);
    assert.equal(draft.linkedin, 'https://linkedin.com/in/morgan', originalname);
    assert.equal(draft.location, 'Austin, Texas', originalname);
    assert.equal(draft.projects[0].name, 'Monitoring Console', originalname);
    assert.equal(draft.projects[0].tech, 'React.js, Python', originalname);
    assert.equal(draft.projects[0].linkSuggestions.live, 'https://console.example.test/', originalname);
    const strategy = { paperSize: 'A4', templateId: 'minimal' };
    const before = renderHtml(createDocument(draft, strategy));
    assert.doesNotMatch(before, /console\.example\.test|Live demo/);
    draft.projects[0].live = draft.projects[0].linkSuggestions.live;
    const after = renderHtml(createDocument(draft, strategy));
    assert.match(after, /href="https:\/\/console\.example\.test\/"/);
    assert.match(after, /<strong>Monitoring Console<\/strong> \| <em>React\.js, Python<\/em>/);
    assert.match(after, /max-width: 794px/);
    assert.match(after, /font-variant-caps: small-caps/);
  }
});

test('pasted resume import and live preview share the existing resume API', async () => {
  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/api/resume';
  const post = async (route, body) => {
    const response = await fetch(base + route, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    return (await response.json()).data;
  };
  try {
    const { draft } = await post('/extract', { kind: 'resume-draft', resumeText: latex });
    draft.projects[0].name = 'Edited Console';
    let preview = await post('/preview', { formData: draft, templateId: 'modern' });
    assert.match(preview.documentText, /Edited Console/);
    assert.doesNotMatch(preview.optimizedHtml, /console\.example\.test/);
    draft.projects[0].github = draft.projects[0].linkSuggestions.github;
    preview = await post('/preview', { formData: draft, templateId: 'minimal' });
    assert.match(preview.documentText, /Repository: https:\/\/github\.com\/morgan\/console/);
  } finally {
    server.close();
    server.closeAllConnections();
  }
});
