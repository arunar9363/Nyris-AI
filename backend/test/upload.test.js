const { once } = require('node:events');
const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');
const { readUploads } = require('../src/middleware/upload.middleware');

test('the API mounts the shared document upload route', async () => {
  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port + '/api/resume/extract';
  const document = 'Sample Candidate\nExperience\n- Built an upload workflow.';
  const form = new FormData();
  form.append('document', new Blob([document], { type: 'text/plain' }), 'resume.txt');
  form.append('kind', 'resume');
  try {
    const response = await fetch(url, { method: 'POST', body: form, signal: AbortSignal.timeout(4000) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, data: { text: document, sections: ['Experience'] } });
  } finally {
    server.close();
    server.closeAllConnections();
  }
});

test('an upload over the size limit returns 413 and subsequent uploads still work', async () => {
  const app = express();
  app.post('/file', readUploads('resumeFile'), (req, res) => res.json({ length: req.files.resumeFile.buffer.length }));
  app.use((error, req, res, next) => res.status(error.statusCode).json({ error: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port + '/file';
  const post = data => {
    const form = new FormData();
    form.append('resumeFile', new Blob([data]), 'resume.txt');
    return fetch(url, { method: 'POST', body: form, signal: AbortSignal.timeout(4000) });
  };
  try {
    const tooLarge = await post(Buffer.alloc(5 * 1024 * 1024 + 100));
    assert.equal(tooLarge.status, 413);
    const subsequent = await post('Readable text');
    assert.equal(subsequent.status, 200);
    assert.deepEqual(await subsequent.json(), { length: 13 });
  } finally {
    server.close();
    server.closeAllConnections();
  }
});
