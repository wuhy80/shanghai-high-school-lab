import { useMemo, useState, type ReactNode } from 'react'
import './PowerLogVisuals.css'

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  tone?: 'primary' | 'secondary'
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, step = 1, tone = 'primary', onChange }: SliderProps) {
  return (
    <label className={`plv-slider plv-${tone}`}>
      <span>{label}<output>{Number.isInteger(value) ? value : value.toFixed(1)}</output></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small><span>{min}</span><span>{max}</span></small>
    </label>
  )
}

function VisualFrame({ title, condition, controls, children, takeaway }: {
  title: string
  condition: ReactNode
  controls?: ReactNode
  children: ReactNode
  takeaway: ReactNode
}) {
  return (
    <section className="power-log-visual" aria-label={title}>
      <header className="plv-header">
        <div>
          <span className="plv-kicker">看见运算结构</span>
          <h3>{title}</h3>
        </div>
        <div className="plv-condition"><b>成立条件</b>{condition}</div>
      </header>
      {controls && <div className="plv-controls">{controls}</div>}
      <div className="plv-stage">{children}</div>
      <p className="plv-takeaway"><b>读图</b>{takeaway}</p>
    </section>
  )
}

function ModeButtons<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="plv-modes" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? 'active' : ''}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

const formatNumber = (value: number, digits = 3) => {
  if (Math.abs(value) >= 1000) return value.toExponential(2)
  return Number(value.toFixed(digits)).toString()
}

const numericRelation = (value: number, digits = 3) => Number(formatNumber(value, digits)) === value ? '=' : '≈'

function PowerFractionVisual() {
  const [base, setBase] = useState(4)
  const [numerator, setNumerator] = useState(3)
  const [denominator, setDenominator] = useState(2)
  const root = base ** (1 / denominator)
  const result = base ** (numerator / denominator)
  const rootRelation = numericRelation(root)
  const resultRelation = numericRelation(result)
  const exponentCells = Array.from({ length: denominator }, (_, index) => index < Math.min(numerator, denominator))

  return (
    <VisualFrame
      title="分数指数是一条“先开方、再乘方”的指令"
      condition={<><span className="plv-a">a &gt; 0</span><span>p、q 为整数，q &gt; 0</span></>}
      controls={<>
        <Slider label="底数 a" value={base} min={2} max={9} onChange={setBase} />
        <Slider label="分子 p" value={numerator} min={1} max={5} tone="secondary" onChange={setNumerator} />
        <Slider label="分母 q" value={denominator} min={2} max={5} onChange={setDenominator} />
      </>}
      takeaway={<>分母 <strong className="plv-a">q</strong> 决定“开 q 次方根”，分子 <strong className="plv-b">p</strong> 决定“写成 p 个相同因数相乘”。两条计算路线必定到达同一个结果。</>}
    >
      <div className="plv-main-formula" aria-live="polite">
        <span className="plv-a">{base}</span><sup className="plv-b">{numerator}/{denominator}</sup>
        <span>=</span>
        <span>(<sup>{denominator}</sup>√<span className="plv-a">{base}</span>)<sup className="plv-b">{numerator}</sup></span>
        <span>{resultRelation}</span>
        <strong>{formatNumber(result)}</strong>
      </div>
      <div className="plv-fraction-meter" aria-label={`指数 ${denominator} 分之 ${numerator}`}>
        <span>0</span>
        <div>
          {exponentCells.map((filled, index) => <i key={index} className={filled ? 'filled' : ''} />)}
        </div>
        <span>1</span>
        {numerator > denominator && <em>再加 {(numerator - denominator)}/{denominator}</em>}
      </div>
      <div className="plv-route-grid">
        <div className="plv-route-step">
          <small>第 1 步：分母 q = {denominator}</small>
          <strong><sup>{denominator}</sup>√{base} {rootRelation} {formatNumber(root)}</strong>
          <span>找一个数，使 {denominator} 个这样的因数相乘得到 {base}</span>
        </div>
        <span className="plv-arrow" aria-hidden="true">→</span>
        <div className="plv-route-step">
          <small>第 2 步：分子 p = {numerator}</small>
          <div className="plv-factor-row" aria-label={`${numerator} 个 ${formatNumber(root)} 相乘`}>
            {Array.from({ length: numerator }, (_, index) => <i key={index}>{formatNumber(root, 2)}</i>)}
          </div>
          <span>把开方所得的数写成 {numerator} 个相同因数相乘</span>
        </div>
        <span className="plv-arrow" aria-hidden="true">→</span>
        <div className="plv-route-step plv-result-step">
          <small>同一个结果</small>
          <strong>{resultRelation === '≈' ? `≈ ${formatNumber(result)}` : formatNumber(result)}</strong>
          <span>也可先算 {base}<sup>{numerator}</sup>，再开 {denominator} 次方</span>
        </div>
      </div>
    </VisualFrame>
  )
}

type PowerLaw = 'product' | 'quotient' | 'power'

const powerLawOptions: readonly { value: PowerLaw; label: string }[] = [
  { value: 'product', label: '同底数相乘' },
  { value: 'quotient', label: '同底数相除' },
  { value: 'power', label: '幂的乘方' },
]

function Factors({ count, canceled = 0 }: { count: number; canceled?: number }) {
  return (
    <div className="plv-factor-row">
      {Array.from({ length: count }, (_, index) => <i key={index} className={index < canceled ? 'canceled' : ''}>a</i>)}
    </div>
  )
}

function PowerOperationVisual() {
  const [mode, setMode] = useState<PowerLaw>('product')
  const [m, setM] = useState(4)
  const [n, setN] = useState(2)
  const difference = m - n

  const content = mode === 'product' ? {
    formula: <>a<sup className="plv-a">{m}</sup> · a<sup className="plv-b">{n}</sup> = a<sup>{m + n}</sup></>,
    rule: '相乘时，前后两组 a 接在一起，因子的总数就是 m + n。',
  } : mode === 'quotient' ? {
    formula: <>a<sup className="plv-a">{m}</sup> ÷ a<sup className="plv-b">{n}</sup> = a<sup>{difference}</sup>{difference < 0 && <> = 1/a<sup>{-difference}</sup></>}</>,
    rule: '相除就是约去上下相同的因子；分母有剩余时，负指数表示倒数。',
  } : {
    formula: <>(a<sup className="plv-a">{m}</sup>)<sup className="plv-b">{n}</sup> = a<sup>{m * n}</sup></>,
    rule: '一共有 n 组，每组含 m 个 a，所以因子总数是 m × n。',
  }

  return (
    <VisualFrame
      title="指数法则来自“数一数共有多少个因子”"
      condition={<><span>当前演示 <span className="plv-a">m、n 为正整数</span></span><span>除法要求 a ≠ 0；推广到实数指数时取 a &gt; 0</span></>}
      controls={<>
        <ModeButtons label="选择指数运算" value={mode} options={powerLawOptions} onChange={setMode} />
        <Slider label="指数 m" value={m} min={1} max={5} onChange={setM} />
        <Slider label="指数 n" value={n} min={1} max={5} tone="secondary" onChange={setN} />
      </>}
      takeaway={content.rule}
    >
      <div className="plv-main-formula" aria-live="polite">{content.formula}</div>
      {mode === 'product' && (
        <div className="plv-factor-equation">
          <div><small>a<sup>m</sup></small><Factors count={m} /></div>
          <b>接在一起</b>
          <div><small>a<sup>n</sup></small><Factors count={n} /></div>
          <span className="plv-arrow">→</span>
          <div><small>共 {m + n} 个 a</small><Factors count={m + n} /></div>
        </div>
      )}
      {mode === 'quotient' && (
        <div className="plv-cancel-demo">
          <div>
            <small>分子 a<sup>{m}</sup></small>
            <Factors count={m} canceled={Math.min(m, n)} />
          </div>
          <span className="plv-fraction-line" />
          <div>
            <small>分母 a<sup>{n}</sup></small>
            <Factors count={n} canceled={Math.min(m, n)} />
          </div>
          <p>{difference === 0 ? '全部约去，结果是 1' : difference > 0 ? `分子剩 ${difference} 个 a` : `分母剩 ${-difference} 个 a，所以写成倒数`}</p>
        </div>
      )}
      {mode === 'power' && (
        <div className="plv-group-demo">
          {Array.from({ length: n }, (_, index) => (
            <div key={index}><small>第 {index + 1} 组</small><Factors count={m} /></div>
          ))}
          <span className="plv-brace">合计 {m} × {n} = {m * n} 个 a</span>
        </div>
      )}
    </VisualFrame>
  )
}

function LogDefinitionVisual() {
  const [base, setBase] = useState(2)
  const [exponent, setExponent] = useState(3)
  const result = base ** exponent
  const resultLabel = exponent < 0 ? `1/${base ** -exponent}` : formatNumber(result)
  const argumentLabel = exponent < 0 ? `(${resultLabel})` : resultLabel
  const commonNumerator = Math.log10(result)
  const commonDenominator = Math.log10(base)

  return (
    <VisualFrame
      title="对数是在追问：底数要乘方几次？"
      condition={<><span className="plv-a">a &gt; 0 且 a ≠ 1</span><span className="plv-b">真数 b &gt; 0</span></>}
      controls={<>
        <div className="plv-base-choices" role="group" aria-label="选择底数">
          {[2, 3, 5, 10].map((item) => <button key={item} type="button" className={base === item ? 'active' : ''} aria-pressed={base === item} onClick={() => setBase(item)}>a = {item}</button>)}
        </div>
        <Slider label="指数 x" value={exponent} min={-2} max={4} tone="secondary" onChange={setExponent} />
      </>}
      takeaway={<>指数式和对数式记录的是同一件事，只是已知量不同。换底公式用两个同底对数的比值，把“陌生底数”改写成计算器认识的底数。</>}
    >
      <div className="plv-inverse-map" aria-live="polite">
        <div>
          <small>指数式：已知乘方次数</small>
          <strong><span className="plv-a">{base}</span><sup className="plv-c">{exponent}</sup> = <span className="plv-b">{resultLabel}</span></strong>
          <span>输入底数和指数，得到结果</span>
        </div>
        <div className="plv-two-way" aria-hidden="true"><span>正向：乘方 →</span><span>← 反向：求对数</span></div>
        <div>
          <small>对数式：已知乘方结果</small>
          <strong>log<sub className="plv-a">{base}</sub><span className="plv-b">{argumentLabel}</span> = <span className="plv-c">{exponent}</span></strong>
          <span>反问“{base} 的几次方等于 {resultLabel}？”</span>
        </div>
      </div>
      <div className="plv-change-base">
        <span>换成常用对数</span>
        <strong>log<sub>{base}</sub>{argumentLabel}</strong>
        <span>=</span>
        <span className="plv-stack-fraction"><i>lg {argumentLabel}</i><i>lg {base}</i></span>
        <span>≈</span>
        <span className="plv-stack-fraction plv-numeric"><i>{formatNumber(commonNumerator)}</i><i>{formatNumber(commonDenominator)}</i></span>
        <span>≈</span>
        <strong className="plv-c">{formatNumber(commonNumerator / commonDenominator)}</strong>
      </div>
    </VisualFrame>
  )
}

type LogLaw = 'product' | 'quotient' | 'power'

const logLawOptions: readonly { value: LogLaw; label: string }[] = [
  { value: 'product', label: '积的对数' },
  { value: 'quotient', label: '商的对数' },
  { value: 'power', label: '幂的对数' },
]

function LogDomainVisual() {
  const [mode, setMode] = useState<LogLaw>('product')
  const [x, setX] = useState(2)
  const [y, setY] = useState(4)
  const [r, setR] = useState(2)
  const markerX = 180 + x / 10 * 360
  const markerY = 180 + y / 10 * 360
  const lx = Math.log10(x)
  const ly = Math.log10(y)
  const power = r

  const operation = mode === 'product' ? {
    symbolic: <>lg(<span className="plv-a">x</span><span className="plv-b">y</span>) = lg <span className="plv-a">x</span> + lg <span className="plv-b">y</span></>,
    numeric: `lg ${formatNumber(x * y)} ≈ ${formatNumber(lx)} + ${formatNumber(ly)} ≈ ${formatNumber(lx + ly)}`,
    note: '乘法进入对数后变成加法',
  } : mode === 'quotient' ? {
    symbolic: <>lg(<span className="plv-a">x</span>/<span className="plv-b">y</span>) = lg <span className="plv-a">x</span> − lg <span className="plv-b">y</span></>,
    numeric: `lg ${formatNumber(x / y)} ≈ ${formatNumber(lx)} − ${formatNumber(ly)} ≈ ${formatNumber(lx - ly)}`,
    note: '除法进入对数后变成减法',
  } : {
    symbolic: <>lg(<span className="plv-a">x</span><sup className="plv-b">r</sup>) = <span className="plv-b">r</span> lg <span className="plv-a">x</span></>,
    numeric: `lg ${formatNumber(x ** power)} ≈ ${power} × ${formatNumber(lx)} ≈ ${formatNumber(power * lx)}`,
    note: '真数的指数可以移到对数前面',
  }

  return (
    <VisualFrame
      title="先过定义域闸门，再使用对数法则"
      condition={<><span>底数 a &gt; 0 且 a ≠ 1</span><span className="plv-a">每一个真数都必须 &gt; 0</span></>}
      controls={<>
        <ModeButtons
          label="选择对数运算"
          value={mode}
          options={logLawOptions}
          onChange={setMode}
        />
        <Slider label="真数 x" value={x} min={0.5} max={10} step={0.5} onChange={setX} />
        {mode === 'power'
          ? <Slider label="指数 r" value={r} min={1} max={5} tone="secondary" onChange={setR} />
          : <Slider label="真数 y" value={y} min={0.5} max={10} step={0.5} tone="secondary" onChange={setY} />}
      </>}
      takeaway={<>{operation.note}。注意定义域检查发生在变形之前：若要把 lg(xy) 拆开成 lg x + lg y，必须分别确保 x &gt; 0、y &gt; 0，不能只检查 xy &gt; 0。</>}
    >
      <div className="plv-main-formula" aria-live="polite">{operation.symbolic}</div>
      <div className="plv-domain-line">
        <svg viewBox="0 0 600 150" role="img" aria-label={`对数真数定义域数轴，x 等于 ${x}，${mode === 'power' ? `指数 r 等于 ${r}` : `y 等于 ${y}`}`}>
          <title>对数真数只能在零的右侧</title>
          <desc>数轴上零和负数区域被排除，x 与 y 位于正数区域。</desc>
          <line className="plv-invalid-axis" x1="40" y1="78" x2="175" y2="78" />
          <line className="plv-valid-axis" x1="180" y1="78" x2="560" y2="78" />
          <line className="plv-zero-tick" x1="180" y1="63" x2="180" y2="94" />
          <circle className="plv-open-zero" cx="180" cy="78" r="8" />
          <text x="180" y="123" textAnchor="middle">0（不能取）</text>
          <text className="plv-invalid-text" x="105" y="50" textAnchor="middle">负数：无意义</text>
          <text className="plv-valid-text" x="370" y="34" textAnchor="middle">正数：允许进入 log</text>
          <g className="plv-x-marker" transform={`translate(${markerX} 78)`}>
            <line y1="-22" y2="20" /><circle r="7" /><text y="-30" textAnchor="middle">x = {x}</text>
          </g>
          {mode !== 'power' && <g className="plv-y-marker" transform={`translate(${markerY} 78)`}>
            <line y1="-18" y2="25" /><rect x="-7" y="-7" width="14" height="14" /><text y="39" textAnchor="middle">y = {y}</text>
          </g>}
        </svg>
      </div>
      <div className="plv-numeric-check"><small>代入检查</small><strong>{operation.numeric}</strong></div>
    </VisualFrame>
  )
}

type GrowthMode = 'growth' | 'decay'

const growthOptions: readonly { value: GrowthMode; label: string }[] = [
  { value: 'growth', label: '指数增长' },
  { value: 'decay', label: '指数衰减' },
]

function GrowthDecayVisual() {
  const [mode, setMode] = useState<GrowthMode>('growth')
  const [initial, setInitial] = useState(10)
  const [base, setBase] = useState(1.5)
  const [selectedX, setSelectedX] = useState(3)
  const values = useMemo(() => Array.from({ length: 6 }, (_, x) => ({ x, y: initial * base ** x })), [initial, base])
  const maxY = Math.max(...values.map((item) => item.y), initial) * 1.12
  const point = values[selectedX]
  const coordinates = values.map((item) => ({
    ...item,
    px: 62 + item.x * 98,
    py: 270 - item.y / maxY * 218,
  }))
  const path = Array.from({ length: 61 }, (_, index) => {
    const x = index / 12
    const y = initial * base ** x
    return `${index === 0 ? 'M' : 'L'} ${62 + x * 98} ${270 - y / maxY * 218}`
  }).join(' ')

  const setGrowthMode = (next: GrowthMode) => {
    setMode(next)
    setBase(next === 'growth' ? 1.5 : 0.7)
  }

  return (
    <VisualFrame
      title="每走相同一步，都乘同一个倍数"
      condition={<><span className="plv-a">初值 C &gt; 0</span><span className="plv-b">a &gt; 0 且 a ≠ 1</span></>}
      controls={<>
        <ModeButtons label="选择变化方式" value={mode} options={growthOptions} onChange={setGrowthMode} />
        <Slider label="初值 C" value={initial} min={5} max={30} onChange={setInitial} />
        <Slider label="每步倍数 a" value={base} min={mode === 'growth' ? 1.1 : 0.2} max={mode === 'growth' ? 2 : 0.9} step={0.1} tone="secondary" onChange={setBase} />
        <Slider label="观察第 x 步" value={selectedX} min={0} max={5} onChange={setSelectedX} />
      </>}
      takeaway={mode === 'growth'
        ? <>因为 <strong className="plv-b">a = {base.toFixed(1)} &gt; 1</strong>，每一步都在原数上再放大，增加量也越来越大，曲线向上弯。</>
        : <>因为 <strong className="plv-b">0 &lt; a = {base.toFixed(1)} &lt; 1</strong>，每一步只保留上一时刻的一部分；数值接近 0，但不会在有限步内变成 0。</>}
    >
      <div className="plv-growth-layout">
        <div className="plv-growth-chart">
          <div className="plv-main-formula">y = <span className="plv-a">{initial}</span> · <span className="plv-b">{base.toFixed(1)}</span><sup>x</sup></div>
          <svg viewBox="0 0 620 320" role="img" aria-label={`函数 y 等于 ${initial} 乘 ${base.toFixed(1)} 的 x 次方，第 ${selectedX} 步函数值为 ${formatNumber(point.y)}`}>
            <title>{mode === 'growth' ? '指数增长曲线' : '指数衰减曲线'}</title>
            <desc>横轴是步数 x，纵轴是数量 y。相邻两个点的纵坐标之比恒为底数 a。</desc>
            {[0, 1, 2, 3, 4].map((index) => <g key={index}>
              <line className="plv-grid-line" x1="62" y1={270 - index * 54.5} x2="552" y2={270 - index * 54.5} />
              <text x="52" y={275 - index * 54.5} textAnchor="end">{formatNumber(maxY * index / 4, 1)}</text>
            </g>)}
            <line className="plv-axis" x1="62" y1="270" x2="568" y2="270" />
            <line className="plv-axis" x1="62" y1="286" x2="62" y2="36" />
            <text x="566" y="299">步数 x</text>
            <text x="70" y="28">数量 y</text>
            <path className="plv-growth-curve" d={path} />
            {coordinates.map((item) => (
              <g key={item.x} className={item.x === selectedX ? 'plv-growth-point active' : 'plv-growth-point'}>
                <line x1={item.px} y1="270" x2={item.px} y2={item.py} />
                <circle cx={item.px} cy={item.py} r={item.x === selectedX ? 9 : 6} />
                <text x={item.px} y="299" textAnchor="middle">{item.x}</text>
              </g>
            ))}
            <g className="plv-selected-label" transform={`translate(${Math.min(465, Math.max(72, coordinates[selectedX].px - 46))} ${Math.max(44, coordinates[selectedX].py - 23)})`}>
              <text>x={selectedX}, y={formatNumber(point.y)}</text>
            </g>
          </svg>
        </div>
        <div className="plv-growth-sequence" aria-label="逐步相乘过程">
          {values.map((item, index) => (
            <div key={item.x} className={item.x === selectedX ? 'active' : ''}>
              <small>x = {item.x}</small>
              <strong>{formatNumber(item.y, 2)}</strong>
              {index < values.length - 1 && <span>× {base.toFixed(1)}</span>}
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  )
}

export function PowerLogVisual({ topicTitle }: { topicTitle: string }): ReactNode {
  const visuals: Record<string, () => ReactNode> = {
    '幂与分数指数幂': () => <PowerFractionVisual />,
    '指数幂的运算': () => <PowerOperationVisual />,
    '对数概念与换底': () => <LogDefinitionVisual />,
    '对数运算与定义域': () => <LogDomainVisual />,
    '指数增长与衰减': () => <GrowthDecayVisual />,
  }

  return visuals[topicTitle]?.() ?? null
}
