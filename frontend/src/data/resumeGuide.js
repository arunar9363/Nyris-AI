export const sectionLabels = {
  summary: 'Professional Summary',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  certifications: 'Certifications',
}

export const resumeLayouts = [
  { id: 'minimal', name: 'Classic', detail: 'Centered navy serif name, small-cap headings, and fine section rules.' },
  { id: 'modern', name: 'Clean', detail: 'Left-aligned teal header, open spacing, and simple title-case headings.' },
  { id: 'creative', name: 'Compact', detail: 'Smaller charcoal header, a 10-point body, and tighter section spacing.' },
]

const start = ['summary', 'education', 'experience', 'projects', 'skills', 'certifications']
const jobs = ['summary', 'experience', 'skills', 'projects', 'education', 'certifications']
const entry = (title, company, dates, bullets, location = '') => ({ title, company, dates, location, bullets })
const project = (name, tech, ...bullets) => ({ name, tech, bullets })
const degree = (institution, degreeName, dates, location = '') => ({ institution, degree: degreeName, dates, location })
const skills = (...pairs) => ({ categories: pairs.map(([label, items]) => ({ label, items })) })

export const resumeProfiles = [
  {
    id: 'graduate', name: 'Fresher', exampleRole: 'Junior software engineer', length: 'Usually one page',
    order: start,
    intro: 'Lead with your education, then show work you can explain in an interview.',
    priorities: [
      'Use internship, class, volunteer, or personal projects as evidence of your skills.',
      'Give each project a contribution, the tools you actually used, and a verifiable result.',
      'Keep certifications that relate to the role and that you have earned.',
    ],
    sample: {
      name: 'Nisha Rao', email: 'nisha.rao@example.com', location: 'Pune, India',
      linkedin: 'https://example.com/nisha/linkedin', github: 'https://example.com/nisha/code', portfolio: 'https://example.com/nisha',
      summary: 'Information technology graduate with experience building React interfaces and Node.js APIs. Interested in accessible web products and reliable backend services.',
      education: [degree('Meadowbridge Institute of Technology', 'B.Tech. in Information Technology', '2022 – 2026', 'Pune, India')],
      experience: [entry('Web Development Intern', 'Willow Code Studio', 'Jan 2026 – Mar 2026', [
        'Built accessible React form components for an appointment portal, including keyboard navigation and error states.',
        'Added 14 API integration tests covering booking, cancellation, and validation.',
      ], 'Remote')],
      projects: [
        project('Campus Events Portal', 'React, Node.js, PostgreSQL', 'Built a search and sign-up workflow for 12 student organizations.', 'Added server-side validation and rate limits for registrations.'),
        project('Reading Tracker', 'JavaScript, REST API', 'Implemented a searchable reading list with persistent account preferences.'),
      ],
      skills: skills(['Programming', 'JavaScript, Python, SQL'], ['Web', 'React, Node.js, REST APIs, Git']),
      certifications: [{ name: 'Foundations of Cloud Computing', issuer: 'Meadowbridge Continuing Education', dates: '2026' }],
    },
  },
  {
    id: 'intern', name: 'Student / Internship', exampleRole: 'Data analyst intern', length: 'Usually one page',
    order: ['summary', 'education', 'projects', 'skills', 'experience', 'certifications'],
    intro: 'Put your expected graduation date and strongest class or extracurricular projects near the top.',
    priorities: [
      'Include two or three courses only when they support the internship requirements.',
      'Name the analysis, artifact, or experiment you personally contributed to.',
      'Include volunteer work or student leadership when it demonstrates relevant skills.',
    ],
    sample: {
      name: 'Amina Patel', email: 'amina.patel@example.com', location: 'Bengaluru, India',
      summary: 'Statistics student applying for a data analyst internship. Experienced with data cleaning, descriptive statistics, and explaining trends to student groups.',
      education: [degree('Cedar Lake University', 'B.Sc. in Statistics', 'Expected May 2027', 'Bengaluru, India')],
      projects: [
        project('Campus Transport Survey', 'Python, pandas, Excel', 'Cleaned 380 survey responses and documented the handling of missing data.', 'Charted peak demand by time of day and presented findings to the student transport committee.'),
        project('Retail Demand Dashboard', 'SQL, Power BI', 'Joined transaction and product datasets and built a dashboard for weekly sales comparisons.'),
      ],
      skills: skills(['Analysis', 'Python, pandas, SQL, Excel'], ['Reporting', 'Power BI, descriptive statistics']),
      experience: [entry('Data Club Volunteer', 'Cedar Lake University', 'Aug 2025 – Present', ['Helped run six beginner workshops on spreadsheet formulas and data visualization.'])],
    },
  },
  {
    id: 'experienced', name: 'Experienced', exampleRole: 'Operations analyst', length: 'One or two pages',
    order: jobs,
    intro: 'Move recent work to the top and make the connection to the target job easy to see.',
    priorities: [
      'List roles from most recent to oldest, with a company, title, and dates for each.',
      'Show outcomes, volume, quality, or time saved where you can verify the figures.',
      'Keep older or unrelated roles brief and use the space for recent achievements.',
    ],
    sample: {
      name: 'Elena Morris', email: 'elena.morris@example.com', location: 'Manchester, UK',
      summary: 'Operations analyst with five years of experience in inventory reporting, root-cause analysis, and warehouse process improvement.',
      experience: [
        entry('Operations Analyst', 'Oakline Distribution Ltd.', 'Apr 2023 – Present', [
          'Automated the weekly inventory exception report in SQL and Excel, cutting preparation time from three hours to 45 minutes.',
          'Worked with dispatch leads to reduce order holds by 17% over two quarters.',
        ], 'Manchester, UK'),
        entry('Operations Coordinator', 'Seagrass Supply Ltd.', 'Jun 2021 – Mar 2023', ['Reconciled daily shipment data across three warehouses and resolved mismatched order records.'], 'Leeds, UK'),
      ],
      skills: skills(['Operations', 'Inventory control, root-cause analysis, process improvement'], ['Tools', 'SQL, Excel, Power BI']),
      education: [degree('Northfield College', 'B.A. in Business Administration', '2018 – 2021')],
    },
  },
  {
    id: 'technical', name: 'Technical / Portfolio', exampleRole: 'Backend engineer', length: 'One or two pages',
    order: ['summary', 'projects', 'experience', 'skills', 'education', 'certifications'],
    intro: 'When your strongest evidence is a project, show what the system does and what you contributed.',
    priorities: [
      'Include a readable project title, relevant stack, and your own contributions.',
      'Link a maintained repository, demo, or portfolio when it helps show the work.',
      'Mention tests, performance, accessibility, or deployment only where you have evidence.',
    ],
    sample: {
      name: 'Jordan Kim', email: 'jordan.kim@example.com', location: 'Toronto, Canada',
      summary: 'Backend developer building APIs and data pipelines. Experienced with TypeScript, PostgreSQL, queues, and automated testing.',
      projects: [
        project('Transit Status API', 'TypeScript, PostgreSQL, Redis', 'Built an ingestion worker that refreshed service alerts every two minutes and de-duplicated repeat events.', 'Added contract tests for pagination, cache invalidation, and upstream timeouts.'),
        project('Volunteer Scheduling Tool', 'Node.js, Docker, GitHub Actions', 'Designed shift assignment endpoints and added conflict checks for overlapping shifts.'),
      ],
      experience: [entry('Junior Software Engineer', 'Fern Systems Inc.', 'Aug 2024 – Present', ['Maintained Node.js endpoints used by the customer support dashboard and wrote regression tests for incoming fixes.'])],
      skills: skills(['Languages', 'TypeScript, JavaScript, SQL'], ['Backend', 'Node.js, PostgreSQL, Redis, REST APIs'], ['Tools', 'Docker, GitHub Actions, Jest']),
      education: [degree('Ridgemont Polytechnic', 'Diploma in Software Development', '2022 – 2024')],
    },
  },
  {
    id: 'switch', name: 'Career Change', exampleRole: 'Customer success specialist', length: 'One or two pages',
    order: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
    intro: 'Use a short summary and relevant evidence to explain the move, then show your work history.',
    priorities: [
      'Translate earlier work into responsibilities that matter in the new role.',
      'Keep original job titles and dates so your experience remains easy to verify.',
      'Include recent projects, training, or volunteer work that shows the shift is underway.',
    ],
    sample: {
      name: 'Mateo Rivera', email: 'mateo.rivera@example.com', location: 'Austin, TX',
      summary: 'Hospitality supervisor moving into customer success. Experienced in onboarding, service recovery, and turning recurring customer issues into process improvements.',
      skills: skills(['Customer operations', 'Onboarding, escalation triage, documentation, service recovery'], ['Tools', 'Zendesk, Google Sheets, Excel']),
      projects: [project('Customer Onboarding Playbook', 'Training project', 'Designed a 30-day onboarding plan with milestones, follow-up templates, and escalation criteria.')],
      experience: [entry('Guest Services Supervisor', 'Juniper Lodge Group', 'Mar 2021 – Present', [
        'Trained 18 new hires on guest workflows, issue documentation, and escalation procedures.',
        'Created a recurring-issues tracker that made weekly handovers easier across three shifts.',
      ])],
      education: [degree('Lakewood Community College', 'Associate Degree in Hospitality Management', '2018 – 2020')],
    },
  },
  {
    id: 'return', name: 'Career Return', exampleRole: 'Financial operations associate', length: 'One or two pages',
    order: jobs,
    intro: 'Show recent relevant activity and keep the dates of past roles clear.',
    priorities: [
      'Add a brief career-break entry if it helps explain the timeline and you want to include it.',
      'Highlight relevant volunteering or training completed during the break.',
      'Keep personal details brief and focus bullets on skills and accomplishments.',
    ],
    sample: {
      name: 'Taylor Nguyen', email: 'taylor.nguyen@example.com', location: 'Melbourne, Australia',
      summary: 'Financial operations professional returning to work after a career break. Experienced in invoice reconciliation, month-end reporting, and vendor communication.',
      experience: [
        entry('Volunteer Treasurer', 'Riverbend Community Garden', 'May 2025 – Present', [
          'Prepare monthly cash summaries and reconcile membership fees against bank transactions.',
          'Introduced invoice tracking in a shared spreadsheet used by four committee members.',
        ]),
        entry('Career Break', '', 'Sep 2023 – Apr 2025', []),
        entry('Accounts Payable Officer', 'Birchway Services Pty Ltd.', 'Jul 2019 – Aug 2023', ['Reconciled supplier statements and prepared weekly payment runs for approximately 90 active vendors.']),
      ],
      skills: skills(['Finance operations', 'Invoice reconciliation, payment runs, month-end reporting'], ['Tools', 'Excel, Xero']),
      education: [degree('Harbor Technical College', 'Diploma of Accounting', '2017 – 2019')],
    },
  },
  {
    id: 'leadership', name: 'Leadership', exampleRole: 'Engineering manager', length: 'One or two pages',
    order: jobs,
    intro: 'Lead with the scope you owned and the outcomes your teams delivered.',
    priorities: [
      'Make team size, product scope, stakeholders, and responsibilities concrete.',
      'Use bullets that connect decisions to delivery, reliability, adoption, or other outcomes.',
      'Summarize early roles unless they directly support the target position.',
    ],
    sample: {
      name: 'Sofia Bennett', email: 'sofia.bennett@example.com', location: 'Boston, MA',
      summary: 'Engineering manager with experience leading platform teams, setting delivery priorities, and improving service reliability across customer-facing products.',
      experience: [
        entry('Engineering Manager', 'Clearbrook Systems Inc.', 'Feb 2022 – Present', [
          'Lead a team of nine engineers responsible for authentication and billing integrations across six products.',
          'Introduced a reliability review and release checklist that reduced repeat production incidents by 28% year over year.',
          'Partnered with product and support leads to make incident response and customer updates consistent.',
        ]),
        entry('Senior Software Engineer', 'Elm Harbor Digital Inc.', 'Jan 2018 – Jan 2022', ['Led development of a shared observability library used by four product teams.']),
      ],
      skills: skills(['Leadership', 'Coaching, capacity planning, stakeholder management'], ['Engineering', 'Service reliability, platform architecture, incident response']),
      education: [degree('Greenvale University', 'B.S. in Computer Science', '2013 – 2017')],
    },
  },
  {
    id: 'research', name: 'Research to Industry', exampleRole: 'Applied research analyst', length: 'One or two pages',
    order: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
    intro: 'Translate research methods and outputs into evidence relevant to an employer’s work.',
    priorities: [
      'Describe the question, method, and finding or deliverable in plain language.',
      'Surface tools, datasets, collaboration, and methods mentioned in the job description when applicable.',
      'For an academic posting requesting a CV, use its publication and teaching requirements.',
    ],
    sample: {
      name: 'Devon Shah', email: 'devon.shah@example.com', location: 'Seattle, WA',
      summary: 'Research analyst with experience designing surveys, analyzing response patterns, and communicating findings to cross-functional audiences.',
      experience: [entry('Graduate Research Assistant', 'Timberline University', 'Sep 2023 – Jun 2026', [
        'Designed survey instruments with a faculty team and analyzed 520 responses using R and regression models.',
        'Summarized findings in three decision briefs for campus service leads.',
      ])],
      projects: [project('Survey Methods Comparison', 'R, SQL, reproducible analysis', 'Compared response patterns across two recruitment methods and documented limitations and next steps.')],
      skills: skills(['Research', 'Survey design, statistical modeling, research communication'], ['Tools', 'R, SQL, Excel']),
      education: [degree('Timberline University', 'M.S. in Applied Statistics', '2024 – 2026')],
    },
  },
]

export function getResumeProfile(id) {
  return resumeProfiles.find(profile => profile.id === id) || resumeProfiles[0]
}

export function resumeSettings(profileId, templateId, paperSize) {
  const profile = getResumeProfile(profileId)
  return { profile: profile.name, sectionOrder: profile.order, templateId, paperSize }
}
