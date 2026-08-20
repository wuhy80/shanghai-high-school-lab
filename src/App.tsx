import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import {
  Binary,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Dna,
  Earth,
  FlaskConical,
  FolderTree,
  GraduationCap,
  Landmark,
  Languages,
  LetterText,
  Menu,
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
import { KnowledgeDetail } from './components/KnowledgeDetail'
import { isMathVisualTopicId } from './components/math-visuals/mathVisualTopics'
import {
  allTopics,
  semesterPlans,
  type CoursePlan,
  type CurriculumUnit,
  type KnowledgeTopic,
  type SemesterId,
} from './curriculum'
import { subjects, type SubjectId } from './data'
import './App.css'

const subjectIcons: Record<SubjectId, ComponentType<LucideProps>> = {
  chinese: Languages,
  math: Sigma,
  english: LetterText,
  physics: Orbit,
  chemistry: FlaskConical,
  biology: Dna,
  politics: Scale,
  history: Landmark,
  geography: Earth,
  information: Binary,
}

const basisLabels: Record<CoursePlan['basis'], string> = {
  catalog: '目录规定',
  school: '校本安排',
  review: '专题复习',
}

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('huzhi-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function firstTopic(course: CoursePlan): KnowledgeTopic {
  return course.units[0].topics[0]
}

function topicCount(course: CoursePlan) {
  return course.units.reduce((total, unit) => total + unit.topics.length, 0)
}

function groupUnitsByChapter(units: CurriculumUnit[]) {
  return units.reduce<Array<{ chapter?: string; units: Array<{ unit: CurriculumUnit; index: number }> }>>((groups, unit, index) => {
    const current = groups.at(-1)
    if (!current || current.chapter !== unit.chapter) {
      groups.push({ chapter: unit.chapter, units: [{ unit, index }] })
    } else {
      current.units.push({ unit, index })
    }
    return groups
  }, [])
}

type UnitDirectoryItemProps = {
  currentTopicId: string
  isCurrentUnit: boolean
  onSelect: (topic: KnowledgeTopic) => void
  subjectId: SubjectId
  unit: CurriculumUnit
  unitIndex: number
}

function UnitDirectoryItem({ currentTopicId, isCurrentUnit, onSelect, subjectId, unit, unitIndex }: UnitDirectoryItemProps) {
  const [open, setOpen] = useState(isCurrentUnit)
  const sectionMatch = unit.title.match(/^(\d+\.\d+)\s+(.+)$/)
  const sectionNumber = sectionMatch?.[1] ?? String(unitIndex + 1).padStart(2, '0')
  const sectionTitle = sectionMatch?.[2] ?? unit.title

  useEffect(() => {
    if (isCurrentUnit) setOpen(true)
  }, [isCurrentUnit])

  return (
    <details
      className={isCurrentUnit ? 'current-unit' : ''}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span>{sectionNumber}</span>
        <strong>{sectionTitle}</strong>
        <small>{unit.topics.length}</small>
      </summary>
      <p>{unit.focus}</p>
      <ol>
        {unit.topics.map((itemTopic, topicIndex) => (
          <li key={itemTopic.id}>
            <button
              id={`directory-topic-${itemTopic.id}`}
              type="button"
              className={itemTopic.id === currentTopicId ? 'active' : ''}
              aria-current={itemTopic.id === currentTopicId ? 'page' : undefined}
              onClick={() => onSelect(itemTopic)}
            >
              <span>{String(topicIndex + 1).padStart(2, '0')}</span>
              <strong>{itemTopic.title}</strong>
              {itemTopic.demoId ? <small>互动</small> : (isMathVisualTopicId(itemTopic.id) || subjectId === 'physics' || subjectId === 'chemistry') && <small>图解</small>}
            </button>
          </li>
        ))}
      </ol>
    </details>
  )
}

function App() {
  const initialSemester = semesterPlans[0]
  const initialSubject = subjects[0]
  const [semesterId, setSemesterId] = useState<SemesterId>(initialSemester.id)
  const [subjectId, setSubjectId] = useState<SubjectId>(initialSubject.id)
  const [topicId, setTopicId] = useState(() => firstTopic(initialSemester.courses[initialSubject.id]).id)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const searchRef = useRef<HTMLDivElement>(null)

  const semester = semesterPlans.find((item) => item.id === semesterId) ?? semesterPlans[0]
  const subject = subjects.find((item) => item.id === subjectId) ?? subjects[0]
  const course = semester.courses[subject.id]
  const courseTopics = useMemo(
    () => course.units.flatMap((unit) => unit.topics.map((topic) => ({ topic, unit }))),
    [course],
  )
  const unitGroups = useMemo(() => groupUnitsByChapter(course.units), [course])
  const chapterCount = unitGroups.filter((group) => group.chapter).length
  const currentIndex = Math.max(0, courseTopics.findIndex((entry) => entry.topic.id === topicId))
  const currentEntry = courseTopics[currentIndex] ?? courseTopics[0]
  const topic = currentEntry.topic
  const unit = currentEntry.unit
  const previous = currentIndex > 0 ? courseTopics[currentIndex - 1] : undefined
  const next = currentIndex < courseTopics.length - 1 ? courseTopics[currentIndex + 1] : undefined

  const searchMatches = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('zh-CN')
    if (!value) return []
    return allTopics.filter(({ semester: itemSemester, subjectId: itemSubjectId, course: itemCourse, unit: itemUnit, topic: itemTopic }) => {
      const itemSubject = subjects.find((entry) => entry.id === itemSubjectId)
      return [
        itemSemester.label,
        itemSemester.shortLabel,
        itemSemester.grade,
        itemSemester.term,
        itemSubject?.name,
        itemSubject?.label,
        itemCourse.book,
        itemCourse.publisher,
        itemCourse.note,
        itemUnit.chapter,
        itemUnit.title,
        itemUnit.focus,
        itemTopic.title,
        itemTopic.focus,
        itemTopic.question,
        ...itemTopic.keyPoints,
        itemTopic.lesson.core,
        ...itemTopic.lesson.explanation,
        ...itemTopic.lesson.steps.flatMap((step) => [step.label, step.detail]),
        itemTopic.lesson.example.prompt,
        ...itemTopic.lesson.example.reasoning,
        itemTopic.lesson.example.result,
        itemTopic.lesson.selfCheck.question,
        itemTopic.lesson.selfCheck.answer,
        itemTopic.lesson.pitfall,
      ].filter(Boolean).join(' ').toLocaleLowerCase('zh-CN').includes(value)
    })
  }, [query])
  const visibleMatches = searchMatches.slice(0, 40)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('huzhi-theme', theme)
  }, [theme])

  useEffect(() => {
    const closeSearch = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', closeSearch)
    return () => document.removeEventListener('mousedown', closeSearch)
  }, [])

  useEffect(() => {
    const closeOverlays = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setSearchOpen(false)
      setCatalogOpen(false)
    }
    document.addEventListener('keydown', closeOverlays)
    return () => document.removeEventListener('keydown', closeOverlays)
  }, [])

  useEffect(() => {
    if (!courseTopics.some((entry) => entry.topic.id === topicId)) setTopicId(firstTopic(course).id)
  }, [course, courseTopics, topicId])

  const selectSemester = (nextSemesterId: SemesterId) => {
    const nextSemester = semesterPlans.find((item) => item.id === nextSemesterId) ?? semesterPlans[0]
    setSemesterId(nextSemester.id)
    setTopicId(firstTopic(nextSemester.courses[subjectId]).id)
    setCatalogOpen(false)
  }

  const selectSubject = (nextSubjectId: SubjectId) => {
    setSubjectId(nextSubjectId)
    setTopicId(firstTopic(semester.courses[nextSubjectId]).id)
    setCatalogOpen(false)
  }

  const selectTopic = (nextTopic: KnowledgeTopic) => {
    setTopicId(nextTopic.id)
    setCatalogOpen(false)
  }

  const selectSearchResult = (result: (typeof allTopics)[number]) => {
    setSemesterId(result.semester.id)
    setSubjectId(result.subjectId)
    setTopicId(result.topic.id)
    setQuery('')
    setSearchOpen(false)
    setCatalogOpen(false)
  }

  return (
    <div className={`app-shell theme-${subject.id} ${catalogOpen ? 'catalog-open' : ''}`}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>

      <header className="topbar">
        <div className="brand" aria-label="沪知高中学习助手">
          <span className="brand-mark" aria-hidden="true"><GraduationCap size={21} /></span>
          <span className="brand-name">沪知高中</span>
          <span className="brand-edition">学习助手</span>
        </div>

        <div className="global-search" ref={searchRef}>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="搜索学期、学科、教材或知识点"
            aria-label="搜索全部课程内容"
          />
          {query && (
            <button className="search-clear" type="button" onClick={() => setQuery('')} aria-label="清空搜索" title="清空搜索">
              <X size={15} />
            </button>
          )}
          {searchOpen && query.trim() && (
            <div className="search-results" id="global-search-results">
              <p className="search-summary" aria-live="polite">
                {searchMatches.length > 0 ? `找到 ${searchMatches.length} 个知识点` : '没有匹配的知识点'}
              </p>
              {visibleMatches.length > 0 && (
                <ul aria-label="搜索结果">
                  {visibleMatches.map((match) => {
                    const matchSubject = subjects.find((item) => item.id === match.subjectId) ?? subjects[0]
                    const Icon = subjectIcons[match.subjectId]
                    return (
                      <li key={match.topic.id}>
                        <button type="button" onClick={() => selectSearchResult(match)}>
                          <span className="result-icon" aria-hidden="true"><Icon size={17} /></span>
                          <span>
                            <strong>{match.topic.title}</strong>
                            <small>{match.semester.shortLabel} · {matchSubject.name} · {match.unit.chapter ? `${match.unit.chapter} · ` : ''}{match.unit.title}</small>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
              {searchMatches.length > visibleMatches.length && <p className="search-more">继续输入可缩小结果范围</p>}
            </div>
          )}
        </div>

        <div className="topbar-actions">
          <span className="curriculum-tag"><BookOpenCheck size={16} aria-hidden="true" /> 上海高中课程</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <nav className="semester-nav" aria-label="按学期选择课程">
        <p>学习阶段</p>
        <div>
          {semesterPlans.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === semester.id ? 'active' : ''}
              aria-current={item.id === semester.id ? 'page' : undefined}
              onClick={() => selectSemester(item.id)}
            >
              <strong>{item.shortLabel}</strong>
              <small>{item.term}</small>
            </button>
          ))}
        </div>
      </nav>

      <nav className="subject-nav" aria-label={`${semester.label}学科`}>
        <div>
          {subjects.map((item) => {
            const Icon = subjectIcons[item.id]
            return (
              <button
                key={item.id}
                type="button"
                className={item.id === subject.id ? 'active' : ''}
                aria-current={item.id === subject.id ? 'page' : undefined}
                onClick={() => selectSubject(item.id)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.name}</span>
                <small>{topicCount(semester.courses[item.id])}</small>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="mobile-course-bar">
        <div>
          <small>{semester.shortLabel} · {subject.name}</small>
          <strong>{course.book}</strong>
        </div>
        <button
          type="button"
          onClick={() => setCatalogOpen(true)}
          aria-expanded={catalogOpen}
          aria-controls="curriculum-directory"
        >
          <Menu size={18} aria-hidden="true" />课程目录
        </button>
      </div>

      <div className="workspace">
        {catalogOpen && <button className="drawer-scrim" type="button" onClick={() => setCatalogOpen(false)} aria-label="关闭课程目录" />}
        <aside className="catalog-sidebar" id="curriculum-directory" aria-label={`${subject.name}教材目录`}>
          <div className="catalog-header">
            <div>
              <p>{semester.label} · {subject.name}</p>
              <h2>{course.book}</h2>
            </div>
            <button className="catalog-close" type="button" onClick={() => setCatalogOpen(false)} aria-label="关闭课程目录">
              <X size={18} />
            </button>
          </div>
          <div className="book-meta">
            <span>{course.publisher}</span>
            <span className={`basis basis-${course.basis}`}>{basisLabels[course.basis]}</span>
            <strong>{chapterCount > 0 ? `${chapterCount} 章 · ${course.units.length} 节` : `${course.units.length} 单元`} · {courseTopics.length} 个知识点</strong>
          </div>
          {course.note && <p className="course-note">{course.note}</p>}

          <nav className="unit-directory" aria-label={`${course.book}单元与知识点`}>
            {unitGroups.map((group, groupIndex) => (
              <section className={group.chapter ? 'chapter-directory' : 'flat-directory'} key={group.chapter ?? 'course-units'} data-chapter-title={group.chapter}>
                {group.chapter && (
                  <header>
                    <span>{String(groupIndex + 1).padStart(2, '0')}</span>
                    <h3>{group.chapter}</h3>
                    <small>{group.units.length} 节</small>
                  </header>
                )}
                {group.units.map(({ unit: item, index: unitIndex }) => (
                  <UnitDirectoryItem
                    key={item.id}
                    currentTopicId={topic.id}
                    isCurrentUnit={item.id === unit.id}
                    onSelect={selectTopic}
                    subjectId={subject.id}
                    unit={item}
                    unitIndex={unitIndex}
                  />
                ))}
              </section>
            ))}
          </nav>
        </aside>

        <main className="main-content" id="main-content" tabIndex={-1}>
          <nav className="content-breadcrumb" aria-label="当前位置">
            <span>{semester.label}</span><i aria-hidden="true">/</i>
            <span>{subject.name}</span><i aria-hidden="true">/</i>
            {unit.chapter && <><span>{unit.chapter}</span><i aria-hidden="true">/</i></>}
            <span>{unit.title}</span>
          </nav>

          <header className="topic-heading">
            <div>
              <p className="eyebrow">{topic.demoId ? '互动演示' : (isMathVisualTopicId(topic.id) || subject.id === 'physics' || subject.id === 'chemistry') ? '可视化讲解' : '重点讲解'} · {subject.label}</p>
              <h1>{topic.title}</h1>
              <p className="topic-focus">{topic.focus}</p>
            </div>
            <div className="topic-index" aria-label={`本课程第 ${currentIndex + 1} 个知识点，共 ${courseTopics.length} 个`}>
              <span>{String(currentIndex + 1).padStart(2, '0')}</span>
              <i />
              <small>{String(courseTopics.length).padStart(2, '0')}</small>
            </div>
          </header>

          <div
            className={`knowledge-panel ${topic.demoId ? 'demo-panel' : 'explanation-panel'}`}
            aria-labelledby={`directory-topic-${topic.id}`}
          >
            {topic.demoId && <DemoStage key={topic.id} topicId={topic.demoId} />}
            <KnowledgeDetail course={course} subjectId={subject.id} subjectName={subject.name} topic={topic} unit={unit} />
          </div>

          <nav className="topic-pagination" aria-label="前后知识点">
            {previous ? (
              <button type="button" className="previous-topic" onClick={() => selectTopic(previous.topic)}>
                <ChevronLeft size={19} aria-hidden="true" />
                <span><small>上一个知识点</small><strong>{previous.topic.title}</strong></span>
              </button>
            ) : <span className="pagination-spacer" />}
            {next ? (
              <button type="button" className="next-topic" onClick={() => selectTopic(next.topic)}>
                <span><small>下一个知识点</small><strong>{next.topic.title}</strong></span>
                <ChevronRight size={19} aria-hidden="true" />
              </button>
            ) : <span className="pagination-spacer" />}
          </nav>

          <footer className="content-footer">
            <span><FolderTree size={15} aria-hidden="true" /> {semester.description}</span>
            <a href={semester.sourceUrl} target="_blank" rel="noreferrer">{semester.sourceLabel}</a>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App
