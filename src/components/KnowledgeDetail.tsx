import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GitBranch,
  HelpCircle,
  Lightbulb,
  ListChecks,
} from 'lucide-react'
import type { CoursePlan, CurriculumUnit, KnowledgeTopic } from '../curriculum'
import { G10MathVisual } from './math-visuals/G10MathVisual'
import { isG10MathVisualTopicId } from './math-visuals/g10MathVisualTopics'

type KnowledgeDetailProps = {
  course: CoursePlan
  subjectName: string
  topic: KnowledgeTopic
  unit: CurriculumUnit
}

const visualLabels: Record<KnowledgeTopic['visual'], string> = {
  model: '模型与条件',
  structure: '结构与证据',
  process: '过程与机制',
  timeline: '时序与解释',
  relation: '主体与关系',
  flow: '输入与流程',
}

export function KnowledgeDetail({ course, subjectName, topic, unit }: KnowledgeDetailProps) {
  const lesson = topic.lesson
  const titleId = `knowledge-detail-title-${topic.id}`

  return (
    <article className={`knowledge-detail visual-${topic.visual}`} aria-labelledby={titleId}>
      <header className="knowledge-question">
        <span className="detail-section-icon" aria-hidden="true"><HelpCircle size={21} /></span>
        <div>
          <p>本节要解决的问题</p>
          <h2 id={titleId}>{lesson.guidingQuestion}</h2>
          <strong className="lesson-core">{lesson.core}</strong>
        </div>
      </header>

      <section className="lesson-explanation" aria-labelledby={`explanation-${topic.id}`}>
        <div className="detail-section-heading">
          <BookOpen size={19} aria-hidden="true" />
          <div>
            <p>{visualLabels[topic.visual]}</p>
            <h3 id={`explanation-${topic.id}`}>把概念讲清楚</h3>
          </div>
        </div>
        <div className="lesson-prose">
          {lesson.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="concept-path" role="list" aria-label="知识点在课程中的位置">
          <div role="listitem"><small>教材</small><strong>{subjectName} · {course.book}</strong></div>
          <span aria-hidden="true">→</span>
          <div role="listitem"><small>单元</small><strong>{unit.title}</strong></div>
          <span aria-hidden="true">→</span>
          <div role="listitem" className="current"><small>知识点</small><strong>{topic.title}</strong></div>
        </div>
        <p className="unit-focus"><GitBranch size={17} aria-hidden="true" /><span><b>单元联系：</b>{unit.focus}</span></p>
      </section>

      {isG10MathVisualTopicId(topic.id) && <G10MathVisual topicTitle={topic.title} />}

      <section className="reasoning-steps" aria-labelledby={`steps-${topic.id}`}>
        <div className="detail-section-heading">
          <ListChecks size={19} aria-hidden="true" />
          <div>
            <p>推理或操作路径</p>
            <h3 id={`steps-${topic.id}`}>按这三步展开</h3>
          </div>
        </div>
        <ol>
          {lesson.steps.map((step, index) => (
            <li key={step.label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{step.label}</strong><p>{step.detail}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="worked-example" aria-labelledby={`example-${topic.id}`}>
        <div className="detail-section-heading">
          <Lightbulb size={19} aria-hidden="true" />
          <div>
            <p>具体情境</p>
            <h3 id={`example-${topic.id}`}>例子拆解</h3>
          </div>
        </div>
        <blockquote>{lesson.example.prompt}</blockquote>
        <ol>
          {lesson.example.reasoning.map((reason, index) => (
            <li key={reason}><span>推理 {index + 1}</span><p>{reason}</p></li>
          ))}
        </ol>
        <p className="example-result"><CheckCircle2 size={18} aria-hidden="true" /><span><b>结论：</b>{lesson.example.result}</span></p>
      </section>

      <section className="lesson-check" aria-labelledby={`check-${topic.id}`}>
        <div className="detail-section-heading">
          <CheckCircle2 size={19} aria-hidden="true" />
          <div>
            <p>理解自检</p>
            <h3 id={`check-${topic.id}`}>换一个条件还能判断吗？</h3>
          </div>
        </div>
        <p>{lesson.selfCheck.question}</p>
        <details>
          <summary>查看答案与判断依据</summary>
          <p>{lesson.selfCheck.answer}</p>
        </details>
      </section>

      <aside className="common-pitfall" aria-labelledby={`pitfall-${topic.id}`}>
        <AlertTriangle size={20} aria-hidden="true" />
        <div>
          <h3 id={`pitfall-${topic.id}`}>常见误区与适用边界</h3>
          <p>{lesson.pitfall}</p>
        </div>
      </aside>
    </article>
  )
}
