const httpError = require('../utils/httpError');
const { bulletPrefix } = require('./resumeInspection');

const SECTION_LABELS = {
  summary: 'Professional Summary',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Technical Skills',
  certifications: 'Certifications',
};

const THEMES = {
  minimal: { accent: '#073483', serif: true, bodySize: 10.5, margin: 36, nameSize: 27, align: 'center', smallCaps: true, inlineTech: true, space: 0.4, lineGap: 0, itemSpace: 2, rule: '#737373', headerRule: false },
  modern: { accent: '#155e75', serif: false, bodySize: 11, margin: 42, nameSize: 28, align: 'left', caps: false, space: 0.72, lineGap: 1, itemSpace: 5, rule: '', headerRule: true },
  creative: { accent: '#27272a', serif: true, bodySize: 10, margin: 36, nameSize: 21, align: 'left', caps: true, inlineTech: true, space: 0.29, lineGap: 0, itemSpace: 1, rule: '#a1a1aa', headerRule: false },
};

function text(value, limit = 240) {
  return typeof value === 'string'
    ? value.normalize('NFC').replace(/\s+/g, ' ').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, limit)
    : '';
}

function webLink(value) {
  const candidate = text(value, 600);
  if (!candidate) return '';
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(candidate) ? candidate : 'https://' + candidate);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password
      ? url.href
      : '';
  } catch {
    return '';
  }
}

function records(value, fields, required, extras = () => ({})) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 25).filter(item => item && typeof item === 'object').map(item => ({
    ...Object.fromEntries(fields.map(key => [key, text(item[key])])),
    ...extras(item),
  })).filter(item => required.some(key => item[key]));
}

function bullets(value) {
  return Array.isArray(value) ? value.slice(0, 10).map(item => text(item, 480)).filter(Boolean) : [];
}

const months = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
function endDate(value = '') {
  if (/\b(present|current|ongoing)\b/i.test(value)) return Infinity;
  const date = [...value.matchAll(/(?:(\b[a-z]{3,9})\s+)?\b((?:19|20)\d{2})\b/gi)].at(-1);
  return date ? Number(date[2]) * 12 + Math.max(0, months.indexOf(date[1]?.slice(0, 3).toLowerCase())) : -1;
}

function newestFirst(rows) {
  return rows.sort((a, b) => endDate(b.dates || b.date) - endDate(a.dates || a.date));
}

function skills(value) {
  const lines = typeof value === 'string' ? value.split(/[\r\n]+/).map(line => {
    const colon = line.indexOf(':');
    return colon > 0
      ? { label: line.slice(0, colon), items: line.slice(colon + 1) }
      : { label: '', items: line };
  }) : value?.categories;
  return records(lines, ['label'], ['items'], item => ({ items: text(item.items, 480) }));
}

function normalizeResume(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const contact = Object.fromEntries(['name', 'email', 'phone', 'location'].map(key => [key, text(source[key])]));
  const links = Object.fromEntries(['linkedin', 'github', 'portfolio'].map(key => [key, webLink(source[key])]));
  const projectLinks = (Array.isArray(source.projectLinks) ? source.projectLinks : [source.projectLinks])
    .slice(0, 4).map(webLink).filter(Boolean);
  return {
    ...contact,
    ...links,
    projectLinks,
    summary: text(source.summary, 1200),
    education: newestFirst(records(source.education, ['institution', 'degree', 'location', 'dates'], ['institution', 'degree'], item => ({
      details: text(item.details, 600),
    }))),
    experience: newestFirst(records(source.experience, ['title', 'company', 'location', 'dates'], ['title', 'company'], item => ({
      bullets: bullets(item.bullets),
    }))),
    projects: records(source.projects, ['name', 'tech', 'date'], ['name'], item => ({
      bullets: bullets(item.bullets), live: webLink(item.live), github: webLink(item.github),
    })),
    skills: { categories: skills(source.skills) },
    certifications: records(source.certifications, ['name', 'issuer', 'dates'], ['name'], item => ({ link: webLink(item.link) })),
    additional: records(source.additional, ['title'], ['title'], item => ({
      lines: (Array.isArray(item.lines) ? item.lines : typeof item.lines === 'string' ? item.lines.split(/\r?\n/) : [])
        .slice(0, 50).map(line => text(line, 1000)).filter(Boolean),
    })).filter(section => section.lines.length),
    sourceSections: Array.isArray(source.sourceSections) ? source.sourceSections.slice(0, 50).map(section => ({
      key: Object.hasOwn(SECTION_LABELS, section?.key) ? section.key : 'additional',
      title: text(section?.title, 80),
      lines: Array.isArray(section?.lines) ? section.lines.map(line => text(line, 30000)).filter(Boolean) : [],
    })).filter(section => section.title && section.lines.length) : [],
  };
}

function normalizeOptions({ templateId = 'minimal', paperSize = 'LETTER', sectionOrder, profile } = {}) {
  if (typeof templateId !== 'string' || !Object.hasOwn(THEMES, templateId)) throw httpError(400, 'Choose an available resume layout.');
  if (!['LETTER', 'A4'].includes(paperSize)) throw httpError(400, 'Choose US Letter or A4 paper.');
  const requested = Array.isArray(sectionOrder) ? sectionOrder.filter(key => Object.hasOwn(SECTION_LABELS, key)) : [];
  return {
    templateId,
    paperSize,
    sectionOrder: [...new Set([...requested, ...Object.keys(SECTION_LABELS)])],
    profile: text(profile, 80),
  };
}

const join = (...values) => values.filter(Boolean).join(' | ');
const link = (label, url) => ({ label, url });

function sourceDocumentSections(sections, order) {
  const rank = key => order.includes(key) ? order.indexOf(key) : order.length;
  return [...sections].sort((a, b) => rank(a.key) - rank(b.key)).map(section => ({
    title: section.title,
    items: section.lines.map(line => bulletPrefix.test(line) ? { bullets: [line.replace(bulletPrefix, '')] } : { text: line }),
  }));
}

function createDocument(source, options = {}) {
  const data = normalizeResume(source);
  const settings = normalizeOptions(options);
  const theme = THEMES[settings.templateId];
  const contacts = [
    link(data.phone, /^[+\d().\s-]{6,}$/.test(data.phone) ? 'tel:' + data.phone.replace(/[^\d+]/g, '') : ''),
    link(data.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? 'mailto:' + data.email : ''),
    ...[['LinkedIn', data.linkedin], ['GitHub', data.github], ['Portfolio', data.portfolio]]
      .filter(([, url]) => url).map(([label, url]) => link(label, url)),
    ...data.projectLinks.map((url, index) => link('Project ' + (index + 1), url)),
    link(data.location),
  ].filter(contact => contact.label);
  const items = {
    summary: data.summary ? [{ text: data.summary }] : [],
    education: data.education.map(entry => ({
      title: entry.institution, topMeta: entry.location, subtitle: entry.degree, bottomMeta: entry.dates, text: entry.details,
    })),
    experience: data.experience.map(entry => ({
      title: entry.title, topMeta: entry.dates, subtitle: entry.company, bottomMeta: entry.location, bullets: entry.bullets,
    })),
    projects: data.projects.map(entry => ({
      title: entry.name, topMeta: entry.date, subtitle: entry.tech, bullets: entry.bullets,
      inlineSubtitle: !!theme.inlineTech && !!entry.tech,
      links: [link('Live demo', entry.live), link('Repository', entry.github)].filter(item => item.url),
    })),
    skills: data.skills.categories.map(entry => ({ label: entry.label, text: entry.items })),
    certifications: data.certifications.map(entry => ({
      label: entry.name, text: join(entry.issuer, entry.dates), labelSeparator: ' — ', inlineLinks: true,
      links: entry.link ? [link('Credential', entry.link)] : [],
    })),
  };
  return {
    name: data.name,
    contacts,
    settings,
    theme,
    sections: data.sourceSections.length ? sourceDocumentSections(data.sourceSections, settings.sectionOrder) : [
      ...settings.sectionOrder.filter(key => items[key].length).map(key => ({
        title: key === 'skills' && /career change|leadership|experienced|return/i.test(settings.profile)
          ? 'Skills' : SECTION_LABELS[key],
        items: items[key],
      })),
      ...sourceDocumentSections(data.additional, settings.sectionOrder),
    ],
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

const renderLink = ({ label, url }) => url
  ? `<a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`
  : escapeHtml(label);

function renderItem(item) {
  const row = (primary, meta, style) => primary || meta
    ? '<p class="row ' + style + '"><span class="row-main">' + primary + '</span>' + (meta ? '<span class="row-meta">' + escapeHtml(meta) + '</span>' : '') + '</p>' : '';
  const inlineLinks = item.inlineLinks && item.links?.length
    ? ' <span aria-hidden="true">·</span> ' + item.links.map(renderLink).join(' | ') : '';
  const label = item.label ? '<strong>' + escapeHtml(item.label) + '</strong>' : '';
  const separator = item.label && item.text ? item.labelSeparator || ': ' : '';
  const body = item.text || label ? '<p>' + label + separator + escapeHtml(item.text) + inlineLinks + '</p>' : '';
  const list = item.bullets?.length ? '<ul>' + item.bullets.map(value => '<li>' + escapeHtml(value) + '</li>').join('') + '</ul>' : '';
  const links = !item.inlineLinks && item.links?.length ? '<p class="links">' + item.links.map(renderLink).join(' | ') + '</p>' : '';
  const title = item.title ? '<strong>' + escapeHtml(item.title) + '</strong>' : '';
  const subtitle = item.subtitle ? '<em>' + escapeHtml(item.subtitle) + '</em>' : '';
  return '<div class="entry">' + row(title + (item.inlineSubtitle ? ' | ' + subtitle : ''), item.topMeta, 'title')
    + row(item.inlineSubtitle ? '' : subtitle, item.bottomMeta, 'subtitle') + body + list + links + '</div>';
}

function renderHtml(document) {
  const { name, contacts, sections, settings, theme } = document;
  const width = settings.paperSize === 'A4' ? 794 : 816;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${escapeHtml(name)} — Resume</title>
<style>
  * { box-sizing: border-box }
  body { margin: 0 auto; max-width: ${width}px; padding: clamp(16px, 5vw, ${theme.margin * 4 / 3}px); color: #171717; background: #fff;
    font-family: ${theme.serif ? '"Times New Roman", Georgia, serif' : 'Arial, sans-serif'}; font-size: ${theme.bodySize}pt; line-height: ${1.2 + theme.lineGap * 0.15} }
  .identity { border-bottom: ${theme.headerRule ? '2px solid ' + theme.accent : 'none'}; padding-bottom: ${theme.headerRule ? '.55em' : '0'} }
  h1 { color: ${theme.accent}; text-align: ${theme.align}; line-height: 1.1; font-size: clamp(24px, 5vw, ${theme.nameSize * 1.38}px); margin: 0 }
  address { font-style: normal; text-align: ${theme.align}; font-size: .92em; margin: .42em 0 ${theme.headerRule ? '.25em' : '.75em'}; overflow-wrap: anywhere }
  a { color: #174d93; text-decoration: underline }
  h2 { font-size: ${theme.headerRule ? '1.12em' : '1.04em'}; font-weight: bold; text-transform: ${theme.caps ? 'uppercase' : 'none'};
    font-variant-caps: ${theme.smallCaps ? 'small-caps' : 'normal'};
    color: ${theme.headerRule ? theme.accent : '#171717'}; border-bottom: ${theme.rule ? '1px solid ' + theme.rule : 'none'};
    margin: ${0.25 + theme.space}em 0 .30em; padding-bottom: .08em; break-after: avoid }
  p, ul { margin: 0; overflow-wrap: anywhere }
  .entry + .entry { margin-top: ${0.12 + theme.itemSpace * 0.072}em }
  .row { display: flex; justify-content: space-between; column-gap: 12px; break-after: avoid }
  .row-main { min-width: 0 }
  .row-meta { flex: 0 0 auto; text-align: right; max-width: 42%; font-size: .92em }
  .subtitle { margin-bottom: .14em }
  ul { padding-left: 1.2em; margin-top: .12em }
  li { padding-left: .06em; break-inside: avoid }
  .links { font-size: .92em }
</style></head><body>
<div class="identity"><h1>${escapeHtml(name)}</h1>
${contacts.length ? '<address>' + contacts.map(renderLink).join(' | ') + '</address>' : ''}</div>
${sections.map(section => '<section><h2>' + escapeHtml(section.title) + '</h2>' + section.items.map(renderItem).join('') + '</section>').join('')}
</body></html>`;
}

function renderText(document) {
  const textLink = ({ label, url }) => url && /^https?:/.test(url) ? label + ': ' + url : label;
  const bodyText = item => [
    [item.label, item.text].filter(Boolean).join(item.labelSeparator || ': '),
    item.inlineLinks ? item.links?.map(textLink).join(' | ') : '',
  ].filter(Boolean).join(' | ');
  return [
    document.name,
    document.contacts.map(textLink).join(' | '),
    ...document.sections.flatMap(section => ['', section.title.toUpperCase(), ...section.items.flatMap(item => [
      join(item.title, item.inlineSubtitle ? item.subtitle : '', item.topMeta),
      join(item.inlineSubtitle ? '' : item.subtitle, item.bottomMeta),
      bodyText(item),
      ...(item.bullets || []).map(bullet => '- ' + bullet),
      item.inlineLinks ? '' : item.links?.map(textLink).join(' | '),
    ].filter(Boolean))]),
    '',
  ].join('\n');
}

module.exports = { createDocument, normalizeResume, normalizeOptions, renderHtml, renderText, escapeHtml, text, webLink };
