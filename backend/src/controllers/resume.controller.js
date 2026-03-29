const path = require('path');
const { v4: uuidv4 } = require('uuid');
const groqService = require('../services/groq.service');
const pdfService = require('../services/pdf.service');
const { extractTextFromPDF, extractTextFromTXT, cleanupFile } = require('../utils/pdfParser');
const Resume = require('../models/Resume.model');

/**
 * POST /api/resume/optimize
 * Step-by-step JD → Resume optimizer
 */
exports.optimizeResume = async (req, res, next) => {
  let resumeFilePath = null
  let jdFilePath = null
  try {
    const {
      jobDescription,
      customSuggestions,
      name, email, phone, linkedin, github, portfolio, projectLinks,
      templateId = 'minimal',
      sessionId,
    } = req.body

    // req.files is an object with fields when using upload.fields()
    const resumeFileObj = req.files?.resumeFile?.[0] || null
    const jdFileObj = req.files?.jdFile?.[0] || null

    // Extract resume text
    let resumeText = ''
    if (resumeFileObj) {
      resumeFilePath = resumeFileObj.path
      const ext = path.extname(resumeFileObj.originalname).toLowerCase()
      if (ext === '.pdf') {
        resumeText = await extractTextFromPDF(resumeFilePath)
      } else {
        resumeText = extractTextFromTXT(resumeFilePath)
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Resume content is required.' })
    }

    // Extract JD text — from body or uploaded file
    let finalJD = jobDescription || ''
    if (jdFileObj) {
      jdFilePath = jdFileObj.path
      const ext = path.extname(jdFileObj.originalname).toLowerCase()
      const isImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)
      if (isImage) {
        // For images: pass filename as note — Groq will handle the text JD
        // In a full implementation you'd use OCR here; for now we note it
        finalJD = finalJD || `[JD uploaded as image: ${jdFileObj.originalname}. Please optimize based on resume content and general best practices.]`
      } else if (ext === '.pdf') {
        finalJD = await extractTextFromPDF(jdFilePath)
      } else {
        finalJD = extractTextFromTXT(jdFilePath)
      }
    }

    if (!finalJD.trim()) {
      return res.status(400).json({ success: false, message: 'Job description is required.' })
    }

    const personalInfo = {
      name: name || '',
      email: email || '',
      phone: phone || '',
      linkedin: linkedin || '',
      github: github || '',
      portfolio: portfolio || '',
      projectLinks: projectLinks ? (Array.isArray(projectLinks) ? projectLinks : [projectLinks]) : [],
    }

    // AI optimization
    const aiResult = await groqService.optimizeResume({
      resumeText,
      jobDescription: finalJD,
      customSuggestions,
      personalInfo,
    })

    const { optimizedData, atsScore, comparison, suggestions, keywordImprovements } = aiResult

    // Generate PDF
    const filename = `resume-${uuidv4()}.pdf`
    const { html: optimizedHtml, pdfPath } = await pdfService.generateResumePdf(
      templateId,
      optimizedData,
      filename
    )

    const pdfUrl = `/uploads/pdfs/${filename}`

    // Save to DB
    const resumeDoc = await Resume.create({
      userId: req.user?._id || null,
      sessionId: sessionId || null,
      type: 'optimized',
      title: `${optimizedData.name || 'Resume'} - ${templateId}`,
      templateId,
      originalResumeText: resumeText,
      jobDescription: finalJD,
      optimizedHtml,
      pdfPath: pdfUrl,
      atsScore,
      atsReport: {
        missingKeywords: [],
        suggestions: suggestions || [],
      },
      personalInfo,
      comparison: {
        addedContent: comparison?.added || [],
        removedContent: comparison?.removed || [],
        improvedContent: comparison?.improved || [],
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        resumeId: resumeDoc._id,
        optimizedHtml,
        pdfUrl,
        atsScore,
        comparison,
        suggestions,
        keywordImprovements,
        optimizedData,
      },
    })
  } catch (error) {
    next(error)
  } finally {
    if (resumeFilePath) cleanupFile(resumeFilePath)
    if (jdFilePath) cleanupFile(jdFilePath)
  }
}

/**
 * POST /api/resume/build
 * Resume Builder
 */
exports.buildResume = async (req, res, next) => {
  try {
    const { formData, domain = 'Full Stack', templateId = 'minimal' } = req.body;

    if (!formData) {
      return res.status(400).json({ success: false, message: 'Form data is required.' });
    }

    const aiResult = await groqService.buildResume({ formData, domain });
    const { optimizedData, atsScore } = aiResult;

    const filename = `resume-${uuidv4()}.pdf`;
    const { html: optimizedHtml, pdfPath } = await pdfService.generateResumePdf(
      templateId,
      optimizedData,
      filename
    );

    const pdfUrl = `/uploads/pdfs/${filename}`;

    const resumeDoc = await Resume.create({
      userId: req.user?._id || null,
      type: 'built',
      title: `${optimizedData.name || 'Resume'} - ${domain}`,
      templateId,
      optimizedHtml,
      pdfPath: pdfUrl,
      atsScore,
      personalInfo: {
        name: optimizedData.name,
        email: optimizedData.email,
        phone: optimizedData.phone,
      },
    });

    return res.status(200).json({
      success: true,
      data: { resumeId: resumeDoc._id, optimizedHtml, pdfUrl, atsScore, optimizedData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resume/history
 */
exports.getHistory = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-optimizedHtml -originalResumeText')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resume/:id
 */
exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
    if (resume.userId && resume.userId.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/resume/:id/favorite
 */
exports.toggleFavorite = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
    resume.isFavorite = !resume.isFavorite;
    await resume.save();
    res.json({ success: true, data: { isFavorite: resume.isFavorite } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resume/:id
 */
exports.deleteResume = async (req, res, next) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Resume deleted.' });
  } catch (error) {
    next(error);
  }
};
