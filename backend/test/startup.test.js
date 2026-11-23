const { once } = require('node:events');
const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

test('the API boots with an invalid frontend origin and unavailable PDF support', async t => {
  const previousOrigins = process.env.FRONTEND_URL;
  t.after(() => {
    if (previousOrigins === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = previousOrigins;
  });
  process.env.FRONTEND_URL = 'nyris.in,https://preview.example.test/path';
  t.mock.method(console, 'warn', () => {});
  t.mock.method(console, 'error', () => {});

  const load = Module._load;
  t.mock.method(Module, '_load', function (request, ...args) {
    if (request === 'pdf-parse') throw new Error('PDF support unavailable in this test');
    return load.call(this, request, ...args);
  });

  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  t.after(() => {
    server.close();
    server.closeAllConnections();
  });
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/api';

  const health = await fetch(base + '/health', { headers: { Origin: 'https://preview.example.test' } });
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('access-control-allow-origin'), 'https://preview.example.test');
  const wrongOrigin = await fetch(base + '/health', { headers: { Origin: 'https://unlisted.example.test' } });
  assert.equal(wrongOrigin.status, 403);

  const extract = (filename, content) => {
    const body = new FormData();
    body.set('document', new Blob([content]), filename);
    return fetch(base + '/resume/extract', { method: 'POST', body, signal: AbortSignal.timeout(4000) });
  };
  const pdf = await extract('resume.pdf', '%PDF-1.4\n');
  assert.equal(pdf.status, 503);
  assert.match((await pdf.json()).message, /PDF processing is unavailable/);
  const text = await extract('resume.txt', 'Sample Candidate\nExperience\n- Built an upload workflow.');
  assert.equal(text.status, 200);
  assert.deepEqual((await text.json()).data.sections, ['Experience']);
});
