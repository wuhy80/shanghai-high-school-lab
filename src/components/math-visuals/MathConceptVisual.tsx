import type { ReactNode } from 'react'
import { G10MathVisual } from './G10MathVisual'
import { G10Term2MathVisual } from './G10Term2MathVisuals'
import { G11MathVisual } from './G11MathVisuals'
import { G12MathVisual } from './G12MathVisuals'
import { ModelingMathVisual } from './ModelingMathVisual'
import { isMathVisualTopicId } from './mathVisualTopics'
import './G10MathVisual.css'

type MathConceptVisualProps = {
  chapter?: string
  topicId: string
  topicTitle: string
  unitTitle: string
}

export function MathConceptVisual({ chapter, topicId, topicTitle, unitTitle }: MathConceptVisualProps) {
  if (!isMathVisualTopicId(topicId)) return null
  if (topicId.startsWith('g10-1-')) return <G10MathVisual topicTitle={topicTitle} />

  let visual: ReactNode
  if (topicId.startsWith('g10-2-') && /^第[6-9]章/.test(chapter ?? '')) {
    visual = <G10Term2MathVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  } else if (topicId.startsWith('g11-')) {
    visual = <G11MathVisual chapter={chapter ?? ''} topicTitle={topicTitle} unitTitle={unitTitle} />
  } else if (topicId.startsWith('g12-')) {
    visual = <G12MathVisual chapter={chapter ?? ''} topicTitle={topicTitle} unitTitle={unitTitle} />
  } else {
    visual = <ModelingMathVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  }

  return <div className="g10-math-visual" data-math-concept-visual={topicTitle}>{visual}</div>
}
