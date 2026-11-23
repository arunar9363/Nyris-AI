const groq = require('../services/groq.service');
const { reviewResume } = require('../services/roaster.service');
const { readDocument } = require('../utils/pdfParser');
const Resume = require('../models/Resume.model');

exports.roastResume = async (req, res, next) => {
  try {
    const body = req.body || {};
    const resumeText = await readDocument(req.files?.resumeFile, body.resumeText, { label: 'resume' });
    const jobDescription = await readDocument(null, body.jobDescription, { label: 'job description', optional: true });
    const roastContent = reviewResume({ resumeText, jobDescription, targetRole: body.targetRole, tone: body.tone });
    if (body.enhance === true || body.enhance === 'true') {
      try {
        const enhancement = await groq.roastResume({ resumeText, targetRole: roastContent.targetRole, tone: roastContent.tone });
        roastContent.coachingNote = enhancement.seriousFeedback;
        roastContent.coachingStatus = enhancement.seriousFeedback ? 'included' : 'unavailable';
      } catch {
        roastContent.coachingStatus = 'unavailable';
      }
    }
    await Resume.create({ userId: req.user._id, type: 'roasted', title: 'Resume Roast', roastContent });
    res.set('Cache-Control', 'private, no-store').json({ success: true, data: roastContent });
  } catch (error) {
    next(error);
  }
};
