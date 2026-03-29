const path = require('path');
const groqService = require('../services/groq.service');
const { extractTextFromPDF, extractTextFromTXT, cleanupFile } = require('../utils/pdfParser');
const Resume = require('../models/Resume.model');

exports.checkATS = async (req, res, next) => {
  let uploadedFilePath = null;
  try {
    const { jobDescription } = req.body;

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

    const result = await groqService.checkATS({ resumeText, jobDescription });

    if (req.user) {
      await Resume.create({
        userId: req.user._id,
        type: 'ats_check',
        title: 'ATS Check Report',
        originalResumeText: resumeText,
        jobDescription: jobDescription || '',
        atsScore: result.score,
        atsReport: {
          missingKeywords: result.missingKeywords || [],
          formattingIssues: result.formattingIssues || [],
          suggestions: result.suggestions || [],
          strengths: result.strengths || [],
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
