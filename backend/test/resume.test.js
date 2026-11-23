const test = require('node:test');
const assert = require('node:assert/strict');
const JSZip = require('jszip');
const { createDocument, renderHtml, renderText } = require('../src/services/resumeDocument');
const { renderPdf } = require('../src/services/pdf.service');
const { renderDocx } = require('../src/services/docx.service');
const { extractTextFromPDF } = require('../src/utils/pdfParser');
const { checkReadiness } = require('../src/services/ats.service');

const sample = {
  name: 'Nisha Rao',
  email: 'nisha@example.test',
  summary: 'Research & development with React and Node.js.',
  linkedin: 'linkedin.com/in/demo-candidate',
  experience: [
    { title: 'Intern', company: 'Cedar Studio', dates: 'Jan 2024 – Jun 2024', bullets: ['Built the first dashboard.'] },
    { title: 'Engineer', company: 'Cedar Studio', dates: 'Jul 2024 – Present', bullets: ['Wrote 12 regression tests.', 'Implemented keyboard navigation.'] },
  ],
  projects: [{ name: 'Campus Forum', tech: 'React, Node.js', bullets: ['Shipped threaded replies.'], live: 'https://example.test/project' }],
  skills: 'Web: React, Node.js',
};

test('all resume layouts keep bullets, recognizable headings and chronological dates in selectable text', async () => {
  for (const templateId of ['minimal', 'modern', 'creative']) {
    const document = createDocument(sample, { templateId, paperSize: 'A4', sectionOrder: ['projects', 'experience', 'summary'] });
    const html = renderHtml(document);
    const text = renderText(document);
    const pdf = await renderPdf(document);
    const extracted = await extractTextFromPDF(pdf);
    const headings = extracted.toUpperCase();
    assert.ok(headings.includes('PROJECTS') && headings.includes('EXPERIENCE'));
    assert.ok(headings.indexOf('PROJECTS') < headings.indexOf('EXPERIENCE'));
    assert.ok(extracted.indexOf('Engineer') < extracted.indexOf('Intern'));
    for (const bullet of ['Built the first dashboard.', 'Wrote 12 regression tests.', 'Implemented keyboard navigation.', 'Shipped threaded replies.']) {
      assert.ok(html.includes(bullet));
      assert.ok(extracted.includes(bullet));
      assert.ok(text.includes(bullet));
    }
    assert.ok(html.includes('Research &amp; development'));
    assert.ok(!html.includes('<h2>Education</h2>'));
  }
});

test('DOCX includes the title, list entries and document hyperlinks', async () => {
  const zip = await JSZip.loadAsync(await renderDocx(createDocument(sample)));
  const body = await zip.file('word/document.xml').async('string');
  const links = await zip.file('word/_rels/document.xml.rels').async('string');
  assert.match(body, /w:pStyle w:val="Heading1"/);
  assert.match(body, /w:pStyle w:val="ListBullet"/);
  assert.ok(body.includes('Nisha Rao') && body.includes('Shipped threaded replies.'));
  assert.ok(links.includes('https://linkedin.com/in/demo-candidate'));
  assert.ok(links.includes('https://example.test/project'));
});

test('expanded Latin names retain their spelling through PDF extraction', async () => {
  const document = createDocument({ ...sample, name: 'Łukasz Dvořák' });
  const text = await extractTextFromPDF(await renderPdf(document));
  assert.ok(text.includes('Łukasz Dvořák'));
});

test('preview data is encoded and unsafe link protocols are discarded', () => {
  const doc = createDocument({ name: 'R&D <Team>', summary: '< 10 projects', portfolio: 'file:///resume.pdf' });
  const html = renderHtml(doc);
  assert.ok(html.includes('R&amp;D &lt;Team&gt;'));
  assert.ok(html.includes('&lt; 10 projects'));
  assert.ok(!html.includes('file:///'));
  assert.throws(() => createDocument(sample, { templateId: '' }), { statusCode: 400 });
});

test('ATS readiness uses matching evidence and omits keyword scoring when there is no target', () => {
  const text = renderText(createDocument(sample));
  const report = checkReadiness(text, 'React, Node.js, PostgreSQL and C++');
  assert.deepEqual(report.matchedKeywords, ['React', 'Node.js']);
  assert.deepEqual(report.missingKeywords, ['C++', 'PostgreSQL']);
  assert.equal(checkReadiness(text).evaluatedWithJobDescription, false);
  assert.ok(!Object.hasOwn(checkReadiness(text).scoreBreakdown, 'keywords'));
});
