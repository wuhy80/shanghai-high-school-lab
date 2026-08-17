import { useId, useState } from 'react'
import { MathChoices, MathRange, MathVisualFrame } from './AdvancedMathVisualFrame'
import './G10Term2MathVisuals.css'

type VisualProps = {
  topicTitle: string
  unitTitle: string
}

const TAU = Math.PI * 2

function fmt(value: number, digits = 2) {
  const rounded = Number(value.toFixed(digits))
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

function signed(value: number, suffix = '') {
  return `${value >= 0 ? '+' : '−'}${fmt(Math.abs(value))}${suffix}`
}

function ArrowDefs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
  )
}

function UnitCircleVisual({ topicTitle, unitTitle }: VisualProps) {
  const markerId = `g10t2-circle-${useId().replace(/:/g, '')}`
  const formulaMode = unitTitle.startsWith('6.2')
  const tangentMode = /正切|余切|定义域/.test(topicTitle)
  const [alpha, setAlpha] = useState(formulaMode ? 40 : 50)
  const [beta, setBeta] = useState(25)
  const radius = 112
  const originX = 238
  const originY = 170
  const radians = alpha * Math.PI / 180
  const betaRadians = beta * Math.PI / 180
  const sumRadians = radians + betaRadians
  const point = (angle: number) => ({
    x: originX + radius * Math.cos(angle),
    y: originY - radius * Math.sin(angle),
  })
  const p = point(radians)
  const q = point(betaRadians)
  const sum = point(sumRadians)
  const tangentY = originY - Math.tan(radians) * radius

  return (
    <MathVisualFrame
      title={`${topicTitle}：角在圆上看得见`}
      summary={formulaMode
        ? '把 α、β 和 α+β 同时放进单位圆，坐标投影会直接给出和差角公式中的正弦与余弦。'
        : '角的终边与单位圆交点为 (cos α, sin α)。旋转终边，符号、周期和同角关系会同步变化。'}
      controls={<>
        <MathRange label="角 α" value={alpha} min={-150} max={tangentMode ? 75 : 150} step={5} output={`${alpha}°`} onChange={setAlpha} />
        {formulaMode && <MathRange label="角 β" value={beta} min={-75} max={75} step={5} output={`${beta}°`} onChange={setBeta} />}
      </>}
      takeaway={formulaMode
        ? <>和差角公式描述的是<strong>旋转合成后的坐标</strong>。先认清角，再代入公式，不能把 sin(α+β) 拆成 sin α+sin β。</>
        : <>交点横坐标是 cos α，纵坐标是 sin α；tan α 是纵横坐标之比，所以 cos α=0 时没有定义。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`单位圆中角alpha为${alpha}度，正弦为${fmt(Math.sin(radians))}，余弦为${fmt(Math.cos(radians))}`}>
        <title>{topicTitle}的单位圆解释</title>
        <desc>拖动角度后，终边、单位圆交点及其横纵投影同步变化。</desc>
        <ArrowDefs id={markerId} />
        <line className="g10t2-axis" x1="62" y1={originY} x2="404" y2={originY} />
        <line className="g10t2-axis" x1={originX} y1="24" x2={originX} y2="316" />
        <circle className="g10t2-circle" cx={originX} cy={originY} r={radius} />
        <path className="g10t2-angle" d={`M ${originX + 38} ${originY} A 38 38 0 ${Math.abs(alpha) > 180 ? 1 : 0} ${alpha < 0 ? 1 : 0} ${originX + 38 * Math.cos(radians)} ${originY - 38 * Math.sin(radians)}`} />
        <line className="g10t2-vector" markerEnd={`url(#${markerId})`} x1={originX} y1={originY} x2={p.x} y2={p.y} />
        <line className="g10t2-guide" x1={p.x} y1={p.y} x2={p.x} y2={originY} />
        <line className="g10t2-guide" x1={p.x} y1={p.y} x2={originX} y2={p.y} />
        <circle className="g10t2-point" cx={p.x} cy={p.y} r="7" />
        {formulaMode && <>
          <line className="g10t2-vector-secondary" x1={originX} y1={originY} x2={q.x} y2={q.y} />
          <line className="g10t2-vector-sum" x1={originX} y1={originY} x2={sum.x} y2={sum.y} />
          <circle className="g10t2-point-secondary" cx={sum.x} cy={sum.y} r="6" />
          <text className="g10t2-short-label" x={q.x + 8} y={q.y + 18}>β</text>
          <text className="g10t2-short-label" x={sum.x + 8} y={sum.y - 10}>α+β</text>
        </>}
        {tangentMode && Math.abs(Math.cos(radians)) > 0.15 && <>
          <line className="g10t2-tangent" x1={originX + radius} y1="32" x2={originX + radius} y2="308" />
          <line className="g10t2-vector-secondary" x1={originX} y1={originY} x2={originX + radius} y2={tangentY} />
          <circle className="g10t2-point-secondary" cx={originX + radius} cy={tangentY} r="6" />
        </>}
        <text className="g10t2-short-label" x={p.x + 9} y={p.y - 11}>P</text>
        <text x="454" y="75">α = {alpha}°</text>
        <text x="454" y="112">sin α = {fmt(Math.sin(radians))}</text>
        <text x="454" y="149">cos α = {fmt(Math.cos(radians))}</text>
        <text x="454" y="186">tan α = {Math.abs(Math.cos(radians)) < 0.01 ? '未定义' : fmt(Math.tan(radians))}</text>
        {formulaMode && <>
          <text className="g10t2-side-note" x="454" y="238">sin(α+β)</text>
          <text className="g10t2-side-note" x="454" y="271">= sin α cos β</text>
          <text className="g10t2-side-note" x="454" y="302">+ cos α sin β</text>
        </>}
      </svg>
      <p className="amv-readout">
        <span>弧度</span><strong>{fmt(radians / Math.PI, 3)}π</strong>
        {formulaMode && <><span>当前验证</span><strong>{fmt(Math.sin(sumRadians))} = {fmt(Math.sin(radians) * Math.cos(betaRadians) + Math.cos(radians) * Math.sin(betaRadians))}</strong></>}
      </p>
    </MathVisualFrame>
  )
}

function waveSegments(fn: (x: number) => number, yLimit = 3.5) {
  const segments: string[][] = [[]]
  let previousY: number | undefined
  for (let index = 0; index <= 280; index += 1) {
    const x = -TAU + index / 280 * TAU * 2
    const y = fn(x)
    const discontinuous = !Number.isFinite(y) || Math.abs(y) > yLimit || (previousY !== undefined && Math.abs(y - previousY) > 2)
    if (discontinuous) {
      if (segments.at(-1)?.length) segments.push([])
      previousY = undefined
      continue
    }
    const px = 42 + index / 280 * 556
    const py = 170 - y * 40
    segments.at(-1)?.push(`${px.toFixed(1)},${py.toFixed(1)}`)
    previousY = y
  }
  return segments.filter((segment) => segment.length > 1).map((segment) => segment.join(' '))
}

function WaveVisual({ topicTitle, unitTitle }: VisualProps) {
  const kind = unitTitle.startsWith('7.2') ? 'cos' : unitTitle.startsWith('7.4') ? 'tan' : 'sin'
  const parameterMode = unitTitle.startsWith('7.3') || /振幅|角频率|初相|参数|平移|伸缩|建模/.test(topicTitle)
  const [amplitude, setAmplitude] = useState(kind === 'tan' ? 1 : parameterMode ? 1.5 : 1)
  const [omega, setOmega] = useState(1)
  const [phase, setPhase] = useState(0)
  const phaseRadians = phase * Math.PI / 4
  const trig = kind === 'cos' ? Math.cos : kind === 'tan' ? Math.tan : Math.sin
  const fn = (x: number) => amplitude * trig(omega * x + phaseRadians)
  const segments = waveSegments(fn)
  const period = kind === 'tan' ? Math.PI / Math.abs(omega) : TAU / Math.abs(omega)
  const name = kind === 'cos' ? 'cos' : kind === 'tan' ? 'tan' : 'sin'

  return (
    <MathVisualFrame
      title={`${topicTitle}：参数改变，整条曲线联动`}
      summary={kind === 'tan'
        ? '正切函数在每个连续区间内递增，但定义域断点会把曲线分开；图像不能跨越渐近线相连。'
        : '振幅控制上下范围，ω 控制水平方向的疏密，φ 控制起始相位。关键点随参数一起移动。'}
      controls={<>
        <MathRange label="振幅 A" value={amplitude} min={0.5} max={2.5} step={0.5} output={`A = ${amplitude}`} onChange={setAmplitude} />
        <MathRange label="角频率 ω" value={omega} min={0.5} max={2} step={0.5} output={`ω = ${omega}`} onChange={setOmega} />
        <MathRange label="初相 φ" value={phase} min={-4} max={4} output={`φ = ${phase}π/4`} onChange={setPhase} />
      </>}
      takeaway={kind === 'tan'
        ? <>正切函数的周期是 π/|ω|。每条分支都递增，但必须先排除使 cos(ωx+φ)=0 的点。</>
        : <>读图时先找中线和振幅，再量相邻同相位点的距离得到周期，最后用一个关键点确定初相。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`函数y等于${amplitude}${name}括号${omega}x加${phase}四分之pi括号的图像`}>
        <title>{topicTitle}的三角函数图像</title>
        <desc>滑块改变振幅、角频率和初相，曲线的高度、周期与水平位置同步更新。</desc>
        <line className="g10t2-axis" x1="42" y1="170" x2="598" y2="170" />
        <line className="g10t2-axis" x1="320" y1="24" x2="320" y2="316" />
        {[0, 1, 2, 3, 4].map((index) => {
          const x = 42 + index * 139
          return <line key={index} className="g10t2-grid" x1={x} y1="30" x2={x} y2="310" />
        })}
        {[90, 250].map((y) => <line key={y} className="g10t2-grid" x1="42" y1={y} x2="598" y2={y} />)}
        {kind === 'tan' && Array.from({ length: 9 }, (_, index) => {
          const k = index - 4
          const asymptote = (Math.PI / 2 - phaseRadians + k * Math.PI) / omega
          const x = 320 + asymptote / (TAU * 2) * 556
          return x > 42 && x < 598 ? <line key={k} className="g10t2-asymptote" x1={x} y1="30" x2={x} y2="310" /> : null
        })}
        {segments.map((points, index) => <polyline key={index} className="g10t2-wave" points={points} />)}
        {['−2π', '−π', '0', 'π', '2π'].map((label, index) => <text key={label} className="g10t2-axis-label" x={42 + index * 139} y="330" textAnchor={index === 0 ? 'start' : index === 4 ? 'end' : 'middle'}>{label}</text>)}
        <text className="g10t2-formula" x="54" y="57">y={fmt(amplitude)}{name}({fmt(omega)}x {phase >= 0 ? '+' : '−'} {Math.abs(phase)}π/4)</text>
      </svg>
      <p className="amv-readout"><span>值域</span><strong>{kind === 'tan' ? 'R' : `[−${fmt(amplitude)}, ${fmt(amplitude)}]`}</strong><span>周期</span><strong>T={fmt(period / Math.PI, 3)}π</strong></p>
    </MathVisualFrame>
  )
}

function TriangleVisual({ topicTitle }: VisualProps) {
  const [angleA, setAngleA] = useState(48)
  const [angleB, setAngleB] = useState(67)
  const angleC = 180 - angleA - angleB
  const c = 6
  const radA = angleA * Math.PI / 180
  const radB = angleB * Math.PI / 180
  const radC = angleC * Math.PI / 180
  const a = c * Math.sin(radA) / Math.sin(radC)
  const b = c * Math.sin(radB) / Math.sin(radC)
  const left = 104
  const right = 536
  const base = right - left
  const height = base / (1 / Math.tan(radA) + 1 / Math.tan(radB))
  const apexX = left + height / Math.tan(radA)
  const apexY = 278 - height
  const cosineCheck = Math.sqrt(a * a + c * c - 2 * a * c * Math.cos(radB))
  const cosineMode = /余弦|勾股|边长/.test(topicTitle)

  return (
    <MathVisualFrame
      title={`${topicTitle}：条件落在同一个三角形里`}
      summary="拖动两个角，边长、面积和第三个角同步变化。先标清已知量，再决定用正弦定理、余弦定理还是面积公式。"
      controls={<>
        <MathRange label="角 A" value={angleA} min={25} max={80} step={1} output={`${angleA}°`} onChange={setAngleA} />
        <MathRange label="角 B" value={angleB} min={25} max={80} step={1} output={`${angleB}°`} onChange={setAngleB} />
      </>}
      takeaway={cosineMode
        ? <>余弦定理适合“已知两边及夹角”或“三边求角”；它在夹角为 90° 时自然退化为勾股定理。</>
        : <>正弦定理连接每条边与其对角。已知两边和其中一边的对角时，要检查另一个角是否可能有两个值。</>}
    >
      <svg viewBox="0 0 640 350" role="img" aria-label={`三角形ABC，角A为${angleA}度，角B为${angleB}度，角C为${angleC}度`}>
        <title>{topicTitle}的动态三角形</title>
        <desc>固定边c为6，拖动角A和角B后，第三个角、其余边和面积同步计算。</desc>
        <polygon className="g10t2-triangle-fill" points={`${left},278 ${right},278 ${apexX},${apexY}`} />
        <path className="g10t2-triangle" d={`M ${left} 278 L ${right} 278 L ${apexX} ${apexY} Z`} />
        <path className="g10t2-angle" d={`M ${left + 46} 278 A 46 46 0 0 0 ${left + 46 * Math.cos(radA)} ${278 - 46 * Math.sin(radA)}`} />
        <path className="g10t2-angle-secondary" d={`M ${right - 46} 278 A 46 46 0 0 1 ${right - 46 * Math.cos(radB)} ${278 - 46 * Math.sin(radB)}`} />
        <text x={left - 16} y="306">A</text>
        <text x={right + 10} y="306">B</text>
        <text x={apexX} y={Math.max(30, apexY - 14)} textAnchor="middle">C</text>
        <text className="g10t2-short-label" x={left + 55} y="260">{angleA}°</text>
        <text className="g10t2-short-label" x={right - 55} y="260" textAnchor="end">{angleB}°</text>
        <text className="g10t2-short-label" x={(left + right) / 2} y="321" textAnchor="middle">c = {c}</text>
        <text className="g10t2-short-label" x={(right + apexX) / 2 + 14} y={(278 + apexY) / 2}>a = {fmt(a)}</text>
        <text className="g10t2-short-label" x={(left + apexX) / 2 - 14} y={(278 + apexY) / 2} textAnchor="end">b = {fmt(b)}</text>
      </svg>
      <p className="amv-readout"><span>第三角</span><strong>C={angleC}°</strong><span>{cosineMode ? '余弦校验' : '正弦比'}</span><strong>{cosineMode ? `b=${fmt(cosineCheck)}` : `a/sin A = ${fmt(a / Math.sin(radA))}`}</strong><span>面积</span><strong>S={fmt(a * c * Math.sin(radB) / 2)}</strong></p>
    </MathVisualFrame>
  )
}

function TrigonometryVisual(props: VisualProps) {
  if (props.unitTitle.startsWith('6.3') || /三角形|正弦定理|余弦定理|面积|仰角|俯角|方位角|测量|多解|解法选择/.test(props.topicTitle)) {
    return <TriangleVisual {...props} />
  }
  if (props.unitTitle.startsWith('7.')) return <WaveVisual {...props} />
  return <UnitCircleVisual {...props} />
}

type VectorMode = 'add' | 'subtract' | 'scale' | 'dot' | 'coordinate'

function vectorMode(topicTitle: string): VectorMode {
  if (/减法/.test(topicTitle)) return 'subtract'
  if (/数量积|夹角|投影|垂直|长度/.test(topicTitle)) return 'dot'
  if (/数乘|共线|平行/.test(topicTitle)) return 'scale'
  if (/坐标|基底|分解|两点/.test(topicTitle)) return 'coordinate'
  return 'add'
}

function VectorVisual({ topicTitle }: VisualProps) {
  const markerId = `g10t2-vector-${useId().replace(/:/g, '')}`
  const mode = vectorMode(topicTitle)
  const [angle, setAngle] = useState(115)
  const [length, setLength] = useState(2.8)
  const [scale, setScale] = useState(1.5)
  const u = { x: 3, y: 1.5 }
  const radians = angle * Math.PI / 180
  const v = { x: length * Math.cos(radians), y: length * Math.sin(radians) }
  const result = mode === 'subtract'
    ? { x: u.x - v.x, y: u.y - v.y }
    : mode === 'scale'
      ? { x: scale * u.x, y: scale * u.y }
      : { x: u.x + v.x, y: u.y + v.y }
  const dot = u.x * v.x + u.y * v.y
  const vectorAngle = Math.acos(dot / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y))) * 180 / Math.PI
  const origin = { x: 312, y: 186 }
  const unit = 46
  const point = (vector: { x: number; y: number }) => ({ x: origin.x + vector.x * unit, y: origin.y - vector.y * unit })
  const pu = point(u)
  const pv = point(v)
  const pr = point(result)
  const vFromU = mode === 'subtract' ? point({ x: u.x - v.x, y: u.y - v.y }) : point({ x: u.x + v.x, y: u.y + v.y })

  return (
    <MathVisualFrame
      title={`${topicTitle}：方向、长度与运算同步`}
      summary={mode === 'dot'
        ? '数量积把两个向量的长度和夹角压缩成一个实数；符号反映夹角是锐角、直角还是钝角。'
        : '向量运算既可以在图上移动有向线段，也可以逐坐标计算。两种表示必须得到同一个结果。'}
      controls={<>
        <MathRange label="向量 v 的方向" value={angle} min={-150} max={150} step={5} output={`${angle}°`} onChange={setAngle} />
        {mode === 'scale'
          ? <MathRange label="数乘系数 k" value={scale} min={-1.5} max={1.5} step={0.5} output={`k = ${scale}`} onChange={setScale} />
          : <MathRange label="向量 v 的长度" value={length} min={1} max={3.5} step={0.5} output={`|v| = ${length}`} onChange={setLength} />}
      </>}
      takeaway={mode === 'dot'
        ? <>u·v=|u||v|cos θ。结果为 0 且两个向量都非零时，才能判断它们垂直。</>
        : mode === 'scale'
          ? <>数乘只改变长度和方向：|k| 决定伸缩，k&lt;0 还会反向；结果始终与原向量共线。</>
          : <>向量相加用首尾相接或平行四边形法则；坐标运算是在同一基底下分别处理两个分量。</>}
    >
      <svg viewBox="0 0 640 350" role="img" aria-label={`向量u坐标为3和1.5，向量v坐标为${fmt(v.x)}和${fmt(v.y)}`}>
        <title>{topicTitle}的平面向量图解</title>
        <desc>改变向量v的方向和长度，图中的向量、合成结果与数量积同步更新。</desc>
        <ArrowDefs id={markerId} />
        <line className="g10t2-axis" x1="48" y1={origin.y} x2="594" y2={origin.y} />
        <line className="g10t2-axis" x1={origin.x} y1="28" x2={origin.x} y2="322" />
        {mode !== 'scale' && <>
          <line className="g10t2-vector-secondary" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pv.x} y2={pv.y} />
          <text className="g10t2-short-label" x={pv.x - 10} y={pv.y - 12} textAnchor="end">v</text>
        </>}
        <line className="g10t2-vector" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pu.x} y2={pu.y} />
        <text className="g10t2-short-label" x={pu.x + 9} y={pu.y - 10}>u</text>
        {mode === 'add' || mode === 'subtract' ? <>
          <line className="g10t2-guide" x1={pu.x} y1={pu.y} x2={vFromU.x} y2={vFromU.y} />
          <line className="g10t2-guide" x1={pv.x} y1={pv.y} x2={pr.x} y2={pr.y} />
          <line className="g10t2-vector-sum" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pr.x} y2={pr.y} />
          <text className="g10t2-short-label" x={pr.x + 8} y={pr.y - 9}>{mode === 'subtract' ? 'u−v' : 'u+v'}</text>
        </> : mode === 'scale' ? <>
          <line className="g10t2-vector-sum" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pr.x} y2={pr.y} />
          <text className="g10t2-short-label" x={pr.x + (scale >= 0 ? 8 : -8)} y={pr.y - 10} textAnchor={scale >= 0 ? 'start' : 'end'}>ku</text>
        </> : mode === 'coordinate' ? <>
          <line className="g10t2-guide" x1={pu.x} y1={pu.y} x2={pu.x} y2={origin.y} />
          <line className="g10t2-guide" x1={pu.x} y1={pu.y} x2={origin.x} y2={pu.y} />
          <text className="g10t2-coordinate-label" x={pu.x} y={origin.y + 27} textAnchor="middle">3</text>
          <text className="g10t2-coordinate-label" x={origin.x - 12} y={pu.y + 7} textAnchor="end">1.5</text>
        </> : <>
          <path className="g10t2-angle" d={`M ${origin.x + 54 * Math.cos(Math.atan2(-u.y, u.x))} ${origin.y + 54 * Math.sin(Math.atan2(-u.y, u.x))} A 54 54 0 0 ${vectorAngle > 180 ? 1 : 0} ${origin.x + 54 * Math.cos(-radians)} ${origin.y + 54 * Math.sin(-radians)}`} />
          <text className="g10t2-short-label" x="75" y="62">θ = {fmt(vectorAngle, 1)}°</text>
        </>}
      </svg>
      <p className="amv-readout">
        <strong>u=(3, 1.5)</strong><strong>v=({fmt(v.x)}, {fmt(v.y)})</strong>
        {mode === 'dot' ? <><span>数量积</span><strong>u·v={fmt(dot)}</strong></> : <><span>结果</span><strong>({fmt(result.x)}, {fmt(result.y)})</strong></>}
      </p>
    </MathVisualFrame>
  )
}

type ComplexOperation = 'add' | 'multiply' | 'divide' | 'conjugate' | 'rotate'

function preferredComplexOperation(topicTitle: string): ComplexOperation {
  if (/除法|分母实数化/.test(topicTitle)) return 'divide'
  if (/乘法|i的周期|虚数单位/.test(topicTitle)) return 'multiply'
  if (/共轭/.test(topicTitle)) return 'conjugate'
  if (/旋转|伸缩/.test(topicTitle)) return 'rotate'
  return 'add'
}

function ComplexPlaneVisual({ topicTitle }: VisualProps) {
  const markerId = `g10t2-complex-${useId().replace(/:/g, '')}`
  const preferred = preferredComplexOperation(topicTitle)
  const [operation, setOperation] = useState<ComplexOperation>(preferred)
  const [a, setA] = useState(2)
  const [b, setB] = useState(2)
  const z = { x: a, y: b }
  const w = { x: -1, y: 1 }
  const denominator = w.x * w.x + w.y * w.y
  const results: Record<ComplexOperation, { x: number; y: number }> = {
    add: { x: z.x + w.x, y: z.y + w.y },
    multiply: { x: z.x * w.x - z.y * w.y, y: z.x * w.y + z.y * w.x },
    divide: { x: (z.x * w.x + z.y * w.y) / denominator, y: (z.y * w.x - z.x * w.y) / denominator },
    conjugate: { x: z.x, y: -z.y },
    rotate: { x: -z.y, y: z.x },
  }
  const result = results[operation]
  const origin = { x: 318, y: 174 }
  const unit = 48
  const point = (value: { x: number; y: number }) => ({ x: origin.x + value.x * unit, y: origin.y - value.y * unit })
  const pz = point(z)
  const pw = point(w)
  const pr = point(result)
  const labels: Record<ComplexOperation, string> = { add: 'z+w', multiply: 'zw', divide: 'z/w', conjugate: 'z̄', rotate: 'iz' }

  return (
    <MathVisualFrame
      title={`${topicTitle}：代数结果落回复平面`}
      summary="复数既是 a+bi，也是复平面上的点和向量。每次运算都同时检查代数结果与几何位置。"
      controls={<>
        <MathChoices label="观察运算" value={operation} onChange={(value) => setOperation(value as ComplexOperation)} choices={[
          { value: 'add', label: '加法' }, { value: 'multiply', label: '乘法' }, { value: 'divide', label: '除法' }, { value: 'conjugate', label: '共轭' }, { value: 'rotate', label: '乘 i' },
        ]} />
        <MathRange label="实部 a" value={a} min={-3} max={3} output={`a = ${a}`} onChange={setA} />
        <MathRange label="虚部 b" value={b} min={-3} max={3} output={`b = ${b}`} onChange={setB} />
      </>}
      takeaway={operation === 'multiply' || operation === 'rotate'
        ? <>复数相乘时模相乘、辐角相加；乘 i 是最典型的例子，它把向量逆时针旋转 90°。</>
        : operation === 'conjugate'
          ? <>共轭只改变虚部符号，在复平面上表现为关于实轴对称，而且 z·z̄=|z|²。</>
          : <>加减对应向量合成；除法先乘分母的共轭，使分母变成实数 |w|²。</>}
    >
      <svg viewBox="0 0 640 350" role="img" aria-label={`复数z等于${a}${signed(b, 'i')}，运算${labels[operation]}的结果为${fmt(result.x)}${signed(result.y, 'i')}`}>
        <title>{topicTitle}的复平面运算</title>
        <desc>调整实部虚部并选择运算，原复数、辅助复数和结果向量同步变化。</desc>
        <ArrowDefs id={markerId} />
        <line className="g10t2-axis" x1="50" y1={origin.y} x2="594" y2={origin.y} />
        <line className="g10t2-axis" x1={origin.x} y1="28" x2={origin.x} y2="320" />
        <text className="g10t2-axis-label" x="580" y={origin.y - 12}>实轴</text>
        <text className="g10t2-axis-label" x={origin.x + 12} y="48">虚轴</text>
        <line className="g10t2-vector" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pz.x} y2={pz.y} />
        {(operation === 'add' || operation === 'multiply' || operation === 'divide') && <>
          <line className="g10t2-vector-secondary" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pw.x} y2={pw.y} />
          <text className="g10t2-short-label" x={pw.x - 10} y={pw.y - 10} textAnchor="end">w</text>
        </>}
        {operation === 'conjugate' && <line className="g10t2-guide" x1={pz.x} y1={pz.y} x2={pr.x} y2={pr.y} />}
        <line className="g10t2-vector-sum" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pr.x} y2={pr.y} />
        <circle className="g10t2-point" cx={pz.x} cy={pz.y} r="7" />
        <circle className="g10t2-point-secondary" cx={pr.x} cy={pr.y} r="7" />
        <text className="g10t2-short-label" x={pz.x + 9} y={pz.y - 10}>z</text>
        <text className="g10t2-short-label" x={pr.x + 9} y={pr.y + 24}>{labels[operation]}</text>
      </svg>
      <p className="amv-readout"><strong>z={a}{signed(b, 'i')}</strong><span>{labels[operation]}</span><strong>{fmt(result.x)}{signed(result.y, 'i')}</strong><span>模</span><strong>|z|={fmt(Math.hypot(a, b))}</strong></p>
    </MathVisualFrame>
  )
}

function QuadraticComplexVisual({ topicTitle }: VisualProps) {
  const [realPart, setRealPart] = useState(1)
  const [imaginaryPart, setImaginaryPart] = useState(2)
  const p = -2 * realPart
  const q = realPart * realPart + imaginaryPart * imaginaryPart
  const discriminant = p * p - 4 * q
  const origin = { x: 320, y: 178 }
  const unit = 50
  const rootX = origin.x + realPart * unit
  const upperY = origin.y - imaginaryPart * unit
  const lowerY = origin.y + imaginaryPart * unit

  return (
    <MathVisualFrame
      title={`${topicTitle}：共轭根成对出现`}
      summary="实系数方程若有一个非实根 a+bi，代入后取共轭可知 a−bi 也是根；两根关于实轴对称。"
      controls={<>
        <MathRange label="根的实部 a" value={realPart} min={-3} max={3} output={`a = ${realPart}`} onChange={setRealPart} />
        <MathRange label="根的虚部 b" value={imaginaryPart} min={1} max={3} output={`b = ${imaginaryPart}`} onChange={setImaginaryPart} />
      </>}
      takeaway={<>两根之和 2a、两根之积 a²+b² 都是实数，所以可以组成实系数方程 x²−2ax+(a²+b²)=0。</>}
    >
      <svg viewBox="0 0 640 350" role="img" aria-label={`实系数二次方程的两个根为${realPart}加减${imaginaryPart}i`}>
        <title>{topicTitle}的共轭根图解</title>
        <desc>两个非实根关于实轴对称，并通过韦达定理形成实系数方程。</desc>
        <line className="g10t2-axis" x1="52" y1={origin.y} x2="590" y2={origin.y} />
        <line className="g10t2-axis" x1={origin.x} y1="30" x2={origin.x} y2="320" />
        <line className="g10t2-guide" x1={rootX} y1={upperY} x2={rootX} y2={lowerY} />
        <circle className="g10t2-point" cx={rootX} cy={upperY} r="9" />
        <circle className="g10t2-point-secondary" cx={rootX} cy={lowerY} r="9" />
        <text className="g10t2-short-label" x={rootX + 12} y={upperY - 12}>a+bi</text>
        <text className="g10t2-short-label" x={rootX + 12} y={lowerY + 24}>a−bi</text>
        <text className="g10t2-formula" x="66" y="62">Δ = {discriminant} &lt; 0</text>
        <text className="g10t2-formula g10t2-mobile-hide" x="66" y="98">两根关于实轴对称</text>
      </svg>
      <p className="amv-readout"><span>方程</span><strong>x² {signed(p, 'x')} {signed(q)} = 0</strong><span>两根</span><strong>{realPart} ± {imaginaryPart}i</strong></p>
    </MathVisualFrame>
  )
}

function PolarComplexVisual({ topicTitle }: VisualProps) {
  const markerId = `g10t2-polar-${useId().replace(/:/g, '')}`
  const [radius, setRadius] = useState(2.5)
  const [angle, setAngle] = useState(40)
  const [rotation, setRotation] = useState(50)
  const radians = angle * Math.PI / 180
  const resultRadians = (angle + rotation) * Math.PI / 180
  const origin = { x: 310, y: 180 }
  const unit = 62
  const p = { x: origin.x + radius * unit * Math.cos(radians), y: origin.y - radius * unit * Math.sin(radians) }
  const result = { x: origin.x + radius * unit * Math.cos(resultRadians), y: origin.y - radius * unit * Math.sin(resultRadians) }

  return (
    <MathVisualFrame
      title={`${topicTitle}：模决定伸缩，辐角决定旋转`}
      summary="三角形式 z=r(cos θ+i sin θ) 把复数拆成长度 r 和方向 θ。乘法时，两部分遵循不同但清晰的规则。"
      controls={<>
        <MathRange label="模 r" value={radius} min={1} max={3.5} step={0.5} output={`r = ${radius}`} onChange={setRadius} />
        <MathRange label="辐角 θ" value={angle} min={-150} max={150} step={5} output={`${angle}°`} onChange={setAngle} />
        <MathRange label="乘数的辐角 β" value={rotation} min={-120} max={120} step={5} output={`${rotation}°`} onChange={setRotation} />
      </>}
      takeaway={<>相乘时模相乘、辐角相加；同一个方向可写成 θ+2kπ，所以辐角不是唯一值。</>}
    >
      <svg viewBox="0 0 640 360" role="img" aria-label={`复数的模为${radius}，辐角为${angle}度，旋转${rotation}度后辐角为${angle + rotation}度`}>
        <title>{topicTitle}的复数三角形式</title>
        <desc>调整模和辐角后，复平面向量的长度与方向同步变化；第二向量显示复数乘法带来的旋转。</desc>
        <ArrowDefs id={markerId} />
        <line className="g10t2-axis" x1="48" y1={origin.y} x2="594" y2={origin.y} />
        <line className="g10t2-axis" x1={origin.x} y1="28" x2={origin.x} y2="326" />
        <circle className="g10t2-modulus-circle" cx={origin.x} cy={origin.y} r={radius * unit} />
        <line className="g10t2-vector" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={p.x} y2={p.y} />
        <line className="g10t2-vector-sum" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={result.x} y2={result.y} />
        <path className="g10t2-angle" d={`M ${origin.x + 48} ${origin.y} A 48 48 0 0 ${angle < 0 ? 1 : 0} ${origin.x + 48 * Math.cos(radians)} ${origin.y - 48 * Math.sin(radians)}`} />
        <text className="g10t2-short-label" x={p.x + 9} y={p.y - 10}>z</text>
        <text className="g10t2-short-label" x={result.x + 9} y={result.y + 22}>zw</text>
        <text className="g10t2-formula" x="62" y="54">θ={angle}°</text>
        <text className="g10t2-formula" x="458" y="54">θ+β={angle + rotation}°</text>
      </svg>
      <p className="amv-readout"><span>代数形式</span><strong>z={fmt(radius * Math.cos(radians))}{signed(radius * Math.sin(radians), 'i')}</strong><span>三角形式</span><strong>{radius}(cos {angle}° + i sin {angle}°)</strong></p>
    </MathVisualFrame>
  )
}

function ComplexVisual(props: VisualProps) {
  if (props.unitTitle.startsWith('9.3') || /方程|判别式|根的类型|韦达|复根/.test(props.topicTitle)) {
    return <QuadraticComplexVisual {...props} />
  }
  if (props.unitTitle.includes('9.4') || /三角形式|辐角|棣莫弗|乘方|开方/.test(props.topicTitle)) {
    return <PolarComplexVisual {...props} />
  }
  return <ComplexPlaneVisual {...props} />
}

export function G10Term2MathVisual({ topicTitle, unitTitle }: VisualProps) {
  if (/^(6\.|7\.)/.test(unitTitle) || /三角|正弦|余弦|正切|余切|弧度|单位圆/.test(`${unitTitle} ${topicTitle}`)) {
    return <TrigonometryVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  }
  if (/^8\./.test(unitTitle) || /向量/.test(`${unitTitle} ${topicTitle}`)) {
    return <VectorVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  }
  return <ComplexVisual topicTitle={topicTitle} unitTitle={unitTitle} />
}
