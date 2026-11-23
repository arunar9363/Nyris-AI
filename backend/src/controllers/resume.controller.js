const path = require('node:path');
const fs = require('node:fs/promises');
const jwt = require('jsonwebtoken');
const Resume = require('../models/Resume.model');
const groq = require('../services/groq.service');
const { renderPdf } = require('../services/pdf.service');
const { renderDocx } = require('../services/docx.service');
const { checkReadiness } = require('../services/ats.service');
const { inspectResume } = require('../services/resumeInspection');
const { resumeFromSource } = require('../services/sourceResume');
const { resumeImport } = require('../services/resumeImport');
const { createDocument, normalizeResume, normalizeOptions, renderHtml, renderText, text } = require('../services/resumeDocument');
const { readDocument } = require('../utils/pdfParser');
const httpError = require('../utils/httpError');

const legacyPdfDir = path.join(__dirname, '../../uploads/pdfs');
const guestLifetime = 24 * 60 * 60;
const excludedHistoryFields = '-optimizedHtml -resumeData -originalResumeText -jobDescription -personalInfo -sessionId -atsReport -roastContent';

exports.extractDocument = async (req, res, next) => {
  try {
    const file = req.files?.document;
    const body = req.body || {};
    const isJob = body.kind === 'job';
    const wantsDraft = body.kind === 'resume-draft';
    if (!file && !wantsDraft) throw httpError(400, 'Choose a document to read.');
    const source = await readDocument(file, body.resumeText, {
      label: isJob ? 'job description' : 'resume',
      readImage: isJob ? groq.readImage : undefined,
      includeLinks: wantsDraft,
    });
    if (wantsDraft) return res.json({ success: true, data: resumeImport(source) });
    const inspection = inspectResume(source);
    res.json({ success: true, data: { text: source, sections: inspection.sections.map(item => item.title) } });
  } catch (error) {
    next(error);
  }
};

function settingsFrom(body) {
  let sectionOrder = body.sectionOrder;
  if (typeof sectionOrder === 'string') {
    try { sectionOrder = JSON.parse(sectionOrder); }
    catch { throw httpError(400, 'Choose a valid section order.'); }
  }
  return normalizeOptions({ ...body, sectionOrder });
}

function verifiedOptimization(candidate, original, contact) {
  const letters = value => value.toLowerCase().replace(/[^\p{L}\p{N}+#]+/gu, ' ').trim();
  const evidence = ' ' + letters(original) + ' ';
  const supported = value => !value || evidence.includes(' ' + letters(value) + ' ');
  const numbers = value => (value.match(/\d+(?:[.,]\d+)*/g) || []).map(number => number.replaceAll(',', ''));
  const existingNumbers = new Set(numbers(original));
  const supportedNumbers = value => numbers(value).every(number => existingNumbers.has(number));
  const data = normalizeResume(candidate);
  const warnings = [];
  for (const [field, keys] of [
    ['experience', ['company', 'title', 'dates']],
    ['education', ['institution', 'degree', 'dates']],
    ['projects', ['name', 'date']],
    ['certifications', ['name', 'issuer', 'dates']],
  ]) {
    const verified = data[field].filter(row => keys.every(key => supported(row[key])));
    if (verified.length !== data[field].length) warnings.push('Review the ' + field + ' entries against your original resume.');
    data[field] = verified;
  }
  for (const row of [...data.experience, ...data.projects]) {
    const verified = row.bullets.filter(supportedNumbers);
    if (verified.length !== row.bullets.length) warnings.push('Review the figures in your experience and project bullets.');
    row.bullets = verified;
  }
  if (!supportedNumbers(data.summary)) {
    data.summary = '';
    warnings.push('Add a summary containing figures you can verify.');
  }
  for (const row of data.projects) {
    if (!supported(row.live)) row.live = '';
    if (!supported(row.github)) row.github = '';
  }
  for (const row of data.certifications) if (!supported(row.link)) row.link = '';
  for (const key of ['name', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio']) {
    data[key] = text(contact[key], 600) || (supported(data[key]) ? data[key] : '');
  }
  data.projectLinks = contact.projectLinks;
  data.skills.categories = data.skills.categories.map(category => ({
    ...category,
    items: category.items.split(/[,;]/).map(item => item.trim()).filter(supported).join(', '),
  })).filter(category => category.items);
  return { data: normalizeResume(data), warnings: [...new Set(warnings)] };
}

function issueGuestAccess(id) {
  return jwt.sign({ purpose: 'resume-export' }, process.env.JWT_SECRET, { subject: String(id), expiresIn: guestLifetime });
}

async function saveResume(req, res, data, settings, { type, role, original, jobDescription, warnings = [], mode }) {
  const document = createDocument(data, settings);
  if (document.name.length < 2) throw httpError(422, 'Enter your full name to generate a resume.');
  if (!document.sections.length) throw httpError(422, 'Add education, experience, skills, or projects before generating a resume.');
  const documentText = renderText(document);
  const report = checkReadiness(documentText, jobDescription);
  report.targetRole = role;
  const baseline = original ? checkReadiness(original, jobDescription) : null;
  const tailoring = baseline ? { mode, originalScore: baseline.score, originalMatches: baseline.matchedKeywords.length, warnings } : undefined;
  const owner = req.user?._id;
  const record = await Resume.create({
    userId: owner || null,
    expiresAt: owner ? undefined : new Date(Date.now() + guestLifetime * 1000),
    type,
    title: document.name + (role ? ' - ' + role : ' - Resume'),
    templateId: settings.templateId,
    paperSize: settings.paperSize,
    sectionOrder: settings.sectionOrder,
    profile: settings.profile,
    originalResumeText: owner ? original : undefined,
    jobDescription: owner ? jobDescription : undefined,
    resumeData: data,
    atsScore: report.score,
    atsReport: report,
    tailoring,
    personalInfo: { name: data.name },
  });
  res.status(200).json({
    success: true,
    data: {
      resumeId: record._id,
      pdfUrl: '/api/resume/' + record._id + '/export/pdf',
      accessToken: owner ? undefined : issueGuestAccess(record._id),
      optimizedHtml: renderHtml(document),
      optimizedData: data,
      documentText,
      atsScore: report.score,
      report,
      warnings,
      tailoring,
    },
  });
}

exports.optimizeResume = async (req, res, next) => {
  try {
    const body = req.body || {};
    const settings = settingsFrom(body);
    const resumeText = await readDocument(req.files?.resumeFile, body.resumeText, { label: 'resume' });
    const jobDescription = await readDocument(req.files?.jdFile, body.jobDescription, { label: 'job description', readImage: groq.readImage });
    const targetRole = text(body.targetRole, 100);
    if (body.formData && typeof body.formData === 'object' && !Array.isArray(body.formData)) {
      const reviewed = normalizeResume(body.formData);
      return await saveResume(req, res, reviewed, settings, { type: 'optimized', role: targetRole, original: resumeText, jobDescription, mode: 'reviewed' });
    }
    let data;
    let warnings = [];
    let mode = 'source';
    if (body.useAi !== false && body.useAi !== 'false') {
      try {
        const optimized = await groq.optimizeResume({
          resumeText, jobDescription, targetRole, profile: settings.profile, customSuggestions: text(body.customSuggestions, 1000),
        });
        const verified = verifiedOptimization(optimized, resumeText, body);
        if (verified.data.experience.length || verified.data.education.length || verified.data.projects.length) {
          data = verified.data;
          warnings = verified.warnings;
          mode = 'ai';
        } else {
          warnings = ['The source wording was preserved so you can verify every entry.'];
        }
      } catch (error) {
        if (!error.expose) throw error;
        warnings = ['AI rewriting was unavailable. This version uses your source wording and selected section order.'];
      }
    }
    if (body.draftOnly === true) return res.json({ success: true, data: { suggestions: data, warnings } });
    data ||= resumeFromSource(resumeText, body);
    await saveResume(req, res, data, settings, { type: 'optimized', role: targetRole, original: resumeText, jobDescription, warnings, mode });
  } catch (error) {
    next(error);
  }
};

exports.previewResume = (req, res, next) => {
  try {
    const body = req.body || {};
    const document = createDocument(body.formData, settingsFrom(body));
    res.json({ success: true, data: { optimizedHtml: renderHtml(document), documentText: renderText(document) } });
  } catch (error) {
    next(error);
  }
};

exports.buildResume = async (req, res, next) => {
  try {
    const body = req.body || {};
    const settings = settingsFrom(body);
    const data = normalizeResume(body.formData);
    const role = text(body.targetRole || body.domain, 100);
    const jobDescription = await readDocument(null, body.jobDescription, { label: 'job description', optional: true });
    await saveResume(req, res, data, settings, { type: 'built', role, jobDescription });
  } catch (error) {
    next(error);
  }
};

function resumeId(req) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw httpError(400, 'The resume ID is invalid.');
  return req.params.id;
}

async function findAccessibleResume(req) {
  const id = resumeId(req);
  let guestAccess = false;
  const token = req.get('X-Resume-Access');
  if (token) {
    try {
      const claims = jwt.verify(token, process.env.JWT_SECRET, { subject: id, algorithms: ['HS256'] });
      guestAccess = claims.purpose === 'resume-export';
    } catch {
      throw httpError(403, 'This resume access link has expired or is invalid.');
    }
  }
  const access = [];
  if (req.user) access.push({ userId: req.user._id });
  if (guestAccess) access.push({ userId: null, expiresAt: { $gt: new Date() } });
  if (!access.length) throw httpError(401, 'Sign in or open the resume from the current optimizer result.');
  const resume = await Resume.findOne({ _id: id, $or: access });
  if (!resume) throw httpError(404, 'Resume not found.');
  return resume;
}

function documentFor(resume) {
  const settings = {
    templateId: resume.templateId,
    paperSize: resume.paperSize,
    sectionOrder: resume.sectionOrder,
    profile: resume.profile,
  };
  if (resume.resumeData) return createDocument(resume.resumeData, settings);
  if (!resume.optimizedHtml) return null;

  const legacy = createDocument({ name: resume.personalInfo?.name || resume.title }, settings);
  const legacyText = resume.optimizedHtml
    .replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<\/(?:p|div|h[1-6]|li|section)>/gi, '\n')
    .replace(/<[^>]*>|\{\{[^}]*}}/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, entity) => ({
      amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ',
    })[entity]);
  legacy.sections.push({
    title: 'Saved Resume',
    items: legacyText.split(/\r?\n/).map(item => text(item, 1600)).filter(Boolean).filter(item => item !== legacy.name)
      .map(item => ({ text: item })),
  });
  return legacy;
}

function legacyFileFor(resume) {
  const filename = /^\/uploads\/pdfs\/(resume-[a-f\d-]{36}\.pdf)$/i.exec(resume.pdfPath || '')?.[1];
  return filename ? path.join(legacyPdfDir, filename) : null;
}

exports.getHistory = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).select(excludedHistoryFields).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await findAccessibleResume(req);
    const document = documentFor(resume);
    res.json({
      success: true,
      data: {
        resumeId: resume._id, title: resume.title, type: resume.type, atsScore: resume.atsScore,
        report: resume.atsReport, roastContent: resume.roastContent, optimizedData: resume.resumeData,
        tailoring: resume.tailoring, warnings: resume.tailoring?.warnings,
        optimizedHtml: document ? renderHtml(document) : undefined,
        documentText: document ? renderText(document) : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

const docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
exports.exportResume = async (req, res, next) => {
  try {
    const format = req.params.format;
    if (!['pdf', 'docx', 'txt'].includes(format)) throw httpError(400, 'Choose PDF, Word, or plain text.');
    const resume = await findAccessibleResume(req);
    const document = documentFor(resume);
    if (!document) throw httpError(404, 'This history entry has no resume document.');
    let output;
    const legacyFile = format === 'pdf' && !resume.resumeData && legacyFileFor(resume);
    if (legacyFile) {
      try { output = await fs.readFile(legacyFile); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (!output) {
      if (format === 'pdf') output = await renderPdf(document);
      if (format === 'docx') output = await renderDocx(document);
      if (format === 'txt') output = renderText(document);
    }
    const name = (document.name.normalize('NFKD').replace(/[^a-z\d]+/gi, '-').replace(/^-|-$/g, '').slice(0, 76) || 'Resume');
    res.attachment(name + '-Resume.' + format).type(format === 'docx' ? docxMime : format).send(output);
  } catch (error) {
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId(req), userId: req.user._id },
      [{ $set: { isFavorite: { $not: ['$isFavorite'] } } }],
      { new: true, projection: { isFavorite: 1 } },
    );
    if (!resume) throw httpError(404, 'Resume not found.');
    res.json({ success: true, data: { isFavorite: resume.isFavorite } });
  } catch (error) {
    next(error);
  }
};

exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: resumeId(req), userId: req.user._id });
    if (!resume) throw httpError(404, 'Resume not found.');
    const file = legacyFileFor(resume);
    if (file) {
      try { await fs.unlink(file); }
      catch (error) { if (error.code !== 'ENOENT') console.error('Nyris could not remove a legacy resume file.'); }
    }
    res.json({ success: true, message: 'Resume deleted.' });
  } catch (error) {
    next(error);
  }
};
