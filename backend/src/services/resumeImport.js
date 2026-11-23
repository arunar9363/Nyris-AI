const { actionStart, bulletPrefix, inspectResume, readContact } = require('./resumeInspection');
const { normalizeResume, webLink } = require('./resumeDocument');

const linkPattern = /\[([^\][\n]{1,240})\]\(((?:https?:\/\/|mailto:|tel:)(?:[^\s()]|\([^()\s]*\))*)\)|(?:https?:\/\/|www\.)[^\s<>|]+|(?<![\p{L}\p{N}@./-])(?:[\p{L}\p{N}-]+\.)+(?:com|org|net|dev|app|io|edu|in|co|me|ai|tech|site|uk|ca|test)(?:[/?#][^\s<>|]*)?(?=$|[\s|,.;)])/giu;
const linkLabel = /^(?:links?|live(?: demo| project)?|demo|project (?:url|link)|github|gitlab|repository|repo|source(?: code)?|credential|certificate|verify|view)$/i;
const isLinkLine = value => value.replace(/^(?:project )?links?\s*:\s*/i, '').split(/\s*[|·]\s*/)
  .every(part => !part.trim() || linkLabel.test(part.trim().replace(/:$/, '')));
const degreePattern = /\b(?:bachelor|master|doctorate|diploma|associate(?:'s)? degree|secondary school|high school|(?:[bm]\.?\s?(?:tech|eng|sc|s|a|ca|ba)|ph\.?\s?d)\.?(?=\W|$))\b/i;
const rolePattern = /\b(?:engineer|developer|intern|analyst|designer|manager|consultant|director|lead|specialist|assistant|researcher|coordinator|officer|architect|administrator|scientist)\b/i;
const stackPattern = /^(?:tech(?:nologies| stack)?|stack|tools?)\s*:|^(?:Python|JavaScript|TypeScript|React(?:\.js)?|Node\.js|Java|C\+\+|SQL|HTML5?|AWS|Azure|Excel|Power BI|Go|Rust|Ruby|Django|FastAPI|PHP)(?:\s*(?:,|\/|$))/i;
const dateToken = '(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?\\s+|(?:0?[1-9]|1[0-2])\\/)?(?:19|20)\\d{2}';
const dateTail = new RegExp('(?:^|\\s)(\\(?(?:expected\\s+(?:graduation\\s+)?|class of\\s+)?(?:' + dateToken + '(?:\\s*(?:[–—-]|--|\\bto\\b)\\s*(?:' + dateToken + '|present|current|ongoing))?|present|current|ongoing)\\)?)$', 'i');
const remoteLocation = /^(?:remote|hybrid|on[- ]?site)$/i;
const cityRegion = /^[\p{L}\p{M}.'’ -]+,\s*[\p{L}\p{M}.'’ -]{2,40}$/u;

function readGroups(value, start, count) {
  const groups = [];
  let end = start;
  while (groups.length < count) {
    while (/\s/.test(value[end] || '')) end++;
    if (value[end] !== '{') break;
    const opening = ++end;
    let balance = 1;
    while (end < value.length && balance) {
      const char = value[end++];
      if (char === '\\' && /[{}\\]/.test(value[end] || '')) end++;
      else if (char === '{') balance++;
      else if (char === '}') balance--;
    }
    if (balance) break;
    groups.push(value.slice(opening, end - 1));
  }
  return { groups, end: groups.length ? end : start };
}

function latexPlain(value, depth = 0) {
  if (depth > 14) return value;
  const pattern = /\\([a-zA-Z]+|[\\%&_$#{} ])/g;
  const inline = new Set(['emph', 'textit', 'textbf', 'texttt', 'textsc', 'underline', 'small']);
  const hidden = new Set(['begin', 'end', 'color', 'vspace', 'hspace']);
  let from = 0;
  let output = '';
  for (let match; (match = pattern.exec(value));) {
    output += value.slice(from, match.index);
    const command = match[1];
    const count = command === 'resumeSubheading' ? 4 : ['resumeProjectHeading', 'href', 'textcolor'].includes(command) ? 2
      : ['section', 'resumeItem', 'url'].includes(command) || inline.has(command) || hidden.has(command) ? 1 : 0;
    const { groups, end } = readGroups(value, pattern.lastIndex, count);
    const contents = () => groups.map(group => latexPlain(group, depth + 1).trim());
    if (command === '\\') output += '\n';
    else if (/^[%&_$#{} ]$/.test(command)) output += command;
    else if (command === 'textbullet' || command === 'item') output += '- ';
    else if (command === 'faGlobe') output += 'Credential';
    else if (command === 'href' && groups.length === 2) output += '[' + latexPlain(groups[1], depth + 1).trim() + '](' + groups[0].replace(/\\([%&_#])/g, '$1').trim() + ')';
    else if (command === 'resumeSubheading' && groups.length === 4) {
      const [first, second, third, fourth] = contents();
      output += '\n' + [first, second].filter(Boolean).join(' | ') + '\n' + [third, fourth].filter(Boolean).join(' | ') + '\n';
    } else if (command === 'resumeProjectHeading' || command === 'section' || command === 'resumeItem') {
      output += '\n' + (command === 'resumeItem' ? '- ' : '') + contents().filter(Boolean).join(' | ') + '\n';
    } else if (command === 'textcolor') output += contents()[1] || '';
    else if (!hidden.has(command)) output += contents().join(' ');
    from = end;
    pattern.lastIndex = end;
  }
  return (output + value.slice(from)).replace(/\$\s*\|\s*\$/g, ' | ').replace(/[{}]/g, '');
}

function importText(source) {
  const document = source.match(/\\begin\s*\{document\}([\s\S]*?)(?:\\end\s*\{document\}|$)/);
  const text = document ? latexPlain(document[1]) : source;
  return text.replace(/^[ \t]*#{1,6}[ \t]+/gm, '').replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/^[ \t]*[-–—•·]+[ \t]*$/gm, '').trim();
}

function readLinks(value) {
  const links = [];
  const plain = value.replace(linkPattern, (match, label, target) => {
    const url = target || match.replace(/[.,;]+$/, '');
    links.push({ label: label?.trim() || '', url });
    return label || '';
  });
  return { plain: plain.trim(), links };
}

const columns = line => line.split(/\s*\|\s*|\s+[·•]\s+|\s{2,}/).map(value => value.trim()).filter(Boolean);
const namedLocation = value => remoteLocation.test(value) || cityRegion.test(value) && !rolePattern.test(value)
  && !degreePattern.test(value) && !stackPattern.test(value);

function readHeader(header) {
  const { plain, links } = readLinks(header.join('\n'));
  const lines = plain.split('\n').flatMap(columns);
  const { email, phone } = readContact(plain);
  const fromAnnotation = prefix => links.find(item => item.url.toLowerCase().startsWith(prefix))?.url.slice(prefix.length) || '';
  const name = lines.map(line => line.replace(/^name\s*:\s*/i, '')).find(line =>
    /^[\p{L}\p{M}][\p{L}\p{M}.'’ -]{1,89}$/u.test(line)
    && !/^(?:résumé|resume|cv|curriculum vitae|linkedin|github|portfolio|remote)$/i.test(line)
    && (!rolePattern.test(line) || /^name\s*:/i.test(lines[0]))
    && line.split(/\s+/).length <= 7) || '';
  const profileLinks = links.map(item => ({ ...item, url: webLink(item.url) })).filter(item => item.url);
  const linkedIn = profileLinks.find(item => /\/\/(?:[^./]+\.)?linkedin\.com\/in\//i.test(item.url));
  const gitHub = profileLinks.find(item => /\/\/(?:www\.)?github\.com\/[^/?#]+\/?(?:[?#].*)?$/i.test(item.url));
  const portfolio = profileLinks.find(item => /\b(?:portfolio|website|personal site)\b/i.test(item.label))
    || profileLinks.find(item => !/(?:linkedin\.com|github\.com|gitlab\.com|bitbucket\.org)\//i.test(item.url));
  const location = lines.find(line => /^(?:location|based in|city)\s*:/i.test(line))?.replace(/^[^:]+:\s*/, '')
    || lines.find(namedLocation) || '';
  return {
    name, email: email || fromAnnotation('mailto:').split('?')[0], phone: phone || fromAnnotation('tel:'),
    location, linkedin: linkedIn?.url, github: gitHub?.url, portfolio: portfolio?.url,
  };
}

function fieldsFor(line, home, includeLocation) {
  const fields = [];
  let dates = '';
  let location = '';
  const parts = columns(line);
  for (let part of parts) {
    const match = part.match(dateTail);
    if (match) {
      dates = match[1];
      part = part.slice(0, match.index).trim();
    }
    const suffix = includeLocation && [home, 'Remote', 'Hybrid', 'On-site'].filter(Boolean).find(value =>
      part.toLowerCase().endsWith(' ' + value.toLowerCase()));
    if (suffix) {
      location = part.slice(-suffix.length);
      part = part.slice(0, -suffix.length).trim();
    }
    if (includeLocation && namedLocation(part) && (fields.length || parts.length === 1 && part.split(/\s+/).length < 5)) location = part;
    else if (part) fields.push(part);
  }
  return { fields, dates, location };
}

function projectLinks(links) {
  const result = {};
  for (const { label, url } of links) {
    const safe = webLink(url);
    if (!safe) continue;
    const domain = new URL(safe).hostname.toLowerCase();
    const key = /\b(?:github|gitlab|repository|repo|source code)\b/i.test(label)
      || /^(?:www\.)?(?:github\.com|gitlab\.com|bitbucket\.org)$/.test(domain) ? 'github' : 'live';
    result[key] ||= safe;
  }
  return result;
}

function readEntries(lines, kind, home) {
  const entries = [];
  const unassigned = [];
  const project = kind === 'projects';
  const education = kind === 'education';
  const start = (line, links, fields, dates, location) => {
    const first = fields.shift() || line;
    const entry = project
      ? { name: first, tech: fields.join(' | '), date: dates, bullets: [], links: projectLinks(links) }
      : education ? { institution: first, degree: fields.shift() || '', location, dates, details: fields.join(' | ') }
        : { title: first, company: fields.shift() || '', location, dates, bullets: [] };
    if (education && degreePattern.test(entry.institution)) {
      [entry.institution, entry.degree] = [entry.degree, entry.institution];
    }
    entries.push(entry);
    return entry;
  };
  let entry;
  let wrapBullet = false;
  for (const raw of lines) {
    const stripped = raw.replace(bulletPrefix, '');
    const { plain, links } = readLinks(stripped);
    const line = plain.replace(/^(?:[-–—•·]\s*)+/, '').trim();
    if (isLinkLine(line) && links.length) {
      if (project && entry) Object.assign(entry.links, projectLinks(links));
      continue;
    }
    if (isLinkLine(line)) continue;
    const contribution = stripped !== raw || (!education && actionStart.test(line));
    if (contribution) {
      if (!entry) unassigned.push('- ' + line);
      else if (education) entry.details = [entry.details, line].filter(Boolean).join(' ');
      else {
        entry.bullets.push(line);
        if (project) Object.assign(entry.links, projectLinks(links));
      }
      wrapBullet = !education && !!entry;
      continue;
    }
    if (wrapBullet && /^[\p{Ll},(;]/u.test(line)) {
      entry.bullets[entry.bullets.length - 1] += ' ' + line;
      continue;
    }
    wrapBullet = false;
    const { fields, dates, location } = fieldsFor(line, home, !project);
    if (!entry) {
      if (fields.length) entry = start(line, links, fields, dates, location);
      else unassigned.push(line);
    } else if (project) {
      if (!entry.tech && stackPattern.test(line)) entry.tech = line.replace(/^[^:]+:\s*(?=[^:]+$)/, '');
      else if (dates && !fields.length) entry.date = dates;
      else entry = start(line, links, fields, dates, location);
    } else if (!fields.length) {
      entry.dates ||= dates;
      entry.location ||= location;
    } else if (education && !entry.degree && degreePattern.test(fields[0])) {
      entry.degree = fields.join(' | ');
      entry.dates ||= dates;
      entry.location ||= location;
    } else if (education && !entry.institution && !degreePattern.test(fields[0])) {
      entry.institution = fields.join(' | ');
      entry.dates ||= dates;
      entry.location ||= location;
    } else if (!education && !entry.company && !entry.bullets.length && fields.length === 1
      && !(dates && rolePattern.test(fields[0]))) {
      entry.company = fields[0];
      entry.dates ||= dates;
      entry.location ||= location;
    } else if (education && /^(?:gpa|grade|coursework|honors|honours|speciali[sz]ation)\b/i.test(line)) {
      entry.details = [entry.details, line].filter(Boolean).join(' ');
    } else {
      entry = start(line, links, fields, dates, location);
    }
  }
  return { entries, unassigned };
}

function readCredentials(lines) {
  const entries = [];
  for (const raw of lines) {
    const { plain, links } = readLinks(raw.replace(/^(?:[-–—*•·]\s+)+/, '').replace(bulletPrefix, ''));
    const link = links.map(item => webLink(item.url)).find(Boolean) || '';
    const line = links.length ? plain.replace(/(?:\s+[|·])?\s+(?:credential|verify|view certificate)\s*:?\s*$/i, '').trim() : plain;
    if (isLinkLine(line)) {
      if (entries.length && link) entries.at(-1).link ||= link;
      continue;
    }
    const [name, ...other] = line.split(/\s*\|\s*|\s+[–—-]{1,2}\s+|:\s+/);
    const dates = other.at(-1)?.trim().match(dateTail)?.[1] || '';
    if (dates && other.at(-1).trim() === dates) other.pop();
    else if (dates) other[other.length - 1] = other.at(-1).trim().slice(0, -dates.length).trim();
    entries.push({ name: name.trim(), issuer: other.join(' — ').trim(), dates, link });
  }
  return entries;
}

function resumeImport(source) {
  const text = importText(source);
  const { header, sections } = inspectResume(text);
  const parsed = { ...readHeader(header), education: [], experience: [], projects: [], certifications: [], additional: [] };
  const skills = [];
  const summaries = [];
  for (const section of sections) {
    if (!section.lines.length) continue;
    if (section.key === 'summary') summaries.push(...section.lines);
    else if (section.key === 'skills') {
      for (const line of section.lines.map(item => item.replace(bulletPrefix, ''))) {
        if (skills.at(-1)?.endsWith(',') && !line.includes(':')) skills[skills.length - 1] += ' ' + line;
        else skills.push(line);
      }
    } else if (section.key === 'certifications') parsed.certifications.push(...readCredentials(section.lines));
    else if (section.key === 'additional') parsed.additional.push(section);
    else {
      const { entries, unassigned } = readEntries(section.lines, section.key, parsed.location);
      parsed[section.key].push(...entries);
      if (unassigned.length) parsed.additional.push({ title: 'Other ' + section.title.toLowerCase(), lines: unassigned });
    }
  }
  if (!sections.length && header.length) {
    const rest = header.filter(line => !line.includes(parsed.name || '\0') && !readLinks(line).links.length
      && !readContact(line).email && !readContact(line).phone && line !== parsed.location);
    if (rest.length) parsed.additional.push({ title: 'Additional Information', lines: rest });
  }
  const draft = normalizeResume({ ...parsed, summary: summaries.join(' '), skills: skills.join('\n') });
  draft.projects = draft.projects.map((project, index) => ({ ...project, linkSuggestions: parsed.projects[index].links }));
  const warnings = [];
  if (!draft.name) warnings.push('Check the name in Contact details.');
  if (!sections.length) warnings.push('Review the extracted text and move details into the appropriate sections.');
  if (parsed.additional.some(section => /^Other /i.test(section.title))) warnings.push('Some lines could not be assigned to a specific entry. They are in Additional sections.');
  return { text, sections: sections.filter(section => section.lines.length).map(section => section.title), draft, warnings };
}

module.exports = { resumeImport };
