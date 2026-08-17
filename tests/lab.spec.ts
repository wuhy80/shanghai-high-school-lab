import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { allTopics, demoIds, semesterPlans, type SemesterId } from '../src/curriculum'
import { subjects, type SubjectId } from '../src/data'
import { G10_MATH_VISUAL_TOPICS } from '../src/components/math-visuals/g10MathVisualTopics'
import { APPLIED_LESSON_TEMPLATE_REGRESSIONS } from '../src/lessonApplied'
import { humanitiesRegressionTemplateByTitle } from '../src/lessonHumanities'
import { scienceLessonRegressionMap } from '../src/lessonScience'

const expectedG10MathLessonTemplates = new Map([
  ['集合的表示与元素关系', 'g10-math-set-language'],
  ['子集与集合相等', 'g10-math-subset-equality'],
  ['交集并集与补集', 'g10-math-set-operations'],
  ['命题及其否定', 'g10-math-proposition-negation'],
  ['充分条件与必要条件', 'g10-math-sufficient-necessary'],
  ['等式与不等式的性质', 'g10-math-equivalence-properties'],
  ['一元二次方程根的结构', 'g10-math-quadratic-roots'],
  ['一元二次不等式', 'g10-math-quadratic-inequality'],
  ['分式不等式', 'g10-math-rational-inequality'],
  ['绝对值不等式', 'g10-math-absolute-inequality'],
  ['基本不等式及等号条件', 'g10-math-amgm'],
  ['幂与分数指数幂', 'g10-math-fractional-powers'],
  ['指数幂的运算', 'g10-math-exponent-laws'],
  ['对数概念与换底', 'g10-math-log-definition'],
  ['对数运算与定义域', 'g10-math-log-laws-domain'],
  ['幂函数的图像与性质', 'g10-math-power-function'],
  ['指数函数的图像与性质', 'g10-math-exponential-function'],
  ['指数增长与衰减', 'g10-math-exponential-growth'],
  ['对数函数的图像与性质', 'g10-math-log-function'],
  ['函数定义域与值域', 'g10-math-domain-range'],
  ['分段函数与实际计费', 'g10-math-piecewise-model'],
  ['函数的单调性', 'g10-math-monotonicity'],
  ['函数的奇偶性', 'g10-math-parity'],
  ['函数的零点', 'g10-math-function-zeros'],
  ['函数图像与参数变换', 'g10-math-graph-transform'],
  ['函数模型的比较与检验', 'g10-math-model-comparison'],
  ['反函数', 'g10-math-inverse-function'],
])

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

test('high-one first-semester math follows the Shanghai textbook chapter and section order', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Textbook structure validation only needs one project')

  const mathCourse = semesterPlans.find((semester) => semester.id === 'g10-1')?.courses.math
  expect(mathCourse).toBeTruthy()
  if (!mathCourse) return

  expect([...new Set(mathCourse.units.map((unit) => unit.chapter))]).toEqual([
    '第1章 集合与逻辑',
    '第2章 等式与不等式',
    '第3章 幂、指数与对数',
    '第4章 幂函数、指数函数与对数函数',
    '第5章 函数的概念、性质及应用',
  ])
  expect(mathCourse.units.map((unit) => unit.title)).toEqual([
    '1.1 集合初步', '1.2 常用逻辑用语',
    '2.1 等式与不等式的性质', '2.2 不等式的求解', '2.3 基本不等式及其应用',
    '3.1 幂与指数', '3.2 对数',
    '4.1 幂函数', '4.2 指数函数', '4.3 对数函数',
    '5.1 函数', '5.2 函数的基本性质', '5.3 函数的应用', '5.4 反函数',
  ])

  await page.goto('/')
  await selectSemester(page, 'g10-1')
  await selectSubject(page, 'math')
  await expect(page.locator('.chapter-directory')).toHaveCount(5)
  await expect(page.locator('.chapter-directory details')).toHaveCount(14)
  await expect(page.locator('.book-meta')).toContainText('5 章 · 14 节 · 27 个知识点')
})

test('all six math semesters preserve the audited textbook or review-board structure', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static textbook structure only needs one project')

  const expected = {
    'g10-1': {
      book: '普通高中教科书·数学（必修 第一册）', unitCount: 14, topicCount: 27,
      chapters: ['第1章 集合与逻辑', '第2章 等式与不等式', '第3章 幂、指数与对数', '第4章 幂函数、指数函数与对数函数', '第5章 函数的概念、性质及应用'],
    },
    'g10-2': {
      book: '普通高中教科书·数学（必修 第二册、第四册）', unitCount: 30, topicCount: 208,
      chapters: ['第6章 三角', '第7章 三角函数', '第8章 平面向量', '第9章 复数', '必修第四册 引论', '第1部分 数学建模活动案例', '第2部分 数学建模活动 A', '第3部分 数学建模活动 B', '附录'],
    },
    'g11-1': {
      book: '普通高中教科书·数学（必修 第三、四册）', unitCount: 30, topicCount: 181,
      chapters: ['必修第三册 · 第10章 空间直线与平面', '必修第三册 · 第11章 简单几何体', '必修第三册 · 第12章 概率初步', '必修第三册 · 第13章 统计', '必修第四册 · 第1部分 数学建模活动案例', '必修第四册 · 第2部分 数学建模活动A', '必修第四册 · 第3部分 数学建模活动B'],
    },
    'g11-2': {
      book: '普通高中教科书·数学（选择性必修 第一、三册）', unitCount: 27, topicCount: 194,
      chapters: ['选择性必修第一册 · 第1章 坐标平面上的直线', '选择性必修第一册 · 第2章 圆锥曲线', '选择性必修第一册 · 第3章 空间向量及其应用', '选择性必修第一册 · 第4章 数列', '选择性必修第三册 · 第1部分 数学建模活动案例', '选择性必修第三册 · 第2部分 数学建模活动A', '选择性必修第三册 · 第3部分 数学建模活动B'],
    },
    'g12-1': {
      book: '普通高中教科书·数学（选择性必修 第二册、第三册）', unitCount: 23, topicCount: 187,
      chapters: ['选择性必修第二册 · 第5章 导数及其应用', '选择性必修第二册 · 第6章 计数原理', '选择性必修第二册 · 第7章 概率初步（续）', '选择性必修第二册 · 第8章 成对数据的统计分析', '选择性必修第三册 · 第1部分 数学建模活动案例', '选择性必修第三册 · 第2部分 数学建模活动A', '选择性必修第三册 · 第3部分 数学建模活动B'],
    },
    'g12-2': {
      book: '上海高中数学专题复习（无统一新授教材）', unitCount: 21, topicCount: 193,
      chapters: ['第一单元 集合、命题与不等式', '第二单元 函数与导数', '第三单元 三角与平面向量', '第四单元 数列', '第五单元 解析几何', '第六单元 立体几何', '第七单元 复数、计数、概率与统计', '第八单元 数学思想方法', '第九单元 应用型问题', '第十单元 创新型问题', '第十一单元 综合表达与校验'],
    },
  } satisfies Record<SemesterId, { book: string; unitCount: number; topicCount: number; chapters: string[] }>

  for (const semester of semesterPlans) {
    const course = semester.courses.math
    const semesterExpected = expected[semester.id]
    expect(course.book, `${semester.id}: math book`).toBe(semesterExpected.book)
    expect(course.units.length, `${semester.id}: math section count`).toBe(semesterExpected.unitCount)
    expect(course.units.every((unit) => Boolean(unit.chapter)), `${semester.id}: every math section has a chapter or review board`).toBe(true)
    expect([...new Set(course.units.map((unit) => unit.chapter))], `${semester.id}: chapter order`).toEqual(semesterExpected.chapters)
    expect(course.units.reduce((sum, unit) => sum + unit.topics.length, 0), `${semester.id}: math topic count`).toBe(semesterExpected.topicCount)
  }

  expect(semesterPlans.find((semester) => semester.id === 'g12-2')?.courses.math.basis).toBe('review')
  expect(semesterPlans.find((semester) => semester.id === 'g12-2')?.courses.math.note).toContain('不冒充官方新教材目录')
})

test('high-three first-semester math keeps the official section order', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static textbook section order only needs one project')
  const mathCourse = semesterPlans.find((semester) => semester.id === 'g12-1')?.courses.math
  expect(mathCourse?.units.map((unit) => unit.title)).toEqual([
    '5.1 导数的概念及意义', '5.2 导数的运算', '5.3 导数的应用',
    '6.1 乘法原理与加法原理', '6.2 排列', '6.3 组合', '6.4 计数原理在古典概率中的应用', '6.5 二项式定理',
    '7.1 条件概率与相关公式', '7.2 随机变量的分布与特征', '7.3 常用分布',
    '8.1 成对数据的相关分析', '8.2 一元线性回归分析', '8.3 2×2列联表',
    '1.1 刹车距离', '1.2 易拉罐的设计', '1.3 珠穆朗玛峰顶上有多少氧气', '1.4 水葫芦的生长',
    '2.1 铅球投掷', '2.2 电梯调度', '3.1 存款计划', '3.2 民生巨变40年', '3.3 教室里的照明',
  ])
})

test('every high-one first-semester math topic uses its own substantive lesson', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static lesson routing only needs one project')

  const entries = allTopics.filter((entry) => entry.semester.id === 'g10-1' && entry.subjectId === 'math')
  expect(entries).toHaveLength(expectedG10MathLessonTemplates.size)
  for (const entry of entries) {
    expect(entry.topic.lesson.templateId, entry.topic.title).toBe(expectedG10MathLessonTemplates.get(entry.topic.title))
    expect(entry.topic.lesson.core, `${entry.topic.title}: core explicitly names the topic`).toContain(entry.topic.title)
    expect(entry.topic.lesson.example.prompt, `${entry.topic.title}: concrete worked example`).toMatch(/[0-9a-zA-Z=<>≤≥∈∩∪√²³]|出租车|药物|同学/)
  }
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

test('advanced math topics use subject-specific lesson families instead of broad fallback examples', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static math lesson routing only needs one project')

  const expectedFamilies = new Map([
    ['正弦函数的单调区间与最值', 'math-trigonometric-function--'],
    ['正弦定理的几何意义', 'math-triangle-solving--'],
    ['直线倾斜角的定义', 'math-line-coordinate-geometry--'],
    ['椭圆离心率', 'math-conic-definition-equation--'],
    ['异面直线所成的角', 'math-solid-geometry--'],
    ['样本均值与总体均值估计', 'math-statistics-inference--'],
    ['独立事件的概率乘法', 'math-probability-statistics--'],
    ['等差数列的单调性', 'math-sequence-recurrence--'],
  ])

  for (const [title, familyPrefix] of expectedFamilies) {
    const matches = allTopics.filter((entry) => entry.subjectId === 'math' && entry.topic.title === title)
    expect(matches.length, `${title}: topic exists`).toBeGreaterThan(0)
    for (const match of matches) {
      expect(match.topic.lesson.templateId.startsWith(familyPrefix), `${match.semester.id}/${title}: lesson family`).toBe(true)
      expect(match.topic.lesson.example.prompt.length, `${match.semester.id}/${title}: worked example`).toBeGreaterThan(18)
    }
  }
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
  const representativeTitles = ['交集并集与补集', '等式与不等式的性质', '对数概念与换底', '幂函数的图像与性质', '反函数']

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

test('representative advanced math visuals fit and remain interactive at every width', async ({ page }, testInfo) => {
  await page.goto('/')
  const representatives = [
    { semester: '高一下', title: '正弦定理的几何意义' },
    { semester: '高二上', title: '异面直线所成的角' },
    { semester: '高二下', title: '椭圆离心率' },
    { semester: '高三上', title: '*7.1.3 贝叶斯公式' },
    { semester: '高三上', title: '7.3.3 正态分布' },
    { semester: '高三下', title: '导数与最优化模型' },
  ]

  for (const representative of representatives) {
    await page.locator('.global-search input').fill(representative.title)
    await page.locator('.search-results button')
      .filter({ hasText: representative.title })
      .filter({ hasText: representative.semester })
      .filter({ hasText: '数学' })
      .first()
      .click()
    const visual = page.locator(`[data-math-concept-visual="${representative.title}"]`)
    await expect(visual, `${representative.semester}/${representative.title}: visual`).toBeVisible()
    const range = visual.locator('input[type="range"]').first()
    if (await range.count()) await range.fill(await range.getAttribute('max') ?? '1')
    const alternate = visual.locator('button[aria-pressed="false"]').first()
    if (await alternate.count()) await alternate.click()
    await expect(visual).not.toContainText(/NaN|Infinity|undefined/)
    await expect(visual.locator('svg').first()).toBeVisible()
    await expectNoPageOverflow(page, `${testInfo.project.name}/${representative.semester}/${representative.title}`)
  }
})

test('curve-equation visual keeps a valid SVG arc at the 360-degree endpoint', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'SVG endpoint regression only needs one browser')
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  await page.goto('/')
  const title = '轨迹方程的直接法'
  await page.locator('.global-search input').fill(title)
  await page.locator('.search-results button')
    .filter({ hasText: title })
    .filter({ hasText: '高二下' })
    .filter({ hasText: '数学' })
    .first()
    .click()
  const visual = page.locator(`[data-math-concept-visual="${title}"]`)
  await visual.locator('input[type="range"]').first().fill('360')
  await expect(visual.locator('path.g11mv-angle')).toHaveAttribute('d', /^M 362 170 A 42 42 0 1 0 /)
  expect(browserErrors, 'the 360-degree SVG arc should parse without browser errors').toEqual([])
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

  const power = mathEntry('幂函数的图像与性质')
  expect(power).toBeTruthy()
  if (!power) return
  await openTopic(page, power)
  const powerVisual = page.locator('[data-math-concept-visual="幂函数的图像与性质"]')
  await powerVisual.getByRole('button', { name: 'a = −1' }).click()
  await expect(powerVisual.locator('polyline.fmv-curve')).toHaveCount(2)
  await expect(powerVisual.locator('.fmv-asymptote')).toHaveCount(1)
  await powerVisual.getByRole('button', { name: 'a = 1/2' }).click()
  await expect(powerVisual.locator('.fmv-domain-endpoint')).toHaveCount(1)
})

test('new equality and inverse-function visuals preserve their key reasoning states', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Interaction state regression only needs one browser')
  await page.goto('/')
  const mathEntry = (title: string) => allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'math' && item.topic.title === title)

  const properties = mathEntry('等式与不等式的性质')
  expect(properties).toBeTruthy()
  if (!properties) return
  await openTopic(page, properties)
  const propertiesVisual = page.locator('[data-math-concept-visual="等式与不等式的性质"]')
  await propertiesVisual.getByRole('button', { name: '乘除负数方向反向' }).click()
  await expect(propertiesVisual.locator('.slv-property-formulas')).toContainText('4 > -8')
  await propertiesVisual.getByRole('button', { name: '错误诊断' }).click()
  await propertiesVisual.getByRole('button', { name: '等式两边乘 0' }).click()
  await expect(propertiesVisual).toContainText('解集从 {2} 扩大为全体实数')

  const inverse = mathEntry('反函数')
  expect(inverse).toBeTruthy()
  if (!inverse) return
  await openTopic(page, inverse)
  const inverseVisual = page.locator('[data-math-concept-visual="反函数"]')
  await expect(inverseVisual.locator('.fmv-inverse-swap')).toContainText('定义域')
  await expect(inverseVisual.locator('.fmv-reflection-line')).toHaveCount(1)
  await inverseVisual.getByRole('button', { name: '不可逆：g(x)=x²' }).click()
  await expect(inverseVisual.locator('.fmv-horizontal-hit')).toHaveCount(2)
  await expect(inverseVisual).toContainText('水平线交 2 点')
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
