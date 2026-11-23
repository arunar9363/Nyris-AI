const assert = require('node:assert/strict');
const test = require('node:test');
const { checkReadiness, matchedTermsInText } = require('../src/services/ats.service');

test('separates required, preferred and role terms and keeps evidence from each document', () => {
  const resume = [
    'Ari Example', 'ari@example.test', 'Experience',
    '- Shipped RESTful APIs with NodeJS.', 'Skills', '- React, Docker', 'Education', 'Example College, 2024',
  ].join('\n');
  const job = [
    'Minimum Qualifications:', '- Node.js and React', '- Salesforce',
    'Preferred Skills:', '- Docker, WireMock',
    'Responsibilities:', '- Collaborate on REST APIs',
    'Benefits:', '- Learn Kubernetes during offsites.',
  ].join('\n');

  const { advanced, scoreBreakdown } = checkReadiness(resume, job);
  const byTerm = Object.fromEntries(advanced.job.requirements.map(item => [item.term, item]));
  assert.deepEqual(byTerm['Node.js'], {
    term: 'Node.js', priority: 'required', status: 'in-context', source: 'Node.js and React',
    excerpt: 'Shipped RESTful APIs with NodeJS.', section: 'Experience',
  });
  assert.equal(byTerm.React.status, 'mentioned');
  assert.equal(byTerm.Salesforce.status, 'missing');
  assert.equal(byTerm.Docker.priority, 'preferred');
  assert.equal(byTerm.WireMock.priority, 'preferred');
  assert.equal(byTerm['REST API'].priority, 'mentioned');
  assert.equal(byTerm.Kubernetes, undefined);
  assert.equal(advanced.job.totalRequired, 3);
  assert.equal(advanced.job.matchedRequired, 2);
  assert.equal(advanced.job.evidencedRequired, 1);
  assert.equal(scoreBreakdown.keywords, 12);
  assert.match(advanced.recommendations[0].detail, /Salesforce/);
});

test('flags alternatives and years as checks that need a reader and discounts learning-only phrases', () => {
  const resume = [
    'Morgan Example', 'Experience', '- Currently learning PostgreSQL.',
    '- Deployed services to Azure. Never used Kubernetes.',
  ].join('\n');
  const job = [
    'Required Skills:', '- 3 years of experience with PostgreSQL', '- AWS or Azure', '- Kubernetes',
  ].join('\n');
  const report = checkReadiness(resume, job);
  assert.equal(report.advanced.job.totalRequired, 2);
  assert.equal(report.advanced.job.matchedRequired, 1);
  assert.equal(report.advanced.job.evidencedRequired, 0);
  assert.equal(report.advanced.job.manualChecks.length, 2);
  assert.match(report.advanced.job.manualChecks[0].source, /3 years/);
  assert.match(report.advanced.job.manualChecks[1].source, /AWS or Azure/);
  assert.equal(report.termEvidence.find(item => item.term === 'Kubernetes').status, 'missing');
  assert.deepEqual(report.missingKeywords, ['Kubernetes']);
  assert.deepEqual(matchedTermsInText('No SQL experience, but built RESTful APIs with NodeJS.', ['SQL', 'REST API', 'Node.js']), ['REST API', 'Node.js']);
  assert.ok(!Object.hasOwn(checkReadiness(resume, 'Required: AWS or Azure').scoreBreakdown, 'keywords'));
});

test('reports reading-order and formatting signals and scales document-only scoring', () => {
  const resume = [
    'Lee Example', 'E X P E R I E N C E', 'Projects', '- Wrote a guide for 12 users.',
    'Education', 'Skills', 'Excel', 'Contact email lee@example.test',
  ].join('\n');
  const report = checkReadiness(resume);
  const { parsing, scoring, job } = report.advanced;
  assert.equal(job.provided, false);
  assert.equal(scoring.possible, 75);
  assert.equal(report.score, Math.round(100 * scoring.earned / scoring.possible));
  assert.equal(parsing.withOutcome, 1);
  assert.equal(parsing.sections.find(item => item.name === 'Education').present, false);
  assert.equal(parsing.signals.find(item => item.label === 'Contact placement').passed, false);
  assert.equal(parsing.signals.find(item => item.label === 'Spaced letters').passed, false);
});
