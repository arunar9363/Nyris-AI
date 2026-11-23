const JSZip = require('jszip');
const { Writable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { extname } = require('node:path');
const httpError = require('./httpError');

const MAX_TEXT = 30000;
const MAX_DOCUMENT_XML = 768 * 1024;

function readableText(value, label) {
  const content = typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '';
  if (!content) throw httpError(400, 'Add ' + label + ' text or upload a readable file.');
  if (content.length > MAX_TEXT) throw httpError(413, 'Keep ' + label + ' text under ' + MAX_TEXT.toLocaleString('en-US') + ' characters.');
  return content;
}

async function extractTextFromPDF(buffer, { includeLinks = false } = {}) {
  let PDFParse;
  try {
    ({ PDFParse } = require('pdf-parse'));
  } catch (error) {
    console.error('PDF support could not be loaded (' + (error.code || error.name) + ').');
    throw httpError(503, 'PDF processing is unavailable. Upload a DOCX or TXT file, or paste the text.');
  }
  const parser = new PDFParse({ data: new Uint8Array(buffer), isEvalSupported: false, stopAtErrors: true });
  let content;
  try {
    content = (await parser.getText({ pageJoiner: '', parseHyperlinks: includeLinks })).text.trim();
  } catch {
    throw httpError(422, 'This PDF could not be read. Try an unlocked text-based PDF, or paste the text.');
  } finally {
    await parser.destroy();
  }
  if (content.replace(/\s/g, '').length < 10) {
    throw httpError(422, 'This PDF has little selectable text. Paste the text or export a text-based PDF.');
  }
  return content;
}

function decodeWordText(value) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return value.replace(/&(?:#(\d{1,7})|#x([a-f\d]{1,6})|(amp|lt|gt|quot|apos));/gi, (_, decimal, hex, entity) => {
    if (entity) return entities[entity.toLowerCase()];
    const point = decimal ? Number(decimal) : Number.parseInt(hex, 16);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : '';
  });
}

async function readWordPart(part) {
  const chunks = [];
  let size = 0;
  await pipeline(part.nodeStream('nodebuffer'), new Writable({
    write(chunk, encoding, done) {
      size += chunk.length;
      if (size > MAX_DOCUMENT_XML) return done(httpError(413, 'This Word document has too much content. Keep only the resume pages.'));
      chunks.push(chunk);
      done();
    },
  }));
  const xml = Buffer.concat(chunks).toString('utf8');
  if (/<!DOCTYPE/i.test(xml)) throw new Error('Invalid Word document part');
  return xml;
}

function wordText(paragraph) {
  const tokens = paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t\s*>|<w:(tab|br)\b[^>]*\/>/g);
  return Array.from(tokens, ([, value, tag]) => tag === 'br' ? '\n' : tag === 'tab' ? ' | ' : decodeWordText(value)).join('');
}

async function wordLinks(part) {
  const links = new Map();
  if (!part) return links;
  const xml = await readWordPart(part);
  for (const [attributes] of xml.matchAll(/<Relationship\s[^>]+>/g)) {
    const fields = Object.fromEntries(Array.from(attributes.matchAll(/\b(Id|Type|Target|TargetMode)\s*=\s*(['"])(.*?)\2/g), ([, name, , value]) => [name, decodeWordText(value)]));
    if (fields.TargetMode === 'External' && fields.Type?.endsWith('/hyperlink') && /^(?:https?:\/\/|mailto:|tel:)[^\s]+$/i.test(fields.Target || '')) {
      links.set(fields.Id, fields.Target);
    }
  }
  return links;
}

async function extractTextFromDocx(buffer, { includeLinks }) {
  try {
    const archive = await JSZip.loadAsync(buffer, { createFolders: false });
    const body = archive.file('word/document.xml');
    if (!body) throw new Error('Missing Word document body');
    const xml = await readWordPart(body);
    const links = includeLinks ? await wordLinks(archive.file('word/_rels/document.xml.rels')) : new Map();
    const paragraphs = xml.matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p\s*>/g);
    const lines = [];
    for (const [, paragraph] of paragraphs) {
      let line = '';
      let start = 0;
      if (links.size) {
        for (const match of paragraph.matchAll(/<w:hyperlink\b([^>]*)>([\s\S]*?)<\/w:hyperlink\s*>/g)) {
          line += wordText(paragraph.slice(start, match.index));
          const target = links.get(match[1].match(/\br:id=(['"])(.*?)\1/)?.[2]);
          const label = wordText(match[2]);
          line += target && label ? '[' + label + '](' + target + ')' : label;
          start = match.index + match[0].length;
        }
      }
      line = (line + wordText(paragraph.slice(start))).trim();
      if (line) lines.push((/<w:numPr\b|w:val=["']ListBullet/i.test(paragraph) ? '- ' : '') + line);
    }
    if (!lines.length) throw new Error('Empty Word document');
    return lines.join('\n');
  } catch (error) {
    if (error.expose) throw error;
    throw httpError(422, 'This Word file has no readable text. Try a standard DOCX file or paste the text.');
  }
}

function imageMime(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return '';
}

async function readDocument(file, value, { label, optional = false, readImage, includeLinks = false } = {}) {
  if (!file) return optional && (value === undefined || typeof value === 'string' && !value.trim()) ? '' : readableText(value, label);
  const { buffer, originalname } = file;
  const extension = extname(originalname).toLowerCase();
  if (extension === '.pdf' && buffer.subarray(0, 1024).includes('%PDF-')) {
    return readableText(await extractTextFromPDF(buffer, { includeLinks }), label);
  }
  if (extension === '.docx' && buffer.subarray(0, 4).equals(Buffer.from('504b0304', 'hex'))) {
    return readableText(await extractTextFromDocx(buffer, { includeLinks }), label);
  }
  if (extension === '.txt') {
    let input;
    try {
      input = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      if (input.includes('\0')) throw new Error('Invalid text');
    } catch {
      throw httpError(422, 'Upload a UTF-8 plain text file or paste the text.');
    }
    return readableText(input, label);
  }
  const mime = imageMime(buffer);
  if (readImage && mime && ['.png', '.jpeg', '.jpg', '.webp'].includes(extension)) {
    return readableText(await readImage(buffer, mime), label);
  }
  throw httpError(415, readImage ? 'Upload a valid PDF, DOCX, TXT, PNG, JPG, or WEBP file.' : 'Upload a valid PDF, DOCX, or TXT file.');
}

module.exports = { extractTextFromPDF, readDocument, readableText };
