const { inspectResume, readContact } = require('./resumeInspection');
const { normalizeResume, webLink } = require('./resumeDocument');

function resumeFromSource(source, contact) {
  const { header, sections } = inspectResume(source);
  const first = header[0]?.split('|')[0].trim() || '';
  const name = /^[\p{L}\p{M}][\p{L}\p{M}.'’ -]{1,89}$/u.test(first)
    && !/^(?:resume|curriculum vitae|cv)$/i.test(first) && first.split(/\s+/).length <= 7 ? first : '';
  const headerText = header.join('\n');
  const { email, phone } = readContact(headerText);
  const links = Array.from(headerText.matchAll(/(?:https?:\/\/|www\.|(?:linkedin|github)\.com\/)[^\s|<>]+/gi), item => item[0].replace(/[),.;]+$/, ''));
  const linkedIn = links.find(value => /(?:^|\/\/)(?:www\.)?linkedin\.com\//i.test(value));
  const gitHub = links.find(value => /(?:^|\/\/)(?:www\.)?github\.com\//i.test(value));
  const portfolio = links.find(value => value !== linkedIn && value !== gitHub && webLink(value));
  const consumed = [email, phone, linkedIn, gitHub, portfolio].filter(Boolean);
  const extra = header.map((line, index) => {
    const content = index === 0 && name ? line.replace(name, '') : line;
    const remaining = consumed.reduce((value, part) => value.replace(part, ''), content);
    return remaining.replace(/^[ |\t]+|[ |\t]+$/g, '').trim();
  }).filter(Boolean);
  const sourceSections = [
    ...sections.filter(section => section.lines.length),
    ...(extra.length ? [{ key: 'additional', title: sections.length ? 'Additional Information' : 'Resume Details', lines: extra }] : []),
  ];
  return normalizeResume({
    name: contact.name || name,
    email: contact.email || email,
    phone: contact.phone || phone,
    location: contact.location,
    linkedin: contact.linkedin || linkedIn,
    github: contact.github || gitHub,
    portfolio: contact.portfolio || portfolio,
    projectLinks: contact.projectLinks,
    sourceSections,
  });
}

module.exports = { resumeFromSource };
