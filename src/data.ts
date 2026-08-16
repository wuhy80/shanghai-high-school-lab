export type SubjectId =
  | 'chinese'
  | 'math'
  | 'english'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'politics'
  | 'history'
  | 'geography'
  | 'information'

export type Subject = {
  id: SubjectId
  name: string
  label: string
}

export const subjects: Subject[] = [
  { id: 'chinese', name: '语文', label: 'CHINESE' },
  { id: 'math', name: '数学', label: 'MATHEMATICS' },
  { id: 'english', name: '英语', label: 'ENGLISH' },
  { id: 'physics', name: '物理', label: 'PHYSICS' },
  { id: 'chemistry', name: '化学', label: 'CHEMISTRY' },
  { id: 'biology', name: '生物学', label: 'BIOLOGY' },
  { id: 'politics', name: '思想政治', label: 'POLITICS' },
  { id: 'history', name: '历史', label: 'HISTORY' },
  { id: 'geography', name: '地理', label: 'GEOGRAPHY' },
  { id: 'information', name: '信息技术', label: 'INFORMATION' },
]
