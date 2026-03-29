const path = require('path');
const groqService = require('../services/groq.service');
const { extractTextFromPDF, extractTextFromTXT, cleanupFile } = require('../utils/pdfParser');
const Resume = require('../models/Resume.model');

exports.roastResume = async (req, res, next) => {
  let uploadedFilePath = null;
  try {
    let resumeText = '';
    if (req.file) {
      uploadedFilePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      resumeText = ext === '.pdf'
        ? await extractTextFromPDF(uploadedFilePath)
        : extractTextFromTXT(uploadedFilePath);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Resume content is required.' });
    }

    const result = await groqService.roastResume({ resumeText });

    if (req.user) {
      await Resume.create({
        userId: req.user._id,
        type: 'roasted',
        title: 'Resume Roast',
        originalResumeText: resumeText,
        roastContent: {
          funnyRoast: result.funnyRoast,
          seriousFeedback: result.seriousFeedback,
          mistakesBreakdown: result.mistakesBreakdown || [],
          improvementTips: result.improvementTips || [],
        },
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  } finally {
    if (uploadedFilePath) cleanupFile(uploadedFilePath);
  }
};
