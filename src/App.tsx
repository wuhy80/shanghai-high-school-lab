import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import {
  Atom,
  BookOpenCheck,
  Dna,
  Earth,
  FlaskConical,
  GraduationCap,
  Landmark,
  Languages,
  LetterText,
  Moon,
  Orbit,
  Scale,
  Search,
  Sigma,
  Sun,
  X,
  type LucideProps,
} from 'lucide-react'
import { DemoStage } from './components/DemoStage'
import { subjects, type Grade, type Subject, type SubjectId } from './data'
import './App.css'

const subjectIcons: Record<SubjectId, ComponentType<LucideProps>> = {
  math: Sigma,
  physics: Orbit,
  chemistry: FlaskConical,
  biology: Dna,
  chinese: Languages,
  english: LetterText,
  history: Landmark,
  geography: Earth,
  politics: Scale,
}

type Theme = 'light' | 'dark'
type GradeFilter = Grade | '全部'

const gradeOptions: GradeFilter[] = ['全部', '高一', '高二', '高三']

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('huzhi-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [subjectId, setSubjectId] = useState<SubjectId>('math')
  const [topicId, setTopicId] = useState('function')
  const [grade, setGrade] = useState<GradeFilter>('全部')
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const searchRef = useRef<HTMLDivElement>(null)

  const subject = subjects.find((item) => item.id === subjectId) ?? subjects[0]
  const topicsFor = (item: Subject) => grade === '全部' ? item.topics : item.topics.filter((entry) => entry.grades.includes(grade))
  const filteredTopics = useMemo(() => grade === '全部' ? subject.topics : subject.topics.filter((entry) => entry.grades.includes(grade)), [grade, subject])
  const topic = filteredTopics.find((item) => item.id === topicId) ?? filteredTopics[0] ?? subject.topics[0]

  const matches = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return []
    return subjects.flatMap((item) =>
      (grade === '全部' ? item.topics : item.topics.filter((entry) => entry.grades.includes(grade)))
        .filter((entry) => `${item.name}${item.label}${entry.title}${entry.chapter}${entry.description}`.toLowerCase().includes(value))
        .map((entry) => ({ subject: item, topic: entry })),
    )
  }, [query, grade])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('huzhi-theme', theme)
  }, [theme])

  useEffect(() => {
    const closeSearch = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setQuery('')
    }
    document.addEventListener('mousedown', closeSearch)
    return () => document.removeEventListener('mousedown', closeSearch)
  }, [])

  useEffect(() => {
    if (!filteredTopics.some((item) => item.id === topicId) && filteredTopics[0]) setTopicId(filteredTopics[0].id)
  }, [grade, subjectId, topicId, filteredTopics])

  const selectSubject = (next: Subject) => {
    setSubjectId(next.id)
    setTopicId(topicsFor(next)[0]?.id ?? next.topics[0].id)
  }

  const selectSearchResult = (nextSubject: Subject, nextTopicId: string) => {
    setSubjectId(nextSubject.id)
    setTopicId(nextTopicId)
    setQuery('')
  }

  return (
    <div className={`app-shell theme-${subject.id}`}>
      <header className="topbar">
        <div className="brand" aria-label="沪知实验室">
          <span className="brand-mark" aria-hidden="true"><Atom size={21} /></span>
          <span className="brand-name">沪知实验室</span>
          <span className="brand-edition">高中</span>
        </div>

        <div className="global-search" ref={searchRef}>
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
            placeholder="搜索学科或知识点"
            aria-label="搜索学科或知识点"
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')} aria-label="清空搜索" title="清空搜索">
              <X size={15} />
            </button>
          )}
          {query && (
            <div className="search-results" role="listbox" aria-label="搜索结果">
              {matches.length > 0 ? matches.map((match) => {
                const Icon = subjectIcons[match.subject.id]
                return (
                  <button
                    key={match.topic.id}
                    role="option"
                    aria-selected={match.topic.id === topicId}
                    onClick={() => selectSearchResult(match.subject, match.topic.id)}
                  >
                    <span className="result-icon"><Icon size={17} /></span>
                    <span><strong>{match.topic.title}</strong><small>{match.subject.name} · {match.topic.grades.join(' / ')} · {match.topic.chapter}</small></span>
                  </button>
                )
              }) : <p className="empty-result">没有匹配的知识点</p>}
            </div>
          )}
        </div>

        <div className="topbar-actions">
          <div className="grade-filter" aria-label="按年级筛选">
            <GraduationCap size={16} aria-hidden="true" />
            {gradeOptions.map((item) => <button key={item} className={item === grade ? 'active' : ''} aria-pressed={item === grade} onClick={() => setGrade(item)}>{item}</button>)}
          </div>
          <span className="curriculum-tag"><BookOpenCheck size={16} /> 课程知识图谱</span>
          <button
            className="icon-button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <nav className="mobile-subjects" aria-label="学科">
        {subjects.map((item) => {
          const Icon = subjectIcons[item.id]
          return (
            <button key={item.id} className={item.id === subjectId ? 'active' : ''} onClick={() => selectSubject(item)}>
              <Icon size={17} /><span>{item.name}</span>
            </button>
          )
        })}
      </nav>

      <div className="workspace">
        <aside className="subject-sidebar">
          <p className="nav-label">学科实验室</p>
          <nav aria-label="学科">
            {subjects.map((item) => {
              const Icon = subjectIcons[item.id]
              return (
                <button key={item.id} className={item.id === subjectId ? 'active' : ''} onClick={() => selectSubject(item)}>
                  <span className="subject-icon"><Icon size={18} /></span>
                  <span className="subject-copy"><strong>{item.name}</strong><small>{item.label}</small></span>
                  <span className="subject-count">{topicsFor(item).length}</span>
                </button>
              )
            })}
          </nav>
          <div className="sidebar-foot">
            <span className="shanghai-dot" aria-hidden="true" />
            <span>上海 · SHANGHAI</span>
          </div>
        </aside>

        <main className="main-content">
          <div className="subject-heading">
            <div>
              <p className="eyebrow">{subject.label} / {grade === '全部' ? topic.grades.join(' · ') : grade} / {topic.chapter}</p>
              <h1>{subject.name}实验台</h1>
              <p className="subject-intro">{topic.description}</p>
            </div>
            <div className="topic-index" aria-label={`本学科共 ${subject.topics.length} 个演示`}>
              <span>{String(filteredTopics.findIndex((item) => item.id === topic.id) + 1).padStart(2, '0')}</span>
              <i />
              <small>{String(filteredTopics.length).padStart(2, '0')}</small>
            </div>
          </div>

          <div className="topic-tabs" role="tablist" aria-label={`${subject.name}知识点`}>
            {filteredTopics.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={item.id === topic.id}
                onClick={() => setTopicId(item.id)}
              >
                <span>{item.title}</span>
                <small>{item.chapter}</small>
              </button>
            ))}
          </div>

          <DemoStage key={topic.id} topicId={topic.id} />

          <footer className="content-footer">
            <span>普通高中课程知识可视化</span>
            <span>内容持续校订 · 非官方教材</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App
