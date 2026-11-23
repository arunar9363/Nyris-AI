const { inspectResume } = require('./resumeInspection');
const { checkReadiness, matchedTermsInText } = require('./ats.service');
const { text } = require('./resumeDocument');

const tones = ['direct', 'coach', 'playful'];
const maxDisplayedBullets = 36;
const longBulletWords = 35;
const writingSections = new Set(['summary', 'experience', 'projects', 'additional']);
const specificOpening = /^(?:co-)?(?:build|coordinate[ds]?|designs?|deliver|develop|facilitate[ds]?|implement|improve|investigate[ds]?|launch|lead|maintain|manage|migrate[ds]?|optimi[sz]e[ds]?|refactor(?:ed|s)?|ship|streamline[ds]?|support(?:ed|s)?|troubleshoot|write)\b/i;
const contextSignal = /\b(?:across\s+\S+|(?:for|to|serving|used by|adopted by|supporting|covering)\s+(?:[\p{L}\p{N}-]+\s+){0,4}(?:users?|customers?|clients?|teams?|departments?|regions?|sites?|stores?|systems?|services?|accounts?|endpoints?|courses?|cohorts?|patients?|students?|workflows?|releases?|environments?))\b/iu;
const scopeQuantity = /\b\d+(?:[.,]\d+)*(?:[kKmMbB])?\+?\s+(?:users?|customers?|clients?|teams?|departments?|regions?|sites?|stores?|systems?|services?|accounts?|endpoints?|courses?|cohorts?|patients?|students?|workflows?|releases?|environments?|records?|reports?|requests?|tests?|projects?|members?|vendors?|interviews?|tickets?|engineers?|employees?)\b/i;
const quantitySignal = /\b\d+(?:[.,]\d+)*(?:[kKmMbB])?\s*(?:%|(?:seconds?|milliseconds?|ms|minutes?|hours?|days?|weeks?|months?|years?|percentage points?|percent)\b)|[$£€₹]\s*\d/i;
const outcomeClaim = /\b(?:saved|saving|reduced|reducing|cut|cutting|eliminated|eliminating|prevented|preventing|increased|increasing|improved|improving|accelerated|accelerating|shortened|expanded|grew|raised|doubled|resulted in|led to)\s+\S+/gi;
const hypotheticalPrefix = /\b(?:to|could|would|should|not|never|potentially|aimed at|(?:goal|aim|objective) of)\s*(?:(?:significantly|directly|substantially)\s*)?$/i;
const numericComparison = /\bfrom\s+\d[\d.,%]*(?:\s+[\p{L}%]+){0,2}\s+to\s+\d/giu;
const projectedComparison = /\b(?:aimed|intended|planned|expected|projected|forecast|targeted|estimated|goal)\b/i;

const issuesById = {
  ownership: {
    title: 'Name your contribution',
    detail: 'Use an opening verb that describes your own work and specify what you owned or supported.',
    question: 'What did you personally do, and what work belonged to the team?',
    scaffold: '[Your verified action] on [the deliverable], working with [the team or stakeholder] where relevant.',
  },
  action: {
    title: 'Lead with the work you did',
    detail: 'Make your action and deliverable easy to spot near the start of the bullet.',
    question: 'What did you build, change, coordinate, investigate, or deliver?',
    scaffold: '[Action you took] [deliverable or task] using [verified approach or method].',
  },
  duplicate: {
    title: 'Remove the repeated bullet',
    detail: 'Keep the clearest version and use the available space for different work.',
    question: 'Which role or project gives this contribution the clearest context?',
    scaffold: 'Keep one version of the bullet and replace the repeated entry with [another verified contribution], if available.',
  },
  length: {
    title: 'Shorten the long bullet',
    detail: 'Lead with the main action. Split separate contributions into separate bullets.',
    question: 'What should a reader remember after one pass?',
    scaffold: '[Main action and deliverable]. Add [secondary contribution] as its own bullet if it supports the role.',
  },
  outcome: {
    title: 'Show what the work achieved',
    detail: 'Add a verified result, such as a change in reliability, completion time, or customer experience.',
    question: 'What changed after the work, and what source could confirm it?',
    scaffold: '[Action and deliverable], which [verified result, qualitative or measured].',
  },
  scope: {
    title: 'Give the work context',
    detail: 'Name the audience, system, workflow, volume, or constraint that helps a reader understand the work.',
    question: 'Who used the work, where did it apply, or how large was it?',
    scaffold: '[Action and deliverable] for [verified audience or system] at [verified scale, when useful].',
  },
  connection: {
    title: 'Connect the work to the target role',
    detail: 'Show the relevant responsibility or skill through the work described here when there is a real connection.',
    question: 'Which responsibility in the posting does this contribution demonstrate?',
    scaffold: '[Action that demonstrates a relevant skill] on [actual work], with [verifiable result if available].',
  },
};

const sentenceFor = (tone, gaps) => {
  if (tone === 'playful') return gaps
    ? 'Your experience is doing the work. A few of these bullets are taking the credit without showing the receipts.'
    : 'The bullets brought receipts. Keep that energy when you tailor them to the next job.';
  return tone === 'coach'
    ? 'Start with the strongest evidence you already have. These edits will make it easier for a reader to find.'
    : 'Start with the findings below. They are backed by wording or sections found in your resume.';
};

function statesOutcome(line) {
  for (const match of line.matchAll(outcomeClaim)) {
    const prefix = line.slice(Math.max(0, match.index - 48), match.index).trimEnd();
    if (!hypotheticalPrefix.test(prefix)) return true;
  }
  return Array.from(line.matchAll(numericComparison)).some(match => {
    const prefix = line.slice(Math.max(0, match.index - 55), match.index);
    return !projectedComparison.test(prefix);
  });
}

function inspectBullet(line, index, seen, jobTerms) {
  const action = line.vague ? 'vague' : line.action || specificOpening.test(line.text) ? 'specific' : 'unclear';
  const numberedScope = scopeQuantity.test(line.text);
  const hasScope = numberedScope || contextSignal.test(line.text);
  const hasOutcome = statesOutcome(line.text);
  const hasNumbers = numberedScope || line.metric || quantitySignal.test(line.text);
  const matchedTerms = matchedTermsInText(line.text, jobTerms);
  const wording = line.text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').replace(/[.,;!?]+$/u, '').trim();
  const duplicateOf = seen.get(wording);
  if (!duplicateOf) seen.set(wording, index);

  const issueIds = [
    action === 'vague' ? 'ownership' : action === 'unclear' ? 'action' : null,
    duplicateOf ? 'duplicate' : null,
    line.words > longBulletWords ? 'length' : null,
    hasOutcome ? null : 'outcome',
    hasScope ? null : 'scope',
    jobTerms.length && !matchedTerms.length && (action !== 'specific' || (!hasScope && !hasOutcome)) ? 'connection' : null,
  ].filter(Boolean);
  const issues = issueIds.map(id => {
    const { title, detail } = issuesById[id];
    return { id, title, detail: id === 'duplicate' ? 'This repeats bullet ' + duplicateOf + '. ' + detail : detail };
  });
  const firstIssue = issuesById[issueIds[0]];
  const needsWork = action !== 'specific' || !!duplicateOf || line.words > longBulletWords || (!hasScope && !hasOutcome);

  return {
    index,
    section: text(line.section, 80),
    text: text(line.text, 400),
    status: needsWork ? 'needs-work' : issues.length ? 'solid' : 'strong',
    action,
    hasScope,
    hasOutcome,
    hasNumbers,
    matchedTerms,
    issues,
    ...(firstIssue ? { coaching: { question: firstIssue.question, scaffold: firstIssue.scaffold } } : {}),
  };
}

function summarizeBullets(bullets) {
  const sections = new Map();
  const issueGroups = new Map();
  let actionLed = 0;
  let needsAttention = 0;
  let withScope = 0;
  let withOutcome = 0;
  let withNumbers = 0;
  for (const bullet of bullets) {
    if (!sections.has(bullet.section)) {
      sections.set(bullet.section, { name: bullet.section, bulletCount: 0, needsAttention: 0, withScope: 0, withOutcome: 0 });
    }
    const section = sections.get(bullet.section);
    section.bulletCount++;
    if (bullet.action === 'specific') actionLed++;
    if (bullet.status === 'needs-work') {
      needsAttention++;
      section.needsAttention++;
    }
    if (bullet.hasScope) {
      withScope++;
      section.withScope++;
    }
    if (bullet.hasOutcome) {
      withOutcome++;
      section.withOutcome++;
    }
    if (bullet.hasNumbers) withNumbers++;
    for (const issue of bullet.issues) {
      const group = issueGroups.get(issue.id);
      if (group) group.count++;
      else issueGroups.set(issue.id, { count: 1, sample: bullet });
    }
  }
  return {
    summary: {
      bulletsAnalyzed: bullets.length, bulletsShown: Math.min(bullets.length, maxDisplayedBullets), needsAttention, actionLed, withScope, withOutcome, withNumbers,
    },
    sections: [...sections.values()],
    issueGroups,
  };
}

function reviewResume({ resumeText, jobDescription = '', targetRole = '', tone = 'direct' }) {
  const selectedTone = tones.includes(tone) ? tone : 'direct';
  const { evidence, sections, words } = inspectResume(resumeText);
  const readiness = checkReadiness(resumeText, jobDescription);
  const headings = new Set(sections.map(section => section.key));
  const contributionHeadings = new Set(sections.filter(section => writingSections.has(section.key)).map(section => section.title));
  const contributions = evidence.filter(line => contributionHeadings.has(line.section) || line.section === 'Resume text');
  const jobTerms = readiness.termEvidence.map(item => item.term);
  const seen = new Map();
  const bullets = contributions.map((line, index) => inspectBullet(line, index + 1, seen, jobTerms));
  const { summary, sections: sectionSummaries, issueGroups } = summarizeBullets(bullets);
  const shouldShorten = issueGroups.get('length')?.count || 0;
  const listedSkills = readiness.advanced.job.requirements.filter(item => !item.alternative && item.status === 'mentioned').map(item => item.term);
  const finding = (id, title, action, sample, priority, count) => ({
    id, title, action, evidence: sample?.text || '', section: sample?.section || '', priority, count,
  });
  const bulletFinding = id => {
    const issue = issueGroups.get(id);
    if (!issue) return null;
    const { title, detail } = issuesById[id];
    const priority = ['ownership', 'action', 'duplicate'].includes(id) ? 'Fix first' : 'Improve';
    return finding(id, title, detail, issue.sample, priority, issue.count);
  };
  const findings = [
    !headings.has('experience') && !headings.has('projects')
      ? finding('structure', 'Give your experience a clear heading', 'Use Experience or Projects above the work you want a recruiter to find first.', null, 'Fix first', 1) : null,
    !bullets.length
      ? finding('bullets', 'Show your contributions in bullets', 'Under each role or project, describe your concrete work and how it helped.', null, 'Fix first', 1) : null,
    !readiness.documentChecks.find(check => check.label === 'Email')?.passed
      ? finding('contact', 'Make your email easy to find', 'Put a current email address beneath your name in the body of the resume.', null, 'Fix first', 1) : null,
    ...['ownership', 'action', 'duplicate', 'outcome', 'scope', 'length'].map(bulletFinding),
    listedSkills.length ? finding('listed', 'Show how a listed skill was used',
      'Connect ' + listedSkills.slice(0, 5).join(', ') + ' to a real project or contribution where relevant.',
      null, 'Improve', listedSkills.length) : null,
    readiness.missingKeywords.length ? finding('relevance', 'Review uncovered job terms',
      'Review ' + readiness.missingKeywords.slice(0, 5).join(', ') + '. Add a term where your experience supports it.',
      null, 'Improve', readiness.missingKeywords.length) : null,
  ].filter(Boolean);
  const outcomeOrScope = bullets.filter(bullet => bullet.hasOutcome || bullet.hasScope).length;
  const bulletCount = bullets.length;
  const percent = count => bulletCount ? Math.round(count * 100 / bulletCount) : 0;
  const rubric = [
    { label: 'Structure', summary: headings.size ? headings.size + ' recognizable sections' : 'Use recognizable section headings', score: Math.min(100, headings.size * 25) },
    { label: 'Specific actions', summary: summary.actionLed + ' of ' + bulletCount + ' bullets start with a recognized action', score: percent(summary.actionLed) },
    { label: 'Scope and outcomes', summary: summary.withOutcome + ' stated outcomes and ' + summary.withScope + ' bullets with scope', score: percent(outcomeOrScope) },
    { label: 'Brevity', summary: bulletCount ? (bulletCount - shouldShorten) + ' bullets use ' + longBulletWords + ' words or fewer' : words + ' readable words', score: percent(bulletCount - shouldShorten) },
  ];
  const average = rubric.reduce((sum, item) => sum + item.score, 0) / rubric.length;
  const role = text(targetRole, 100);
  const strong = bullets.find(bullet => bullet.action === 'specific' && bullet.hasOutcome)
    || bullets.find(bullet => bullet.action === 'specific' && bullet.hasNumbers);
  return {
    overallRating: average >= 85 ? 'A' : average >= 70 ? 'B' : average >= 50 ? 'C' : average >= 35 ? 'D' : 'E',
    verdict: average >= 75 ? 'Your strongest evidence is easy to spot.' : 'Lead with concrete work and show what it achieved.',
    funnyRoast: sentenceFor(selectedTone, findings.length),
    seriousFeedback: (role ? 'Review for ' + role + '. ' : '') + sentenceFor('direct', findings.length),
    mistakesBreakdown: findings.map(item => item.title),
    improvementTips: findings.slice(0, 4).map(item => item.action),
    rubric,
    findings,
    evidenceHighlight: strong ? { text: strong.text, section: strong.section } : undefined,
    targetRole: role,
    tone: selectedTone,
    matchedKeywords: readiness.matchedKeywords,
    missingKeywords: readiness.missingKeywords,
    detailedReview: {
      summary,
      sections: sectionSummaries,
      priorities: findings.map(({ id, title, action, priority, count }) => ({ id, title, detail: action, priority, count })),
      bullets: bullets.slice(0, maxDisplayedBullets),
    },
  };
}

module.exports = { reviewResume };
