const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../../templates');
const OUTPUT_DIR = path.join(__dirname, '../../uploads/pdfs');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Simple template engine - replaces {{var}}, {{#if}}, {{#each}} blocks
 */
const renderTemplate = (template, data) => {
  let html = template;

  // Handle {{#each array}} blocks
  html = html.replace(/\{\{#each (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, keyPath, block) => {
    const keys = keyPath.split('.');
    let arr = data;
    for (const k of keys) arr = arr?.[k];
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr.map((item, index) => {
      let b = block;
      // Replace @first
      b = b.replace(/\{\{#unless @first\}\}([\s\S]*?)\{\{\/unless\}\}/g, index === 0 ? '' : '$1');
      b = b.replace(/\{\{#if @first\}\}([\s\S]*?)\{\{\/if\}\}/g, index === 0 ? '$1' : '');
      // Replace item properties
      if (typeof item === 'string') {
        b = b.replace(/\{\{this\}\}/g, item);
      } else if (typeof item === 'object') {
        Object.keys(item).forEach(k => {
          const val = item[k];
          // Nested #if inside each
          b = b.replace(new RegExp(`\\{\\{#if ${k}\\}\\}([\\s\\S]*?)\\{\\{\\/if\\}\\}`, 'g'), val ? '$1' : '');
          // Nested #each inside each (bullets)
          b = b.replace(new RegExp(`\\{\\{#each ${k}\\}\\}([\\s\\S]*?)\\{\\{\\/each\\}\\}`, 'g'), (m, innerBlock) => {
            if (!Array.isArray(val)) return '';
            return val.map(v => innerBlock.replace(/\{\{this\}\}/g, v)).join('');
          });
          b = b.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), val ?? '');
        });
      }
      // Clean remaining {{...}} tags for missing props
      b = b.replace(/\{\{#if \w+\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      b = b.replace(/\{\{#unless \w+\}\}[\s\S]*?\{\{\/unless\}\}/g, '');
      return b;
    }).join('');
  });

  // Handle top-level {{#if key}} blocks
  html = html.replace(/\{\{#if (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, keyPath, block) => {
    const keys = keyPath.split('.');
    let val = data;
    for (const k of keys) val = val?.[k];
    return val && (Array.isArray(val) ? val.length > 0 : true) ? block : '';
  });

  // Handle {{#unless key}} blocks
  html = html.replace(/\{\{#unless (\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (match, key, block) => {
    return data[key] ? '' : block;
  });

  // Replace simple {{key}} and {{key.subkey}}
  html = html.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, keyPath) => {
    const keys = keyPath.split('.');
    let val = data;
    for (const k of keys) val = val?.[k];
    return val !== undefined && val !== null ? String(val) : '';
  });

  return html;
};

/**
 * Generate HTML from template + data
 */
const generateHtml = (templateId, data) => {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.html`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template '${templateId}' not found`);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');
  return renderTemplate(template, data);
};

/**
 * Convert HTML string to PDF using Puppeteer
 */
const htmlToPdf = async (html, filename) => {
  const outputPath = path.join(OUTPUT_DIR, filename);
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return outputPath;
  } finally {
    if (browser) await browser.close();
  }
};

/**
 * Main export: generate PDF from template + data
 */
exports.generateResumePdf = async (templateId, resumeData, filename) => {
  const html = generateHtml(templateId, resumeData);
  const pdfPath = await htmlToPdf(html, filename || `resume-${Date.now()}.pdf`);
  return { html, pdfPath };
};

exports.generateHtml = generateHtml;