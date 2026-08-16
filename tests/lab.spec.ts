import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { allTopics, demoIds, semesterPlans, type SemesterId } from '../src/curriculum'
import { subjects, type SubjectId } from '../src/data'
import { G10_MATH_VISUAL_TOPICS } from '../src/components/math-visuals/g10MathVisualTopics'
import { APPLIED_LESSON_TEMPLATE_REGRESSIONS } from '../src/lessonApplied'
import { humanitiesRegressionTemplateByTitle } from '../src/lessonHumanities'
import { scienceLessonRegressionMap } from '../src/lessonScience'

const expectedSemesterIds: SemesterId[] = ['g10-1', 'g10-2', 'g11-1', 'g11-2', 'g12-1', 'g12-2']
const expectedSubjectIds = subjects.map((subject) => subject.id).sort()
const subjectName = (subjectId: SubjectId) => subjects.find((subject) => subject.id === subjectId)?.name ?? subjectId

async function selectSemester(page: Page, semesterId: SemesterId) {
  const semester = semesterPlans.find((item) => item.id === semesterId)
  if (!semester) throw new Error(`Unknown semester: ${semesterId}`)
  await page.locator('.semester-nav button').filter({ hasText: semester.shortLabel }).click()
}

async function selectSubject(page: Page, subjectId: SubjectId) {
  await page.locator('.subject-nav button').filter({ hasText: subjectName(subjectId) }).click()
}

async function openTopic(page: Page, entry: (typeof allTopics)[number]) {
  await selectSemester(page, entry.semester.id)
  await selectSubject(page, entry.subjectId)
  const topicButton = page.locator(`[id="directory-topic-${entry.topic.id}"]`)
  const unitDetails = topicButton.locator('xpath=ancestor::details')
  if (!await unitDetails.evaluate((element) => (element as HTMLDetailsElement).open)) {
    await unitDetails.locator('summary').click()
  }
  await topicButton.click()
  await expect(page.getByRole('heading', { level: 1, name: entry.topic.title, exact: true })).toBeVisible()
}

async function expectNoPageOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(overflow.scrollWidth - overflow.clientWidth, `${label}: horizontal page overflow`).toBeLessThanOrEqual(1)
}

test('curriculum contains six complete semesters with valid, unique topics', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static curriculum validation only needs one project')

  expect(semesterPlans.map((semester) => semester.id)).toEqual(expectedSemesterIds)
  expect(new Set(semesterPlans.map((semester) => semester.id)).size).toBe(6)
  expect(subjects).toHaveLength(10)

  const semesterLabels = new Set<string>()
  const unitIds = new Set<string>()
  const topicIds = new Set<string>()
  const mappedDemoIds = new Set<string>()
  const allowedDemoIds = new Set<string>(demoIds)

  for (const semester of semesterPlans) {
    expect(semester.label.trim(), `${semester.id}: semester label`).not.toBe('')
    expect(semester.shortLabel.trim(), `${semester.id}: semester short label`).not.toBe('')
    expect(semester.description.trim(), `${semester.id}: semester description`).not.toBe('')
    expect(semester.sourceLabel.trim(), `${semester.id}: source label`).not.toBe('')
    expect(semester.sourceUrl, `${semester.id}: official source URL`).toMatch(/^https:\/\//)
    expect(semesterLabels.has(semester.label), `${semester.id}: duplicate semester label`).toBe(false)
    semesterLabels.add(semester.label)
    expect(Object.keys(semester.courses).sort(), `${semester.id}: ten subjects`).toEqual(expectedSubjectIds)

    for (const subject of subjects) {
      const course = semester.courses[subject.id]
      expect(course.book.trim(), `${semester.id}/${subject.id}: book`).not.toBe('')
      expect(course.publisher.trim(), `${semester.id}/${subject.id}: publisher`).not.toBe('')
      expect(['catalog', 'school', 'review']).toContain(course.basis)
      expect(course.units.length, `${semester.id}/${subject.id}: unit count`).toBeGreaterThanOrEqual(4)

      const courseTopicTitles = new Set<string>()
      const courseTopicCount = course.units.reduce((total, unit) => total + unit.topics.length, 0)
      expect(courseTopicCount, `${semester.id}/${subject.id}: topic count`).toBeGreaterThanOrEqual(20)

      for (const unit of course.units) {
        expect(unit.id.trim(), `${semester.id}/${subject.id}: unit id`).not.toBe('')
        expect(unit.title.trim(), `${semester.id}/${subject.id}/${unit.id}: unit title`).not.toBe('')
        expect(unit.focus.trim(), `${semester.id}/${subject.id}/${unit.id}: unit focus`).not.toBe('')
        expect(unit.topics.length, `${semester.id}/${subject.id}/${unit.id}: topics`).toBeGreaterThan(0)
        expect(unitIds.has(unit.id), `${unit.id}: duplicate unit id`).toBe(false)
        unitIds.add(unit.id)

        for (const topic of unit.topics) {
          expect(topic.id.trim(), `${unit.id}: topic id`).not.toBe('')
          expect(topic.title.trim(), `${topic.id}: title`).not.toBe('')
          expect(topic.focus.trim(), `${topic.id}: focus`).not.toBe('')
          expect(topic.question.trim(), `${topic.id}: question`).not.toBe('')
          expect(topic.pitfall.trim(), `${topic.id}: pitfall`).not.toBe('')
          expect(topic.keyPoints).toHaveLength(3)
          for (const point of topic.keyPoints) expect(point.trim(), `${topic.id}: empty key point`).not.toBe('')
          expect(topicIds.has(topic.id), `${topic.id}: duplicate topic id`).toBe(false)
          expect(courseTopicTitles.has(topic.title), `${semester.id}/${subject.id}: duplicate topic title ${topic.title}`).toBe(false)
          topicIds.add(topic.id)
          courseTopicTitles.add(topic.title)

          if (topic.demoId) {
            expect(allowedDemoIds.has(topic.demoId), `${topic.id}: invalid demo id ${topic.demoId}`).toBe(true)
            expect(topic.mode, `${topic.id}: demo mode`).toBe('demo')
            mappedDemoIds.add(topic.demoId)
          } else {
            expect(topic.mode, `${topic.id}: explanation mode`).toBe('explain')
          }
        }
      }
    }
  }

  expect(topicIds.size, 'flattened topic count').toBe(allTopics.length)
  expect([...mappedDemoIds].sort(), 'every implemented demo should be reachable from the curriculum').toEqual([...demoIds].sort())
})

test('every topic contains a substantive lesson and each subject uses varied concept templates', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static lesson quality validation only needs one project')

  const templatesBySubject = new Map<SubjectId, Map<string, number>>()
  const templatesByCourse = new Map<string, Set<string>>()
  const templateUseByCourse = new Map<string, Map<string, number>>()
  const lessonQualityErrors: string[] = []

  for (const entry of allTopics) {
    const { lesson } = entry.topic
    const label = `${entry.semester.id}/${entry.subjectId}/${entry.topic.title}`
    const expectLength = (value: string, minimum: number, field: string) => {
      if (value.trim().length < minimum) {
        lessonQualityErrors.push(`${label}: ${field} has ${value.trim().length} characters, expected at least ${minimum}`)
      }
    }

    expectLength(lesson.templateId, 4, 'template id')
    expectLength(lesson.guidingQuestion, 10, 'guiding question')
    expectLength(lesson.core, 24, 'core concept')
    if (!lesson.core.includes(entry.topic.title)) lessonQualityErrors.push(`${label}: core concept does not name this topic`)
    expect(lesson.explanation, `${label}: explanation paragraphs`).toHaveLength(2)
    lesson.explanation.forEach((paragraph, index) => expectLength(paragraph, 32, `explanation ${index + 1}`))
    expect(lesson.steps, `${label}: reasoning steps`).toHaveLength(3)
    lesson.steps.forEach((step, index) => {
      expectLength(step.label, 2, `step ${index + 1} label`)
      expectLength(step.detail, 18, `step ${index + 1} detail`)
    })
    expectLength(lesson.example.prompt, 10, 'worked example prompt')
    expect(lesson.example.reasoning, `${label}: worked example reasoning`).toHaveLength(2)
    lesson.example.reasoning.forEach((reason, index) => expectLength(reason, 14, `worked example reasoning ${index + 1}`))
    expectLength(lesson.example.result, 5, 'worked example conclusion')
    expectLength(lesson.selfCheck.question, 8, 'self-check question')
    expectLength(lesson.selfCheck.answer, 12, 'self-check answer')
    expectLength(lesson.pitfall, 16, 'topic-specific misconception or boundary')

    const totalLessonLength = [
      lesson.guidingQuestion,
      lesson.core,
      ...lesson.explanation,
      ...lesson.steps.flatMap((step) => [step.label, step.detail]),
      lesson.example.prompt,
      ...lesson.example.reasoning,
      lesson.example.result,
      lesson.selfCheck.question,
      lesson.selfCheck.answer,
      lesson.pitfall,
    ].join('').trim().length
    if (totalLessonLength < 320) lessonQualityErrors.push(`${label}: complete lesson has only ${totalLessonLength} characters, expected at least 320`)

    const subjectTemplates = templatesBySubject.get(entry.subjectId) ?? new Map<string, number>()
    subjectTemplates.set(lesson.templateId, (subjectTemplates.get(lesson.templateId) ?? 0) + 1)
    templatesBySubject.set(entry.subjectId, subjectTemplates)

    const courseKey = `${entry.semester.id}/${entry.subjectId}`
    const courseTemplates = templatesByCourse.get(courseKey) ?? new Set<string>()
    courseTemplates.add(lesson.templateId)
    templatesByCourse.set(courseKey, courseTemplates)
    const courseTemplateUse = templateUseByCourse.get(courseKey) ?? new Map<string, number>()
    courseTemplateUse.set(lesson.templateId, (courseTemplateUse.get(lesson.templateId) ?? 0) + 1)
    templateUseByCourse.set(courseKey, courseTemplateUse)
  }

  for (const subject of subjects) {
    const templates = templatesBySubject.get(subject.id) ?? new Map<string, number>()
    const total = [...templates.values()].reduce((sum, count) => sum + count, 0)
    const largestFamily = Math.max(0, ...templates.values())
    if (templates.size < 10) lessonQualityErrors.push(`${subject.name}: only ${templates.size} distinct concept templates, expected at least 10`)
    if (largestFamily / total >= 0.7) lessonQualityErrors.push(`${subject.name}: one template covers ${largestFamily}/${total} topics`)
    if (templates.has(`${subject.id}-unit-method`)) lessonQualityErrors.push(`${subject.name}: old generic fallback is still used`)
  }

  for (const [courseKey, templateIds] of templatesByCourse) {
    if (templateIds.size < 3) lessonQualityErrors.push(`${courseKey}: only ${templateIds.size} concept families, expected at least 3`)
    const largestUse = Math.max(0, ...(templateUseByCourse.get(courseKey)?.values() ?? []))
    if (largestUse > 6) lessonQualityErrors.push(`${courseKey}: one lesson body is reused by ${largestUse} topics, expected at most 6`)
  }

  expect(lessonQualityErrors, 'lesson fields below the substantive-content thresholds').toEqual([])
})

test('explicit topic regression routes keep ambiguous titles in the intended lesson family', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static lesson route validation only needs one project')

  const assertRoutes = (routes: Readonly<Record<string, string>>, source: string) => {
    for (const [rawKey, expectedTemplateId] of Object.entries(routes)) {
      const separator = rawKey.indexOf(':')
      const hasSubject = separator > 0
      const subjectId = hasSubject ? rawKey.slice(0, separator) as SubjectId : undefined
      const title = hasSubject ? rawKey.slice(separator + 1) : rawKey
      const matches = allTopics.filter((entry) => entry.topic.title === title && (!subjectId || entry.subjectId === subjectId))
      expect(matches.length, `${source}: regression topic ${rawKey} exists`).toBeGreaterThan(0)
      for (const match of matches) {
        const actualTemplateId = match.topic.lesson.templateId
        const matchesFamily = actualTemplateId === expectedTemplateId || actualTemplateId.startsWith(`${expectedTemplateId}--`)
        expect(matchesFamily, `${source}: ${match.semester.id}/${match.subjectId}/${title} expected ${expectedTemplateId}, received ${actualTemplateId}`).toBe(true)
      }
    }
  }

  assertRoutes(APPLIED_LESSON_TEMPLATE_REGRESSIONS, 'applied subjects')
  assertRoutes(scienceLessonRegressionMap, 'science subjects')
  assertRoutes(
    Object.fromEntries(Object.entries(humanitiesRegressionTemplateByTitle).map(([key, route]) => [key, route.familyId])),
    'humanities subjects',
  )
})

test('semester-first navigation and global search open the exact course topic', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Full navigation traversal runs on desktop')
  await page.goto('/')

  await expect(page.locator('.semester-nav button')).toHaveCount(6)
  await expect(page.locator('.subject-nav button')).toHaveCount(10)
  for (const semester of semesterPlans) {
    await selectSemester(page, semester.id)
    await expect(page.locator('.semester-nav button.active')).toContainText(semester.shortLabel)
    await expect(page.locator('.catalog-header')).toContainText(semester.label)
    await expect(page.locator('.unit-directory details')).toHaveCount(semester.courses.chinese.units.length)
  }

  const target = allTopics.find((candidate) => (
    candidate.semester.id === 'g12-2'
    && allTopics.filter((entry) => entry.topic.title === candidate.topic.title).length === 1
  ))
  expect(target, 'a unique high-three second-semester search target').toBeTruthy()
  if (!target) return

  await page.getByRole('searchbox', { name: '搜索全部课程内容' }).fill(target.topic.title)
  const result = page.locator('.search-results button')
    .filter({ hasText: target.topic.title })
    .filter({ hasText: target.semester.shortLabel })
    .filter({ hasText: subjectName(target.subjectId) })
  await expect(result).toHaveCount(1)
  await result.click()

  await expect(page.locator('.semester-nav button.active')).toContainText(target.semester.shortLabel)
  await expect(page.locator('.subject-nav button.active')).toContainText(subjectName(target.subjectId))
  await expect(page.locator('.catalog-header h2')).toHaveText(target.course.book)
  await expect(page.getByRole('heading', { level: 1, name: target.topic.title, exact: true })).toBeVisible()
  await expect(page.locator(`[id="directory-topic-${target.topic.id}"]`)).toHaveAttribute('aria-current', 'page')
})

test('every mapped interactive demo renders and remains numerically valid', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Complete demo traversal runs on desktop')
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  await page.goto('/')

  const demos = new Map<string, (typeof allTopics)[number]>()
  for (const entry of allTopics) {
    if (entry.topic.demoId && !demos.has(entry.topic.demoId)) demos.set(entry.topic.demoId, entry)
  }
  expect([...demos.keys()].sort()).toEqual([...demoIds].sort())

  for (const [demoId, entry] of demos) {
    await openTopic(page, entry)
    const lab = page.locator('.lab-frame')
    const visual = page.locator('.visual-panel')
    await expect(lab, `${demoId}: lab frame`).toBeVisible()
    await expect(visual, `${demoId}: visual panel`).toBeVisible()
    await expect(page.locator('.knowledge-detail'), `${demoId}: complete lesson below demo`).toBeVisible()
    await expect(page.locator('.worked-example'), `${demoId}: worked example below demo`).toBeVisible()
    await expect(page.locator('.lesson-check'), `${demoId}: self-check below demo`).toBeVisible()
    const visualSize = await visual.evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return { height: bounds.height, width: bounds.width }
    })
    expect(visualSize.width, `${demoId}: visual width`).toBeGreaterThan(100)
    expect(visualSize.height, `${demoId}: visual height`).toBeGreaterThan(100)

    const ranges = lab.locator('input[type="range"]')
    for (let index = 0; index < await ranges.count(); index += 1) {
      const range = ranges.nth(index)
      await range.fill(await range.getAttribute('max') ?? '1')
    }
    await expect(lab, `${demoId}: invalid numeric output`).not.toContainText(/NaN|Infinity|undefined/)
  }

  expect(errors).toEqual([])
})

test('every high-one first-semester math topic has a working concept visual at every width', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/')

  const entries = allTopics.filter((entry) => entry.semester.id === 'g10-1' && entry.subjectId === 'math')
  expect(entries.map((entry) => entry.topic.title)).toEqual([...G10_MATH_VISUAL_TOPICS])

  for (const entry of entries) {
    if (testInfo.project.name === 'desktop-chromium') {
      await openTopic(page, entry)
    } else {
      await page.locator('.global-search input').fill(entry.topic.title)
      await page.locator('.search-results button')
        .filter({ hasText: entry.topic.title })
        .filter({ hasText: '高一上' })
        .filter({ hasText: '数学' })
        .first()
        .click()
    }
    const visual = page.locator(`[data-math-concept-visual="${entry.topic.title}"]`)
    await expect(visual, `${entry.topic.title}: concept visual`).toBeVisible()
    const bounds = await visual.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return { height: rect.height, width: rect.width }
    })
    expect(bounds.width, `${entry.topic.title}: visual width`).toBeGreaterThan(240)
    expect(bounds.height, `${entry.topic.title}: visual height`).toBeGreaterThan(160)

    const range = visual.locator('input[type="range"]').first()
    if (await range.count()) await range.fill(await range.getAttribute('max') ?? '1')
    const alternative = visual.locator('button[aria-pressed="false"]').first()
    if (await alternative.count()) await alternative.click()
    await expect(visual, `${entry.topic.title}: valid visual output`).not.toContainText(/NaN|Infinity|undefined/)
    await expectNoPageOverflow(page, `${testInfo.project.name}/${entry.topic.title}`)
  }
})

test('representative math concept visuals fit desktop and narrow screens', async ({ page }, testInfo) => {
  await page.goto('/')
  const representativeTitles = ['交集并集与补集', '一元二次不等式', '对数概念与换底', '函数的单调性', '函数模型的比较与检验']

  for (const title of representativeTitles) {
    await page.locator('.global-search input').fill(title)
    const result = page.locator('.search-results button')
      .filter({ hasText: title })
      .filter({ hasText: '高一上' })
      .filter({ hasText: '数学' })
      .first()
    await result.click()
    const visual = page.locator(`[data-math-concept-visual="${title}"]`)
    await expect(visual).toBeVisible()
    const range = visual.locator('input[type="range"]').first()
    if (await range.count()) await range.fill(await range.getAttribute('max') ?? '1')
    await expect(visual).not.toContainText(/NaN|Infinity|undefined/)
    await expectNoPageOverflow(page, `${testInfo.project.name}/${title}`)
  }
})

test('switching logarithm laws keeps the exponent control and formula synchronized', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Interaction state regression only needs one browser')
  await page.goto('/')
  const entry = allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'math' && item.topic.title === '对数运算与定义域')
  expect(entry).toBeTruthy()
  if (!entry) return
  await openTopic(page, entry)

  const visual = page.locator('[data-math-concept-visual="对数运算与定义域"]')
  await visual.locator('input[type="range"]').nth(1).fill('4.5')
  await visual.getByRole('button', { name: '幂的对数' }).click()
  await expect(visual.locator('input[type="range"]').nth(1)).toHaveValue('2')
  await expect(visual).toContainText('lg 4 ≈ 2 × 0.301 ≈ 0.602')

  await visual.locator('input[type="range"]').nth(1).fill('5')
  await expect(visual).toContainText('lg 32 ≈ 5 × 0.301 ≈ 1.505')
})

test('audited math diagrams preserve domains, endpoints and symmetry cues', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Diagram semantics regression only needs one browser')
  await page.goto('/')
  const mathEntry = (title: string) => allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'math' && item.topic.title === title)

  const subset = mathEntry('子集与集合相等')
  expect(subset).toBeTruthy()
  if (!subset) return
  await openTopic(page, subset)
  const subsetVisual = page.locator('[data-math-concept-visual="子集与集合相等"]')
  await expect(subsetVisual.locator('.slv-b-mark')).toHaveAttribute('cx', '560')
  await subsetVisual.getByRole('button', { name: '集合相等' }).click()
  await expect(subsetVisual.locator('.slv-mutual-inclusion')).toContainText('A ⊆ B')

  const quadratic = mathEntry('一元二次不等式')
  expect(quadratic).toBeTruthy()
  if (!quadratic) return
  await openTopic(page, quadratic)
  const quadraticVisual = page.locator('[data-math-concept-visual="一元二次不等式"]')
  await quadraticVisual.locator('input[type="range"]').fill('-2')
  await expect(quadraticVisual.locator('.slv-boundary-test')).toHaveCount(1)
  await expect(quadraticVisual.locator('.slv-test-point')).toHaveCount(0)

  const parity = mathEntry('函数的奇偶性')
  expect(parity).toBeTruthy()
  if (!parity) return
  await openTopic(page, parity)
  const parityVisual = page.locator('[data-math-concept-visual="函数的奇偶性"]')
  await parityVisual.getByRole('button', { name: '奇函数' }).click()
  await expect(parityVisual.locator('.fmv-origin-center')).toHaveCount(1)
  await expect(parityVisual.locator('.fmv-symmetry')).toHaveCount(0)

  const piecewise = mathEntry('分段函数与实际计费')
  expect(piecewise).toBeTruthy()
  if (!piecewise) return
  await openTopic(page, piecewise)
  const piecewiseVisual = page.locator('[data-math-concept-visual="分段函数与实际计费"]')
  await expect(piecewiseVisual.locator('.fmv-open-end')).toHaveCount(7)
  await expect(piecewiseVisual.locator('.fmv-closed-end')).toHaveCount(7)

  const power = mathEntry('幂函数模型')
  expect(power).toBeTruthy()
  if (!power) return
  await openTopic(page, power)
  const powerVisual = page.locator('[data-math-concept-visual="幂函数模型"]')
  await powerVisual.getByRole('button', { name: 'a = −1' }).click()
  await expect(powerVisual.locator('polyline.fmv-curve')).toHaveCount(2)
  await expect(powerVisual.locator('.fmv-asymptote')).toHaveCount(1)
  await powerVisual.getByRole('button', { name: 'a = 1/2' }).click()
  await expect(powerVisual.locator('.fmv-domain-endpoint')).toHaveCount(1)
})

test('a math concept visual passes serious and critical WCAG checks in both themes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'narrow-chromium', 'Axe is covered at desktop and 390px mobile widths')
  await page.addInitScript(() => localStorage.setItem('huzhi-theme', 'light'))
  await page.goto('/')
  const title = '基本不等式及等号条件'
  await page.locator('.global-search input').fill(title)
  await page.locator('.search-results button')
    .filter({ hasText: title })
    .filter({ hasText: '高一上' })
    .filter({ hasText: '数学' })
    .first()
    .click()
  const visualSelector = `[data-math-concept-visual="${title}"]`
  await expect(page.locator(visualSelector)).toBeVisible()

  for (const theme of ['light', 'dark'] as const) {
    if (theme === 'dark') await page.locator('.icon-button').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    const results = await new AxeBuilder({ page })
      .include(visualSelector)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    expect(blocking, `${testInfo.project.name}/${theme}: math visual accessibility violations`).toEqual([])
  }
})

test('desktop, mobile and narrow layouts avoid horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/')
  await expectNoPageOverflow(page, `${testInfo.project.name} initial page`)

  const demo = allTopics.find((entry) => entry.topic.demoId)
  expect(demo, 'at least one interactive demo').toBeTruthy()
  if (demo) {
    if (testInfo.project.name === 'desktop-chromium') {
      await openTopic(page, demo)
    } else {
      await page.getByRole('button', { name: '课程目录', exact: true }).click()
      await expect(page.locator('.catalog-sidebar')).toBeVisible()
      await expectNoPageOverflow(page, `${testInfo.project.name} open catalog`)
      await page.locator('.catalog-close').click()
      await expect(page.locator('.catalog-sidebar')).toBeHidden()

      await page.getByRole('searchbox', { name: '搜索全部课程内容' }).fill(demo.topic.title)
      await page.locator('.search-results button')
        .filter({ hasText: demo.topic.title })
        .filter({ hasText: demo.semester.shortLabel })
        .first()
        .click()
    }
    await expect(page.locator('.lab-frame')).toBeVisible()
    await expectNoPageOverflow(page, `${testInfo.project.name} interactive demo`)
  }

  if (testInfo.project.name === 'desktop-chromium') {
    await expect(page.locator('.catalog-sidebar')).toBeVisible()
    await expect(page.locator('.mobile-course-bar')).toBeHidden()
  } else {
    await expect(page.locator('.mobile-course-bar')).toBeVisible()
  }
})

test('desktop and 390px layouts pass serious and critical WCAG checks in both themes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'narrow-chromium', 'Axe is covered at desktop and 390px mobile widths')
  await page.addInitScript(() => localStorage.setItem('huzhi-theme', 'light'))
  await page.goto('/')

  for (const theme of ['light', 'dark'] as const) {
    if (theme === 'dark') await page.locator('.icon-button').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    expect(blocking, `${testInfo.project.name}/${theme}: serious or critical accessibility violations`).toEqual([])
  }
})
