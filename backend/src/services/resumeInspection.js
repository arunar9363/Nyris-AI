const sectionNames = {
  summary: /^(?:professional |career |executive )?(?:summary|profile|objective)$|^about me$/i,
  experience: /^(?:(?:work|professional|relevant|research|employment|volunteer|internship) )?experience$|^(?:work |employment )history$|^employment$|^internships$/i,
  projects: /^(?:(?:selected|technical|academic|personal|research) )?projects?$|^portfolio projects$/i,
  education: /^(?:education|academic background|academic qualifications|qualifications|education and training)$/i,
  skills: /^(?:(?:technical|core|relevant|key|professional) )?(?:skills|competencies)$|^tools and technologies$/i,
  certifications: /^(?:(?:professional )?certifications?|certificates|licenses|licences|credentials|(?:certifications (?:and|&) licen[cs]es|licen[cs]es (?:and|&) certifications))$/i,
  additional: /^(?:achievements|awards(?: and honors)?|honors(?: and awards)?|publications|(?:community|volunteer) work|volunteering|leadership(?: and activities)?|activities|languages|training|additional information)$/i,
};

const bulletPrefix = /^\s*(?:[-–—•▪●◦*·]|\d{1,2}[.)])\s+/u;
const actionStart = /^(?:achieved|added|analyzed|analysed|authored|automated|built|coached|created|designed|deployed|developed|delivered|documented|engineered|evaluated|identified|implemented|improved|increased|integrated|launched|led|maintained|managed|measured|orchestrated|organized|optimized|partnered|performed|planned|prepared|presented|reconciled|reduced|resolved|reviewed|shipped|tested|trained|wrote)\b/i;
const resultSignal = /\b(?:reduc(?:ed|ing)|increas(?:ed|ing)|improv(?:ed|ing)|cut|saved|accelerated|eliminated|prevented|enabled|result(?:ed|ing) in|so (?:that|the))\b/i;
const metricSignal = /(?:[$€£₹]\s*\d|\d(?:[\d,.]*\d)?(?:\s*(?:%|percent\b|(?:ms|requests|users|customers|members|hours|days|minutes|tests|records|teams|projects|clients|sites|hours\/week)\b)))/i;
const vagueStart = /^(?:responsible for|worked on|helped with|involved in|assisted with|tasked with|participated in)\b/i;
const emailPattern = /\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b/i;

function parseHeading(line) {
  const separator = line.indexOf(':');
  const title = (separator < 0 ? line : line.slice(0, separator)).trim().replace(/\s*[-–—]\s*$/, '');
  const match = Object.entries(sectionNames).find(([, pattern]) => pattern.test(title));
  if (!match) return null;
  return { key: match[0], title, inline: separator < 0 ? '' : line.slice(separator + 1).trim() };
}

function inspectResume(resumeText) {
  const header = [];
  const sections = [];
  const evidence = [];
  let section;
  for (const raw of resumeText.split(/\r?\n/)) {
    const line = raw.trim().replace(/\t+/g, ' | ');
    if (!line) continue;
    const heading = parseHeading(line);
    if (heading) {
      section = { key: heading.key, title: heading.title, lines: [] };
      sections.push(section);
      if (heading.inline) section.lines.push(heading.inline);
      continue;
    }
    if (section) section.lines.push(line);
    else header.push(line);
    const value = line.replace(bulletPrefix, '');
    if (value !== line || (section && ['experience', 'projects'].includes(section.key) && actionStart.test(line))) {
      evidence.push({
        text: value,
        section: section?.title || 'Resume text',
        words: value.split(/\s+/).length,
        action: actionStart.test(value),
        vague: vagueStart.test(value),
        result: resultSignal.test(value),
        metric: metricSignal.test(value),
      });
    }
  }
  return { header, sections, evidence, words: resumeText.trim().split(/\s+/).filter(Boolean).length };
}

function readContact(value) {
  const email = value.match(emailPattern)?.[0] || '';
  const phone = (value.match(/(?:\+?\d[\d.() -]{6,}\d)/g) || []).find(number =>
    !/^\d{4}\s*[-–—]\s*\d{4}$/.test(number.trim()) && /^\d{8,15}$/.test(number.replace(/\D/g, '')),
  )?.trim() || '';
  return { email, phone };
}

module.exports = { inspectResume, readContact, bulletPrefix, actionStart };
