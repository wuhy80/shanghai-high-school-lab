import type { ReactNode } from 'react'
import { FunctionModelVisual } from './FunctionModelVisuals'
import { PowerLogVisual } from './PowerLogVisuals'
import { SetLogicInequalityVisual } from './SetLogicInequalityVisuals'
import { FUNCTION_MODEL_TOPICS, POWER_LOG_TOPICS, SET_LOGIC_INEQUALITY_TOPICS } from './g10MathVisualTopics'
import './G10MathVisual.css'

const setTopicNames = new Set<string>(SET_LOGIC_INEQUALITY_TOPICS)
const powerLogTopicNames = new Set<string>(POWER_LOG_TOPICS)
const functionTopicNames = new Set<string>(FUNCTION_MODEL_TOPICS)

export function G10MathVisual({ topicTitle }: { topicTitle: string }) {
  let visual: ReactNode = null
  if (setTopicNames.has(topicTitle)) visual = <SetLogicInequalityVisual topicTitle={topicTitle} />
  else if (powerLogTopicNames.has(topicTitle)) visual = <PowerLogVisual topicTitle={topicTitle} />
  else if (functionTopicNames.has(topicTitle)) visual = <FunctionModelVisual topicTitle={topicTitle} />

  if (!visual) return null
  return <div className="g10-math-visual" data-math-concept-visual={topicTitle}>{visual}</div>
}
