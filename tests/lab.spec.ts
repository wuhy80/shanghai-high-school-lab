import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { allTopics, demoIds, semesterPlans, type SemesterId } from '../src/curriculum'
import { subjects, type SubjectId } from '../src/data'
import { G10_MATH_VISUAL_TOPICS } from '../src/components/math-visuals/g10MathVisualTopics'
import { APPLIED_LESSON_TEMPLATE_REGRESSIONS } from '../src/lessonApplied'
import { humanitiesRegressionTemplateByTitle } from '../src/lessonHumanities'
import { resolveChemistryVisualFamily, resolvePhysicsVisualFamily } from '../src/components/science-visuals/scienceVisualFamilies'

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

test('physics and chemistry are chaptered, deep and duplicate-free in all six semesters', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static science curriculum validation only needs one project')

  for (const semester of semesterPlans) {
    for (const subjectId of ['physics', 'chemistry'] as const) {
      const course = semester.courses[subjectId]
      const titles = course.units.flatMap((unit) => unit.topics.map((topic) => topic.title))
      const uniqueTitles = new Set(titles)
      expect(course.units.every((unit) => Boolean(unit.chapter)), `${semester.id}/${subjectId}: every section has a chapter`).toBe(true)
      expect(uniqueTitles.size, `${semester.id}/${subjectId}: duplicate topic titles`).toBe(titles.length)
      expect(titles.length, `${semester.id}/${subjectId}: substantive topic count`).toBeGreaterThanOrEqual(50)
      expect(course.units.every((unit) => unit.topics.every((topic) => topic.lesson.templateId.includes('--'))), `${semester.id}/${subjectId}: dedicated lesson routing`).toBe(true)
      if (semester.id === 'g12-2') {
        expect(course.basis, `${semester.id}/${subjectId}: review basis`).toBe('review')
        expect(course.book, `${semester.id}/${subjectId}: no invented textbook`).toContain('专题复习')
      }
    }
  }
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
  assertRoutes(
    Object.fromEntries(Object.entries(humanitiesRegressionTemplateByTitle).map(([key, route]) => [key, route.familyId])),
    'humanities subjects',
  )
})

test('physics and chemistry topics route to their dedicated concept families', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static science route validation only needs one project')
  const routes = [
    { subjectId: 'physics', title: '匀变速直线运动的定义', family: 'linear-kinematics' },
    { subjectId: 'physics', title: '洛伦兹力方向', family: 'magnetic-particle' },
    { subjectId: 'physics', title: '机械波的形成条件', family: 'mechanical-wave' },
    { subjectId: 'physics', title: '法拉第电磁感应定律', family: 'electromagnetic-induction' },
    { subjectId: 'physics', title: '理想气体状态方程', family: 'thermal-gas' },
    { subjectId: 'physics', title: '光电效应的实验规律', family: 'modern-physics' },
    { subjectId: 'chemistry', title: '物质的量及单位', family: 'chemistry-stoichiometry' },
    { subjectId: 'chemistry', title: '平衡常数的表达', family: 'chemistry-equilibrium' },
    { subjectId: 'chemistry', title: '原电池电极判断', family: 'chemistry-electrochemistry' },
    { subjectId: 'chemistry', title: '分子空间构型', family: 'chemistry-molecular-geometry' },
    { subjectId: 'chemistry', title: '官能团相互转化', family: 'chemistry-organic-reactions' },
    { subjectId: 'chemistry', title: '气体制备净化收集', family: 'chemistry-gas-preparation' },
  ] as const

  for (const route of routes) {
    const matches = allTopics.filter((entry) => entry.subjectId === route.subjectId && entry.topic.title === route.title)
    expect(matches.length, `${route.subjectId}/${route.title}: curriculum topic exists`).toBeGreaterThan(0)
    for (const match of matches) {
      expect(match.topic.lesson.templateId, `${match.semester.id}/${route.title}: dedicated lesson family`).toMatch(new RegExp(`^${route.family}--`))
    }
  }
})

test('ambiguous science titles route to the intended visual family', async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Static science visual route validation only needs one project')
  const routes = [
    { subjectId: 'physics', title: '多解与运动方向核验', family: 'motion' },
    { subjectId: 'physics', title: '重力势能', family: 'energy' },
    { subjectId: 'physics', title: '静电平衡与导体内部', family: 'electrostatic' },
    { subjectId: 'physics', title: '碰撞中的临界条件', family: 'momentum' },
    { subjectId: 'physics', title: '回复力与加速度关系', family: 'oscillation' },
    { subjectId: 'physics', title: '横波纵波与介质质点', family: 'wave' },
    { subjectId: 'physics', title: '带电粒子在磁场中的运动', family: 'magnet' },
    { subjectId: 'physics', title: '理想变压器', family: 'transformer' },
    { subjectId: 'physics', title: '传感器的输入与输出', family: 'sensor' },
    { subjectId: 'physics', title: '气体状态变化与图像', family: 'pv-process' },
    { subjectId: 'physics', title: '原子核衰变规律', family: 'nuclear' },
    { subjectId: 'chemistry', title: '电解质和非电解质', family: 'ions' },
    { subjectId: 'chemistry', title: '弱电解质的电离平衡', family: 'acid' },
    { subjectId: 'chemistry', title: '电离能与电负性', family: 'periodic' },
    { subjectId: 'chemistry', title: '化学键与反应热', family: 'thermochemistry' },
    { subjectId: 'chemistry', title: '反应物产物总能量', family: 'thermochemistry' },
    { subjectId: 'chemistry', title: '晶胞中的粒子计数', family: 'crystal' },
    { subjectId: 'chemistry', title: '电解池工作原理', family: 'electrolysis-corrosion' },
    { subjectId: 'chemistry', title: '酸碱中和滴定', family: 'titration' },
    { subjectId: 'chemistry', title: '气体制备净化与收集', family: 'apparatus' },
    { subjectId: 'chemistry', title: '烯烃炔烃的加成氧化', family: 'organic-reaction' },
  ] as const

  for (const route of routes) {
    const entries = allTopics.filter((entry) => entry.subjectId === route.subjectId && entry.topic.title === route.title)
    expect(entries.length, `${route.subjectId}/${route.title}: curriculum topic exists`).toBeGreaterThan(0)
    for (const entry of entries) {
      const family = route.subjectId === 'physics'
        ? resolvePhysicsVisualFamily(entry.topic.title, entry.unit.title)
        : resolveChemistryVisualFamily(entry.topic.title, entry.unit.title)
      expect(family, `${entry.semester.id}/${route.title}: visual family`).toBe(route.family)
    }
  }
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

test('mobile catalog restores focus and keeps active course filters visible', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile focus flow is covered at 390x844')
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 })
  await page.goto('/')

  const catalogTrigger = page.getByRole('button', { name: '课程目录', exact: true })
  const catalogClose = page.locator('.catalog-close')
  await catalogTrigger.click()
  await expect(catalogClose).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(catalogTrigger).toBeFocused()

  await catalogTrigger.click()
  await expect(catalogClose).toBeFocused()
  const nextTopic = page.locator('.catalog-sidebar details[open] li button:not([aria-current="page"])').first()
  const nextTopicTitle = (await nextTopic.locator('strong').textContent())?.trim()
  expect(nextTopicTitle, 'a different visible topic in the current catalog section').toBeTruthy()
  if (!nextTopicTitle) return
  await nextTopic.click()

  const nextHeading = page.getByRole('heading', { level: 1, name: nextTopicTitle, exact: true })
  await expect(nextHeading).toBeVisible()
  await expect(nextHeading).toBeFocused()

  const distantTarget = allTopics.find((entry) => (
    entry.semester.id === 'g12-1'
    && entry.subjectId === 'physics'
    && entry.topic.title === '法拉第电磁感应定律'
  ))
  expect(distantTarget, 'a distant semester and subject search target').toBeTruthy()
  if (!distantTarget) return

  await page.getByRole('searchbox', { name: '搜索全部课程内容' }).fill(distantTarget.topic.title)
  await page.locator('.search-results button')
    .filter({ hasText: distantTarget.topic.title })
    .filter({ hasText: distantTarget.semester.shortLabel })
    .filter({ hasText: subjectName(distantTarget.subjectId) })
    .first()
    .click()

  const distantHeading = page.getByRole('heading', { level: 1, name: distantTarget.topic.title, exact: true })
  await expect(distantHeading).toBeFocused()
  await expect(page.locator('.semester-nav button[aria-current="page"]')).toContainText(distantTarget.semester.shortLabel)
  await expect(page.locator('.subject-nav button[aria-current="page"]')).toContainText(subjectName(distantTarget.subjectId))

  const activeItemIsVisible = async (navSelector: string) => page.locator(navSelector).evaluate((nav) => {
    const active = nav.querySelector<HTMLButtonElement>('button[aria-current="page"]')
    if (!active) return false
    const navBounds = nav.getBoundingClientRect()
    const activeBounds = active.getBoundingClientRect()
    return activeBounds.left >= navBounds.left - 1 && activeBounds.right <= navBounds.right + 1
  })
  await expect.poll(() => activeItemIsVisible('.semester-nav')).toBe(true)
  await expect.poll(() => activeItemIsVisible('.subject-nav')).toBe(true)
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

test('representative physics and chemistry visual families work at every width', async ({ page }, testInfo) => {
  test.setTimeout(300_000)
  await page.goto('/')
  const representatives = [
    { semesterId: 'g10-1', subjectId: 'physics', title: '匀变速直线运动的定义', family: 'motion' },
    { semesterId: 'g11-1', subjectId: 'physics', title: '闭合电路欧姆定律', family: 'electric' },
    { semesterId: 'g11-1', subjectId: 'physics', title: '洛伦兹力方向', family: 'magnet' },
    { semesterId: 'g11-2', subjectId: 'physics', title: '机械波的形成条件', family: 'wave' },
    { semesterId: 'g12-1', subjectId: 'physics', title: '理想气体状态方程', family: 'thermal' },
    { semesterId: 'g12-1', subjectId: 'physics', title: '法拉第电磁感应定律', family: 'induction' },
    { semesterId: 'g12-1', subjectId: 'physics', title: '光电效应的实验规律', family: 'modern' },
    { semesterId: 'g12-1', subjectId: 'physics', title: '理想变压器', family: 'transformer' },
    { semesterId: 'g12-1', subjectId: 'physics', title: '传感器的输入与输出', family: 'sensor' },
    { semesterId: 'g12-2', subjectId: 'physics', title: '气体状态变化与图像', family: 'pv-process' },
    { semesterId: 'g12-1', subjectId: 'physics', title: '原子核衰变规律', family: 'nuclear' },
    { semesterId: 'g10-2', subjectId: 'physics', title: '曲线运动的速度方向', family: 'projectile' },
    { semesterId: 'g10-1', subjectId: 'physics', title: '受力分析的隔离法', family: 'force' },
    { semesterId: 'g10-2', subjectId: 'physics', title: '万有引力定律', family: 'orbit' },
    { semesterId: 'g10-2', subjectId: 'physics', title: '机械能守恒条件', family: 'energy' },
    { semesterId: 'g11-2', subjectId: 'physics', title: '弹性碰撞', family: 'momentum' },
    { semesterId: 'g11-2', subjectId: 'physics', title: '单摆周期', family: 'oscillation' },
    { semesterId: 'g12-2', subjectId: 'physics', title: '几何光学成像', family: 'optics' },
    { semesterId: 'g11-1', subjectId: 'physics', title: '静电平衡与导体内部', family: 'electrostatic' },
    { semesterId: 'g10-1', subjectId: 'chemistry', title: '物质的量及单位', family: 'stoich' },
    { semesterId: 'g10-2', subjectId: 'chemistry', title: '温度影响', family: 'rate' },
    { semesterId: 'g11-2', subjectId: 'chemistry', title: '平衡常数的表达', family: 'equilibrium' },
    { semesterId: 'g11-2', subjectId: 'chemistry', title: '水的离子积与pH', family: 'acid' },
    { semesterId: 'g11-2', subjectId: 'chemistry', title: '原电池电极判断', family: 'electrochem' },
    { semesterId: 'g12-1', subjectId: 'chemistry', title: '分子空间构型', family: 'structure' },
    { semesterId: 'g12-1', subjectId: 'chemistry', title: '有机物分类与命名', family: 'organic' },
    { semesterId: 'g12-2', subjectId: 'chemistry', title: '实验变量设计', family: 'experiment' },
    { semesterId: 'g10-1', subjectId: 'chemistry', title: '离子反应发生条件', family: 'ions' },
    { semesterId: 'g10-1', subjectId: 'chemistry', title: '电子转移表示法', family: 'redox' },
    { semesterId: 'g10-2', subjectId: 'chemistry', title: '原子半径递变', family: 'periodic' },
    { semesterId: 'g11-2', subjectId: 'chemistry', title: '反应能量图与活化能', family: 'thermochemistry' },
    { semesterId: 'g12-1', subjectId: 'chemistry', title: '晶胞中的粒子计数', family: 'crystal' },
    { semesterId: 'g10-1', subjectId: 'chemistry', title: '氯气与水反应', family: 'inorganic' },
    { semesterId: 'g11-2', subjectId: 'chemistry', title: '沉淀溶解平衡', family: 'precipitation' },
    { semesterId: 'g12-1', subjectId: 'chemistry', title: '质谱红外与核磁信息', family: 'spectrum' },
    { semesterId: 'g10-2', subjectId: 'chemistry', title: '材料老化与回收', family: 'materials' },
    { semesterId: 'g11-2', subjectId: 'chemistry', title: '电解池工作原理', family: 'electrolysis-corrosion' },
    { semesterId: 'g11-2', subjectId: 'chemistry', title: '酸碱中和滴定', family: 'titration' },
    { semesterId: 'g12-2', subjectId: 'chemistry', title: '气体制备净化收集', family: 'apparatus' },
    { semesterId: 'g12-1', subjectId: 'chemistry', title: '烯烃炔烃的加成氧化', family: 'organic-reaction' },
  ] as const

  for (const representative of representatives) {
    const entry = allTopics.find((item) => item.semester.id === representative.semesterId
      && item.subjectId === representative.subjectId
      && item.topic.title === representative.title)
    expect(entry, `${representative.semesterId}/${representative.title}: curriculum entry`).toBeTruthy()
    if (!entry) continue
    await page.getByRole('searchbox', { name: '搜索全部课程内容' }).fill(entry.topic.title)
    await page.locator('.search-results button')
      .filter({ hasText: entry.topic.title })
      .filter({ hasText: entry.semester.shortLabel })
      .filter({ hasText: subjectName(entry.subjectId) })
      .first()
      .click()

    const visual = page.locator(`[data-science-concept-visual="${entry.topic.title}"]`)
    await expect(visual, `${entry.semester.shortLabel}/${entry.topic.title}: visual`).toBeVisible()
    await expect(visual).toHaveAttribute('data-science-family', representative.family)
    await expect(visual.locator('svg[role="img"]')).toBeVisible()
    const bounds = await visual.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return { height: rect.height, width: rect.width }
    })
    expect(bounds.width, `${entry.topic.title}: visual width`).toBeGreaterThan(240)
    expect(bounds.height, `${entry.topic.title}: visual height`).toBeGreaterThan(160)

    const range = visual.locator('input[type="range"]').first()
    if (await range.count()) await range.fill(await range.getAttribute('max') ?? '1')
    const choice = visual.locator('button[aria-pressed="false"]').first()
    if (await choice.count()) await choice.click()
    await expect(visual).not.toContainText(/NaN|Infinity|undefined/)
    await expectNoPageOverflow(page, `${testInfo.project.name}/${entry.semester.shortLabel}/${entry.topic.title}`)
  }
})

test('new science visual families keep every SVG element inside the viewBox', async ({ page }, testInfo) => {
  test.setTimeout(240_000)
  await page.goto('/')
  const representatives = [
    ['g10-2', 'physics', '曲线运动的速度方向'],
    ['g10-1', 'physics', '受力分析的隔离法'],
    ['g10-2', 'physics', '万有引力定律'],
    ['g10-2', 'physics', '机械能守恒条件'],
    ['g11-2', 'physics', '弹性碰撞'],
    ['g11-2', 'physics', '单摆周期'],
    ['g12-2', 'physics', '几何光学成像'],
    ['g11-1', 'physics', '静电平衡与导体内部'],
    ['g12-1', 'physics', '理想变压器'],
    ['g12-1', 'physics', '传感器的输入与输出'],
    ['g12-2', 'physics', '气体状态变化与图像'],
    ['g12-1', 'physics', '原子核衰变规律'],
    ['g10-1', 'chemistry', '离子反应发生条件'],
    ['g10-1', 'chemistry', '电子转移表示法'],
    ['g10-2', 'chemistry', '原子半径递变'],
    ['g11-2', 'chemistry', '反应能量图与活化能'],
    ['g12-1', 'chemistry', '晶胞中的粒子计数'],
    ['g10-1', 'chemistry', '氯气与水反应'],
    ['g11-2', 'chemistry', '沉淀溶解平衡'],
    ['g12-1', 'chemistry', '质谱红外与核磁信息'],
    ['g10-2', 'chemistry', '材料老化与回收'],
    ['g11-2', 'chemistry', '电解池工作原理'],
    ['g11-2', 'chemistry', '酸碱中和滴定'],
    ['g12-2', 'chemistry', '气体制备净化收集'],
    ['g12-1', 'chemistry', '烯烃炔烃的加成氧化'],
  ] as const

  const expectInsideViewBox = async (visual: ReturnType<Page['locator']>, label: string) => {
    const overflow = await visual.locator('svg').evaluate((svg) => {
      const viewBox = svg.viewBox.baseVal
      const tolerance = 2
      return Array.from(svg.querySelectorAll<SVGGraphicsElement>('text,line,path,polyline,polygon,rect,circle,ellipse'))
        .flatMap((element) => {
          if (getComputedStyle(element).display === 'none') return []
          let box: DOMRect
          try {
            box = element.getBBox()
          } catch {
            return []
          }
          const svgMatrix = svg.getScreenCTM()
          const elementMatrix = element.getScreenCTM()
          const matrix = svgMatrix && elementMatrix ? svgMatrix.inverse().multiply(elementMatrix) : undefined
          const corners = [
            [box.x, box.y],
            [box.x + box.width, box.y],
            [box.x, box.y + box.height],
            [box.x + box.width, box.y + box.height],
          ].map(([x, y]) => {
            const point = svg.createSVGPoint()
            point.x = x
            point.y = y
            return matrix ? point.matrixTransform(matrix) : point
          })
          const bounds = {
            x: Math.min(...corners.map((point) => point.x)),
            y: Math.min(...corners.map((point) => point.y)),
            width: Math.max(...corners.map((point) => point.x)) - Math.min(...corners.map((point) => point.x)),
            height: Math.max(...corners.map((point) => point.y)) - Math.min(...corners.map((point) => point.y)),
          }
          const outside = bounds.x < viewBox.x - tolerance
            || bounds.y < viewBox.y - tolerance
            || bounds.x + bounds.width > viewBox.x + viewBox.width + tolerance
            || bounds.y + bounds.height > viewBox.y + viewBox.height + tolerance
          return outside ? [{ tag: element.tagName, text: element.textContent?.trim(), box: bounds }] : []
        })
    })
    expect(overflow, label).toEqual([])
  }

  for (const [semesterId, subjectId, title] of representatives) {
    const entry = allTopics.find((item) => item.semester.id === semesterId && item.subjectId === subjectId && item.topic.title === title)
    expect(entry, `${semesterId}/${subjectId}/${title}: curriculum entry`).toBeTruthy()
    if (!entry) continue
    await page.getByRole('searchbox', { name: '搜索全部课程内容' }).fill(title)
    await page.locator('.search-results button').filter({ hasText: title }).filter({ hasText: entry.semester.shortLabel }).filter({ hasText: subjectName(entry.subjectId) }).first().click()
    const visual = page.locator(`[data-science-concept-visual="${title}"]`)
    await expect(visual).toBeVisible()
    await expectInsideViewBox(visual, `${testInfo.project.name}/${title}/initial`)

    const ranges = visual.locator('input[type="range"]')
    for (let index = 0; index < await ranges.count(); index += 1) {
      const range = ranges.nth(index)
      await range.fill(await range.getAttribute('min') ?? '0')
      await expectInsideViewBox(visual, `${testInfo.project.name}/${title}/range-${index}-min`)
      await range.fill(await range.getAttribute('max') ?? '1')
      await expectInsideViewBox(visual, `${testInfo.project.name}/${title}/range-${index}-max`)
    }

    const choices = visual.locator('.amv-choices button')
    for (let index = 0; index < await choices.count(); index += 1) {
      await choices.nth(index).click()
      await expectInsideViewBox(visual, `${testInfo.project.name}/${title}/choice-${index}`)
    }
  }
})

test('science animation controls change state and respect reduced motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Animation state regression only needs one browser')
  await page.goto('/')
  const entry = allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'physics' && item.topic.title === '匀变速直线运动的定义')
  expect(entry).toBeTruthy()
  if (!entry) return
  await openTopic(page, entry)
  const visual = page.locator(`[data-science-concept-visual="${entry.topic.title}"]`)
  const button = visual.locator('.science-play')
  await expect(button).toHaveText('播放动画')
  const movingDot = visual.locator('.science-dot').first()
  const initialX = await movingDot.getAttribute('cx')
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await expect(button).toHaveText('暂停动画')
  await page.waitForTimeout(160)
  expect(await movingDot.getAttribute('cx')).not.toBe(initialX)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(button).toBeHidden()
  const stoppedX = await movingDot.getAttribute('cx')
  await page.waitForTimeout(180)
  expect(await movingDot.getAttribute('cx')).toBe(stoppedX)
})

test('science diagrams preserve their core quantitative relationships', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Science invariants only need one browser')
  await page.goto('/')
  const entry = (semesterId: SemesterId, subjectId: SubjectId, title: string) => {
    const match = allTopics.find((item) => item.semester.id === semesterId && item.subjectId === subjectId && item.topic.title === title)
    expect(match, `${semesterId}/${subjectId}/${title}: curriculum entry`).toBeTruthy()
    return match
  }

  const motionEntry = entry('g10-1', 'physics', '匀变速直线运动的定义')
  if (!motionEntry) return
  await openTopic(page, motionEntry)
  const motion = page.locator('[data-science-family="motion"]')
  await motion.locator('input[type="range"]').nth(0).fill('1')
  await motion.locator('input[type="range"]').nth(1).fill('0')
  await expect(motion.locator('svg')).toHaveAttribute('data-displacement', '4.000')
  await motion.locator('input[type="range"]').nth(1).fill('2')
  await expect(motion.locator('svg')).toHaveAttribute('data-displacement', '20.000')

  const magnetEntry = entry('g11-1', 'physics', '洛伦兹力方向')
  if (!magnetEntry) return
  await openTopic(page, magnetEntry)
  const magnet = page.locator('[data-science-family="magnet"]')
  await magnet.locator('input[type="range"]').fill('1')
  const slowRadius = Number(await magnet.locator('svg').getAttribute('data-orbit-radius'))
  await magnet.locator('input[type="range"]').fill('6')
  const fastRadius = Number(await magnet.locator('svg').getAttribute('data-orbit-radius'))
  expect(fastRadius, 'r=mv/(qB): faster particles have a larger radius').toBeGreaterThan(slowRadius)

  const waveEntry = entry('g11-2', 'physics', '机械波的形成条件')
  if (!waveEntry) return
  await openTopic(page, waveEntry)
  const wave = page.locator('[data-science-family="wave"]')
  await wave.locator('input[type="range"]').first().fill('1')
  const lowFrequencyEnd = Number(await wave.locator('[data-wavelength-marker]').getAttribute('x2'))
  await wave.locator('input[type="range"]').first().fill('4')
  const highFrequencyEnd = Number(await wave.locator('[data-wavelength-marker]').getAttribute('x2'))
  expect(highFrequencyEnd, 'v=lambda*f: wavelength shrinks as frequency rises at fixed speed').toBeLessThan(lowFrequencyEnd)

  const inductionEntry = entry('g12-1', 'physics', '法拉第电磁感应定律')
  if (!inductionEntry) return
  await openTopic(page, inductionEntry)
  const induction = page.locator('[data-science-family="induction"]')
  await induction.locator('input[type="range"]').fill('0')
  await expect(induction.locator('svg')).toHaveAttribute('data-induced-emf', '0.000')
  await induction.locator('input[type="range"]').fill('80')
  await expect(induction.locator('svg')).toHaveAttribute('data-induced-emf', '4.000')

  const transformerEntry = entry('g12-1', 'physics', '理想变压器')
  if (!transformerEntry) return
  await openTopic(page, transformerEntry)
  const transformer = page.locator('[data-science-family="transformer"]')
  await transformer.locator('input[type="range"]').nth(0).fill('400')
  await transformer.locator('input[type="range"]').nth(1).fill('800')
  await expect(transformer.locator('svg')).toHaveAttribute('data-turns-ratio', '2.000')
  await expect(transformer.locator('svg')).toHaveAttribute('data-output-voltage', '440.000')
  await expect(transformer.locator('svg')).toHaveAttribute('data-output-current', '0.500')

  const gasEntry = entry('g12-2', 'physics', '气体状态变化与图像')
  if (!gasEntry) return
  await openTopic(page, gasEntry)
  const gas = page.locator('[data-science-family="pv-process"]')
  await gas.locator('.amv-choices button').filter({ hasText: '等温' }).click()
  await gas.locator('input[type="range"]').fill('1.6')
  const gasSvg = gas.locator('svg')
  expect(Number(await gasSvg.getAttribute('data-pressure')) * Number(await gasSvg.getAttribute('data-volume')), 'isothermal pV remains constant').toBeCloseTo(200, 2)
  await expect(gasSvg).toHaveAttribute('data-temperature', '300.000')

  const nuclearEntry = entry('g12-1', 'physics', '原子核衰变规律')
  if (!nuclearEntry) return
  await openTopic(page, nuclearEntry)
  const nuclear = page.locator('[data-science-family="nuclear"]')
  await nuclear.locator('input[type="range"]').nth(0).fill('6')
  await nuclear.locator('input[type="range"]').nth(1).fill('6')
  await expect(nuclear.locator('svg')).toHaveAttribute('data-parent-nuclei', '32')
  await nuclear.locator('input[type="range"]').nth(1).fill('12')
  await expect(nuclear.locator('svg')).toHaveAttribute('data-parent-nuclei', '16')

  const modernEntry = entry('g12-1', 'physics', '光电效应的实验规律')
  if (!modernEntry) return
  await openTopic(page, modernEntry)
  const modern = page.locator('[data-science-family="modern"]')
  const n1Y = Number(await modern.locator('[data-energy-level="1"]').getAttribute('y1'))
  const n4Y = Number(await modern.locator('[data-energy-level="4"]').getAttribute('y1'))
  expect(n4Y, 'higher atomic energy levels appear higher on the diagram').toBeLessThan(n1Y)

  const acidEntry = entry('g11-2', 'chemistry', '水的离子积与pH')
  if (!acidEntry) return
  await openTopic(page, acidEntry)
  const acid = page.locator('[data-science-family="acid"]')
  await acid.locator('input[type="range"]').fill('0')
  await expect(acid.locator('[data-ph-indicator]')).toHaveAttribute('fill', /hsl\(0 /)
  await acid.locator('input[type="range"]').fill('14')
  await expect(acid.locator('[data-ph-indicator]')).toHaveAttribute('fill', /hsl\(240 /)

  const rateEntry = entry('g10-2', 'chemistry', '温度影响')
  if (!rateEntry) return
  await openTopic(page, rateEntry)
  const rate = page.locator('[data-science-family="rate"]')
  await rate.locator('input[type="range"]').first().fill('200')
  await expect(rate.locator('svg')).toHaveAttribute('data-particle-count', '16')
  await rate.locator('input[type="range"]').first().fill('500')
  await expect(rate.locator('svg')).toHaveAttribute('data-particle-count', '16')

  const titrationEntry = entry('g11-2', 'chemistry', '酸碱中和滴定')
  if (!titrationEntry) return
  await openTopic(page, titrationEntry)
  const titration = page.locator('[data-science-family="titration"]')
  await titration.locator('input[type="range"]').fill('25')
  await expect(titration.locator('svg')).toHaveAttribute('data-titration-ph', '7.000')

  const electrolysisEntry = entry('g11-2', 'chemistry', '电解池工作原理')
  if (!electrolysisEntry) return
  await openTopic(page, electrolysisEntry)
  const electrolysis = page.locator('[data-science-family="electrolysis-corrosion"]')
  await electrolysis.locator('.amv-choices button').filter({ hasText: '电解池' }).click()
  await expect(electrolysis.locator('svg')).toHaveAttribute('data-electrochemistry-mode', 'electrolysis')
  await expect(electrolysis).toContainText('阳极(+)：2Cl⁻ → Cl₂ + 2e⁻')
})

test('representative science visuals pass serious and critical WCAG checks in both themes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'narrow-chromium', 'Axe is covered at desktop and 390px mobile widths')
  test.setTimeout(180_000)
  await page.addInitScript(() => localStorage.setItem('huzhi-theme', 'light'))
  await page.goto('/')
  const entries = [
    allTopics.find((item) => item.semester.id === 'g12-1' && item.subjectId === 'physics' && item.topic.title === '法拉第电磁感应定律'),
    allTopics.find((item) => item.semester.id === 'g11-2' && item.subjectId === 'chemistry' && item.topic.title === '原电池电极判断'),
    allTopics.find((item) => item.semester.id === 'g10-2' && item.subjectId === 'physics' && item.topic.title === '曲线运动的速度方向'),
    allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'physics' && item.topic.title === '受力分析的隔离法'),
    allTopics.find((item) => item.semester.id === 'g10-2' && item.subjectId === 'physics' && item.topic.title === '万有引力定律'),
    allTopics.find((item) => item.semester.id === 'g10-2' && item.subjectId === 'physics' && item.topic.title === '机械能守恒条件'),
    allTopics.find((item) => item.semester.id === 'g11-2' && item.subjectId === 'physics' && item.topic.title === '弹性碰撞'),
    allTopics.find((item) => item.semester.id === 'g11-2' && item.subjectId === 'physics' && item.topic.title === '单摆周期'),
    allTopics.find((item) => item.semester.id === 'g12-2' && item.subjectId === 'physics' && item.topic.title === '几何光学成像'),
    allTopics.find((item) => item.semester.id === 'g11-1' && item.subjectId === 'physics' && item.topic.title === '静电平衡与导体内部'),
    allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'chemistry' && item.topic.title === '离子反应发生条件'),
    allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'chemistry' && item.topic.title === '电子转移表示法'),
    allTopics.find((item) => item.semester.id === 'g10-2' && item.subjectId === 'chemistry' && item.topic.title === '原子半径递变'),
    allTopics.find((item) => item.semester.id === 'g11-2' && item.subjectId === 'chemistry' && item.topic.title === '反应能量图与活化能'),
    allTopics.find((item) => item.semester.id === 'g12-1' && item.subjectId === 'chemistry' && item.topic.title === '晶胞中的粒子计数'),
    allTopics.find((item) => item.semester.id === 'g10-1' && item.subjectId === 'chemistry' && item.topic.title === '氯气与水反应'),
    allTopics.find((item) => item.semester.id === 'g11-2' && item.subjectId === 'chemistry' && item.topic.title === '沉淀溶解平衡'),
    allTopics.find((item) => item.semester.id === 'g12-1' && item.subjectId === 'chemistry' && item.topic.title === '质谱红外与核磁信息'),
    allTopics.find((item) => item.semester.id === 'g10-2' && item.subjectId === 'chemistry' && item.topic.title === '材料老化与回收'),
    allTopics.find((item) => item.semester.id === 'g12-1' && item.subjectId === 'physics' && item.topic.title === '理想变压器'),
    allTopics.find((item) => item.semester.id === 'g12-1' && item.subjectId === 'physics' && item.topic.title === '传感器的输入与输出'),
    allTopics.find((item) => item.semester.id === 'g12-2' && item.subjectId === 'physics' && item.topic.title === '气体状态变化与图像'),
    allTopics.find((item) => item.semester.id === 'g12-1' && item.subjectId === 'physics' && item.topic.title === '原子核衰变规律'),
    allTopics.find((item) => item.semester.id === 'g11-2' && item.subjectId === 'chemistry' && item.topic.title === '电解池工作原理'),
    allTopics.find((item) => item.semester.id === 'g11-2' && item.subjectId === 'chemistry' && item.topic.title === '酸碱中和滴定'),
    allTopics.find((item) => item.semester.id === 'g12-2' && item.subjectId === 'chemistry' && item.topic.title === '气体制备净化收集'),
    allTopics.find((item) => item.semester.id === 'g12-1' && item.subjectId === 'chemistry' && item.topic.title === '烯烃炔烃的加成氧化'),
  ]
  expect(entries.every(Boolean), 'science accessibility representatives exist').toBe(true)

  for (const theme of ['light', 'dark'] as const) {
    if (theme === 'dark') await page.locator('.icon-button').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    for (const entry of entries) {
      if (!entry) continue
      await page.getByRole('searchbox', { name: '搜索全部课程内容' }).fill(entry.topic.title)
      await page.locator('.search-results button')
        .filter({ hasText: entry.topic.title })
        .filter({ hasText: entry.semester.shortLabel })
        .filter({ hasText: subjectName(entry.subjectId) })
        .first()
        .click()
      const visual = page.locator(`[data-science-concept-visual="${entry.topic.title}"]`)
      await expect(visual).toBeVisible()
      const results = await new AxeBuilder({ page }).include(`[data-science-concept-visual="${entry.topic.title}"]`).withTags(['wcag2a', 'wcag2aa']).analyze()
      const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
      expect(blocking, `${testInfo.project.name}/${theme}/${entry.topic.title}: science visual accessibility violations`).toEqual([])
    }
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
