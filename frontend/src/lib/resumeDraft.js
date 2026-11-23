const contacts = ['name', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio', 'summary']
const sections = ['education', 'experience', 'projects', 'certifications', 'additional']

export function newResumeEntry(kind, values = {}) {
  return {
    ...(['experience', 'projects'].includes(kind) ? { bullets: [] } : {}),
    ...values,
    id: crypto.randomUUID(),
    ...(kind === 'additional' && Array.isArray(values.lines) ? { lines: values.lines.join('\n') } : {}),
  }
}

export function makeResumeDraft(data = {}) {
  const entries = Object.fromEntries(sections.map(kind => [kind, (data[kind] || []).map(entry => newResumeEntry(kind, entry))]))
  const skills = typeof data.skills === 'string' ? data.skills
    : (data.skills?.categories || []).map(({ label, items }) => label ? label + ': ' + items : items).join('\n')
  return { ...Object.fromEntries(contacts.map(key => [key, data[key] || ''])), ...entries, skills }
}

export function resumeDraftPayload(form) {
  return { ...form, projects: form.projects.map(({ linkSuggestions, ...entry }) => entry) }
}

const identity = value => (value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const includesUrl = value => /https?:\/\/|www\./i.test(value)

export function applySuggestedWording(form, suggestions) {
  if (!suggestions) return form
  function editEntries(entries, revised, keys) {
    return entries.map(entry => {
      const matches = (revised || []).filter(item => keys.every(key => identity(item[key]) === identity(entry[key])))
      const bullets = matches.length === 1 ? matches[0].bullets : null
      return bullets?.length && !bullets.some(includesUrl) ? { ...entry, bullets } : entry
    })
  }
  return {
    ...form,
    summary: suggestions.summary && !includesUrl(suggestions.summary) ? suggestions.summary : form.summary,
    experience: editEntries(form.experience, suggestions.experience, ['title', 'company', 'dates']),
    projects: editEntries(form.projects, suggestions.projects, ['name']),
  }
}

export function hasResumeContent(form) {
  return !!(form.summary.trim() || form.skills.trim()
    || form.education.some(entry => entry.institution?.trim() || entry.degree?.trim())
    || form.experience.some(entry => entry.title?.trim() || entry.company?.trim())
    || form.projects.some(entry => entry.name?.trim())
    || form.certifications.some(entry => entry.name?.trim())
    || form.additional.some(entry => entry.title?.trim() && entry.lines?.trim()))
}

export function validProjectUrl(value) {
  if (!value?.trim()) return true
  try {
    const candidate = value.trim()
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(candidate) ? candidate : 'https://' + candidate)
    return ['https:', 'http:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password
  } catch {
    return false
  }
}

export function draftProblem(form) {
  if (form.name.trim().length < 2) return 'Enter the full name in Contact and summary.'
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Check the email address in Contact and summary.'
  if (!hasResumeContent(form)) return 'Add at least one section with details for your resume.'
  const project = form.projects.find(entry => !validProjectUrl(entry.live) || !validProjectUrl(entry.github))
  if (project) return 'Check the URL for ' + (project.name?.trim() || 'the unnamed project') + '. Use an http or https address, or leave the link blank.'
  return ''
}
