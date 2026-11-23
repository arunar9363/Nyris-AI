const { inspectResume, readContact } = require('./resumeInspection');

const commonTerms = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java', 'C++', 'C#', '.NET', 'SQL', 'PostgreSQL', 'MongoDB',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'HTML', 'CSS', 'WordPress',
  'unit testing', 'test automation', 'machine learning', 'data analysis', 'data visualization', 'Power BI', 'Tableau', 'Excel',
  'FastAPI', 'TensorFlow', 'PyTorch', 'Generative AI', 'LLM', 'NLP', 'prompt engineering', 'Figma', 'UX research',
  'project management', 'stakeholder management', 'risk management', 'budget management', 'change management', 'Agile', 'Scrum',
  'customer service', 'customer success', 'account management', 'sales operations', 'lead generation', 'financial reporting',
  'quality assurance', 'process improvement', 'inventory management', 'data entry', 'clinical research', 'case management',
  'technical writing', 'people management', 'team leadership', 'community outreach', 'market research', 'digital marketing',
  'Spring Boot', 'Django', 'Flask', 'Angular', 'Vue.js', 'Next.js', 'Redux', 'Golang', 'Rust', 'PHP', 'Ruby', 'Kotlin',
  'Terraform', 'Linux', 'Jenkins', 'GitHub Actions', 'Apache Kafka', 'Spark', 'Redis', 'Snowflake', 'Databricks', 'dbt',
  'Salesforce', 'SAP', 'Workday', 'HubSpot', 'Zendesk', 'QuickBooks', 'GAAP', 'IFRS', 'financial modeling', 'bookkeeping',
  'business analysis', 'supply chain', 'procurement', 'regulatory compliance', 'patient care', 'statistical analysis', 'SEO',
];

const normalize = value => value.toLowerCase().replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ').trim();
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const aliases = {
  'Node.js': ['NodeJS', 'Node JS'],
  'REST API': ['REST APIs', 'RESTful API', 'RESTful APIs'],
  PostgreSQL: ['Postgres'],
  'unit testing': ['unit tests', 'unit test'],
  'CI/CD': ['CI CD', 'continuous integration and delivery'],
  'Vue.js': ['VueJS', 'Vue JS', 'Vue'],
  'Next.js': ['NextJS', 'Next JS'],
  'Apache Kafka': ['Kafka'],
};
const termPattern = term => {
  const phrases = [term, ...(Object.hasOwn(aliases, term) ? aliases[term] : [])].map(value => escapePattern(normalize(value)));
  return new RegExp('(?<![\\p{L}\\p{N}+#])(?:' + phrases.join('|') + ')(?![\\p{L}\\p{N}+#])', 'giu');
};
const commonTermPatterns = new Map(commonTerms.map(term => [term, termPattern(term)]));
const priorityWeight = { required: 4, preferred: 2, mentioned: 1 };
const evidenceWeight = { 'in-context': 1, mentioned: 0.55, missing: 0 };
const contextSection = /^(?:(?:work|professional|relevant|research|employment|volunteer|internship) )?experience$|^(?:work |employment )history$|^employment$|^internships$|projects?|^resume text$/i;
const learningOnly = /^(?:(?:currently |started )?(?:learning|studying|training in)|(?:beginner in|familiar(?:ity)? with|exposure to|interested in))\b/i;
const extraSections = [
  ['summary', 'Summary'], ['experience', 'Experience'], ['projects', 'Projects'], ['education', 'Education'],
  ['skills', 'Skills'], ['certifications', 'Certifications'], ['additional', 'Additional information'],
];

function isNegated(clause, match) {
  const before = clause.slice(0, match.index).split(/[,;.!?]|\b(?:but|however|although)\b/).at(-1).trim();
  const after = clause.slice(match.index + match[0].length);
  return /\b(?:no (?:prior )?|lack(?:ed|ing|s)?\s+)$/.test(before + ' ')
    || /\b(?:no (?:prior )?(?:experience|proficiency|knowledge|skills?|exposure|familiarity)(?: with| in| of)?|lack(?:ed|ing|s)?(?: experience(?: with| in)?)?|never (?:used|worked with)|(?:not|without) (?:any )?(?:experience(?: with| in)?|proficient in|familiar with)|without)\s+(?:[\p{L}\p{N}+#./-]+\s+(?:(?:and|or)\s+)?)?$/iu.test(before + ' ')
    || /^\s+(?:is |are )?(?:not|no longer)\s+(?:necessary|required|needed)\b/.test(after);
}

function matchPosition(text, term, pattern = commonTermPatterns.get(term) || termPattern(term)) {
  for (const match of text.matchAll(pattern)) {
    if (!isNegated(text, match)) return match;
  }
  return null;
}

function matchedTermsInText(text, terms) {
  const normalized = normalize(text);
  return terms.filter(term => !!matchPosition(normalized, term));
}

const headings = [
  ['required', /^(?:requirements?|(?:minimum|basic|required|essential|mandatory) (?:qualifications?|skills?|requirements?|experience)|must[- ]haves?|what you(?:'|’)ll need|what you (?:need|must have))$/i],
  ['preferred', /^(?:preferred(?: (?:qualifications?|skills?|requirements?|experience))?|desirable(?: skills?)?|nice[- ]to[- ]haves?|bonus(?: points| skills)?|optional(?: skills?)?|additional (?:assets?|preferences?))$/i],
  ['mentioned', /^(?:qualifications?|(?:key |job )?responsibilities|what you(?:'|’)ll do|about (?:the role|the job|you)|skills?|our stack|technology stack|the role|role overview)$/i],
  ['ignore', /^(?:about (?:us|the company)|benefits?(?: and perks)?|perks|what we offer|salary|compensation|how to apply|equal opportunity(?: employer)?|privacy(?: notice)?)$/i],
];
const preferredHint = /\b(?:nice[- ]to[- ]have|preferred|desirable|optional|a plus|bonus|an advantage)\b/i;
const requiredHint = /\b(?:required|mandatory|essential|must(?: have| demonstrate| possess)?|minimum|non[- ]negotiable)\b/i;
const requirementCue = /^(?:(?:(?:hands[- ]on|professional|proven|previous|prior|demonstrated|working)\s+)?(?:experience|proficiency|knowledge|familiarity|skills?)\s+(?:with|in|of|using)|(?:must|required to)\s+(?:have|know|use))\s+/i;
const manualCriterion = /\b(?:\d{1,2}(?:\s*(?:\+|[-–]\s*\d{1,2}))?\s*(?:years?|months?)|(?:bachelor(?:['’]s)?|master(?:['’]s)?|doctoral|associate(?:['’]s)?|college|university)\s+degree|(?:security|active|secret|government) clearance|(?:work|employment) authori[sz]ation|licen[cs]e|citizenship)\b/i;

function jobClauses(raw) {
  let heading = 'mentioned';
  const clauses = [];
  for (const incoming of raw.split(/\r?\n|;\s*|(?<=[.!?])\s+(?=[A-Z])/)) {
    const listPrefix = /^(?:[-*•–]\s*|\d+[.)]\s+)/u;
    const isListItem = listPrefix.test(incoming.trim());
    let value = incoming.trim().replace(listPrefix, '');
    if (!value) continue;
    const colon = value.indexOf(':');
    const title = (colon < 0 ? value : value.slice(0, colon)).trim().replace(/[.!?]$/, '');
    const header = headings.find(([, pattern]) => pattern.test(title));
    if (header) {
      heading = header[0];
      value = colon < 0 ? '' : value.slice(colon + 1).trim();
    }
    if (!value || heading === 'ignore') continue;
    const parts = value.split(/,\s+(?=[^,]{1,100}\b(?:required|preferred|optional|desirable|must have|nice to have)\b)/i)
      .flatMap(part => part.split(/\s+(?=(?:preferred(?: skills| qualifications)?|nice to have|required(?: skills| qualifications)?)\s*:)/i));
    for (const part of parts) {
      const priority = preferredHint.test(part) ? 'preferred' : requiredHint.test(part) ? 'required' : heading;
      clauses.push({ text: part.trim(), priority, explicitList: Boolean(header || isListItem) && heading !== 'mentioned' });
    }
  }
  return clauses;
}

function extraTerms({ text, priority, explicitList }, known, limitingCriterion) {
  if (limitingCriterion || priority === 'mentioned' || (!explicitList && !requirementCue.test(text))) return [];
  const clean = text.replace(requirementCue, '').replace(/\s+(?:is |are )?(?:required|preferred|optional|desirable|a plus)[.!]?$/i, '');
  return clean.split(/\s*(?:,|\band\b|\bor\b)\s*/i)
    .map(value => value.trim().replace(/^[\s([{]+|[\s)\]}.!?]+$/g, ''))
    .filter(value => value.length >= 2 && value.length <= 55 && /^[\p{L}][\p{L}\p{N}#.+/& -]*$/u.test(value))
    .filter(value => value.split(/\s+/).length <= 5 && !/\b(?:with|prior|experience|proficiency|ability|background|knowledge|advantage|required|preferred|must|nice|optional|demonstrated|expertise|them|your|you|our|will|have|without|strong|excellent)\b/i.test(value))
    .filter(value => !matchedTermsInText(value, known).length);
}

function analyzeJob(description) {
  const terms = new Map();
  const manualChecks = [];
  for (const clause of jobClauses(description)) {
    const normalized = normalize(clause.text);
    const criterion = clause.text.match(manualCriterion)?.[0];
    const found = commonTerms.map(term => ({ term, match: matchPosition(normalized, term) })).filter(item => item.match);
    if (criterion && manualChecks.length < 8) {
      manualChecks.push({ source: clause.text.slice(0, 240), priority: clause.priority, detail: 'Check this qualification against your actual history.' });
    }
    const alternatives = new Set();
    const ordered = found.slice().sort((a, b) => a.match.index - b.match.index);
    for (let index = 1; index < ordered.length; index++) {
      const left = ordered[index - 1].match;
      const right = ordered[index].match;
      if (/^\s*(?:,?\s*or|and\/or)\s*$/.test(normalized.slice(left.index + left[0].length, right.index))) {
        alternatives.add(ordered[index - 1].term);
        alternatives.add(ordered[index].term);
      }
    }
    if (alternatives.size && manualChecks.length < 8) {
      manualChecks.push({ source: clause.text.slice(0, 240), priority: clause.priority, detail: 'This line offers alternatives. Confirm which option your experience supports.' });
    }
    for (const term of [...found.map(item => item.term), ...extraTerms(clause, commonTerms, criterion)]) {
      const key = normalize(term);
      const priority = alternatives.has(term) ? 'mentioned' : clause.priority;
      const existing = terms.get(key);
      if (existing && priorityWeight[existing.priority] >= priorityWeight[priority]) continue;
      terms.set(key, { term, priority, source: clause.text.slice(0, 240), ...(alternatives.has(term) ? { alternative: true } : {}) });
    }
  }
  const knownIndex = new Map(commonTerms.map((term, index) => [term, index]));
  const requirements = [...terms.values()]
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || (knownIndex.get(a.term) ?? Infinity) - (knownIndex.get(b.term) ?? Infinity))
    .slice(0, 48);
  return { provided: Boolean(description.trim()), requirements, manualChecks };
}

function evidenceFor(term, inspection) {
  const pattern = termPattern(term);
  const matches = line => !!matchPosition(normalize(line), term, pattern);
  const bullet = inspection.evidence.find(item => contextSection.test(item.section) && !learningOnly.test(item.text) && matches(item.text));
  if (bullet) return { status: 'in-context', excerpt: bullet.text.slice(0, 220), section: bullet.section.slice(0, 100) };

  for (const item of inspection.sections) {
    const line = item.lines.find(matches);
    if (line) return { status: 'mentioned', excerpt: line.slice(0, 220), section: item.title.slice(0, 100) };
  }
  const line = inspection.header.find(matches);
  return line ? { status: 'mentioned', excerpt: line.slice(0, 220), section: 'Opening text' } : { status: 'missing' };
}

function recommendations(requirements, checks, inspection) {
  const missingRequired = requirements.filter(item => item.priority === 'required' && item.status === 'missing');
  const listedRequired = requirements.filter(item => item.priority === 'required' && item.status === 'mentioned');
  const missingPreferred = requirements.filter(item => item.priority === 'preferred' && item.status === 'missing');
  const formatFlags = checks.filter(item => item.key === 'formatting' && !item.met && item.label !== 'Phone');
  const output = [];
  if (missingRequired.length) {
    output.push({ title: 'Review required skills and qualifications', detail: 'Check the posting for ' + missingRequired.slice(0, 5).map(item => item.term).join(', ') + '. Add evidence only for work you can substantiate.', priority: 'high' });
  }
  if (listedRequired.length) {
    output.push({ title: 'Support listed requirements with a contribution', detail: 'For ' + listedRequired.slice(0, 5).map(item => item.term).join(', ') + ', point to a real task or project and describe what you did.', priority: 'high' });
  }
  output.push(...formatFlags.map(item => ({ title: 'Review ' + item.label.toLowerCase(), detail: item.fix, priority: 'high' })));
  if (!inspection.sections.some(item => item.lines.length)) {
    output.push({ title: 'Separate sections with explicit headings', detail: 'Use headings such as Experience, Projects, Education and Skills on their own lines.', priority: 'high' });
  }
  if (missingPreferred.length) {
    output.push({ title: 'Consider preferred skills', detail: 'Review ' + missingPreferred.slice(0, 5).map(item => item.term).join(', ') + ' after addressing required evidence.', priority: 'medium' });
  }
  if (inspection.evidence.length && !inspection.evidence.some(item => item.result || item.metric)) {
    output.push({ title: 'Show the result of your contribution', detail: 'Give a concrete outcome, scope or deliverable. Use a number when you can verify it.', priority: 'medium' });
  }
  return output.slice(0, 7);
}

function checkReadiness(resumeText, jobDescription = '') {
  const inspection = inspectResume(resumeText);
  const sections = new Set(inspection.sections.filter(section => section.lines.length).map(section => section.key));
  const contacts = readContact(resumeText);
  const openingContacts = readContact(inspection.header.join('\n'));
  const contributions = inspection.evidence.filter(item => contextSection.test(item.section));
  const outcomes = contributions.filter(item => item.result || item.metric).length;
  const datedSections = inspection.sections.filter(item => ['experience', 'education', 'projects'].includes(item.key));
  const dateScope = datedSections.length ? datedSections.flatMap(item => item.lines).join('\n') : resumeText;
  const checks = [
    { key: 'sections', label: 'Experience and projects', weight: 9, met: sections.has('experience') || sections.has('projects'),
      strength: 'Experience or projects have a recognizable heading.', fix: 'Use an Experience or Projects heading and include specific contributions.' },
    { key: 'sections', label: 'Education', weight: 8, met: sections.has('education'),
      strength: 'Education has a recognizable heading.', fix: 'Label education clearly when it is relevant to the role.' },
    { key: 'sections', label: 'Skills', weight: 8, met: sections.has('skills'),
      strength: 'Skills have a recognizable heading.', fix: 'List relevant tools and skills under a Skills or Technical Skills heading.' },
    { key: 'formatting', label: 'Email', weight: 7, met: !!contacts.email,
      strength: 'An email address is readable in the text.', fix: 'Place a professional email address in the document body directly under your name.' },
    { key: 'formatting', label: 'Phone', weight: 4, met: !!contacts.phone,
      strength: 'A phone number is readable in the text.', fix: 'Add a readable phone number in the contact line when appropriate.' },
    { key: 'formatting', label: 'Readable characters', weight: 7, met: !/�|[\u0000\u0008-\u000b\u000e-\u001f]|\{\{[^}]+}}/.test(resumeText),
      strength: 'The extracted text has readable characters and no unresolved template placeholders.', fix: 'Export a fresh text-based document and check that the copied text is intact.' },
    { key: 'formatting', label: 'Contact placement', weight: 4, met: !!(openingContacts.email || openingContacts.phone),
      strength: 'A contact detail appears before the first recognized section.', fix: 'Place your email or phone near the top of the document body and check the extracted order.' },
    { key: 'formatting', label: 'Spaced letters', weight: 3, met: !/(?:^|[ \t])(?:\p{L}[ \t]+){5,}\p{L}(?=[ \t.,:!?]|$)/mu.test(resumeText),
      strength: 'Common character-spacing problems were not detected in the extracted text.', fix: 'Check any headings with letters split apart and re-export with conventional text spacing.' },
    { key: 'readability', label: 'Detail', weight: 6, met: inspection.words >= 70,
      strength: 'The text contains enough detail for a first review.', fix: 'Add concise details about relevant work, projects, or education.' },
    { key: 'readability', label: 'Contributions', weight: 8, met: contributions.length > 0,
      strength: 'Specific contributions are present in the extracted text.', fix: 'Use short bullets that describe an action and its result where you can verify it.' },
    { key: 'readability', label: 'Dates', weight: 7, met: /\b(?:19|20)\d{2}\b/.test(dateScope),
      strength: 'The text contains dated experience or education.', fix: 'Add consistent dates, such as May 2024 – Present.' },
    { key: 'readability', label: 'Outcomes or scope', weight: 4, met: outcomes > 0,
      strength: 'A contribution describes a result or scope.', fix: 'Add a concrete result, deliverable, scale, or audience to a contribution you made.' },
  ];
  const job = analyzeJob(jobDescription);
  const requirements = job.requirements.map(item => ({ ...item, ...evidenceFor(item.term, inspection) }));
  const weightedRequirements = requirements.filter(item => !item.alternative);
  const termEvidence = requirements.map(({ term, status, excerpt, section }) => ({
    term, status, ...(excerpt ? { excerpt, section } : {}),
  }));
  const matched = termEvidence.filter(item => item.status !== 'missing').map(item => item.term);
  const missingKeywords = weightedRequirements.filter(item => item.status === 'missing').map(item => item.term);
  const groups = [
    ['formatting', 'Extracted text', 'Detected contact details, character integrity and contact placement.'],
    ['sections', 'Section structure', 'Detectable sections with content for skills, education, and experience or projects.'],
    ['readability', 'Experience evidence', 'Readable detail, dates, contributions and visible outcomes or scope.'],
  ];
  const dimensions = groups.map(([key, label, description]) => ({
    key, label, description, possible: 25,
    earned: checks.filter(check => check.key === key && check.met).reduce((sum, check) => sum + check.weight, 0),
  }));
  if (weightedRequirements.length) {
    const weight = weightedRequirements.reduce((sum, item) => sum + priorityWeight[item.priority], 0);
    const earned = weightedRequirements.reduce((sum, item) => sum + priorityWeight[item.priority] * evidenceWeight[item.status], 0);
    dimensions.push({
      key: 'keywords', label: 'Job evidence', possible: 25, earned: Math.round(25 * earned / weight),
      description: 'Required terms carry four times the weight of general terms. Preferred terms carry twice the weight. A mention earns 55% of the contribution credit.',
    });
  }
  const scoreBreakdown = Object.fromEntries(dimensions.map(item => [item.key, item.earned]));
  const possible = dimensions.reduce((sum, item) => sum + item.possible, 0);
  const earned = dimensions.reduce((sum, item) => sum + item.earned, 0);
  const score = Math.round(100 * earned / possible);
  const needsWork = checks.filter(check => !check.met);
  const documentChecks = checks.map(check => ({ label: check.label, passed: check.met, detail: check.met ? check.strength : check.fix }));
  const required = requirements.filter(item => item.priority === 'required');
  const preferred = requirements.filter(item => item.priority === 'preferred');
  const totals = items => ({ matched: items.filter(item => item.status !== 'missing').length, evidenced: items.filter(item => item.status === 'in-context').length });
  const requiredTotals = totals(required);
  const preferredTotals = totals(preferred);
  return {
    score,
    scoreBreakdown,
    missingKeywords,
    matchedKeywords: matched,
    formattingIssues: needsWork.filter(check => check.key === 'formatting').map(check => check.fix),
    suggestions: [
      ...needsWork.filter(check => check.key !== 'formatting').map(check => check.fix),
      ...(missingKeywords.length ? ['Review the unmatched terms. Include a term only when it describes your actual experience.'] : []),
    ],
    strengths: checks.filter(check => check.met).map(check => check.strength),
    documentChecks,
    termEvidence,
    evaluatedWithJobDescription: weightedRequirements.length > 0,
    advanced: {
      job: {
        provided: job.provided, requirements, manualChecks: job.manualChecks,
        matchedRequired: requiredTotals.matched, totalRequired: required.length, evidencedRequired: requiredTotals.evidenced,
        matchedPreferred: preferredTotals.matched, totalPreferred: preferred.length, evidencedPreferred: preferredTotals.evidenced,
      },
      parsing: {
        sections: extraSections.map(([key, name]) => ({
          name, present: sections.has(key), items: inspection.sections.filter(item => item.key === key).reduce((sum, item) => sum + item.lines.length, 0),
        })),
        words: inspection.words, lines: resumeText.split(/\r?\n/).filter(line => line.trim()).length,
        contributions: contributions.length, withOutcome: outcomes, signals: documentChecks,
      },
      recommendations: recommendations(requirements, checks, inspection),
      scoring: { label: 'ATS readiness estimate', dimensions, earned, possible },
    },
  };
}

module.exports = { checkReadiness, matchedTermsInText };
