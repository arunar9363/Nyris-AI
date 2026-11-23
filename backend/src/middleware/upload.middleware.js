const Busboy = require('busboy');
const httpError = require('../utils/httpError');

const FILE_LIMIT = 5 * 1024 * 1024;
const TEXT_LIMIT = 32 * 1024;

function readUploads(...fileFields) {
  return (req, res, next) => {
    if (!req.is('multipart/form-data')) return next();
    const maxBytes = FILE_LIMIT * fileFields.length + 3 * TEXT_LIMIT;
    if (Number(req.headers['content-length']) > maxBytes) {
      return next(httpError(413, 'Upload exceeds the file size limit.'));
    }

    let parser;
    try {
      parser = Busboy({
        headers: req.headers,
        limits: {
          files: fileFields.length,
          fileSize: FILE_LIMIT,
          fields: 24,
          fieldSize: TEXT_LIMIT,
          parts: 27,
        },
      });
    } catch {
      return next(httpError(400, 'The upload could not be read. Try choosing the file again.'));
    }
    const body = Object.create(null);
    const files = Object.create(null);
    const fileNames = new Set();
    let size = 0;
    let finished = false;

    const finish = error => {
      if (finished) return;
      finished = true;
      req.off('data', count);
      req.off('aborted', abort);
      if (error) {
        req.unpipe(parser);
        // Busboy finishes updating its file stream after emitting a limit event.
        queueMicrotask(() => parser.destroy());
        res.set('Connection', 'close');
        return next(error);
      }
      req.body = body;
      req.files = files;
      next();
    };
    const count = chunk => {
      size += chunk.length;
      if (size > maxBytes) finish(httpError(413, 'Upload exceeds the file size limit.'));
    };
    const abort = () => finish(httpError(400, 'The upload was interrupted.'));
    const tooManyParts = () => finish(httpError(400, 'The upload contains too many fields or files.'));

    parser.on('field', (name, value, info) => {
      if (info.nameTruncated || info.valueTruncated || name.length > 64) {
        return finish(httpError(413, 'One of the text fields is too long.'));
      }
      if (name === 'projectLinks') {
        body.projectLinks = [...(body.projectLinks || []), value];
      } else if (!Object.hasOwn(body, name)) {
        body[name] = value;
      }
    });
    parser.on('file', (name, file, info) => {
      file.on('error', () => finish(httpError(400, 'The upload was interrupted.')));
      if (!fileFields.includes(name) || fileNames.has(name)) {
        file.resume();
        return finish(httpError(400, 'Choose one file per upload field.'));
      }
      fileNames.add(name);
      const chunks = [];
      file.on('limit', () => finish(httpError(413, 'Each upload must be 5 MB or smaller.')));
      file.on('data', chunk => chunks.push(chunk));
      file.on('end', () => {
        files[name] = { buffer: Buffer.concat(chunks), originalname: info.filename || '' };
      });
    });
    parser.on('error', () => finish(httpError(400, 'The upload could not be read.')));
    for (const event of ['filesLimit', 'fieldsLimit', 'partsLimit']) parser.on(event, tooManyParts);
    parser.on('close', () => finish());
    req.on('data', count);
    req.on('aborted', abort);
    req.pipe(parser);
  };
}

module.exports = { readUploads };
