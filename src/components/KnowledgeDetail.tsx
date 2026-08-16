import { AlertTriangle, BookOpen, CheckCircle2, GitBranch, HelpCircle } from 'lucide-react'
import type { CoursePlan, CurriculumUnit, KnowledgeTopic } from '../curriculum'

type KnowledgeDetailProps = {
  course: CoursePlan
  subjectName: string
  topic: KnowledgeTopic
  unit: CurriculumUnit
}

const visualLabels: Record<KnowledgeTopic['visual'], string> = {
  model: '模型关系',
  structure: '结构分析',
  process: '过程链',
  timeline: '时序线索',
  relation: '要素关系',
  flow: '流程拆解',
}

export function KnowledgeDetail({ course, subjectName, topic, unit }: KnowledgeDetailProps) {
  return (
    <article className={`knowledge-detail visual-${topic.visual}`} aria-labelledby="knowledge-detail-title">
      <header className="knowledge-question">
        <span className="detail-section-icon" aria-hidden="true"><HelpCircle size={20} /></span>
        <div>
          <p>本节核心问题</p>
          <h2 id="knowledge-detail-title">{topic.question}</h2>
        </div>
      </header>

      <section className="concept-relation" aria-labelledby="concept-relation-title">
        <div className="detail-section-heading">
          <GitBranch size={18} aria-hidden="true" />
          <div>
            <p>{visualLabels[topic.visual]}</p>
            <h3 id="concept-relation-title">放回教材单元理解</h3>
          </div>
        </div>
        <div className="concept-path" role="list" aria-label="知识点在课程中的位置">
          <div role="listitem"><small>学科教材</small><strong>{subjectName} · {course.book}</strong></div>
          <span aria-hidden="true">→</span>
          <div role="listitem"><small>当前单元</small><strong>{unit.title}</strong></div>
          <span aria-hidden="true">→</span>
          <div role="listitem" className="current"><small>当前知识点</small><strong>{topic.title}</strong></div>
        </div>
        <p className="unit-focus"><BookOpen size={17} aria-hidden="true" />{unit.focus}</p>
      </section>

      <section className="key-points" aria-labelledby="key-points-title">
        <div className="detail-section-heading">
          <CheckCircle2 size={18} aria-hidden="true" />
          <div>
            <p>理解与应用</p>
            <h3 id="key-points-title">三个检查点</h3>
          </div>
        </div>
        <ol>
          {topic.keyPoints.map((point, index) => (
            <li key={point}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{point}</p>
            </li>
          ))}
        </ol>
      </section>

      <aside className="common-pitfall" aria-labelledby="common-pitfall-title">
        <AlertTriangle size={19} aria-hidden="true" />
        <div>
          <h3 id="common-pitfall-title">常见边界与误区</h3>
          <p>{topic.pitfall}</p>
        </div>
      </aside>
    </article>
  )
}
