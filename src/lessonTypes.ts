export type LessonStep = {
  label: string
  detail: string
}

export type LessonExample = {
  prompt: string
  reasoning: [string, string]
  result: string
}

export type LessonCheck = {
  question: string
  answer: string
}

export type LessonContent = {
  templateId: string
  guidingQuestion: string
  core: string
  explanation: [string, string]
  steps: [LessonStep, LessonStep, LessonStep]
  example: LessonExample
  selfCheck: LessonCheck
  pitfall: string
}

export type LessonContext = {
  title: string
  unitTitle: string
  unitFocus: string
}
