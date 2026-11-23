const { checkReadiness } = require('../services/ats.service');
const { readDocument } = require('../utils/pdfParser');
const { text } = require('../services/resumeDocument');
const Resume = require('../models/Resume.model');

exports.checkATS = async (req, res, next) => {
  try {
    const body = req.body || {};
    const resumeText = await readDocument(req.files?.resumeFile, body.resumeText, { label: 'resume' });
    const jobDescription = await readDocument(null, body.jobDescription, { label: 'job description', optional: true });
    const report = checkReadiness(resumeText, jobDescription);
    report.targetRole = text(body.targetRole, 100);
    await Resume.create({
      userId: req.user._id,
      type: 'ats_check',
      title: 'ATS Readiness Report',
      atsScore: report.score,
      atsReport: report,
    });
    res.set('Cache-Control', 'private, no-store').json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
