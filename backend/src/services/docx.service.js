const JSZip = require('jszip');
const { escapeHtml: xml } = require('./resumeDocument');

const word = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const relationships = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const packageRelationships = 'http://schemas.openxmlformats.org/package/2006/relationships';
const contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.';
const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const run = (value, style = '') => value
  ? '<w:r>' + (style ? '<w:rPr>' + style + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + xml(value) + '</w:t></w:r>'
  : '';
const paragraph = (style, content) => content
  ? `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${content}</w:p>` : '';

async function renderDocx(document) {
  const { name, contacts, sections, settings, theme } = document;
  const zip = new JSZip();
  const links = [];
  const hyperlink = ({ label, url }) => {
    if (!url) return run(label);
    const id = 'link' + (links.length + 1);
    links.push(`<Relationship Id="${id}" Type="${relationships}/hyperlink" Target="${xml(url)}" TargetMode="External"/>`);
    return `<w:hyperlink r:id="${id}">${run(label, '<w:color w:val="174D93"/><w:u w:val="single"/>')}</w:hyperlink>`;
  };
  const row = (style, primary, meta, subtitle) => paragraph(style, run(primary)
    + (subtitle ? run(' | ', '<w:b w:val="0"/>') + run(subtitle, '<w:b w:val="0"/><w:i/>') : '')
    + (meta ? '<w:r><w:tab/></w:r>' + run(meta, '<w:b w:val="0"/>') : ''));
  const items = sections.map(section => paragraph('Heading1', run(section.title)) + section.items.map(item => [
    row('Entry', item.title, item.topMeta, item.inlineSubtitle ? item.subtitle : ''),
    row('Subtitle', item.inlineSubtitle ? '' : item.subtitle, item.bottomMeta),
    paragraph('Normal', run(item.label, '<w:b/>') + run((item.label && item.text ? item.labelSeparator || ': ' : '') + (item.text || ''))
      + (item.inlineLinks && item.links?.length ? run(' · ') + item.links.map(hyperlink).join(run(' | ')) : '')),
    ...(item.bullets || []).map(bullet => paragraph('ListBullet', run(bullet))),
    paragraph('Normal', item.inlineLinks ? '' : (item.links || []).map(hyperlink).join(run(' | '))),
  ].join('')).join('')).join('');
  const header = paragraph('Title', run(name)) + paragraph('Contact', contacts.map(hyperlink).join(run(' | ')));
  const [width, height] = settings.paperSize === 'A4' ? [11906, 16838] : [12240, 15840];
  const margin = theme.margin * 20;
  const font = theme.serif ? 'Times New Roman' : 'Arial';
  const alignment = '<w:jc w:val="' + theme.align + '"/>';
  const border = (color, width) => '<w:pBdr><w:bottom w:val="single" w:sz="' + width + '" w:space="1" w:color="' + color.slice(1) + '"/></w:pBdr>';
  const titleStyle = '<w:b/><w:color w:val="' + theme.accent.slice(1) + '"/><w:sz w:val="' + theme.nameSize * 2 + '"/>';
  const tab = `<w:tabs><w:tab w:val="right" w:pos="${width - margin * 2}"/></w:tabs>`;
  const style = (id, properties = '', formatting = '') => `<w:style w:type="paragraph" w:styleId="${id}"${id === 'Normal' ? ' w:default="1"' : ''}>
    <w:name w:val="${id}"/>${id === 'Normal' ? '' : '<w:basedOn w:val="Normal"/>'}
    <w:pPr>${properties}</w:pPr><w:rPr>${formatting}</w:rPr></w:style>`;
  zip.file('[Content_Types].xml', declaration + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="${contentType}document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="${contentType}styles+xml"/>
    <Override PartName="/word/numbering.xml" ContentType="${contentType}numbering+xml"/>
    </Types>`);
  zip.file('_rels/.rels', declaration + `<Relationships xmlns="${packageRelationships}">
    <Relationship Id="document" Type="${relationships}/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file('word/_rels/document.xml.rels', declaration + `<Relationships xmlns="${packageRelationships}">
    <Relationship Id="styles" Type="${relationships}/styles" Target="styles.xml"/>
    <Relationship Id="numbering" Type="${relationships}/numbering" Target="numbering.xml"/>
    ${links.join('')}</Relationships>`);
  zip.file('word/document.xml', declaration + `<w:document xmlns:w="${word}" xmlns:r="${relationships}"><w:body>
    ${header}${items}<w:sectPr><w:pgSz w:w="${width}" w:h="${height}"/>
    <w:pgMar w:top="${margin}" w:right="${margin}" w:bottom="${margin}" w:left="${margin}" w:header="0" w:footer="0" w:gutter="0"/>
    </w:sectPr></w:body></w:document>`);
  zip.file('word/styles.xml', declaration + `<w:styles xmlns:w="${word}">
    ${style('Normal', '<w:spacing w:after="' + (24 + theme.itemSpace * 6) + '" w:line="' + (240 + theme.lineGap * 17) + '" w:lineRule="auto"/>',
      '<w:rFonts w:ascii="' + font + '" w:hAnsi="' + font + '"/><w:sz w:val="' + theme.bodySize * 2 + '"/>')}
    ${style('Title', '<w:keepNext/>' + alignment, titleStyle)}
    ${style('Contact', (theme.headerRule ? border(theme.accent, 12) : '') + '<w:spacing w:after="154"/>' + alignment, '<w:sz w:val="19"/>')}
    ${style('Heading1', '<w:keepNext/>' + (theme.rule ? border(theme.rule, 4) : '') + '<w:spacing w:before="' + Math.round(60 + theme.space * 190) + '" w:after="58"/><w:outlineLvl w:val="0"/>',
      '<w:b/>' + (theme.smallCaps ? '<w:smallCaps/>' : theme.caps ? '<w:caps/>' : '<w:color w:val="' + theme.accent.slice(1) + '"/>') + '<w:sz w:val="22"/>')}
    ${style('Entry', '<w:keepNext/>' + tab, '<w:b/>')}
    ${style('Subtitle', tab, '<w:i/>')}
    ${style('ListBullet', '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>')}
    </w:styles>`);
  zip.file('word/numbering.xml', declaration + `<w:numbering xmlns:w="${word}">
    <w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/>
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="–"/>
    <w:lvlJc w:val="left"/><w:pPr><w:ind w:left="250" w:hanging="170"/></w:pPr></w:lvl>
    </w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

module.exports = { renderDocx };
