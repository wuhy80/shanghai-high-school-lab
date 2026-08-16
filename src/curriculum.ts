import { semesterSeeds } from './curriculumSeeds'
import type { SubjectId } from './data'
import { buildLessonContent } from './lessonContent'
import type { LessonContent } from './lessonTypes'

export type SemesterId = 'g10-1' | 'g10-2' | 'g11-1' | 'g11-2' | 'g12-1' | 'g12-2'
export type TopicMode = 'demo' | 'explain'
export type VisualKind = 'model' | 'structure' | 'process' | 'timeline' | 'relation' | 'flow'
export type CourseBasis = 'catalog' | 'school' | 'review'

export type KnowledgeTopic = {
  id: string
  title: string
  focus: string
  question: string
  keyPoints: [string, string, string]
  pitfall: string
  lesson: LessonContent
  mode: TopicMode
  visual: VisualKind
  demoId?: string
}

export type CurriculumUnit = {
  id: string
  chapter?: string
  title: string
  focus: string
  topics: KnowledgeTopic[]
}

export type CoursePlan = {
  book: string
  publisher: string
  basis: CourseBasis
  note?: string
  units: CurriculumUnit[]
}

export type SemesterPlan = {
  id: SemesterId
  grade: '高一' | '高二' | '高三'
  term: '第一学期' | '第二学期'
  label: string
  shortLabel: string
  description: string
  sourceLabel: string
  sourceUrl: string
  courses: Record<SubjectId, CoursePlan>
}

export type UnitSeed = {
  chapter?: string
  title: string
  focus: string
  topics: string[]
}

export type CourseSeed = Omit<CoursePlan, 'units'> & { units: UnitSeed[] }
export type SemesterSeed = Omit<SemesterPlan, 'courses'> & { courses: Record<SubjectId, CourseSeed> }

export const demoIds = [
  'function', 'probability', 'unit-circle', 'projectile', 'wave', 'circuit', 'equilibrium', 'titration',
  'reaction-rate', 'genetics', 'enzyme', 'photosynthesis', 'argument', 'imagery', 'classical-syntax',
  'syntax', 'tense', 'conditional', 'timeline', 'revolution', 'causality', 'solar', 'circulation',
  'water-cycle', 'market', 'flow', 'rule-of-law',
] as const

const demoByTitle: Record<string, (typeof demoIds)[number]> = {
  '函数图像与参数变换': 'function',
  '随机试验与频率': 'probability',
  '单位圆与三角函数': 'unit-circle',
  '平抛与斜抛运动': 'projectile',
  '波的叠加与干涉': 'wave',
  '欧姆定律与伏安特性': 'circuit',
  '闭合电路欧姆定律': 'circuit',
  '化学平衡移动': 'equilibrium',
  '化学平衡移动与常数': 'equilibrium',
  '浓度压强对平衡的影响': 'equilibrium',
  '酸碱中和滴定': 'titration',
  '浓度温度与反应速率': 'reaction-rate',
  '孟德尔遗传组合': 'genetics',
  '温度pH与酶活性': 'enzyme',
  '光照CO₂与光合速率': 'photosynthesis',
  '论点论据与论证链': 'argument',
  '诗词意象与情感': 'imagery',
  '特殊句式与语序还原': 'classical-syntax',
  '英语复杂句拆解': 'syntax',
  '时态与时间轴': 'tense',
  '真实与虚拟条件句': 'conditional',
  '虚拟语气与真实距离': 'conditional',
  '上海近现代史节点': 'timeline',
  '两次工业革命比较': 'revolution',
  '历史事件因果层次': 'causality',
  '正午太阳高度': 'solar',
  '海陆热力环流': 'circulation',
  '自然与城市水循环': 'water-cycle',
  '供给需求与均衡': 'market',
  '国民经济循环': 'flow',
  '立法程序与法治原则': 'rule-of-law',
}

const visualBySubject: Record<SubjectId, VisualKind> = {
  chinese: 'structure', math: 'model', english: 'structure', physics: 'model', chemistry: 'process',
  biology: 'process', politics: 'relation', history: 'timeline', geography: 'process', information: 'flow',
}

function buildSemester(seed: SemesterSeed): SemesterPlan {
  const courses = Object.fromEntries(Object.entries(seed.courses).map(([rawSubjectId, course]) => {
    const subjectId = rawSubjectId as SubjectId
    let topicIndex = 0
    const units = course.units.map((unit, unitIndex) => ({
      id: `${seed.id}-${subjectId}-u${unitIndex + 1}`,
      chapter: unit.chapter,
      title: unit.title,
      focus: unit.focus,
      topics: unit.topics.map((title) => {
        topicIndex += 1
        const demoId = demoByTitle[title]
        const lesson = buildLessonContent(subjectId, {
          title,
          unitTitle: unit.title,
          unitFocus: unit.focus,
        })
        return {
          id: `${seed.id}-${subjectId}-t${topicIndex}`,
          title,
          focus: unit.focus,
          question: lesson.guidingQuestion,
          keyPoints: lesson.steps.map((step) => step.detail) as [string, string, string],
          pitfall: lesson.pitfall,
          lesson,
          mode: demoId ? 'demo' as const : 'explain' as const,
          visual: visualBySubject[subjectId],
          demoId,
        }
      }),
    }))
    return [subjectId, { ...course, units }]
  })) as Record<SubjectId, CoursePlan>
  return { ...seed, courses }
}

export const semesterPlans: SemesterPlan[] = semesterSeeds.map(buildSemester)

export const getSemester = (semesterId: SemesterId) =>
  semesterPlans.find((semester) => semester.id === semesterId) ?? semesterPlans[0]

export const flattenTopics = (semester: SemesterPlan) => Object.entries(semester.courses).flatMap(([subjectId, course]) =>
  course.units.flatMap((unit) => unit.topics.map((topic) => ({ subjectId: subjectId as SubjectId, course, unit, topic }))),
)

export const allTopics = semesterPlans.flatMap((semester) =>
  flattenTopics(semester).map((entry) => ({ semester, ...entry })),
)
