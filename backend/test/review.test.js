const test = require('node:test');
const assert = require('node:assert/strict');
const { createDocument, renderHtml, renderText } = require('../src/services/resumeDocument');
const { renderDocx } = require('../src/services/docx.service');
const { readDocument } = require('../src/utils/pdfParser');
const { checkReadiness } = require('../src/services/ats.service');
const { reviewResume } = require('../src/services/roaster.service');
const { resumeFromSource } = require('../src/services/sourceResume');

const source = [
  'Sam Taylor', 'sam@example.test', 'Education', 'Sample College | 2022 – 2026',
  'Experience', 'Engineer | Bright Labs | 2025 – Present',
  '- Responsible for React pages.', '- Built 12 tests for REST APIs.',
  'Projects', '- Shipped a privacy settings form.', 'Skills: SQL, NodeJS',
].join('\n');

test('Roaster prioritizes specific source evidence and recognizes an impact cue without a provider', () => {
  const report = reviewResume({ resumeText: source, jobDescription: 'React, PostgreSQL, and Node.js.', targetRole: 'Web engineer', tone: 'playful' });
  assert.ok(report.findings.some(item => item.id === 'ownership' && item.evidence === 'Responsible for React pages.'));
  assert.equal(report.evidenceHighlight.text, 'Built 12 tests for REST APIs.');
  assert.equal(report.targetRole, 'Web engineer');
  assert.ok(report.missingKeywords.includes('PostgreSQL'));
  assert.match(report.funnyRoast, /receipts/);
});

test('ATS marks terms with resume context and treats listed skills and absent terms separately', () => {
  const { termEvidence, documentChecks } = checkReadiness(source, 'React, SQL, REST API, Node.js, and Docker.');
  const status = Object.fromEntries(termEvidence.map(item => [item.term, item.status]));
  assert.deepEqual(status, { React: 'in-context', 'Node.js': 'mentioned', SQL: 'mentioned', Docker: 'missing', 'REST API': 'in-context' });
  assert.equal(documentChecks.find(check => check.label === 'Phone').passed, false);
});

test('source-only tailoring preserves original bullets, selects section order, and persists varied layout styles', () => {
  const data = resumeFromSource(source, {});
  assert.equal(data.name, 'Sam Taylor');
  const options = { sectionOrder: ['projects', 'experience'] };
  const [classic, clean, compact] = ['minimal', 'modern', 'creative'].map(templateId => createDocument(data, { ...options, templateId }));
  assert.match(renderHtml(classic), /text-align: center/);
  assert.match(renderHtml(clean), /2px solid #155e75/);
  assert.match(renderHtml(compact), /text-align: left/);
  assert.ok(compact.theme.bodySize < clean.theme.bodySize);
  const text = renderText(clean);
  assert.ok(text.indexOf('PROJECTS') < text.indexOf('EXPERIENCE'));
  assert.ok(text.includes('- Built 12 tests for REST APIs.'));
  assert.ok(text.includes('Engineer | Bright Labs | 2025 – Present'));
});

test('the parser reads Word export text, bullets, and basic entities', async () => {
  const document = createDocument({ name: 'Sam Taylor', projects: [{ name: 'Research & Development', bullets: ['Created 12 test plans.'] }] });
  const result = await readDocument({ originalname: 'sample.docx', buffer: await renderDocx(document) }, undefined, { label: 'resume' });
  assert.ok(result.includes('Research & Development'));
  assert.ok(result.includes('- Created 12 test plans.'));
});
