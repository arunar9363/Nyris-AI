const PDFDocument = require('pdfkit');
const fontkit = require('fontkit');
const path = require('node:path');
const { renderText } = require('./resumeDocument');
const httpError = require('../utils/httpError');

const needsUnicodeFont = /[^\x20-\x7e\u00a0-\u00ff\r\n\t\u2013\u2014\u2018-\u201e\u2022\u2026\u20ac]/u;

function resumeFonts(document) {
  const text = renderText(document);
  if (!needsUnicodeFont.test(text)) {
    return document.theme.serif ? ['Times-Roman', 'Times-Bold', 'Times-Italic'] : ['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique'];
  }
  const directory = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts');
  const embedded = ['Regular', 'Bold', 'Italic'].map(face => path.join(directory, 'LiberationSans-' + face + '.ttf'));
  const font = fontkit.openSync(embedded[0]);
  const characters = [...new Set(text.replace(/\s/g, ''))];
  const covers = candidate => characters.every(character => candidate.hasGlyphForCodePoint(character.codePointAt(0)));
  if (covers(font)) return embedded;

  const custom = process.env.RESUME_PDF_FONT;
  if (custom && covers(fontkit.openSync(custom))) return [custom, custom, custom];
  throw httpError(422, 'Use Word or plain text for characters outside the available PDF fonts.');
}

function renderPdf(document) {
  const { name, contacts, sections, settings, theme } = document;
  const [regular, bold, italic] = resumeFonts(document);
  const size = theme.bodySize;
  const left = theme.margin;
  const linkColor = '#174d93';

  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: settings.paperSize,
      margin: left,
      info: { Title: name + ' - Resume', Creator: 'Nyris AI' },
    });
    const chunks = [];
    pdf.on('data', chunk => chunks.push(chunk));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);

    const width = pdf.page.width - left * 2;
    const ensureSpace = height => {
      if (pdf.y + height > pdf.page.height - left) pdf.addPage();
    };
    const body = () => pdf.font(regular).fontSize(size).lineGap(theme.lineGap).fillColor('#171717');
    const row = (value, meta, face, subtitle = '') => {
      if (!value && !meta && !subtitle) return;
      const right = meta ? Math.min(170, width * 0.37) : 0;
      const titleWidth = right ? width - right - 10 : width;
      const options = { width: titleWidth };
      const heading = [value, subtitle].filter(Boolean).join('  |  ');
      const titleHeight = heading ? body().font(face).heightOfString(heading, options) : 0;
      const metaHeight = meta ? body().fontSize(size - 0.5).heightOfString(meta, { width: right }) : 0;
      ensureSpace(Math.max(titleHeight, metaHeight) + 2);
      const y = pdf.y;
      if (subtitle) {
        body().font(face).text(value, left, y, { ...options, continued: true });
        pdf.font(italic).text('  |  ' + subtitle);
      } else if (value) {
        body().font(face).text(value, left, y, options);
      }
      const afterHeading = value ? pdf.y : y;
      if (meta) body().fontSize(size - 0.5).text(meta, left + width - right, y, { width: right, align: 'right' });
      pdf.x = left;
      pdf.y = Math.max(afterHeading, y + metaHeight);
    };
    const links = (items, center) => {
      if (!items.length) return;
      const lines = [[]];
      let used = 0;
      const gap = '  |  ';
      const measure = value => body().fontSize(size - 0.7).widthOfString(value);
      for (const item of items) {
        let line = lines.at(-1);
        let needed = measure((line.length ? gap : '') + item.label);
        if (used + needed > width && line.length) {
          line = [];
          lines.push(line);
          used = 0;
          needed = measure(item.label);
        }
        line.push(item);
        used += needed;
      }
      for (const line of lines) {
        ensureSpace(size + 4);
        const y = pdf.y;
        let x = center ? left + Math.max(0, (width - measure(line.map(item => item.label).join(gap))) / 2) : left;
        const output = (value, url) => {
          const labelWidth = measure(value);
          body().fontSize(size - 0.7).fillColor(url ? linkColor : '#171717');
          pdf.text(value, x, y, { lineBreak: false });
          if (url && labelWidth) {
            pdf.link(x, y, labelWidth, size + 1, url);
            pdf.strokeColor(linkColor).lineWidth(0.4).moveTo(x, y + size + 0.5).lineTo(x + labelWidth, y + size + 0.5).stroke();
          }
          x += labelWidth;
        };
        line.forEach((item, index) => {
          if (index) output(gap);
          output(item.label, item.url);
        });
        pdf.x = left;
        pdf.y = y + size + 3;
      }
    };

    pdf.font(bold).fontSize(theme.nameSize).fillColor(theme.accent).text(name, { align: theme.align, width });
    links(contacts, theme.align === 'center');
    if (theme.headerRule) {
      pdf.strokeColor(theme.accent).lineWidth(1.4).moveTo(left, pdf.y + 1).lineTo(left + width, pdf.y + 1).stroke();
      pdf.y += 6;
    }
    pdf.moveDown(0.35);

    for (const section of sections) {
      ensureSpace(50);
      pdf.moveDown(theme.space);
      pdf.font(bold).fontSize(size + 0.7).fillColor(theme.headerRule ? theme.accent : '#171717')
        .text(theme.caps || theme.smallCaps ? section.title.toUpperCase() : section.title, { width });
      if (theme.rule) pdf.strokeColor(theme.rule).lineWidth(0.45).moveTo(left, pdf.y + 0.6).lineTo(left + width, pdf.y + 0.6).stroke();
      pdf.y += theme.rule ? 5 : 3;
      for (const item of section.items) {
        ensureSpace(item.title || item.subtitle ? 38 : 17);
        row(item.title, item.topMeta, bold, item.inlineSubtitle ? item.subtitle : '');
        row(item.inlineSubtitle ? '' : item.subtitle, item.bottomMeta, italic);
        if (item.inlineLinks && item.links?.length) {
          body().font(bold).text(item.label, { width, continued: true });
          body().text((item.text ? (item.labelSeparator || ': ') + item.text : '') + '  ·  ', { continued: true });
          const [{ label, url }] = item.links;
          body().fillColor(linkColor).text(label, { link: url, underline: true, continued: false });
        } else if (item.label || item.text) {
          if (item.label && item.text) {
            body().font(bold).text(item.label, { width, continued: true });
            body().text((item.labelSeparator || ': ') + item.text);
          } else {
            body().font(item.label ? bold : regular).text(item.label || item.text, { width });
          }
        }
        for (const bullet of item.bullets || []) body().text('– ' + bullet, left + 9, pdf.y, { width: width - 9 });
        pdf.x = left;
        if (!item.inlineLinks) links(item.links || [], false);
        pdf.y += item.title ? theme.itemSpace : 1.2;
      }
    }
    pdf.end();
  });
}

module.exports = { renderPdf };
