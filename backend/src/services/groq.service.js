const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Optimize resume content against a job description
 */
exports.optimizeResume = async ({ resumeText, jobDescription, customSuggestions, personalInfo }) => {
  const prompt = `You are an expert ATS resume optimizer and career coach. Optimize the following resume for the given job description.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME:
${resumeText}

CUSTOM SUGGESTIONS FROM USER:
${customSuggestions || 'None provided'}

PERSONAL INFO TO USE:
- Name: ${personalInfo.name || 'N/A'}
- Email: ${personalInfo.email || 'N/A'}
- Phone: ${personalInfo.phone || 'N/A'}
- LinkedIn: ${personalInfo.linkedin || 'N/A'}
- GitHub: ${personalInfo.github || 'N/A'}
- Portfolio: ${personalInfo.portfolio || 'N/A'}
- Project Links: ${personalInfo.projectLinks?.join(', ') || 'N/A'}

INSTRUCTIONS:
1. Optimize bullet points to match JD keywords naturally
2. Add missing skills/keywords that are present in JD but missing in resume
3. Improve action verbs and quantify achievements where possible
4. Maintain authenticity - don't fabricate experience
5. Structure for maximum ATS compatibility
6. Score should aim for 85-100 ATS rating

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "optimizedData": {
    "name": "candidate name",
    "email": "email",
    "phone": "phone",
    "linkedin": "linkedin url",
    "github": "github url",
    "portfolio": "portfolio url",
    "summary": "optimized professional summary",
    "education": [{"institution": "", "degree": "", "location": "", "dates": ""}],
    "experience": [{"title": "", "company": "", "location": "", "dates": "", "bullets": []}],
    "projects": [{"name": "", "tech": "", "date": "", "bullets": [], "live": "", "github": ""}],
    "skills": {"categories": [{"label": "", "items": ""}]},
    "certifications": [{"name": "", "issuer": ""}]
  },
  "atsScore": 88,
  "comparison": {
    "added": ["keyword1", "skill2"],
    "removed": ["outdated term"],
    "improved": ["bullet point improved", "summary enhanced"]
  },
  "suggestions": ["suggestion 1", "suggestion 2"],
  "keywordImprovements": ["added React hooks", "added CI/CD pipeline"]
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0].message.content.trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');
  return JSON.parse(jsonMatch[0]);
};

/**
 * Check ATS score for a resume
 */
exports.checkATS = async ({ resumeText, jobDescription }) => {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume${jobDescription ? ' against the provided job description' : ''}.

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "score": 78,
  "missingKeywords": ["keyword1", "keyword2"],
  "formattingIssues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "strengths": ["strength1", "strength2"],
  "scoreBreakdown": {
    "keywords": 25,
    "formatting": 20,
    "sections": 18,
    "readability": 15
  }
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 2048,
  });

  const content = response.choices[0].message.content.trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');
  return JSON.parse(jsonMatch[0]);
};

/**
 * Roast the resume
 */
exports.roastResume = async ({ resumeText }) => {
  const prompt = `You are a brutally honest but funny and helpful career coach. Roast this resume in a humorous yet constructive way.

RESUME:
${resumeText}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "funnyRoast": "A funny, sarcastic but not offensive roast of the resume (2-3 paragraphs)",
  "seriousFeedback": "Honest, professional feedback on the overall quality",
  "mistakesBreakdown": ["mistake1", "mistake2", "mistake3"],
  "improvementTips": ["tip1", "tip2", "tip3", "tip4"],
  "overallRating": "C+",
  "verdict": "One-liner funny verdict about the resume"
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });

  const content = response.choices[0].message.content.trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');
  return JSON.parse(jsonMatch[0]);
};

/**
 * Build resume from form data
 */
exports.buildResume = async ({ formData, domain }) => {
  const prompt = `You are an expert resume writer specializing in ${domain} roles. Create an ATS-optimized resume from this data.

USER PROVIDED DATA:
${JSON.stringify(formData, null, 2)}

TARGET DOMAIN: ${domain}

INSTRUCTIONS:
1. Write compelling, quantified bullet points
2. Use strong action verbs
3. Optimize for ATS (target score 90-100)
4. Add relevant technical keywords for ${domain}
5. Make the summary powerful and role-specific

Return ONLY a valid JSON object with this exact structure (no markdown):
{
  "optimizedData": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "summary": "",
    "education": [{"institution": "", "degree": "", "location": "", "dates": ""}],
    "experience": [{"title": "", "company": "", "location": "", "dates": "", "bullets": []}],
    "projects": [{"name": "", "tech": "", "date": "", "bullets": [], "live": "", "github": ""}],
    "skills": {"categories": [{"label": "", "items": ""}]},
    "certifications": [{"name": "", "issuer": ""}]
  },
  "atsScore": 94
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0].message.content.trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');
  return JSON.parse(jsonMatch[0]);
};
