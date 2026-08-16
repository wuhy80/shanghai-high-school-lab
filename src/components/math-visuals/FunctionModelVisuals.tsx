import { useId, useState, type ReactNode } from 'react'
import './FunctionModelVisuals.css'

type VisualFrameProps = {
  title: string
  summary: string
  controls?: ReactNode
  children: ReactNode
  takeaway: ReactNode
}

function VisualFrame({ title, summary, controls, children, takeaway }: VisualFrameProps) {
  return (
    <section className="fmv" aria-label={`${title}示意图`}>
      <header className="fmv-header">
        <div><span>看图理解</span><h3>{title}</h3></div>
        <p>{summary}</p>
      </header>
      {controls && <div className="fmv-controls">{controls}</div>}
      <div className="fmv-stage">{children}</div>
      <p className="fmv-takeaway"><strong>抓住：</strong>{takeaway}</p>
    </section>
  )
}

function RangeControl({ label, value, min, max, step, onChange, output }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  output: string
}) {
  const id = useId()
  return (
    <label className="fmv-range" htmlFor={id}>
      <span><b>{label}</b><output>{output}</output></span>
      <input id={id} type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function ChoiceControl({ label, choices, value, onChange }: {
  label: string
  choices: ReadonlyArray<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="fmv-choice">
      <legend>{label}</legend>
      <div>
        {choices.map((choice) => (
          <button key={choice.value} type="button" aria-pressed={value === choice.value} onClick={() => onChange(choice.value)}>{choice.label}</button>
        ))}
      </div>
    </fieldset>
  )
}

function Axes({ xLabel = 'x', yLabel = 'y', xOrigin = 280, yOrigin = 250 }: { xLabel?: string; yLabel?: string; xOrigin?: number; yOrigin?: number }) {
  return (
    <g className="fmv-axes" aria-hidden="true">
      <line x1="34" y1={yOrigin} x2="542" y2={yOrigin} />
      <line x1={xOrigin} y1="20" x2={xOrigin} y2="276" />
      <path d={`M 542 ${yOrigin} l -8 -5 v 10 z`} />
      <path d={`M ${xOrigin} 20 l -5 8 h 10 z`} />
      <text x="528" y={yOrigin - 10}>{xLabel}</text>
      <text x={xOrigin + 9} y="34">{yLabel}</text>
    </g>
  )
}

function curvePoints(fn: (x: number) => number, min: number, max: number, mapX: (x: number) => number, mapY: (y: number) => number) {
  return Array.from({ length: 121 }, (_, index) => {
    const x = min + (max - min) * index / 120
    return `${mapX(x).toFixed(1)},${mapY(fn(x)).toFixed(1)}`
  }).join(' ')
}

function DomainRangeVisual() {
  const [x, setX] = useState(1)
  const inside = Math.abs(x) <= 2
  const y = inside ? Math.sqrt(4 - x * x) : undefined
  const mapX = (value: number) => 280 + value * 92
  const mapY = (value: number) => 250 - value * 96
  const arc = curvePoints((value) => Math.sqrt(Math.max(0, 4 - value * value)), -2, 2, mapX, mapY)

  return (
    <VisualFrame
      title="定义域管输入，值域管输出"
      summary="沿着输入 x 走一遍，观察哪些 x 能送进规则，又能产生哪些 y。"
      controls={<RangeControl label="尝试输入 x" value={x} min={-3} max={3} step={0.25} onChange={setX} output={`x = ${x}`} />}
      takeaway={<>定义域是所有“允许进入”的 <i>x</i>；值域是这些输入实际产生的全部 <i>y</i>。它们不是横轴、纵轴本身。</>}
    >
      <div className="fmv-flow" aria-live="polite">
        <span className={inside ? 'is-active' : 'is-error'}>输入 x = {x}</span><b aria-hidden="true">→</b>
        <span>规则 y = √(4 − x²)</span><b aria-hidden="true">→</b>
        <span className={inside ? 'is-active' : 'is-error'}>{inside ? `输出 y = ${y?.toFixed(2)}` : '没有实数输出'}</span>
      </div>
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`函数 y 等于根号下 4 减 x 平方，定义域负2到2，值域0到2。当前输入${x}，${inside ? `输出${y?.toFixed(2)}` : '没有实数输出'}`}>
        <title>从半圆图像读取定义域和值域</title>
        <desc>把图像向横轴投影得到定义域负2到2，向纵轴投影得到值域0到2。</desc>
        <Axes />
        <line className="fmv-domain-band" x1={mapX(-2)} y1="264" x2={mapX(2)} y2="264" />
        <line className="fmv-range-band" x1="266" y1={mapY(2)} x2="266" y2={mapY(0)} />
        <text className="fmv-direct-label" x="280" y="292" textAnchor="middle">定义域 [−2, 2]</text>
        <text className="fmv-direct-label" x="188" y="145" textAnchor="middle">值域 [0, 2]</text>
        <polyline className="fmv-curve" points={arc} />
        <circle className="fmv-endpoint" cx={mapX(-2)} cy={mapY(0)} r="5" />
        <circle className="fmv-endpoint" cx={mapX(2)} cy={mapY(0)} r="5" />
        {inside && y !== undefined && <g className="fmv-current-point">
          <line x1={mapX(x)} y1={mapY(y)} x2={mapX(x)} y2={250} />
          <line x1={mapX(x)} y1={mapY(y)} x2={280} y2={mapY(y)} />
          <circle cx={mapX(x)} cy={mapY(y)} r="6" />
          <text x={mapX(x) + (x > 1.3 ? -10 : 10)} y={mapY(y) - 12} textAnchor={x > 1.3 ? 'end' : 'start'}>({x}, {y.toFixed(2)})</text>
        </g>}
      </svg>
    </VisualFrame>
  )
}

function MonotonicityVisual() {
  const [side, setSide] = useState<'left' | 'right'>('left')
  const x1 = side === 'left' ? -2.5 : 0.8
  const x2 = side === 'left' ? -1 : 2.3
  const mapX = (value: number) => 280 + value * 76
  const mapY = (value: number) => 250 - value * 25
  const points = curvePoints((value) => value * value, -3, 3, mapX, mapY)
  const decreases = side === 'left'

  return (
    <VisualFrame
      title="单调性必须在一个区间里比较"
      summary="同一条抛物线，在最低点两侧有相反的变化方向。"
      controls={<ChoiceControl label="选择观察区间" value={side} onChange={(value) => setSide(value as 'left' | 'right')} choices={[{ value: 'left', label: 'x ≤ 0' }, { value: 'right', label: 'x ≥ 0' }]} />}
      takeaway={<>先限定区间，再取 <i>x₁ &lt; x₂</i>。若总有 <i>f(x₁) &gt; f(x₂)</i> 就递减；若总有 <i>f(x₁) &lt; f(x₂)</i> 就递增。</>}
    >
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`函数y等于x平方在${decreases ? '负无穷到0上递减' : '0到正无穷上递增'}的示意图`}>
        <title>用两个有序输入判断单调性</title>
        <desc>选取同一区间内的x1和x2，按x1小于x2的顺序比较对应函数值。</desc>
        <Axes />
        <polyline className="fmv-curve" points={points} />
        <polyline className="fmv-highlight" points={curvePoints((value) => value * value, side === 'left' ? -3 : 0, side === 'left' ? 0 : 3, mapX, mapY)} />
        {[x1, x2].map((value, index) => <g key={value} className="fmv-current-point">
          <line x1={mapX(value)} y1={mapY(value * value)} x2={mapX(value)} y2="250" />
          <circle cx={mapX(value)} cy={mapY(value * value)} r="6" />
          <text x={mapX(value)} y="272" textAnchor="middle">x{index + 1}</text>
          <text x={mapX(value) + (side === 'left' ? -9 : 9)} y={mapY(value * value) - 9} textAnchor={side === 'left' ? 'end' : 'start'}>f(x{index + 1})</text>
        </g>)}
        <path className="fmv-direction" d={decreases ? 'M 118 58 Q 176 155 267 235' : 'M 293 235 Q 384 155 442 58'} />
        <text className="fmv-direct-label" x={decreases ? 134 : 426} y="112" textAnchor="middle">x 增大，y {decreases ? '减小' : '增大'}</text>
      </svg>
      <p className="fmv-equation" aria-live="polite">x₁ = {x1} &lt; x₂ = {x2}，而 f(x₁) = {(x1 * x1).toFixed(2)} {decreases ? '>' : '<'} f(x₂) = {(x2 * x2).toFixed(2)}，所以该区间上单调{decreases ? '递减' : '递增'}。</p>
    </VisualFrame>
  )
}

type ParityMode = 'even' | 'odd' | 'neither'

function ParityVisual() {
  const [mode, setMode] = useState<ParityMode>('even')
  const [x, setX] = useState(1.5)
  const functions = {
    even: { formula: 'f(x) = x²', fn: (value: number) => value * value, verdict: '偶函数：关于 y 轴对称' },
    odd: { formula: 'f(x) = x³ / 3', fn: (value: number) => value ** 3 / 3, verdict: '奇函数：关于原点中心对称' },
    neither: { formula: 'f(x) = x² + x', fn: (value: number) => value * value + value, verdict: '既非奇函数也非偶函数' },
  }
  const current = functions[mode]
  const mapX = (value: number) => 280 + value * 70
  const mapY = (value: number) => 150 - value * 10
  const yRight = current.fn(x)
  const yLeft = current.fn(-x)

  return (
    <VisualFrame
      title="奇偶性是把 x 换成 −x 后的整体关系"
      summary="动点只帮助观察一组 x 与 −x；最终结论必须对定义域内任意 x 作代数验证。"
      controls={<>
        <ChoiceControl label="选择函数" value={mode} onChange={(value) => setMode(value as ParityMode)} choices={[{ value: 'even', label: '偶函数' }, { value: 'odd', label: '奇函数' }, { value: 'neither', label: '都不是' }]} />
        <RangeControl label="取一对相反数" value={x} min={0.5} max={2} step={0.5} onChange={setX} output={`±${x}`} />
      </>}
      takeaway={<>偶函数对任意 <i>x</i> 满足 <i>f(−x)=f(x)</i>；奇函数对任意 <i>x</i> 满足 <i>f(−x)=−f(x)</i>，且定义域都关于原点对称。一组反例可以否定结论，但一组符合关系的点不能代替证明。</>}
    >
      <p className="fmv-formula">{current.formula}</p>
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`${current.formula}，${current.verdict}。x等于${x}时两侧函数值分别为${yRight.toFixed(2)}和${yLeft.toFixed(2)}`}>
        <title>比较相反输入对应的函数值</title>
        <Axes yOrigin={150} />
        <polyline className="fmv-curve" points={curvePoints(current.fn, -3, 3, mapX, mapY)} />
        {mode === 'even' && <>
          <line className="fmv-symmetry" x1="280" y1="20" x2="280" y2="278" />
          <line className="fmv-pair-guide" x1={mapX(-x)} y1={mapY(yLeft)} x2={mapX(x)} y2={mapY(yRight)} />
          <text className="fmv-direct-label" x="292" y="42">对称轴 y 轴</text>
        </>}
        {mode === 'odd' && <>
          <line className="fmv-center-symmetry" x1={mapX(-x)} y1={mapY(yLeft)} x2={mapX(x)} y2={mapY(yRight)} />
          <circle className="fmv-origin-center" cx="280" cy="150" r="6" />
          <text className="fmv-direct-label" x="292" y="174">对称中心 O</text>
        </>}
        <g className="fmv-pair-point">
          <circle cx={mapX(x)} cy={mapY(yRight)} r="7" />
          <circle cx={mapX(-x)} cy={mapY(yLeft)} r="7" />
          <text x={mapX(x) + 10} y={mapY(yRight) - 10}>(x, f(x))</text>
          <text x={mapX(-x) - 10} y={mapY(yLeft) - 10} textAnchor="end">(−x, f(−x))</text>
        </g>
      </svg>
      <p className={`fmv-equation ${mode === 'neither' ? 'is-warning' : ''}`} aria-live="polite">f({-x}) = {yLeft.toFixed(2)}；f({x}) = {yRight.toFixed(2)}。{current.verdict}。</p>
    </VisualFrame>
  )
}

function ZeroVisual() {
  const [q, setQ] = useState(1)
  const count = q < 0 ? 0 : q === 0 ? 1 : 2
  const mapX = (value: number) => 280 + value * 76
  const mapY = (value: number) => 220 - value * 35
  const roots = q > 0 ? [-Math.sqrt(q), Math.sqrt(q)] : q === 0 ? [0] : []

  return (
    <VisualFrame
      title="零点就是图像与 x 轴相遇的位置"
      summary="上下移动 y = x² − q，看方程 x² − q = 0 的实数解如何变化。"
      controls={<RangeControl label="竖直参数 q" value={q} min={-2} max={4} step={1} onChange={setQ} output={`q = ${q}`} />}
      takeaway={<>“函数零点”是输入 <i>x</i>，不是交点 <i>(x,0)</i>。求零点、解 <i>f(x)=0</i>、找 x 轴交点横坐标是同一件事。</>}
    >
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`函数y等于x平方减${q}，与x轴有${count}个交点，因此有${count}个零点`}>
        <title>函数零点与方程实数解</title>
        <Axes yOrigin={220} />
        <polyline className="fmv-curve" points={curvePoints((value) => value * value - q, -2.6, 2.6, mapX, mapY)} />
        {roots.map((root) => <g key={root} className="fmv-root">
          <circle cx={mapX(root)} cy="220" r="7" />
          <text x={mapX(root)} y="246" textAnchor="middle">x = {Number(root.toFixed(2))}</text>
        </g>)}
        {count === 0 && <text className="fmv-direct-label" x="280" y="193" textAnchor="middle">整条图像在 x 轴上方</text>}
      </svg>
      <p className="fmv-equation" aria-live="polite">x² − ({q}) = 0 {count === 0 ? '没有实数解' : `有 ${count} 个实数解`} ⇔ 函数有 {count} 个零点。</p>
    </VisualFrame>
  )
}

function TransformVisual() {
  const [focus, setFocus] = useState<'a' | 'h' | 'k'>('a')
  const notes = {
    a: { formula: 'y = a·f(x)', action: '先把每个纵坐标乘 a', effect: '|a| 控制纵向伸缩；a < 0 再关于 x 轴翻折' },
    h: { formula: 'y = f(x − h)', action: '要得到旧输入 x，需要新输入 x + h', effect: '图像水平移动：h > 0 向右，h < 0 向左' },
    k: { formula: 'y = f(x) + k', action: '每个输出都统一加 k', effect: '图像竖直移动：k > 0 向上，k < 0 向下' },
  }
  const note = notes[focus]

  return (
    <VisualFrame
      title="a、h、k 分别改动输出、输入与基准高度"
      summary="已有动态曲线负责展示结果；这张构造图解释为什么横移容易写反。"
      controls={<ChoiceControl label="查看一个参数" value={focus} onChange={(value) => setFocus(value as 'a' | 'h' | 'k')} choices={[{ value: 'a', label: 'a：伸缩/翻折' }, { value: 'h', label: 'h：水平移动' }, { value: 'k', label: 'k：竖直移动' }]} />}
      takeaway={<>遇到组合变换先抓住内部的 <i>x−h</i>，再处理外部乘 <i>a</i> 和加 <i>k</i>；不要把“公式中的符号”机械当作移动方向。</>}
    >
      <div className="fmv-transform-map" aria-live="polite">
        <div><small>原函数</small><strong>点 (x, y)</strong></div><span aria-hidden="true">→</span>
        <div className="is-active"><small>{note.formula}</small><strong>{note.action}</strong></div><span aria-hidden="true">→</span>
        <div><small>新图像</small><strong>{note.effect}</strong></div>
      </div>
      <svg className="fmv-transform-sketch" viewBox="0 0 560 170" role="img" aria-label={`${note.formula}的坐标变换关系：${note.action}，结果是${note.effect}`}>
        <title>函数图像参数变换的坐标构造</title>
        <line className="fmv-baseline" x1="42" y1="124" x2="520" y2="124" />
        <g className={focus === 'h' ? 'is-active' : ''}><circle cx="152" cy="82" r="8" /><line x1="152" y1="82" x2="262" y2="82" /><path d="M 262 82 l -10 -6 v 12 z" /><text x="207" y="69" textAnchor="middle">x → x + h</text></g>
        <g className={focus === 'k' ? 'is-active' : ''}><circle cx="262" cy="82" r="8" /><line x1="262" y1="82" x2="262" y2="35" /><path d="M 262 35 l -6 10 h 12 z" /><text x="278" y="48">y → y + k</text></g>
        <g className={focus === 'a' ? 'is-active' : ''}><line x1="374" y1="124" x2="374" y2="65" /><circle cx="374" cy="65" r="8" /><text x="390" y="82">y → ay</text></g>
        <text x="152" y="148" textAnchor="middle">原位置</text><text x="318" y="148" textAnchor="middle">变换后位置</text>
      </svg>
    </VisualFrame>
  )
}

type InverseMode = 'invertible' | 'many-to-one'

function InverseFunctionVisual() {
  const [mode, setMode] = useState<InverseMode>('invertible')
  const [a, setA] = useState(1.5)
  const [level, setLevel] = useState(1)
  const b = 2 * a + 1
  const inverse = (value: number) => (value - 1) / 2
  const symmetricMapX = (value: number) => 280 + value * 25
  const symmetricMapY = (value: number) => 150 - value * 25
  const parabolaMapX = (value: number) => 280 + value * 88
  const parabolaMapY = (value: number) => 258 - value * 52
  const root = Math.sqrt(level)

  return (
    <VisualFrame
      title={mode === 'invertible' ? '反函数把输入与输出完整交换' : '先用水平线检验能不能交换'}
      summary={mode === 'invertible'
        ? '在 f(x)=2x+1，x∈[−2,2] 中跟踪一对输入输出；交换坐标后得到反函数上的点。'
        : '在 g(x)=x²，x∈[−2,2] 上，同一条水平线会遇到两个点，说明一个输出来自两个输入。'}
      controls={<>
        <ChoiceControl
          label="选择要检查的函数"
          value={mode}
          onChange={(value) => setMode(value as InverseMode)}
          choices={[
            { value: 'invertible', label: '可逆：f(x)=2x+1' },
            { value: 'many-to-one', label: '不可逆：g(x)=x²' },
          ]}
        />
        {mode === 'invertible'
          ? <RangeControl label="原函数输入 a" value={a} min={-2} max={2} step={0.5} onChange={setA} output={`a = ${a}`} />
          : <RangeControl label="水平线高度 c" value={level} min={0.5} max={4} step={0.5} onChange={setLevel} output={`c = ${level}`} />}
      </>}
      takeaway={mode === 'invertible'
        ? <>若 <i>f(a)=b</i>，就有 <i>f⁻¹(b)=a</i>；因此点 <i>(a,b)</i> 交换成 <i>(b,a)</i>，定义域和值域互换，两条图像关于 <i>y=x</i> 对称。</>
        : <>并非每个函数在原定义域上都有反函数。水平线只要与图像相交两次，交换后就会让一个输入对应两个输出；限制定义域后才可能可逆。</>}
    >
      {mode === 'invertible' ? <>
        <div className="fmv-inverse-swap" aria-live="polite">
          <div>
            <strong>原函数 f</strong>
            <span><small>输入 / 定义域 D<sub>f</sub></small><b>a = {a}　∈ [−2, 2]</b></span>
            <i aria-hidden="true">→</i>
            <span><small>输出 / 值域 V<sub>f</sub></small><b>b = {b}　∈ [−3, 5]</b></span>
          </div>
          <div className="is-inverse">
            <strong>反函数 f⁻¹</strong>
            <span><small>输入 / 定义域 D<sub>f⁻¹</sub> = V<sub>f</sub></small><b>b = {b}　∈ [−3, 5]</b></span>
            <i aria-hidden="true">→</i>
            <span><small>输出 / 值域 V<sub>f⁻¹</sub> = D<sub>f</sub></small><b>a = {a}　∈ [−2, 2]</b></span>
          </div>
        </div>
        <svg className="fmv-plot fmv-inverse-plot" viewBox="0 0 560 300" role="img" aria-label={`原函数 f 的点为 ${a},${b}，反函数的对应点为 ${b},${a}；两条图像关于 y 等于 x 对称`}>
          <title>原函数与反函数关于 y=x 对称</title>
          <desc>原函数 f(x)=2x+1 的定义域是负2到2，反函数是括号 x 减 1 再除以 2。点 a,b 交换成 b,a。</desc>
          <Axes xOrigin={280} yOrigin={150} />
          <line className="fmv-identity-line" x1={symmetricMapX(-5)} y1={symmetricMapY(-5)} x2={symmetricMapX(5)} y2={symmetricMapY(5)} />
          <text className="fmv-direct-label" x="398" y="48">y = x</text>
          <polyline className="fmv-original-curve" points={curvePoints((value) => 2 * value + 1, -2, 2, symmetricMapX, symmetricMapY)} />
          <polyline className="fmv-inverse-curve" points={curvePoints(inverse, -3, 5, symmetricMapX, symmetricMapY)} />
          <text className="fmv-original-label" x={symmetricMapX(-2) + 8} y={symmetricMapY(-3) - 10}>f</text>
          <text className="fmv-inverse-label" x={symmetricMapX(5) - 8} y={symmetricMapY(2) - 10} textAnchor="end">f⁻¹</text>
          <line className="fmv-reflection-line" x1={symmetricMapX(a)} y1={symmetricMapY(b)} x2={symmetricMapX(b)} y2={symmetricMapY(a)} />
          <g className="fmv-original-point">
            <circle cx={symmetricMapX(a)} cy={symmetricMapY(b)} r="7" />
            <text x={symmetricMapX(a) - 10} y={b >= 4.5 ? symmetricMapY(b) + 24 : symmetricMapY(b) - 11} textAnchor="end">P({a}, {b})</text>
          </g>
          <g className="fmv-inverted-point">
            <rect x={symmetricMapX(b) - 6} y={symmetricMapY(a) - 6} width="12" height="12" transform={`rotate(45 ${symmetricMapX(b)} ${symmetricMapY(a)})`} />
            <text x={symmetricMapX(b) + 10} y={symmetricMapY(a) + 20}>P′({b}, {a})</text>
          </g>
        </svg>
        <p className="fmv-equation">P(a,b) = ({a},{b})　⇄　P′(b,a) = ({b},{a})</p>
      </> : <>
        <div className="fmv-inverse-failure" aria-live="polite">
          <span><small>原函数中的两个输入</small><b>g(−{Number(root.toFixed(2))}) = g({Number(root.toFixed(2))}) = {level}</b></span>
          <i aria-hidden="true">交换输入输出后</i>
          <span className="is-error"><small>同一个输入会有两个输出</small><b>{level} → −{Number(root.toFixed(2))} 和 {Number(root.toFixed(2))}</b></span>
        </div>
        <svg className="fmv-plot fmv-horizontal-test-plot" viewBox="0 0 560 300" role="img" aria-label={`函数 g 等于 x 平方在定义域负2到2上，水平线 y 等于 ${level} 与图像有两个交点，所以原定义域上没有反函数`}>
          <title>水平线检验一一对应</title>
          <desc>水平线与抛物线相交两次，两个不同输入产生同一个输出，交换后不再满足函数定义。</desc>
          <Axes xOrigin={280} yOrigin={258} />
          <polyline className="fmv-original-curve" points={curvePoints((value) => value * value, -2, 2, parabolaMapX, parabolaMapY)} />
          <line className="fmv-horizontal-line" x1={parabolaMapX(-2.35)} y1={parabolaMapY(level)} x2={parabolaMapX(2.35)} y2={parabolaMapY(level)} />
          <text className="fmv-horizontal-label" x={parabolaMapX(2.25)} y={parabolaMapY(level) - 10} textAnchor="end">y = {level}</text>
          {[-root, root].map((value) => <g key={value} className="fmv-horizontal-hit">
            <circle cx={parabolaMapX(value)} cy={parabolaMapY(level)} r="7" />
            <line x1={parabolaMapX(value)} y1={parabolaMapY(level)} x2={parabolaMapX(value)} y2="258" />
            <text x={parabolaMapX(value)} y="282" textAnchor="middle">{Number(value.toFixed(2))}</text>
          </g>)}
          <text className="fmv-direct-label" x="280" y="34" textAnchor="middle">水平线交 2 点 → 不满足一一对应</text>
        </svg>
        <p className="fmv-equation is-warning">在定义域 [−2,2] 上没有反函数；若限制为 [0,2] 或 [−2,0]，水平线至多交一点，才可求反函数。</p>
      </>}
    </VisualFrame>
  )
}

function PiecewiseVisual() {
  const [hours, setHours] = useState(2)
  const cost = hours <= 1 ? 6 : Math.min(30, 6 + Math.ceil(hours - 1) * 4)
  const rule = hours <= 1 ? '首小时' : cost === 30 ? '封顶' : '续时'
  const mapX = (value: number) => 58 + value * 56
  const mapY = (value: number) => 260 - value * 6.5
  const segments = [
    { start: 0, end: 1, value: 6 },
    { start: 1, end: 2, value: 10 },
    { start: 2, end: 3, value: 14 },
    { start: 3, end: 4, value: 18 },
    { start: 4, end: 5, value: 22 },
    { start: 5, end: 6, value: 26 },
    { start: 6, end: 8, value: 30 },
  ]

  return (
    <VisualFrame
      title="分段函数先判断落在哪一段"
      summary="以下停车规则只用于建模：首小时 6 元，之后每满或不足 1 小时加 4 元，30 元封顶。"
      controls={<RangeControl label="停车时长" value={hours} min={0.5} max={8} step={0.5} onChange={setHours} output={`${hours} 小时`} />}
      takeaway={<>先按条件选公式，再代入。边界 <i>x=1</i> 属于哪一段、续时是否“向上取整”，都必须从文字规则中确认。</>}
    >
      <div className="fmv-piecewise-rule">
        <b>C(x)=</b><span>6，0 &lt; x ≤ 1</span><span>6+4⌈x−1⌉，1 &lt; x 且结果低于 30</span><span>30，达到封顶</span>
      </div>
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`停车${hours}小时，按${rule}规则计费${cost}元的阶梯图`}>
        <title>停车时长对应的分段计费阶梯图</title>
        <g className="fmv-axes"><line x1="58" y1="260" x2="528" y2="260" /><line x1="58" y1="24" x2="58" y2="260" /><text x="450" y="284">时长/小时</text><text x="68" y="38">费用/元</text></g>
        {segments.map((segment) => <g key={segment.start} className="fmv-step-segment">
          <line x1={mapX(segment.start)} y1={mapY(segment.value)} x2={mapX(segment.end)} y2={mapY(segment.value)} />
          <circle className="fmv-open-end" cx={mapX(segment.start)} cy={mapY(segment.value)} r="5" />
          <circle className="fmv-closed-end" cx={mapX(segment.end)} cy={mapY(segment.value)} r="5" />
        </g>)}
        <g className="fmv-current-point"><line x1={mapX(hours)} y1={mapY(cost)} x2={mapX(hours)} y2="260" /><circle cx={mapX(hours)} cy={mapY(cost)} r="7" /><text x={mapX(hours)} y={mapY(cost) - 13} textAnchor="middle">{cost} 元</text></g>
        <text className="fmv-direct-label" x="145" y="202">首小时</text><text className="fmv-direct-label" x="326" y="128">逐小时增加</text><text className="fmv-direct-label" x="430" y="51">30 元封顶</text>
      </svg>
      <p className="fmv-equation" aria-live="polite">x = {hours} 落在“{rule}”这一段，所以 C({hours}) = {cost} 元。</p>
    </VisualFrame>
  )
}

function PowerVisual() {
  const [exponent, setExponent] = useState('2')
  const [x, setX] = useState(2)
  const a = Number(exponent)
  const doubled = 2 ** a
  const mapX = (value: number) => 280 + value * 60
  const yScale = a === 2 ? 7.2 : a === 1 ? 29 : a === .5 ? 52 : 38
  const mapY = (value: number) => 150 - value * yScale
  const domainLabel = a === -1 ? '定义域 (−∞, 0) ∪ (0, +∞)' : a === .5 ? '定义域 [0, +∞)' : '定义域 R'
  const curveDomains: Array<[number, number]> = a === -1
    ? [[-4, -.35], [.35, 4]]
    : a === .5
      ? [[0, 4]]
      : [[-4, 4]]

  return (
    <VisualFrame
      title="幂函数看的是倍数如何被指数放大"
      summary="先按指数确定完整定义域与图像分支，再在正数输入上观察：输入乘 2，输出乘 2ᵃ。"
      controls={<>
        <ChoiceControl label="选择指数 a" value={exponent} onChange={setExponent} choices={[{ value: '-1', label: 'a = −1' }, { value: '0.5', label: 'a = 1/2' }, { value: '1', label: 'a = 1' }, { value: '2', label: 'a = 2' }]} />
        <RangeControl label="输入 x" value={x} min={.5} max={2} step={.5} onChange={setX} output={`x = ${x}`} />
      </>}
      takeaway={<>幂函数 <i>y=xᵃ</i> 的定义域随指数改变：负指数排除 0，平方根只接收非负数，整数指数可接收全体实数。图中的倍数实验限定 <i>x&gt;0</i>，用于观察 <i>f(2x)=2ᵃf(x)</i>。</>}
    >
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`幂函数y等于x的${a}次方，输入从${x}扩大到${x * 2}时，输出扩大${doubled.toFixed(2)}倍`}>
        <title>幂函数的完整定义域与正数输入尺度变化</title>
        <desc>{domainLabel}。红色和金色点只在正数输入上比较 x 与 2x。</desc>
        <Axes xOrigin={280} yOrigin={150} />
        {a === -1 && <line className="fmv-asymptote" x1="280" y1="20" x2="280" y2="276" />}
        {curveDomains.map(([start, end]) => <polyline key={`${start}-${end}`} className="fmv-curve" points={curvePoints((value) => value ** a, start, end, mapX, mapY)} />)}
        {a === .5 && <circle className="fmv-domain-endpoint" cx={mapX(0)} cy={mapY(0)} r="6" />}
        {[x, x * 2].map((value, index) => {
          const valueY = value ** a
          return <g key={value} className={index === 0 ? 'fmv-current-point' : 'fmv-pair-point'}><line x1={mapX(value)} y1={mapY(valueY)} x2={mapX(value)} y2="150" /><circle cx={mapX(value)} cy={mapY(valueY)} r="7" /><text x={mapX(value)} y="176" textAnchor="middle">{index === 0 ? 'x' : '2x'}</text></g>
        })}
        <path className="fmv-direction" d={`M ${mapX(x) + 10} 226 Q ${(mapX(x) + mapX(x * 2)) / 2} 202 ${mapX(x * 2) - 10} 226`} />
        <text className="fmv-direct-label" x={(mapX(x) + mapX(x * 2)) / 2} y="195" textAnchor="middle">正数输入 ×2，输出 ×{Number(doubled.toFixed(2))}</text>
        <text className="fmv-direct-label" x="280" y="292" textAnchor="middle">{domainLabel}</text>
      </svg>
      <p className="fmv-equation">f(2x) = (2x)ᵃ = 2ᵃf(x)；当前 a = {a}，倍数是 {Number(doubled.toFixed(2))}。</p>
    </VisualFrame>
  )
}

function ExponentialVisual() {
  const [base, setBase] = useState('1.5')
  const [time, setTime] = useState(3)
  const b = Number(base)
  const amount = 100 * b ** time
  const mapX = (value: number) => 58 + value * 78
  const maxAmount = b > 1 ? 800 : 120
  const mapY = (value: number) => 258 - value / maxAmount * 215

  return (
    <VisualFrame
      title="指数函数是每一步都乘同一个倍数"
      summary="初始量 100，每经过一期乘 b；增长或衰减由底数 b 决定。"
      controls={<>
        <ChoiceControl label="每期变化" value={base} onChange={setBase} choices={[{ value: '1.5', label: '×1.5 增长' }, { value: '0.7', label: '×0.7 衰减' }]} />
        <RangeControl label="经过期数 t" value={time} min={0} max={5} step={1} onChange={setTime} output={`${time} 期`} />
      </>}
      takeaway={<>指数模型 <i>y=A·bᵗ</i> 的时间在指数位置。相邻两期的比值保持为 <i>b</i>，而不是相邻两期的差保持不变。</>}
    >
      <div className="fmv-growth-chain" aria-label="逐期乘相同倍数">
        {Array.from({ length: time + 1 }, (_, index) => <span key={index} className={index === time ? 'is-active' : ''}><small>t={index}</small><b>{(100 * b ** index).toFixed(1)}</b>{index < time && <i>×{b}</i>}</span>)}
      </div>
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`指数模型100乘${b}的t次方，第${time}期为${amount.toFixed(1)}`}>
        <title>指数增长或衰减曲线</title>
        <g className="fmv-axes"><line x1="58" y1="258" x2="528" y2="258" /><line x1="58" y1="24" x2="58" y2="258" /><text x="480" y="282">时间 t</text><text x="68" y="39">数量</text></g>
        <polyline className="fmv-curve" points={curvePoints((value) => 100 * b ** value, 0, 5.5, mapX, mapY)} />
        <g className="fmv-current-point"><line x1={mapX(time)} y1={mapY(amount)} x2={mapX(time)} y2="258" /><circle cx={mapX(time)} cy={mapY(amount)} r="7" /><text x={mapX(time) + (time > 4 ? -10 : 10)} y={mapY(amount) - 10} textAnchor={time > 4 ? 'end' : 'start'}>{amount.toFixed(1)}</text></g>
      </svg>
    </VisualFrame>
  )
}

function LogarithmVisual() {
  const [x, setX] = useState(4)
  const y = Math.log2(x)
  const mapX = (value: number) => 72 + value * 54
  const mapY = (value: number) => 185 - value * 38

  return (
    <VisualFrame
      title="对数是在反问：2 的几次方等于 x"
      summary="给定结果 x，log₂x 返回指数 y；它与 2ʸ=x 是同一句关系的两种读法。"
      controls={<RangeControl label="给定结果 x" value={x} min={.25} max={8} step={.25} onChange={setX} output={`x = ${x}`} />}
      takeaway={<>指数式与对数式互译：<i>2ʸ=x ⇔ log₂x=y</i>。因为指数函数的输出恒大于 0，所以对数函数只接收 <i>x&gt;0</i>。</>}
    >
      <div className="fmv-inverse-reading" aria-live="polite"><span><small>指数读法</small><b>2<sup>{y.toFixed(2)}</sup> = {x}</b></span><i aria-hidden="true">⇄</i><span><small>对数读法</small><b>log₂{x} = {y.toFixed(2)}</b></span></div>
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`以2为底${x}的对数等于${y.toFixed(2)}，图像定义域是x大于0`}>
        <title>对数函数与指数函数互为反函数</title>
        <g className="fmv-axes"><line x1="45" y1="185" x2="530" y2="185" /><line x1="72" y1="20" x2="72" y2="276" /><text x="518" y="208">x</text><text x="84" y="34">y</text></g>
        <line className="fmv-asymptote" x1="72" y1="24" x2="72" y2="276" />
        <text className="fmv-direct-label" x="84" y="274">x = 0 是边界，不能取</text>
        <polyline className="fmv-curve" points={curvePoints((value) => Math.log2(value), .12, 8.4, mapX, mapY)} />
        <g className="fmv-current-point"><line x1={mapX(x)} y1={mapY(y)} x2={mapX(x)} y2="185" /><line x1="72" y1={mapY(y)} x2={mapX(x)} y2={mapY(y)} /><circle cx={mapX(x)} cy={mapY(y)} r="7" /><text x={mapX(x) + (x > 6 ? -10 : 10)} y={mapY(y) - 10} textAnchor={x > 6 ? 'end' : 'start'}>({x}, {y.toFixed(2)})</text></g>
      </svg>
    </VisualFrame>
  )
}

type ModelMode = 'linear' | 'exponential'
const observed = [10, 15, 22, 34, 51]

function ModelComparisonVisual() {
  const [mode, setMode] = useState<ModelMode>('linear')
  const predict = mode === 'linear' ? (time: number) => 10 + 10 * time : (time: number) => 10 * 1.5 ** time
  const prediction = observed.map((_, index) => predict(index))
  const residuals = observed.map((value, index) => value - prediction[index])
  const squaredError = residuals.reduce((sum, value) => sum + value * value, 0)
  const mapX = (value: number) => 76 + value * 100
  const mapY = (value: number) => 258 - value * 4.2
  const line = curvePoints(predict, 0, 4, mapX, mapY)

  return (
    <VisualFrame
      title="选模型不能只看曲线像不像"
      summary="用同一组观测数据比较线性模型与指数模型，竖直短线就是残差。"
      controls={<ChoiceControl label="候选模型" value={mode} onChange={(value) => setMode(value as ModelMode)} choices={[{ value: 'linear', label: '线性：10+10t' }, { value: 'exponential', label: '指数：10×1.5ᵗ' }]} />}
      takeaway={<>残差 = 观测值 − 预测值。较小且没有系统方向的残差支持模型；还要结合变量含义、定义域和外推风险判断。</>}
    >
      <svg className="fmv-plot" viewBox="0 0 560 300" role="img" aria-label={`${mode === 'linear' ? '线性' : '指数'}模型的残差平方和为${squaredError.toFixed(2)}，越小表示对当前数据拟合越好`}>
        <title>用残差比较函数模型</title>
        <g className="fmv-axes"><line x1="58" y1="258" x2="528" y2="258" /><line x1="58" y1="24" x2="58" y2="258" /><text x="480" y="282">时间 t</text><text x="68" y="39">观测量</text></g>
        <polyline className="fmv-model-line" points={line} />
        {observed.map((value, index) => <g key={index}>
          <line className="fmv-residual" x1={mapX(index)} y1={mapY(prediction[index])} x2={mapX(index)} y2={mapY(value)} />
          <circle className="fmv-observation" cx={mapX(index)} cy={mapY(value)} r="6" />
          <text className="fmv-residual-label" x={mapX(index) + 9} y={(mapY(prediction[index]) + mapY(value)) / 2}>{residuals[index] === 0 ? '0' : residuals[index].toFixed(1)}</text>
        </g>)}
        <text className="fmv-direct-label" x="510" y="52" textAnchor="end">● 观测值　— 模型预测</text>
      </svg>
      <div className="fmv-fit-readout" aria-live="polite"><span>残差平方和</span><strong>{squaredError.toFixed(2)}</strong><small>{mode === 'exponential' ? '本组数据下更小，但仍需检验现实机制' : '短线有明显同向偏离，提示模型形状不合适'}</small></div>
    </VisualFrame>
  )
}

const visualByTopic: Record<string, () => ReactNode> = {
  '函数定义域与值域': () => <DomainRangeVisual />,
  '函数的单调性': () => <MonotonicityVisual />,
  '函数的奇偶性': () => <ParityVisual />,
  '函数的零点': () => <ZeroVisual />,
  '函数图像与参数变换': () => <TransformVisual />,
  '反函数': () => <InverseFunctionVisual />,
  '分段函数与实际计费': () => <PiecewiseVisual />,
  '幂函数的图像与性质': () => <PowerVisual />,
  '指数函数的图像与性质': () => <ExponentialVisual />,
  '对数函数的图像与性质': () => <LogarithmVisual />,
  '函数模型的比较与检验': () => <ModelComparisonVisual />,
}

export function FunctionModelVisual({ topicTitle }: { topicTitle: string }): ReactNode {
  return visualByTopic[topicTitle]?.() ?? null
}
