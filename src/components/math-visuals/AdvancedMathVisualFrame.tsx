import { useId, type ReactNode } from 'react'
import './AdvancedMathVisualFrame.css'

type MathVisualFrameProps = {
  title: string
  summary: string
  controls?: ReactNode
  children: ReactNode
  takeaway: ReactNode
}

export function MathVisualFrame({ title, summary, controls, children, takeaway }: MathVisualFrameProps) {
  return (
    <section className="amv" aria-label={`${title}可视化讲解`}>
      <header className="amv-header">
        <div><span>看图推理</span><h3>{title}</h3></div>
        <p>{summary}</p>
      </header>
      {controls && <div className="amv-controls">{controls}</div>}
      <div className="amv-stage">{children}</div>
      <p className="amv-takeaway"><strong>抓住：</strong>{takeaway}</p>
    </section>
  )
}

export function MathRange({ label, value, min, max, step = 1, output, onChange }: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  output: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <label className="amv-range" htmlFor={id}>
      <span><b>{label}</b><output>{output}</output></span>
      <input id={id} type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export function MathChoices({ label, value, choices, onChange }: {
  label: string
  value: string
  choices: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="amv-choices">
      <legend>{label}</legend>
      <div>{choices.map((choice) => (
        <button key={choice.value} type="button" aria-pressed={choice.value === value} onClick={() => onChange(choice.value)}>{choice.label}</button>
      ))}</div>
    </fieldset>
  )
}

export function CoordinateAxes({ xOrigin = 310, yOrigin = 250, xLabel = 'x', yLabel = 'y' }: {
  xOrigin?: number
  yOrigin?: number
  xLabel?: string
  yLabel?: string
}) {
  return (
    <g className="amv-axes" aria-hidden="true">
      <line x1="42" y1={yOrigin} x2="596" y2={yOrigin} />
      <line x1={xOrigin} y1="28" x2={xOrigin} y2="292" />
      <path d={`M 596 ${yOrigin} l -10 -6 v 12 z`} />
      <path d={`M ${xOrigin} 28 l -6 10 h 12 z`} />
      <text x="574" y={yOrigin - 12}>{xLabel}</text>
      <text x={xOrigin + 12} y="46">{yLabel}</text>
    </g>
  )
}
