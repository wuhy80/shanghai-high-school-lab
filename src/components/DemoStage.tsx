import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, Dices, Pause, Play, RefreshCw } from 'lucide-react'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

type RangeFieldProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  format?: (value: number) => string
}

function RangeField({ label, value, min, max, step = 1, unit = '', onChange, format }: RangeFieldProps) {
  return (
    <label className="range-field">
      <span><b>{label}</b><output>{format ? format(value) : value}{unit}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <i><small>{min}{unit}</small><small>{max}{unit}</small></i>
    </label>
  )
}

type LabFrameProps = {
  formula: ReactNode
  status: ReactNode
  controls: ReactNode
  children: ReactNode
  insight: ReactNode
}

function LabFrame({ formula, status, controls, children, insight }: LabFrameProps) {
  return (
    <section className="lab-frame">
      <header className="lab-toolbar">
        <div className="formula-display">{formula}</div>
        <div className="live-status"><span aria-hidden="true" />{status}</div>
      </header>
      <div className="lab-body">
        <aside className="control-panel">{controls}</aside>
        <div className="visual-panel">{children}</div>
      </div>
      <div className="insight-bar"><strong>观察</strong><span>{insight}</span></div>
    </section>
  )
}

function PlotGrid({ xLabel = 'x', yLabel = 'y' }: { xLabel?: string; yLabel?: string }) {
  return (
    <g className="plot-grid" aria-hidden="true">
      {[80, 160, 240, 320, 400, 480, 560].map((x) => <line key={`x-${x}`} x1={x} y1="24" x2={x} y2="316" />)}
      {[64, 124, 184, 244, 304].map((y) => <line key={`y-${y}`} x1="48" y1={y} x2="576" y2={y} />)}
      <line className="axis" x1="48" y1="184" x2="582" y2="184" />
      <line className="axis" x1="312" y1="20" x2="312" y2="320" />
      <text x="570" y="174">{xLabel}</text><text x="320" y="36">{yLabel}</text>
    </g>
  )
}

function FunctionLab() {
  const [a, setA] = useState(1)
  const [h, setH] = useState(0)
  const [k, setK] = useState(0)
  const points = useMemo(() => Array.from({ length: 161 }, (_, index) => {
    const x = -5 + index / 16
    const y = a * (x - h) ** 2 + k
    return `${48 + (x + 5) * 52.8},${184 - y * 18}`
  }).join(' '), [a, h, k])
  const direction = a > 0 ? '开口向上' : '开口向下'
  const width = Math.abs(a) > 1 ? '更窄' : Math.abs(a) < 1 ? '更宽' : '标准宽度'

  return (
    <LabFrame
      formula={<><span>y = </span><b>{a}</b><span>(x {h >= 0 ? '−' : '+'} {Math.abs(h)})² {k >= 0 ? '+' : '−'} {Math.abs(k)}</span></>}
      status={`顶点 (${h}, ${k})`}
      controls={<>
        <p className="control-title">参数</p>
        <RangeField label="伸缩 a" value={a} min={-3} max={3} step={0.25} onChange={(value) => setA(value === 0 ? 0.25 : value)} />
        <RangeField label="水平 h" value={h} min={-3} max={3} step={0.5} onChange={setH} />
        <RangeField label="竖直 k" value={k} min={-4} max={4} step={0.5} onChange={setK} />
        <button className="secondary-button" onClick={() => { setA(1); setH(0); setK(0) }}><RefreshCw size={15} />重置</button>
      </>}
      insight={<>图像{direction}，相对 <em>y = x²</em> {width}，对称轴为 <em>x = {h}</em>。</>}
    >
      <svg className="plot function-plot" viewBox="0 0 624 340" role="img" aria-label={`二次函数图像，顶点为 ${h}, ${k}`}>
        <defs><clipPath id="function-clip"><rect x="48" y="20" width="528" height="300" /></clipPath></defs>
        <PlotGrid />
        <polyline className="reference-curve" points={Array.from({ length: 101 }, (_, index) => { const x = -5 + index / 10; return `${48 + (x + 5) * 52.8},${184 - x * x * 18}` }).join(' ')} clipPath="url(#function-clip)" />
        <polyline className="primary-curve" points={points} clipPath="url(#function-clip)" />
        <line className="guide-line" x1={48 + (h + 5) * 52.8} y1="24" x2={48 + (h + 5) * 52.8} y2="316" />
        <circle className="active-point" cx={48 + (h + 5) * 52.8} cy={184 - k * 18} r="6" />
        <text className="point-label" x={58 + (h + 5) * 52.8} y={174 - k * 18}>({h}, {k})</text>
      </svg>
      <div className="plot-legend"><span><i className="legend-primary" />当前函数</span><span><i className="legend-reference" />y = x²</span></div>
    </LabFrame>
  )
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value |= 0
    value = value + 0x6D2B79F5 | 0
    let result = Math.imul(value ^ value >>> 15, 1 | value)
    result = result + Math.imul(result ^ result >>> 7, 61 | result) ^ result
    return ((result ^ result >>> 14) >>> 0) / 4294967296
  }
}

function ProbabilityLab() {
  const [probability, setProbability] = useState(0.5)
  const [trials, setTrials] = useState(100)
  const [seed, setSeed] = useState(42)
  const simulation = useMemo(() => {
    const random = seededRandom(seed)
    let success = 0
    const convergence = Array.from({ length: trials }, (_, index) => {
      if (random() < probability) success += 1
      return success / (index + 1)
    })
    return { success, convergence }
  }, [probability, trials, seed])
  const observed = simulation.success / trials
  const path = simulation.convergence.map((value, index) => `${54 + index / Math.max(1, trials - 1) * 516},${292 - value * 236}`).join(' ')

  return (
    <LabFrame
      formula={<><span>P(正面) = </span><b>{probability.toFixed(2)}</b></>}
      status={`${trials} 次试验`}
      controls={<>
        <p className="control-title">随机试验</p>
        <RangeField label="理论概率" value={probability} min={0.1} max={0.9} step={0.05} onChange={setProbability} format={(value) => value.toFixed(2)} />
        <RangeField label="试验次数" value={trials} min={20} max={500} step={20} onChange={setTrials} unit=" 次" />
        <button className="primary-button" onClick={() => setSeed((value) => value + 1)}><Dices size={16} />重新模拟</button>
        <div className="mini-stats"><span><small>正面</small><b>{simulation.success}</b></span><span><small>反面</small><b>{trials - simulation.success}</b></span></div>
      </>}
      insight={<>本轮频率为 <em>{observed.toFixed(3)}</em>，与理论概率相差 <em>{Math.abs(observed - probability).toFixed(3)}</em>。</>}
    >
      <svg className="plot probability-plot" viewBox="0 0 624 340" role="img" aria-label={`随机试验频率折线，最终频率 ${observed.toFixed(3)}`}>
        <g className="chart-frame">
          {[0, .25, .5, .75, 1].map((value) => <g key={value}><line x1="54" y1={292 - value * 236} x2="570" y2={292 - value * 236} /><text x="18" y={296 - value * 236}>{value.toFixed(2)}</text></g>)}
          <line className="theory-line" x1="54" y1={292 - probability * 236} x2="570" y2={292 - probability * 236} />
          <polyline className="primary-curve" points={path} />
          <circle className="active-point" cx="570" cy={292 - observed * 236} r="6" />
          <text className="value-label" x="548" y={278 - observed * 236}>{observed.toFixed(3)}</text>
          <text x="54" y="322">1</text><text x="548" y="322">{trials} 次</text>
        </g>
      </svg>
    </LabFrame>
  )
}

function ProjectileLab() {
  const [speed, setSpeed] = useState(24)
  const [angle, setAngle] = useState(45)
  const [gravity, setGravity] = useState(9.8)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rad = angle * Math.PI / 180
  const duration = 2 * speed * Math.sin(rad) / gravity
  const distance = speed * Math.cos(rad) * duration
  const maxHeight = (speed * Math.sin(rad)) ** 2 / (2 * gravity)
  const trajectory = Array.from({ length: 101 }, (_, index) => {
    const t = duration * index / 100
    const x = speed * Math.cos(rad) * t
    const y = speed * Math.sin(rad) * t - gravity * t * t / 2
    return `${54 + x / Math.max(distance, 1) * 516},${292 - y / Math.max(maxHeight, 1) * 220}`
  }).join(' ')
  const currentT = duration * progress
  const currentX = speed * Math.cos(rad) * currentT
  const currentY = Math.max(0, speed * Math.sin(rad) * currentT - gravity * currentT ** 2 / 2)

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setProgress((value) => {
      if (value >= 1) { setPlaying(false); return 1 }
      return Math.min(1, value + 0.012)
    }), 24)
    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <LabFrame
      formula={<><span>x = v₀cosθ·t　y = v₀sinθ·t − </span><b>½gt²</b></>}
      status={`飞行 ${duration.toFixed(2)} s`}
      controls={<>
        <p className="control-title">初始条件</p>
        <RangeField label="初速度" value={speed} min={8} max={40} step={1} unit=" m/s" onChange={(value) => { setSpeed(value); setProgress(0) }} />
        <RangeField label="发射角" value={angle} min={15} max={75} step={1} unit="°" onChange={(value) => { setAngle(value); setProgress(0) }} />
        <RangeField label="重力加速度" value={gravity} min={3.7} max={12} step={0.1} unit=" m/s²" onChange={(value) => { setGravity(value); setProgress(0) }} />
        <button className="primary-button" onClick={() => { if (progress >= 1) setProgress(0); setPlaying(!playing) }}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? '暂停' : progress >= 1 ? '重播' : '播放'}</button>
      </>}
      insight={<>射程 <em>{distance.toFixed(1)} m</em>，最高点 <em>{maxHeight.toFixed(1)} m</em>；同一初速度下，45° 附近射程最大。</>}
    >
      <svg className="plot projectile-plot" viewBox="0 0 624 340" role="img" aria-label={`抛体轨迹，射程 ${distance.toFixed(1)} 米`}>
        <defs><marker id="velocity-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
        <g className="sky-grid">{[90, 170, 250].map((y) => <line key={y} x1="54" y1={y} x2="570" y2={y} />)}</g>
        <line className="ground-line" x1="36" y1="292" x2="588" y2="292" />
        <polyline className="trajectory-line" points={trajectory} />
        <line className="velocity-vector" x1="54" y1="292" x2={54 + 70 * Math.cos(rad)} y2={292 - 70 * Math.sin(rad)} markerEnd="url(#velocity-arrow)" />
        <path className="angle-arc" d={`M 89 292 A 35 35 0 0 0 ${54 + 35 * Math.cos(rad)} ${292 - 35 * Math.sin(rad)}`} />
        <text className="value-label" x="92" y="282">{angle}°</text>
        <circle className="projectile-shadow" cx={54 + currentX / Math.max(distance, 1) * 516} cy="292" r="8" />
        <circle className="projectile-ball" cx={54 + currentX / Math.max(distance, 1) * 516} cy={292 - currentY / Math.max(maxHeight, 1) * 220} r="9" />
      </svg>
    </LabFrame>
  )
}

function WaveLab() {
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, setFrequency] = useState(1.5)
  const [phase, setPhase] = useState(0)
  const wave = (offset: number, sum = false) => Array.from({ length: 161 }, (_, index) => {
    const x = index / 160 * Math.PI * 4
    const one = amplitude * Math.sin(frequency * x)
    const two = amplitude * Math.sin(frequency * x + phase * Math.PI / 180)
    const y = sum ? one + two : offset === 0 ? one : two
    return `${48 + index / 160 * 528},${sum ? 250 - y * 30 : 86 + offset - y * 22}`
  }).join(' ')
  const interference = Math.abs(Math.cos(phase * Math.PI / 360)) * amplitude * 2

  return (
    <LabFrame
      formula={<><span>y = y₁ + y₂　Δφ = </span><b>{phase}°</b></>}
      status={phase % 360 === 0 ? '完全加强' : phase === 180 ? '完全减弱' : '部分叠加'}
      controls={<>
        <p className="control-title">波源</p>
        <RangeField label="振幅 A" value={amplitude} min={0.5} max={1.5} step={0.1} onChange={setAmplitude} format={(value) => value.toFixed(1)} />
        <RangeField label="频率 f" value={frequency} min={0.5} max={2.5} step={0.1} unit=" Hz" onChange={setFrequency} format={(value) => value.toFixed(1)} />
        <RangeField label="相位差 Δφ" value={phase} min={0} max={360} step={15} unit="°" onChange={setPhase} />
        <div className="phase-presets"><button onClick={() => setPhase(0)}>同相</button><button onClick={() => setPhase(90)}>1/4 周期</button><button onClick={() => setPhase(180)}>反相</button></div>
      </>}
      insight={<>合振幅约为 <em>{interference.toFixed(2)}A</em>。相位差接近 0° 时加强，接近 180° 时减弱。</>}
    >
      <svg className="plot wave-plot" viewBox="0 0 624 340" role="img" aria-label={`两列波相位差 ${phase} 度的叠加`}>
        {[86, 250].map((y) => <line key={y} className="wave-axis" x1="48" y1={y} x2="576" y2={y} />)}
        <polyline className="wave-one" points={wave(0)} />
        <polyline className="wave-two" points={wave(68)} />
        <line className="wave-divider" x1="48" y1="170" x2="576" y2="170" />
        <polyline className="wave-sum" points={wave(0, true)} />
        <text x="54" y="30">分波 y₁ / y₂</text><text x="54" y="196">合成波 y</text>
      </svg>
    </LabFrame>
  )
}

function EquilibriumLab() {
  const [temperature, setTemperature] = useState(350)
  const [pressure, setPressure] = useState(1)
  const no2Ratio = clamp(0.18 + (temperature - 250) / 220 * 0.55 + (1 - pressure) * 0.12, 0.08, 0.9)
  const no2Count = Math.round(no2Ratio * 40)
  return (
    <LabFrame
      formula={<><span>N₂O₄(g) ⇌ 2NO₂(g)　</span><b>ΔH &gt; 0</b></>}
      status={no2Ratio > .55 ? '平衡偏右' : no2Ratio < .35 ? '平衡偏左' : '接近平衡中部'}
      controls={<>
        <p className="control-title">反应条件</p>
        <RangeField label="温度" value={temperature} min={250} max={470} step={5} unit=" K" onChange={setTemperature} />
        <RangeField label="压强" value={pressure} min={0.5} max={3} step={0.1} unit=" atm" onChange={setPressure} format={(value) => value.toFixed(1)} />
        <div className="condition-buttons"><button onClick={() => setTemperature((value) => clamp(value + 40, 250, 470))}>升温</button><button onClick={() => setPressure((value) => clamp(value * 1.5, .5, 3))}>加压</button></div>
        <div className="species-key"><span><i className="molecule-a" />N₂O₄</span><span><i className="molecule-b" />NO₂</span></div>
      </>}
      insight={<>升温有利于吸热的正反应；加压使平衡向气体物质的量较少的 <em>N₂O₄</em> 一侧移动。</>}
    >
      <div className="equilibrium-vessel" role="img" aria-label={`平衡体系中约有 ${no2Count} 个二氧化氮示意粒子`}>
        <div className="vessel-glass">
          <div className="gas-tint" style={{ opacity: no2Ratio * .8 }} />
          {Array.from({ length: 40 }, (_, index) => (
            <span
              key={index}
              className={index < no2Count ? 'particle no2' : 'particle n2o4'}
              style={{ left: `${7 + ((index * 37) % 87)}%`, top: `${8 + ((index * 53) % 82)}%`, animationDelay: `${(index % 8) * -0.3}s` }}
            >{index < no2Count ? <i /> : <><i /><i /></>}</span>
          ))}
          <span className="vessel-temperature">{temperature} K</span>
        </div>
        <div className="equilibrium-meter"><span style={{ width: `${no2Ratio * 100}%` }} /><b>N₂O₄</b><b>NO₂</b></div>
      </div>
    </LabFrame>
  )
}

function TitrationLab() {
  const [volume, setVolume] = useState(12)
  const [concentration, setConcentration] = useState(0.1)
  const acidMoles = .1 * .025
  const baseMoles = concentration * volume / 1000
  const totalVolume = .025 + volume / 1000
  let ph = 7
  if (Math.abs(baseMoles - acidMoles) < .00001) ph = 7
  else if (baseMoles < acidMoles) ph = -Math.log10((acidMoles - baseMoles) / totalVolume)
  else ph = 14 + Math.log10((baseMoles - acidMoles) / totalVolume)
  ph = clamp(ph, 0, 14)
  const endpoint = acidMoles / concentration * 1000
  const curve = Array.from({ length: 201 }, (_, index) => {
    const v = index / 4
    const base = concentration * v / 1000
    const total = .025 + v / 1000
    let value = 7
    if (Math.abs(base - acidMoles) < .000005) value = 7
    else if (base < acidMoles) value = -Math.log10((acidMoles - base) / total)
    else value = 14 + Math.log10((base - acidMoles) / total)
    return `${54 + v / 50 * 516},${300 - clamp(value, 0, 14) / 14 * 252}`
  }).join(' ')

  return (
    <LabFrame
      formula={<><span>HCl + NaOH → NaCl + H₂O　pH = </span><b>{ph.toFixed(2)}</b></>}
      status={Math.abs(volume - endpoint) < .7 ? '接近滴定终点' : volume < endpoint ? '酸过量' : '碱过量'}
      controls={<>
        <p className="control-title">滴定管</p>
        <RangeField label="NaOH 体积" value={volume} min={0} max={50} step={0.25} unit=" mL" onChange={setVolume} format={(value) => value.toFixed(2)} />
        <RangeField label="NaOH 浓度" value={concentration} min={0.05} max={0.2} step={0.01} unit=" mol/L" onChange={setConcentration} format={(value) => value.toFixed(2)} />
        <div className="endpoint-readout"><small>理论终点</small><strong>{endpoint.toFixed(2)} mL</strong></div>
      </>}
      insight={<>强酸强碱滴定在终点附近出现 pH 突跃；本组条件的等量点为 <em>{endpoint.toFixed(2)} mL</em>。</>}
    >
      <svg className="plot titration-plot" viewBox="0 0 624 340" role="img" aria-label={`酸碱滴定曲线，当前 pH ${ph.toFixed(2)}`}>
        <g className="chart-frame">
          {[0, 7, 14].map((value) => <g key={value}><line x1="54" y1={300 - value / 14 * 252} x2="570" y2={300 - value / 14 * 252} /><text x="24" y={304 - value / 14 * 252}>{value}</text></g>)}
          <line className="endpoint-line" x1={54 + endpoint / 50 * 516} y1="42" x2={54 + endpoint / 50 * 516} y2="304" />
          <polyline className="primary-curve" points={curve} />
          <circle className="active-point" cx={54 + volume / 50 * 516} cy={300 - ph / 14 * 252} r="7" />
          <text className="value-label" x={clamp(62 + volume / 50 * 516, 62, 524)} y={clamp(286 - ph / 14 * 252, 38, 282)}>pH {ph.toFixed(2)}</text>
          <text x="54" y="328">0</text><text x="530" y="328">NaOH / mL</text>
        </g>
      </svg>
    </LabFrame>
  )
}

const gametes: Record<string, string[]> = { AA: ['A', 'A'], Aa: ['A', 'a'], aa: ['a', 'a'] }

function GeneticsLab() {
  const [parentA, setParentA] = useState('Aa')
  const [parentB, setParentB] = useState('Aa')
  const combinations = gametes[parentA].flatMap((one) => gametes[parentB].map((two) => `${one}${two}`.split('').sort((a) => a === 'A' ? -1 : 1).join('')))
  const dominant = combinations.filter((value) => value.includes('A')).length
  return (
    <LabFrame
      formula={<><span>P　</span><b>{parentA} × {parentB}</b></>}
      status={`显性表型 ${dominant / 4 * 100}%`}
      controls={<>
        <p className="control-title">亲本基因型</p>
        <label className="select-field"><span>亲本 1</span><select value={parentA} onChange={(event) => setParentA(event.target.value)}>{['AA', 'Aa', 'aa'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="select-field"><span>亲本 2</span><select value={parentB} onChange={(event) => setParentB(event.target.value)}>{['AA', 'Aa', 'aa'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <div className="allele-key"><span><b>A</b> 显性等位基因</span><span><b>a</b> 隐性等位基因</span></div>
      </>}
      insight={<>子代基因型为 {Array.from(new Set(combinations)).map((value) => `${value} ${combinations.filter((item) => item === value).length}/4`).join('、')}。</>}
    >
      <div className="punnett-wrap" role="img" aria-label={`遗传棋盘格，显性表型概率 ${dominant / 4 * 100}%`}>
        <div className="parent-label top">亲本 2 配子</div><div className="parent-label side">亲本 1 配子</div>
        <div className="punnett-grid">
          <span className="corner" />
          {gametes[parentB].map((value, index) => <b className="gamete" key={`top-${index}`}>{value}</b>)}
          {gametes[parentA].map((one, row) => <div className="punnett-row" key={`row-${row}`}><b className="gamete">{one}</b>{gametes[parentB].map((_two, col) => { const genotype = combinations[row * 2 + col]; return <span className={genotype.includes('A') ? 'dominant' : 'recessive'} key={col}><strong>{genotype}</strong><small>{genotype.includes('A') ? '显性' : '隐性'}</small></span> })}</div>)}
        </div>
        <div className="ratio-bar"><span className="dominant" style={{ width: `${dominant / 4 * 100}%` }}>显性 {dominant}</span><span className="recessive" style={{ width: `${(4 - dominant) / 4 * 100}%` }}>隐性 {4 - dominant}</span></div>
      </div>
    </LabFrame>
  )
}

function EnzymeLab() {
  const [temperature, setTemperature] = useState(37)
  const [ph, setPh] = useState(7)
  const activityAt = (temp: number, acidity: number) => Math.exp(-(((temp - 37) / 16) ** 2)) * Math.exp(-(((acidity - 7) / 2.2) ** 2))
  const activity = activityAt(temperature, ph)
  const tempCurve = Array.from({ length: 101 }, (_, index) => { const t = index * .6; return `${54 + index * 2.35},${286 - activityAt(t, 7) * 218}` }).join(' ')
  const phCurve = Array.from({ length: 101 }, (_, index) => { const value = index * .14; return `${335 + index * 2.35},${286 - activityAt(37, value) * 218}` }).join(' ')
  return (
    <LabFrame
      formula={<><span>相对酶活性 = </span><b>{(activity * 100).toFixed(0)}%</b></>}
      status={activity > .75 ? '活性较高' : activity > .35 ? '活性受限' : '活性较低'}
      controls={<>
        <p className="control-title">环境条件</p>
        <RangeField label="温度" value={temperature} min={0} max={60} step={1} unit=" ℃" onChange={setTemperature} />
        <RangeField label="pH" value={ph} min={0} max={14} step={0.1} onChange={setPh} format={(value) => value.toFixed(1)} />
        <div className="activity-gauge"><span style={{ width: `${activity * 100}%` }} /><small>相对活性</small><b>{(activity * 100).toFixed(0)}%</b></div>
      </>}
      insight={<>偏离最适温度或最适 pH 都会降低活性；高温还可能破坏酶的空间结构。</>}
    >
      <svg className="plot enzyme-plot" viewBox="0 0 624 340" role="img" aria-label={`当前条件下酶的相对活性为 ${(activity * 100).toFixed(0)}%`}>
        <g className="small-multiple"><text x="54" y="38">温度</text><line x1="54" y1="286" x2="289" y2="286" /><line x1="54" y1="58" x2="54" y2="286" /><polyline className="primary-curve" points={tempCurve} /><circle className="active-point" cx={54 + temperature / 60 * 235} cy={286 - activityAt(temperature, 7) * 218} r="6" /><text x="54" y="314">0℃</text><text x="261" y="314">60℃</text></g>
        <g className="small-multiple"><text x="335" y="38">pH</text><line x1="335" y1="286" x2="570" y2="286" /><line x1="335" y1="58" x2="335" y2="286" /><polyline className="secondary-curve" points={phCurve} /><circle className="active-point secondary" cx={335 + ph / 14 * 235} cy={286 - activityAt(37, ph) * 218} r="6" /><text x="335" y="314">0</text><text x="554" y="314">14</text></g>
      </svg>
    </LabFrame>
  )
}

const argumentsData = [
  { label: '阅读', claim: '整本书阅读应保留慢读时间', reason: '深度理解需要持续的注意和回看', facts: ['连续阅读更容易建立人物关系网', '批注能留下理解变化的轨迹'], quote: '不动笔墨不读书', conclusion: '阅读安排应兼顾速度与深度' },
  { label: '城市', claim: '城市更新要保留历史空间', reason: '场所记忆构成城市文化的连续性', facts: ['石库门街区记录了上海生活方式', '再利用可延长旧建筑的公共价值'], quote: '建筑是凝固的历史', conclusion: '更新不是简单推倒重来' },
  { label: '科技', claim: '使用人工智能仍需独立判断', reason: '工具输出不能替代证据核验', facts: ['模型可能生成貌似合理的错误信息', '不同来源的结论需要交叉验证'], quote: '尽信书，则不如无书', conclusion: '效率提升必须与判断力并行' },
]

function ArgumentLab() {
  const [sample, setSample] = useState(0)
  const [evidence, setEvidence] = useState<'fact' | 'quote'>('fact')
  const data = argumentsData[sample]
  const evidenceText = evidence === 'fact' ? data.facts.join('；') : data.quote
  return (
    <LabFrame
      formula={<><span>论点 + 理由 + 证据 → </span><b>结论</b></>}
      status={evidence === 'fact' ? '事实论据' : '引用论据'}
      controls={<>
        <p className="control-title">文本主题</p>
        <div className="segmented-control">{argumentsData.map((item, index) => <button className={index === sample ? 'active' : ''} onClick={() => setSample(index)} key={item.label}>{item.label}</button>)}</div>
        <p className="control-title spaced">论据类型</p>
        <div className="segmented-control"><button className={evidence === 'fact' ? 'active' : ''} onClick={() => setEvidence('fact')}>事实</button><button className={evidence === 'quote' ? 'active' : ''} onClick={() => setEvidence('quote')}>引用</button></div>
      </>}
      insight={<>理由回答“为什么”，论据回答“凭什么”；二者都应直接支撑中心论点。</>}
    >
      <div className="argument-map" role="img" aria-label="议论文论证结构图">
        <div className="argument-node claim"><small>中心论点</small><strong>{data.claim}</strong></div>
        <ArrowDown size={20} aria-hidden="true" />
        <div className="argument-branches">
          <div className="argument-node"><small>理由</small><strong>{data.reason}</strong></div>
          <div className="argument-node evidence"><small>{evidence === 'fact' ? '事实论据' : '引用论据'}</small><strong>{evidenceText}</strong></div>
        </div>
        <ArrowDown size={20} aria-hidden="true" />
        <div className="argument-node conclusion"><small>结论</small><strong>{data.conclusion}</strong></div>
      </div>
    </LabFrame>
  )
}

const imagery = [
  { id: 'moon', name: '月', x: 390, y: 82, emotion: '思念 · 澄澈', scene: '夜空', lines: '海上生明月，天涯共此时' },
  { id: 'willow', name: '柳', x: 210, y: 218, emotion: '离别 · 留恋', scene: '渡口', lines: '杨柳岸，晓风残月' },
  { id: 'goose', name: '雁', x: 462, y: 198, emotion: '乡愁 · 音信', scene: '长空', lines: '雁字回时，月满西楼' },
  { id: 'river', name: '江', x: 162, y: 112, emotion: '流逝 · 壮阔', scene: '江天', lines: '无边落木萧萧下，不尽长江滚滚来' },
]

function ImageryLab() {
  const [selected, setSelected] = useState('moon')
  const current = imagery.find((item) => item.id === selected) ?? imagery[0]
  return (
    <LabFrame
      formula={<><span>物象 + 语境 → </span><b>意象</b></>}
      status={current.emotion}
      controls={<>
        <p className="control-title">典型意象</p>
        <div className="imagery-selector">{imagery.map((item) => <button className={item.id === selected ? 'active' : ''} onClick={() => setSelected(item.id)} key={item.id}><b>{item.name}</b><span>{item.scene}</span></button>)}</div>
      </>}
      insight={<><em>{current.name}</em> 的意义不是固定答案，需要结合修饰语、人物处境和全诗语调判断。</>}
    >
      <svg className="plot imagery-map" viewBox="0 0 624 340" role="img" aria-label={`诗词意象图，当前选择${current.name}`}>
        <defs><radialGradient id="imagery-glow"><stop offset="0" stopColor="currentColor" stopOpacity=".18"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></radialGradient></defs>
        <circle className="imagery-orbit" cx="312" cy="154" r="116" /><circle className="imagery-orbit inner" cx="312" cy="154" r="62" />
        {imagery.map((item) => <g key={item.id} className={`imagery-item ${item.id === selected ? 'active' : ''}`} onClick={() => setSelected(item.id)} role="button" aria-label={`选择${item.name}`}><circle className="glow" cx={item.x} cy={item.y} r="42" /><circle cx={item.x} cy={item.y} r={item.id === selected ? 28 : 23} /><text x={item.x} y={item.y + 6} textAnchor="middle">{item.name}</text></g>)}
        <g className="poem-caption"><text x="312" y="292" textAnchor="middle">{current.lines}</text><text x="312" y="318" textAnchor="middle">{current.emotion}</text></g>
      </svg>
    </LabFrame>
  )
}

const syntaxSamples = [
  { sentence: 'The city that never sleeps keeps changing.', trunk: ['The city', 'keeps changing'], branch: 'that never sleeps', type: '定语从句', labels: ['主语', '谓语'] },
  { sentence: 'What we choose today will shape our future.', trunk: ['What we choose today', 'will shape our future'], branch: 'What we choose today', type: '主语从句', labels: ['主语从句', '谓语'] },
  { sentence: 'I believe that curiosity makes learning last.', trunk: ['I', 'believe'], branch: 'that curiosity makes learning last', type: '宾语从句', labels: ['主语', '谓语'] },
]

function SyntaxLab() {
  const [index, setIndex] = useState(0)
  const data = syntaxSamples[index]
  return (
    <LabFrame
      formula={<><span>Sentence = </span><b>Main clause</b><span> + Subordinate clause</span></>}
      status={data.type}
      controls={<>
        <p className="control-title">例句</p>
        <div className="sentence-options">{syntaxSamples.map((item, itemIndex) => <button className={itemIndex === index ? 'active' : ''} onClick={() => setIndex(itemIndex)} key={item.sentence}><span>0{itemIndex + 1}</span>{item.sentence}</button>)}</div>
      </>}
      insight={<>先找限定动词，再定位主句主干；本句的 <em>{data.type}</em> 是 “{data.branch}”。</>}
    >
      <div className="syntax-tree" role="img" aria-label={`${data.sentence} 的句法结构树`}>
        <p className="source-sentence">{data.sentence}</p>
        <div className="tree-root"><span>SENTENCE</span><i /></div>
        <div className="tree-branches">
          <div><i /><span>{data.labels[0]}</span><strong>{data.trunk[0]}</strong></div>
          <div className="branch-main"><i /><span>{data.labels[1]}</span><strong>{data.trunk[1]}</strong></div>
          <div className="branch-clause"><i /><span>{data.type}</span><strong>{data.branch}</strong></div>
        </div>
      </div>
    </LabFrame>
  )
}

const tenses = [
  { id: 'present', label: '一般现在时', example: 'She studies every evening.', note: '习惯或客观事实', marks: [180, 240, 300, 360, 420], line: undefined },
  { id: 'continuous', label: '现在进行时', example: 'She is studying now.', note: '此刻正在进行', marks: [300], line: [248, 352] },
  { id: 'past', label: '一般过去时', example: 'She studied last night.', note: '过去已完成', marks: [154], line: undefined },
  { id: 'perfect', label: '现在完成时', example: 'She has studied for two hours.', note: '过去开始并影响现在', marks: [300], line: [132, 300] },
  { id: 'future', label: '一般将来时', example: 'She will study tomorrow.', note: '将来发生', marks: [454], line: undefined },
  { id: 'pastPerfect', label: '过去完成时', example: 'She had studied before dinner.', note: '过去的过去', marks: [126], line: [82, 178], reference: 214 },
]

function TenseLab() {
  const [selected, setSelected] = useState('perfect')
  const tense = tenses.find((item) => item.id === selected) ?? tenses[0]
  return (
    <LabFrame
      formula={<><span>tense = time + </span><b>aspect</b></>}
      status={tense.note}
      controls={<>
        <p className="control-title">常用时态</p>
        <div className="tense-list">{tenses.map((item) => <button className={item.id === selected ? 'active' : ''} onClick={() => setSelected(item.id)} key={item.id}><span>{item.label}</span><small>{item.note}</small></button>)}</div>
      </>}
      insight={<><em>{tense.example}</em> 先确定动作与“现在”的关系，再选择时态形式。</>}
    >
      <svg className="plot tense-timeline" viewBox="0 0 624 340" role="img" aria-label={`${tense.label}时间轴`}>
        <defs><marker id="time-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
        <line className="time-axis" x1="64" y1="174" x2="562" y2="174" markerEnd="url(#time-arrow)" />
        <line className="now-line" x1="300" y1="72" x2="300" y2="256" />
        <text x="90" y="210">PAST</text><text x="300" y="54" textAnchor="middle">NOW</text><text x="456" y="210">FUTURE</text>
        {tense.line && <line className="duration-line" x1={tense.line[0]} y1="174" x2={tense.line[1]} y2="174" />}
        {tense.marks.map((x) => <g key={x}><circle className="event-mark" cx={x} cy="174" r="9" /><circle className="event-pulse" cx={x} cy="174" r="18" /></g>)}
        {tense.reference && <g><line className="reference-time" x1={tense.reference} y1="112" x2={tense.reference} y2="230" /><text x={tense.reference} y="250" textAnchor="middle">past reference</text></g>}
        <text className="timeline-example" x="312" y="302" textAnchor="middle">{tense.example}</text>
      </svg>
    </LabFrame>
  )
}

const historyEvents = [
  { year: 1843, title: '上海开埠', detail: '上海被纳入近代条约口岸体系，城市空间与经济结构快速变化。', national: '鸦片战争后的社会转型' },
  { year: 1919, title: '五四运动', detail: '上海工人罢工、商人罢市，推动运动中心由北京转向上海。', national: '新民主主义革命开端' },
  { year: 1921, title: '中共一大', detail: '中国共产党第一次全国代表大会在上海开幕。', national: '中国革命面貌焕然一新' },
  { year: 1978, title: '改革开放', detail: '工作重心转向社会主义现代化建设，上海进入新的发展阶段。', national: '十一届三中全会' },
  { year: 1990, title: '浦东开发开放', detail: '浦东开发开放成为深化改革、扩大开放的重要标志。', national: '对外开放格局深化' },
]

function TimelineLab() {
  const [selected, setSelected] = useState(2)
  const current = historyEvents[selected]
  const xForYear = (year: number) => 62 + (year - 1840) / 160 * 500
  return (
    <LabFrame
      formula={<><span>地方节点 ↔ </span><b>全国进程</b></>}
      status={`${current.year} · ${current.title}`}
      controls={<>
        <p className="control-title">关键节点</p>
        <div className="history-event-list">{historyEvents.map((event, index) => <button className={index === selected ? 'active' : ''} onClick={() => setSelected(index)} key={event.year}><b>{event.year}</b><span>{event.title}</span></button>)}</div>
      </>}
      insight={<>{current.detail}</>}
    >
      <svg className="plot history-timeline" viewBox="0 0 624 340" role="img" aria-label={`1843 至 1990 年上海近现代历史时间轴，当前为 ${current.title}`}>
        <line className="history-axis" x1="62" y1="174" x2="562" y2="174" />
        {historyEvents.map((event, index) => { const x = xForYear(event.year); const above = index % 2 === 0; return <g key={event.year} className={index === selected ? 'active' : ''} onClick={() => setSelected(index)} role="button" aria-label={`${event.year} ${event.title}`}><line x1={x} y1="174" x2={x} y2={above ? 110 : 238} /><circle cx={x} cy="174" r={index === selected ? 9 : 6} /><text className="event-year" x={x} y={above ? 92 : 264} textAnchor="middle">{event.year}</text><text className="event-title" x={x} y={above ? 72 : 284} textAnchor="middle">{event.title}</text></g> })}
        <g className="history-detail"><text x="312" y="314" textAnchor="middle">全国进程：{current.national}</text></g>
      </svg>
    </LabFrame>
  )
}

const revolutions = {
  first: { label: '第一次工业革命', period: '18 世纪 60 年代起', energy: '蒸汽动力', industries: ['纺织', '煤炭', '铁路'], inventions: ['珍妮纺纱机', '改良蒸汽机', '蒸汽机车'], impact: '工厂制度形成，生产从手工走向机器' },
  second: { label: '第二次工业革命', period: '19 世纪 70 年代起', energy: '电力与内燃机', industries: ['电气', '化工', '汽车'], inventions: ['发电机', '电话', '内燃机'], impact: '重工业兴起，生产与资本进一步集中' },
}

function RevolutionLab() {
  const [selected, setSelected] = useState<keyof typeof revolutions>('second')
  const item = revolutions[selected]
  return (
    <LabFrame
      formula={<><span>能源突破 → 技术群 → </span><b>生产变革</b></>}
      status={item.period}
      controls={<>
        <p className="control-title">比较阶段</p>
        <div className="revolution-switch"><button className={selected === 'first' ? 'active' : ''} onClick={() => setSelected('first')}>第一次</button><button className={selected === 'second' ? 'active' : ''} onClick={() => setSelected('second')}>第二次</button></div>
        <div className="revolution-summary"><small>核心动力</small><strong>{item.energy}</strong><small>代表产业</small><strong>{item.industries.join(' · ')}</strong></div>
      </>}
      insight={<>{item.impact}。比较时要同时看能源、产业结构和社会影响。</>}
    >
      <div className="revolution-network" role="img" aria-label={`${item.label}技术关系图`}>
        <div className="network-core"><small>动力</small><strong>{item.energy}</strong></div>
        <div className="network-line horizontal" /><div className="network-line vertical one" /><div className="network-line vertical two" /><div className="network-line vertical three" />
        <div className="network-nodes">{item.inventions.map((invention, index) => <div key={invention}><span>0{index + 1}</span><strong>{invention}</strong><small>{item.industries[index]}</small></div>)}</div>
        <p>{item.label}<span>{item.period}</span></p>
      </div>
    </LabFrame>
  )
}

function SolarLab() {
  const [latitude, setLatitude] = useState(31.2)
  const [day, setDay] = useState(172)
  const declination = 23.44 * Math.sin(2 * Math.PI * (284 + day) / 365)
  const altitude = clamp(90 - Math.abs(latitude - declination), 0, 90)
  const x = 104 + Math.cos(altitude * Math.PI / 180) * 390
  const y = 274 - Math.sin(altitude * Math.PI / 180) * 220
  const season = day < 80 ? '冬末至春分' : day < 172 ? '春分至夏至' : day < 266 ? '夏至至秋分' : day < 355 ? '秋分至冬至' : '冬至前后'
  return (
    <LabFrame
      formula={<><span>H = 90° − |φ − δ| = </span><b>{altitude.toFixed(1)}°</b></>}
      status={season}
      controls={<>
        <p className="control-title">观测条件</p>
        <RangeField label="纬度 φ" value={latitude} min={-60} max={60} step={0.1} unit="°" onChange={setLatitude} format={(value) => value.toFixed(1)} />
        <RangeField label="一年中的第" value={day} min={1} max={365} step={1} unit=" 天" onChange={setDay} />
        <button className="secondary-button" onClick={() => setLatitude(31.2)}>定位上海 31.2°N</button>
        <div className="solar-readout"><span><small>太阳直射纬度</small><b>{declination.toFixed(1)}°</b></span><span><small>正午高度</small><b>{altitude.toFixed(1)}°</b></span></div>
      </>}
      insight={<>上海纬度约 31.2°N；太阳直射点向北靠近上海时，正午太阳高度增大。</>}
    >
      <svg className="plot solar-plot" viewBox="0 0 624 340" role="img" aria-label={`纬度 ${latitude.toFixed(1)} 度处正午太阳高度 ${altitude.toFixed(1)} 度`}>
        <defs><radialGradient id="sun-glow"><stop offset="0" stopColor="currentColor" stopOpacity=".38"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></radialGradient></defs>
        <path className="sky-arc" d="M 104 274 A 230 230 0 0 1 494 274" />
        <line className="horizon" x1="54" y1="274" x2="570" y2="274" />
        <line className="sun-ray" x1="104" y1="274" x2={x} y2={y} />
        <path className="altitude-arc" d={`M 174 274 A 70 70 0 0 0 ${104 + 70 * Math.cos(altitude * Math.PI / 180)} ${274 - 70 * Math.sin(altitude * Math.PI / 180)}`} />
        <circle className="sun-glow" cx={x} cy={y} r="38" /><circle className="sun" cx={x} cy={y} r="17" />
        <text className="altitude-label" x={128 + 58 * Math.cos(altitude * Math.PI / 360)} y={266 - 58 * Math.sin(altitude * Math.PI / 360)}>{altitude.toFixed(1)}°</text>
        <text x="58" y="302">南</text><text x="548" y="302">北</text><text x="312" y="326" textAnchor="middle">地平面 · 纬度 {latitude.toFixed(1)}°</text>
      </svg>
    </LabFrame>
  )
}

function CirculationLab() {
  const [difference, setDifference] = useState(12)
  const [mode, setMode] = useState<'day' | 'night'>('day')
  const leftHot = mode === 'day'
  return (
    <LabFrame
      formula={<><span>冷热不均 → 气压差 → </span><b>热力环流</b></>}
      status={`温差 ${difference} ℃`}
      controls={<>
        <p className="control-title">地表情境</p>
        <div className="segmented-control"><button className={mode === 'day' ? 'active' : ''} onClick={() => setMode('day')}>白天</button><button className={mode === 'night' ? 'active' : ''} onClick={() => setMode('night')}>夜晚</button></div>
        <RangeField label="陆海温差" value={difference} min={2} max={24} step={1} unit=" ℃" onChange={setDifference} />
        <div className="pressure-key"><span><i className="high" />高压</span><span><i className="low" />低压</span></div>
      </>}
      insight={<>近地面空气从高压流向低压；{mode === 'day' ? '白天陆地升温快，形成海风' : '夜晚陆地降温快，形成陆风'}。</>}
    >
      <svg className={`plot circulation-plot strength-${Math.ceil(difference / 6)}`} viewBox="0 0 624 340" role="img" aria-label={`${mode === 'day' ? '白天海风' : '夜晚陆风'}热力环流示意图`}>
        <defs><marker id="air-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
        <rect className={leftHot ? 'land hot' : 'land cold'} x="36" y="262" width="276" height="44" /><rect className={leftHot ? 'sea cold' : 'sea hot'} x="312" y="262" width="276" height="44" />
        <text x="174" y="290" textAnchor="middle">陆地 · {leftHot ? '较热' : '较冷'}</text><text x="450" y="290" textAnchor="middle">海洋 · {leftHot ? '较冷' : '较热'}</text>
        <path className="air-loop" d={leftHot ? 'M 150 250 C 120 184 135 86 240 70 C 360 50 472 100 468 244' : 'M 468 250 C 500 184 485 86 380 70 C 260 50 150 100 154 244'} markerEnd="url(#air-arrow)" />
        <path className="surface-wind" d={leftHot ? 'M 468 244 C 382 228 265 228 156 244' : 'M 156 244 C 252 228 370 228 464 244'} markerEnd="url(#air-arrow)" />
        <g className="pressure-labels"><text className="low" x={leftHot ? 156 : 464} y="224" textAnchor="middle">低压</text><text className="high" x={leftHot ? 464 : 156} y="224" textAnchor="middle">高压</text></g>
        {Array.from({ length: 7 }, (_, index) => <circle className="air-particle" key={index} r="3" style={{ animationDelay: `${index * -.35}s` }} />)}
      </svg>
    </LabFrame>
  )
}

function MarketLab() {
  const [demand, setDemand] = useState(0)
  const [supply, setSupply] = useState(0)
  const price = clamp(50 + demand * 5 - supply * 5, 15, 85)
  const quantity = clamp(50 + demand * 5 + supply * 5, 15, 85)
  const toX = (q: number) => 72 + q / 100 * 478
  const toY = (p: number) => 294 - p / 100 * 246
  return (
    <LabFrame
      formula={<><span>Qd = Qs　均衡价格 = </span><b>{price.toFixed(0)}</b></>}
      status={`均衡数量 ${quantity.toFixed(0)}`}
      controls={<>
        <p className="control-title">市场变化</p>
        <RangeField label="需求移动" value={demand} min={-4} max={4} step={1} onChange={setDemand} format={(value) => value > 0 ? `右移 ${value}` : value < 0 ? `左移 ${Math.abs(value)}` : '不变'} />
        <RangeField label="供给移动" value={supply} min={-4} max={4} step={1} onChange={setSupply} format={(value) => value > 0 ? `右移 ${value}` : value < 0 ? `左移 ${Math.abs(value)}` : '不变'} />
        <div className="scenario-buttons"><button onClick={() => { setDemand(3); setSupply(0) }}>收入增加</button><button onClick={() => { setDemand(0); setSupply(-3) }}>成本上升</button><button onClick={() => { setDemand(0); setSupply(0) }}>恢复</button></div>
      </>}
      insight={<>需求{demand === 0 ? '未移动' : demand > 0 ? '增加' : '减少'}、供给{supply === 0 ? '未移动' : supply > 0 ? '增加' : '减少'}，均衡点移动到 <em>Q {quantity.toFixed(0)} / P {price.toFixed(0)}</em>。</>}
    >
      <svg className="plot market-plot" viewBox="0 0 624 340" role="img" aria-label={`供求曲线，均衡价格 ${price.toFixed(0)}，均衡数量 ${quantity.toFixed(0)}`}>
        <defs><marker id="market-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
        <line className="market-axis" x1="72" y1="294" x2="566" y2="294" markerEnd="url(#market-arrow)" /><line className="market-axis" x1="72" y1="294" x2="72" y2="36" markerEnd="url(#market-arrow)" />
        <line className="demand-curve" x1={toX(clamp(demand * 10, 0, 100))} y1={toY(100)} x2={toX(clamp(100 + demand * 10, 0, 100))} y2={toY(0)} />
        <line className="supply-curve" x1={toX(clamp(supply * 10, 0, 100))} y1={toY(0)} x2={toX(clamp(100 + supply * 10, 0, 100))} y2={toY(100)} />
        <line className="equilibrium-guide" x1={toX(quantity)} y1={toY(price)} x2={toX(quantity)} y2="294" /><line className="equilibrium-guide" x1="72" y1={toY(price)} x2={toX(quantity)} y2={toY(price)} />
        <circle className="active-point" cx={toX(quantity)} cy={toY(price)} r="8" /><text className="value-label" x={toX(quantity) + 12} y={toY(price) - 12}>E ({quantity.toFixed(0)}, {price.toFixed(0)})</text>
        <text x="556" y="322">数量 Q</text><text x="30" y="44">价格 P</text><text className="curve-label demand" x="514" y={toY(12)}>D</text><text className="curve-label supply" x="514" y={toY(88)}>S</text>
      </svg>
    </LabFrame>
  )
}

function FlowLab() {
  const [consumption, setConsumption] = useState(70)
  const [tax, setTax] = useState(20)
  const wages = 100
  const savings = Math.max(0, wages - consumption - tax)
  const government = tax * .8
  return (
    <LabFrame
      formula={<><span>收入 = 消费 + 税收 + </span><b>储蓄</b></>}
      status={`储蓄 ${savings} 单位`}
      controls={<>
        <p className="control-title">居民部门</p>
        <RangeField label="消费支出" value={consumption} min={30} max={80} step={5} unit="" onChange={(value) => setConsumption(Math.min(value, 100 - tax))} />
        <RangeField label="税收" value={tax} min={5} max={35} step={5} unit="" onChange={(value) => setTax(Math.min(value, 100 - consumption))} />
        <div className="flow-balance"><span><small>收入</small><b>100</b></span><span><small>支出与储蓄</small><b>{consumption + tax + savings}</b></span></div>
      </>}
      insight={<>居民获得企业支付的收入，再以消费、税收和储蓄进入其他部门；图中每条流都有对应去向。</>}
    >
      <div className="economy-flow" role="img" aria-label="居民、企业和政府之间的国民经济循环图">
        <div className="sector households"><small>HOUSEHOLDS</small><strong>居民</strong><span>可支配收入 {100 - tax}</span></div>
        <div className="sector firms"><small>FIRMS</small><strong>企业</strong><span>消费收入 {consumption}</span></div>
        <div className="sector government"><small>GOVERNMENT</small><strong>政府</strong><span>公共支出 {government.toFixed(0)}</span></div>
        <div className="flow-arrow wages"><span>工资 100</span><i /></div>
        <div className="flow-arrow spending"><span>消费 {consumption}</span><i /></div>
        <div className="flow-arrow taxes"><span>税收 {tax}</span><i /></div>
        <div className="flow-arrow purchase"><span>政府购买 {government.toFixed(0)}</span><i /></div>
        <div className="savings-node"><small>金融市场</small><strong>储蓄 {savings}</strong></div>
      </div>
    </LabFrame>
  )
}

export function DemoStage({ topicId }: { topicId: string }) {
  const demos: Record<string, () => ReactNode> = {
    function: () => <FunctionLab />, probability: () => <ProbabilityLab />, projectile: () => <ProjectileLab />, wave: () => <WaveLab />,
    equilibrium: () => <EquilibriumLab />, titration: () => <TitrationLab />, genetics: () => <GeneticsLab />, enzyme: () => <EnzymeLab />,
    argument: () => <ArgumentLab />, imagery: () => <ImageryLab />, syntax: () => <SyntaxLab />, tense: () => <TenseLab />,
    timeline: () => <TimelineLab />, revolution: () => <RevolutionLab />, solar: () => <SolarLab />, circulation: () => <CirculationLab />,
    market: () => <MarketLab />, flow: () => <FlowLab />,
  }
  return demos[topicId]?.() ?? <FunctionLab />
}
