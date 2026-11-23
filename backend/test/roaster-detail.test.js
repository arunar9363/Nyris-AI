const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reviewResume } = require('../src/services/roaster.service');

test('detailed Roaster separates contribution, scope, and outcomes', () => {
  const report = reviewResume({
    resumeText: [
      'Alex Robin', 'alex@example.com', 'Experience',
      '- Responsible for updating the dashboard.',
      '- Build 12 tests for REST APIs.',
      '- Delivered a reporting dashboard to the finance team and reduced month-end processing time from 8 hours to 5.',
      '- Built a caching layer with the goal of improving latency.',
      '- Planned a rollout targeting a conversion change from 2% to 4%.',
      'Skills', '- Docker', '- SQL',
    ].join('\n'),
    jobDescription: 'Experience with RESTful APIs and SQL.',
  });
  const { bullets, summary, priorities } = report.detailedReview;
  assert.equal(summary.bulletsAnalyzed, 5);
  assert.equal(summary.withOutcome, 1);
  assert.equal(bullets[0].action, 'vague');
  assert.match(bullets[0].coaching.scaffold, /\[Your verified action\]/);
  assert.equal(bullets[1].action, 'specific');
  assert.equal(bullets[1].hasScope, true);
  assert.equal(bullets[1].hasOutcome, false);
  assert.ok(bullets[1].matchedTerms.includes('REST API'));
  assert.equal(bullets[2].hasOutcome, true);
  assert.equal(bullets[2].status, 'strong');
  assert.equal(bullets[3].hasOutcome, false);
  assert.equal(bullets[4].hasOutcome, false);
  assert.ok(priorities.some(item => item.id === 'listed' && item.detail.includes('SQL')));
});

test('detailed Roaster counts repeated bullets and bounds excerpts', () => {
  const resumeText = ['Experience', ...Array(45).fill('- Built 12 tests.'), 'Projects', '- Shipped a force-feedback prototype.'].join('\n');
  const { summary, priorities, bullets, sections } = reviewResume({ resumeText }).detailedReview;
  assert.equal(summary.bulletsAnalyzed, 46);
  assert.equal(summary.bulletsShown, 36);
  assert.equal(bullets.length, 36);
  assert.match(bullets[1].issues.find(item => item.id === 'duplicate').detail, /bullet 1/);
  assert.equal(priorities.find(item => item.id === 'duplicate').count, 44);
  assert.deepEqual(sections.map(section => [section.name, section.bulletCount]), [['Experience', 45], ['Projects', 1]]);
});
