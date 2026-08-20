import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SubjectId } from '../../data'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'
import './ScienceConceptVisual.css'

type ScienceConceptVisualProps = {
  subjectId: SubjectId
  topicTitle: string
  unitTitle: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function PlayButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return <button className="science-play" type="button" aria-pressed={playing} onClick={onToggle}>{playing ? '暂停动画' : '播放动画'}</button>
}

function useTicker(initial = 0, step = 0.04, max = 1) {
  const [value, setValue] = useState(initial)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing || reducedMotion()) return undefined
    const timer = window.setInterval(() => setValue((current) => (current + step >= max ? 0 : current + step)), 40)
    return () => window.clearInterval(timer)
  }, [max, playing, step])
  return { value, setValue, playing, setPlaying }
}

function PhysicsMotionVisual({ topicTitle }: { topicTitle: string }) {
  const { value: time, setValue: setTime, playing, setPlaying } = useTicker(0, 0.035, 1)
  const [acceleration, setAcceleration] = useState(2)
  const position = 48 + 500 * (0.5 - 0.5 * Math.cos(time * Math.PI * 2))
  const velocity = 5 * Math.sin(time * Math.PI * 2)
  const accelerationValue = acceleration * Math.cos(time * Math.PI * 2)
  return <MathVisualFrame
    title={`${topicTitle}：运动状态的连续变化`}
    summary="拖动时间或播放动画，比较位置、速度和加速度。速度是位置图像的斜率，加速度是速度图像的斜率。"
    controls={<><MathRange label="时间 t" value={time} min={0} max={1} step={0.01} output={`${(time * 4).toFixed(2)} s`} onChange={setTime} /><MathRange label="加速度幅值" value={acceleration} min={0.5} max={4} step={0.5} output={`${acceleration.toFixed(1)} m/s²`} onChange={setAcceleration} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>同一时刻的位移、速度、加速度要放回同一参考系判断；速度为零不代表加速度为零。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}运动示意，当前位置 ${position.toFixed(0)}，速度 ${velocity.toFixed(1)}`}>
      <title>{topicTitle}运动示意</title><desc>小球沿水平轨道运动，箭头表示速度，读数随时间变化。</desc>
      <line className="science-axis" x1="42" y1="150" x2="598" y2="150" /><line className="science-guide" x1="42" y1="184" x2="598" y2="184" />
      <circle className="science-dot" cx={position} cy="150" r="13" /><line className="science-vector" x1={position} y1="150" x2={position + velocity * 11} y2="150" />
      <text className="science-label" x="45" y="214">0</text><text className="science-label" x="574" y="214">x</text><text className="science-label" x={clamp(position - 22, 48, 550)} y="117">v = {velocity.toFixed(1)} m/s</text>
      <rect className="science-meter" x="58" y="32" width="150" height="56" rx="4" /><text className="science-meter-label" x="72" y="55">a(t)</text><text className="science-meter-value" x="72" y="76">{accelerationValue.toFixed(1)} m/s²</text>
      <rect className="science-meter science-meter-alt" x="224" y="32" width="150" height="56" rx="4" /><text className="science-meter-label" x="238" y="55">x(t)</text><text className="science-meter-value" x="238" y="76">{((position - 48) / 50).toFixed(1)} m</text>
    </svg>
  </MathVisualFrame>
}

function PhysicsElectricVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, playing, setPlaying } = useTicker(0, 0.03, 1)
  const [voltage, setVoltage] = useState(6)
  const [resistance, setResistance] = useState(3)
  const current = voltage / resistance
  const electrons = Array.from({ length: 7 }, (_, index) => (phase * 320 + index * 48) % 320)
  return <MathVisualFrame
    title={`${topicTitle}：电压、电阻与电流`}
    summary="用可调电源和电阻观察闭合电路。电流 I=U/R，电子沿导线定向移动，电势能在负载上转化。"
    controls={<><MathRange label="电压 U" value={voltage} min={1} max={12} step={1} output={`${voltage} V`} onChange={setVoltage} /><MathRange label="电阻 R" value={resistance} min={1} max={8} step={1} output={`${resistance} Ω`} onChange={setResistance} /><PlayButton playing={playing} onToggle={() => setPlaying((currentValue) => !currentValue)} /></>}
    takeaway={<>闭合回路中电流处处相同（串联），电阻增大时电流减小；电源提供的能量不会凭空消失。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}电路示意，电流 ${current.toFixed(2)} 安培`}>
      <title>{topicTitle}电路示意</title><desc>电池、导线和电阻构成闭合回路，黄色圆点表示电子定向移动。</desc>
      <path className="science-wire" d="M110 70 H530 V230 H110 Z" /><rect className="science-battery" x="92" y="102" width="35" height="95" rx="3" /><line className="science-battery-line" x1="78" y1="126" x2="142" y2="126" /><line className="science-battery-line" x1="88" y1="174" x2="132" y2="174" />
      <path className="science-resistor" d="M270 70 l12 18 l20 -36 l20 36 l20 -36 l20 36 l20 -36 l20 36 l12 -18" />
      {electrons.map((offset, index) => <circle key={index} className="science-electron" cx={110 + offset} cy="70" r="5" />)}
      <text className="science-label" x="246" y="52">R = {resistance} Ω</text><text className="science-label" x="154" y="266">U = {voltage} V</text><text className="science-label science-current" x="405" y="113">I = {current.toFixed(2)} A</text>
    </svg>
  </MathVisualFrame>
}

function PhysicsMagnetVisual({ topicTitle }: { topicTitle: string }) {
  const [speed, setSpeed] = useState(4)
  const [charge, setCharge] = useState<'正电荷' | '负电荷'>('正电荷')
  const radius = clamp(120 - speed * 12, 42, 120)
  const sign = charge === '正电荷' ? 1 : -1
  const endX = 320 + radius * Math.cos(sign > 0 ? -0.95 : 0.95)
  const endY = 170 + radius * Math.sin(sign > 0 ? -0.95 : 0.95)
  return <MathVisualFrame
    title={`${topicTitle}：带电粒子在磁场中的轨迹`}
    summary="磁场对运动电荷的洛伦兹力始终垂直于速度，改变方向而不直接改变速率，因此轨迹可以是圆或螺旋。"
    controls={<><MathRange label="速度 v" value={speed} min={1} max={6} step={1} output={`${speed} ×10⁶ m/s`} onChange={setSpeed} /><MathChoices label="电荷类型" value={charge} choices={[{ value: '正电荷', label: '正电荷' }, { value: '负电荷', label: '负电荷' }]} onChange={(value) => setCharge(value as typeof charge)} /></>}
    takeaway={<>半径 <code>r=mv/(qB)</code> 随速度增大而增大；换成负电荷，弯曲方向反向，但周期关系仍由质量、电荷量和磁感应强度决定。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${charge}轨迹，半径 ${radius.toFixed(0)}`}>
      <title>{topicTitle}洛伦兹力示意</title><desc>匀强磁场中带电粒子沿圆弧运动，速度和洛伦兹力互相垂直。</desc>
      <rect className="science-field" x="42" y="30" width="556" height="240" rx="6" />
      {Array.from({ length: 30 }, (_, index) => <text key={index} className="science-field-mark" x={70 + (index % 10) * 52} y={65 + Math.floor(index / 10) * 62}>×</text>)}
      <path className="science-orbit" d={`M ${320 - radius} 170 A ${radius} ${radius} 0 1 1 ${endX} ${endY}`} /><circle className="science-dot" cx={320 - radius} cy="170" r="11" />
      <line className="science-vector" x1={320 - radius} y1="170" x2={320 - radius + 42} y2="170" /><line className="science-force" x1={320 - radius} y1="170" x2={320 - radius} y2={170 - sign * 48} />
      <text className="science-label" x={320 - radius + 46} y="164">v</text><text className="science-label" x={320 - radius + 8} y={170 - sign * 56}>F</text><text className="science-label" x="480" y="252">B 垂直纸面向里</text>
    </svg>
  </MathVisualFrame>
}

function PhysicsWaveVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, setValue: setPhase, playing, setPlaying } = useTicker(0, 0.025, 1)
  const [frequency, setFrequency] = useState(2)
  const points = Array.from({ length: 121 }, (_, index) => {
    const x = 42 + index * 4.65
    const y = 150 - 54 * Math.sin(index / 120 * Math.PI * 2 * frequency - phase * Math.PI * 2)
    return `${x},${y}`
  }).join(' ')
  return <MathVisualFrame
    title={`${topicTitle}：波形、波长与频率`}
    summary="波形图是某一时刻空间各点的位移快照。播放后看波峰向右传播，调节频率可比较周期和波长的变化。"
    controls={<><MathRange label="频率 f" value={frequency} min={1} max={4} step={1} output={`${frequency} Hz`} onChange={setFrequency} /><MathRange label="相位" value={phase} min={0} max={1} step={0.01} output={`${(phase * 360).toFixed(0)}°`} onChange={setPhase} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>介质改变时频率由波源决定，波速和波长随介质改变；质点只在平衡位置附近振动，不随波形整体前进。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}波形，频率 ${frequency} 赫兹`}>
      <title>{topicTitle}波形传播</title><desc>正弦波在水平介质中传播，标出了一个波长和振幅。</desc>
      <line className="science-axis" x1="42" y1="150" x2="598" y2="150" /><polyline className="science-wave" points={points} />
      <line className="science-guide" x1="95" y1="96" x2="95" y2="204" /><line className="science-guide" x1="95" y1="96" x2="234" y2="96" /><line className="science-guide" x1="234" y1="96" x2="234" y2="150" />
      <text className="science-label" x="148" y="84">λ</text><text className="science-label" x="105" y="116">A</text><text className="science-label" x="500" y="220">传播方向 →</text>
    </svg>
  </MathVisualFrame>
}

function PhysicsThermalVisual({ topicTitle }: { topicTitle: string }) {
  const [temperature, setTemperature] = useState(300)
  const dots = useMemo(() => Array.from({ length: 24 }, (_, index) => ({ x: 78 + (index % 8) * 58, y: 78 + Math.floor(index / 8) * 52, dx: ((index * 17) % 13) - 6, dy: ((index * 23) % 11) - 5 })), [])
  const scale = temperature / 300
  return <MathVisualFrame
    title={`${topicTitle}：温度与分子热运动`}
    summary="温度反映大量分子无规则运动的剧烈程度。滑动温度，粒子的运动箭头变长，体现微观状态的统计变化。"
    controls={<MathRange label="温度 T" value={temperature} min={200} max={600} step={20} output={`${temperature} K`} onChange={setTemperature} />}
    takeaway={<>宏观温度不是单个分子的速度；它描述大量粒子平均动能的统计结果。气体压强来自粒子碰撞器壁的平均效果。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}分子运动，温度 ${temperature} 开尔文`}>
      <title>{topicTitle}分子热运动</title><desc>容器中的多个粒子和速度箭头，温度越高箭头越长。</desc>
      <rect className="science-container" x="44" y="32" width="552" height="220" rx="8" />
      {dots.map((dot, index) => <g key={index}><circle className="science-particle" cx={dot.x} cy={dot.y} r="7" /><line className="science-vector science-vector-soft" x1={dot.x} y1={dot.y} x2={dot.x + dot.dx * scale} y2={dot.y + dot.dy * scale} /></g>)}
      <text className="science-label" x="62" y="278">平均动能 ∝ T</text><text className="science-label" x="474" y="278">T = {temperature} K</text>
    </svg>
  </MathVisualFrame>
}

function PhysicsInductionVisual({ topicTitle }: { topicTitle: string }) {
  const [flux, setFlux] = useState(55)
  const [direction, setDirection] = useState<'增大' | '减小'>('增大')
  const emf = Math.abs(flux - 50) / 10
  return <MathVisualFrame
    title={`${topicTitle}：磁通量变化产生感应电动势`}
    summary="改变线圈中的磁通量，线圈中就会出现感应电流。楞次定律告诉我们感应效应总是反抗磁通量的变化。"
    controls={<><MathRange label="磁通量 Φ" value={flux} min={10} max={90} step={5} output={`${flux} mWb`} onChange={setFlux} /><MathChoices label="变化趋势" value={direction} choices={[{ value: '增大', label: '增大' }, { value: '减小', label: '减小' }]} onChange={(value) => setDirection(value as typeof direction)} /></>}
    takeaway={<>感应电动势大小与磁通量变化率有关；电流方向由“阻碍原磁通量变化”判断，而不是简单背固定方向。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}感应示意，感应电动势 ${emf.toFixed(1)} 伏`}>
      <title>{topicTitle}电磁感应示意</title><desc>磁铁靠近或远离线圈，线圈中的电流计偏转方向随磁通量变化而改变。</desc>
      <ellipse className="science-coil" cx="405" cy="150" rx="100" ry="92" /><ellipse className="science-coil-inner" cx="405" cy="150" rx="66" ry="62" />
      <rect className="science-magnet" x="112" y="104" width="100" height="92" rx="5" /><text className="science-magnet-label" x="138" y="140">N</text><text className="science-magnet-label" x="174" y="177">S</text>
      <line className="science-vector" x1="230" y1="150" x2="310" y2="150" /><text className="science-label" x="230" y="126">磁通量 {direction}</text>
      <path className="science-current-arc" d={direction === '增大' ? 'M 350 78 A 78 78 0 0 1 350 222' : 'M 460 78 A 78 78 0 0 0 460 222'} /><text className="science-label" x="476" y="245">ε = {emf.toFixed(1)} V</text>
    </svg>
  </MathVisualFrame>
}

function PhysicsModernVisual({ topicTitle }: { topicTitle: string }) {
  const [level, setLevel] = useState(2)
  const energies = [-13.6, -3.4, -1.51, -0.85]
  return <MathVisualFrame
    title={`${topicTitle}：能级跃迁与光谱证据`}
    summary="原子只能处在离散能级。电子从高能级跃迁到低能级时发出光子，光子能量等于两能级差。"
    controls={<MathRange label="终止能级 n" value={level} min={1} max={3} step={1} output={`n = ${level}`} onChange={setLevel} />}
    takeaway={<>谱线不是连续颜色的任意组合，而是能级差的“指纹”。吸收与发射对应相反方向的跃迁。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}能级图，跃迁到 n=${level}`}>
      <title>{topicTitle}原子能级跃迁</title><desc>氢原子多个离散能级，电子从高能级向下跃迁并发出光子。</desc>
      {energies.map((energy, index) => { const y = 64 + index * 48; return <g key={index}><line className="science-energy" x1="110" y1={y} x2="500" y2={y} /><text className="science-label" x="72" y={y + 6}>n={index + 1}</text><text className="science-label" x="518" y={y + 6}>{energy} eV</text></g> })}
      <line className="science-transition" x1="306" y1={64 + 48 * 3} x2="306" y2={64 + (level - 1) * 48} /><polygon className="science-arrow-head" points={`300,${64 + (level - 1) * 48} 312,${64 + (level - 1) * 48} 306,${56 + (level - 1) * 48}`} /><circle className="science-dot" cx="306" cy={64 + (level - 1) * 48} r="9" />
      <text className="science-label" x="254" y="274">ΔE = hν</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryStoichVisual({ topicTitle }: { topicTitle: string }) {
  const [moles, setMoles] = useState(2)
  const particles = Array.from({ length: moles * 4 }, (_, index) => ({ x: 110 + (index % 8) * 48, y: 84 + Math.floor(index / 8) * 54 }))
  return <MathVisualFrame
    title={`${topicTitle}：从微粒数到物质的量`}
    summary="每组小球代表相同数量级的微观粒子。物质的量 n 把粒子数、质量、气体体积和溶液浓度放进同一条换算链。"
    controls={<MathRange label="物质的量 n" value={moles} min={1} max={5} step={1} output={`${moles} mol`} onChange={setMoles} />}
    takeaway={<>先把已知量统一成 mol，再按化学方程式系数比传递，最后换回题目要求的质量、体积或粒子数。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}微粒示意，物质的量 ${moles} 摩尔`}>
      <title>{topicTitle}物质的量示意</title><desc>粒子数量随物质的量滑块增加，右侧给出摩尔质量和粒子数换算。</desc>
      <rect className="science-container" x="46" y="34" width="420" height="210" rx="8" />
      {particles.map((particle, index) => <circle key={index} className="science-particle" cx={particle.x} cy={particle.y} r="9" />)}
      <text className="science-label" x="492" y="90">n = {moles} mol</text><text className="science-label" x="492" y="136">N = {moles}Nₐ</text><text className="science-label" x="492" y="182">m = nM</text>
      <text className="science-label" x="62" y="278">一小组圆点 = 0.25 mol</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryRateVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, setValue: setPhase, playing, setPlaying } = useTicker(0, 0.025, 1)
  const [temperature, setTemperature] = useState(300)
  const particleCount = Math.round(8 + (temperature - 200) / 30)
  return <MathVisualFrame
    title={`${topicTitle}：有效碰撞与反应速率`}
    summary="粒子碰撞不一定发生反应，只有能量足够且取向合适的有效碰撞才会生成产物。温度升高会增加有效碰撞比例。"
    controls={<><MathRange label="温度 T" value={temperature} min={200} max={500} step={20} output={`${temperature} K`} onChange={setTemperature} /><MathRange label="动画相位" value={phase} min={0} max={1} step={0.01} output={`${(phase * 360).toFixed(0)}°`} onChange={setPhase} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>催化剂降低活化能，改变达到有效碰撞的比例，但不改变反应物和生成物的总能量差。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}有效碰撞示意，温度 ${temperature} 开尔文`}>
      <title>{topicTitle}有效碰撞</title><desc>两类粒子在容器中运动，红色连接表示发生有效碰撞。</desc>
      <rect className="science-container" x="42" y="32" width="556" height="220" rx="8" />
      {Array.from({ length: particleCount }, (_, index) => { const x = 80 + ((index * 67 + phase * 140) % 470); const y = 72 + ((index * 43 + phase * 75) % 140); return <circle key={index} className={index % 3 === 0 ? 'science-reactant science-reactant-b' : 'science-reactant'} cx={x} cy={y} r="9" /> })}
      <circle className="science-collision" cx="319" cy="150" r="28" /><text className="science-label" x="278" y="205">有效碰撞</text><text className="science-label" x="62" y="278">速率随有效碰撞比例增加</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryEquilibriumVisual({ topicTitle }: { topicTitle: string }) {
  const [extent, setExtent] = useState(50)
  const reactant = Math.round((100 - extent) / 10)
  const product = Math.round(extent / 10)
  return <MathVisualFrame
    title={`${topicTitle}：可逆反应的动态平衡`}
    summary="平衡不是反应停止，而是正、逆反应速率相等。拖动平衡程度，观察反应物与生成物微粒数量的相对变化。"
    controls={<MathRange label="平衡移动程度" value={extent} min={10} max={90} step={5} output={`${extent}%`} onChange={setExtent} />}
    takeaway={<>改变浓度、压强或温度会让体系重新建立平衡；平衡常数只由温度决定，不能把“平衡移动”理解成单向反应停止。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}平衡示意，生成物比例 ${extent}%`}>
      <title>{topicTitle}动态平衡</title><desc>反应物和生成物微粒在同一容器中共存，数量随平衡程度改变。</desc>
      <rect className="science-container" x="42" y="32" width="556" height="220" rx="8" />
      {Array.from({ length: reactant }, (_, index) => <circle key={`r-${index}`} className="science-reactant" cx={78 + (index % 5) * 55} cy={78 + Math.floor(index / 5) * 58} r="11" />)}
      {Array.from({ length: product }, (_, index) => <rect key={`p-${index}`} className="science-product" x={360 + (index % 5) * 45} y={70 + Math.floor(index / 5) * 58} width="20" height="20" rx="4" />)}
      <text className="science-label" x="64" y="278">反应物 {reactant}</text><text className="science-label" x="442" y="278">生成物 {product}</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryAcidVisual({ topicTitle }: { topicTitle: string }) {
  const [ph, setPh] = useState(7)
  const hue = clamp(240 - ph * 28, 0, 240)
  return <MathVisualFrame
    title={`${topicTitle}：酸碱性与 pH`}
    summary="pH 用氢离子浓度的负对数表示酸碱性。拖动 pH，从颜色和刻度看出酸碱性是连续变化的。"
    controls={<MathRange label="pH" value={ph} min={0} max={14} step={0.5} output={ph.toFixed(1)} onChange={setPh} />}
    takeaway={<>pH 每变化 1，氢离子浓度变化 10 倍；滴定曲线的突跃区是判断终点指示剂范围的依据。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}pH刻度，当前 ${ph.toFixed(1)}`}>
      <title>{topicTitle}pH刻度</title><desc>从强酸到强碱的连续颜色刻度，指针标出当前 pH。</desc>
      <defs><linearGradient id="science-ph-gradient" x1="0" x2="1"><stop offset="0%" stopColor="#e45b66" /><stop offset="50%" stopColor="#f3cf5b" /><stop offset="100%" stopColor="#4d91d8" /></linearGradient></defs>
      <rect x="62" y="105" width="516" height="44" rx="8" fill="url(#science-ph-gradient)" /><line className="science-ph-marker" x1={62 + ph / 14 * 516} y1="82" x2={62 + ph / 14 * 516} y2="176" /><polygon className="science-arrow-head" points={`${62 + ph / 14 * 516 - 9},82 ${62 + ph / 14 * 516 + 9},82 ${62 + ph / 14 * 516},68`} />
      {Array.from({ length: 15 }, (_, index) => <g key={index}><line className="science-tick" x1={62 + index / 14 * 516} y1="149" x2={62 + index / 14 * 516} y2="160" /><text className="science-label" x={62 + index / 14 * 516} y="190" textAnchor="middle">{index}</text></g>)}
      <circle cx="62" cy="234" r="9" fill={`hsl(${hue} 70% 55%)`} /><text className="science-label" x="82" y="240">当前 pH = {ph.toFixed(1)}</text><text className="science-label" x="62" y="72">酸性</text><text className="science-label" x="534" y="72">碱性</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryElectrochemVisual({ topicTitle }: { topicTitle: string }) {
  const [load, setLoad] = useState(50)
  const electrons = Math.max(1, Math.round(load / 15))
  return <MathVisualFrame
    title={`${topicTitle}：原电池中的电子流向`}
    summary="氧化反应发生在负极，电子经外电路流向正极；盐桥中的离子迁移维持溶液电中性。"
    controls={<MathRange label="反应进程" value={load} min={10} max={90} step={5} output={`${load}%`} onChange={setLoad} />}
    takeaway={<>判断电极先看氧化还原，再确定电子方向；电流方向与电子方向相反，盐桥离子不通过外电路。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}原电池示意，反应进程 ${load}%`}>
      <title>{topicTitle}原电池</title><desc>两个半电池通过导线和盐桥相连，电子从负极流向正极。</desc>
      <path className="science-wire" d="M100 72 H540 V92" /><rect className="science-beaker" x="74" y="100" width="178" height="140" rx="7" /><rect className="science-beaker" x="388" y="100" width="178" height="140" rx="7" /><rect className="science-saltbridge" x="245" y="100" width="150" height="28" rx="14" />
      <rect className="science-electrode science-electrode-negative" x="132" y="124" width="28" height="102" rx="4" /><rect className="science-electrode science-electrode-positive" x="474" y="124" width="28" height="102" rx="4" />
      {Array.from({ length: electrons }, (_, index) => <circle key={index} className="science-electron" cx={150 + index * 72} cy="72" r="5" />)}
      <text className="science-label" x="108" y="264">负极：氧化</text><text className="science-label" x="430" y="264">正极：还原</text><text className="science-label" x="260" y="66">e⁻ →</text><text className="science-label" x="262" y="154">盐桥</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryStructureVisual({ topicTitle }: { topicTitle: string }) {
  const [shape, setShape] = useState('tetrahedral')
  const layouts: Record<string, Array<[number, number]>> = { linear: [[240, 150], [400, 150]], bent: [[235, 105], [405, 180]], tetrahedral: [[210, 100], [415, 100], [245, 220], [390, 225]] }
  const labels: Record<string, string> = { linear: '直线形', bent: 'V 形', tetrahedral: '正四面体' }
  const bonds = layouts[shape]
  return <MathVisualFrame
    title={`${topicTitle}：分子空间构型`}
    summary="价层电子对互斥模型把成键电子对和孤电子对的排斥转化为可观察的空间几何。"
    controls={<MathChoices label="构型" value={shape} choices={Object.entries(labels).map(([value, label]) => ({ value, label }))} onChange={setShape} />}
    takeaway={<>分子构型由电子对排斥决定，键角变化会影响极性、沸点和溶解性；不能只看化学式的平面写法。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${labels[shape]}构型`}>
      <title>{topicTitle}分子构型</title><desc>中心原子与周围原子由彩色键相连，按钮可切换三种典型构型。</desc>
      {bonds.map(([x, y], index) => <line key={index} className="science-bond" x1="320" y1="160" x2={x} y2={y} />)}<circle className="science-center" cx="320" cy="160" r="28" />
      {bonds.map(([x, y], index) => <g key={`atom-${index}`}><circle className="science-atom" cx={x} cy={y} r="19" /><text className="science-label" x={x} y={y + 6} textAnchor="middle">X</text></g>)}
      <text className="science-label" x="252" y="274">{labels[shape]}：中心原子 A + {bonds.length} 个 X</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryOrganicVisual({ topicTitle }: { topicTitle: string }) {
  const [length, setLength] = useState(4)
  const atoms = Array.from({ length }, (_, index) => ({ x: 120 + index * (400 / Math.max(length - 1, 1)), y: index % 2 ? 178 : 122 }))
  return <MathVisualFrame
    title={`${topicTitle}：碳链与官能团变化`}
    summary="有机物的性质由碳骨架和官能团共同决定。拖动碳链长度，观察同系物中结构单元的重复。"
    controls={<MathRange label="碳原子数" value={length} min={2} max={7} step={1} output={`${length} 个`} onChange={setLength} />}
    takeaway={<>先识别官能团，再判断反应类型；同系物具有相似的化学性质，但物理性质会随碳链长度有规律地变化。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}碳链示意，${length}个碳原子`}>
      <title>{topicTitle}有机碳链</title><desc>碳原子沿锯齿链连接，末端标出可替换的官能团位置。</desc>
      {atoms.slice(0, -1).map((atom, index) => <line key={index} className="science-bond" x1={atom.x} y1={atom.y} x2={atoms[index + 1].x} y2={atoms[index + 1].y} />)}
      {atoms.map((atom, index) => <g key={index}><circle className="science-carbon" cx={atom.x} cy={atom.y} r="18" /><text className="science-label" x={atom.x} y={atom.y + 6} textAnchor="middle">C</text></g>)}
      <line className="science-functional-bond" x1={atoms.at(-1)?.x ?? 520} y1={atoms.at(-1)?.y ?? 122} x2="570" y2="90" /><text className="science-label" x="548" y="72">—OH</text><text className="science-label" x="74" y="260">碳骨架：{length} 个 C</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryExperimentVisual({ topicTitle }: { topicTitle: string }) {
  const [step, setStep] = useState(2)
  const stages = ['发生', '净化', '收集', '检验']
  return <MathVisualFrame
    title={`${topicTitle}：实验流程的证据链`}
    summary="实验题不是装置识图竞赛，而是把反应原理、杂质去除、收集方法和检验现象按顺序连接起来。"
    controls={<MathRange label="流程步骤" value={step} min={0} max={3} step={1} output={`${step + 1} / 4`} onChange={setStep} />}
    takeaway={<>每一步都要说明目的和依据：发生装置提供反应条件，净化去除干扰，收集利用物性差异，检验给出可重复证据。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}实验流程，当前步骤 ${stages[step]}`}>
      <title>{topicTitle}实验流程</title><desc>四个实验流程节点由箭头连接，当前节点高亮。</desc>
      {stages.map((stage, index) => <g key={stage}><rect className={index === step ? 'science-stage science-stage-active' : 'science-stage'} x={44 + index * 145} y="108" width="112" height="70" rx="6" /><text className="science-label" x={100 + index * 145} y="150" textAnchor="middle">{stage}</text>{index < stages.length - 1 && <path className="science-process-arrow" d={`M ${158 + index * 145} 143 h 27`} />}</g>)}
      <text className="science-label" x="60" y="236">现象</text><text className="science-label" x="184" y="236">去除干扰</text><text className="science-label" x="334" y="236">利用物性</text><text className="science-label" x="480" y="236">得出结论</text>
    </svg>
  </MathVisualFrame>
}

function chemistryFamily(topicTitle: string, unitTitle: string) {
  const classify = (text: string) => {
    if (/电化学|原电池|电解|腐蚀|电极|电池/.test(text)) return 'electrochem'
    if (/酸|碱|pH|滴定|电离|水解|沉淀/.test(text)) return 'acid'
    if (/平衡|平衡常数/.test(text)) return 'equilibrium'
    if (/速率|催化|碰撞/.test(text)) return 'rate'
    if (/有机|烷|烯|醇|酚|醚|醛|酮|羧酸|酯|官能团|高分子|同分异构|碳链/.test(text)) return 'organic'
    if (/结构|原子轨道|电子排布|晶体|共价键|化学键|杂化|分子构型/.test(text)) return 'structure'
    if (/实验|制备|净化|收集|检验|流程/.test(text)) return 'experiment'
    return undefined
  }
  return classify(topicTitle) ?? classify(unitTitle) ?? 'stoich'
}

function physicsFamily(context: string) {
  if (/电磁感应|交变电流|变压器|输电|传感器|法拉第/.test(context)) return 'induction'
  if (/光电|原子|核|能级|衰变|裂变|聚变|辐射/.test(context)) return 'modern'
  if (/波|振动|光学|干涉|衍射|偏振/.test(context)) return 'wave'
  if (/电场|电势|电容|电路|欧姆|电流|电功率|电压|电阻/.test(context)) return 'electric'
  if (/磁场|磁|洛伦兹|安培|质谱|回旋/.test(context)) return 'magnet'
  if (/热|气体|分子|热力|内能/.test(context)) return 'thermal'
  return 'motion'
}

export function ScienceConceptVisual({ subjectId, topicTitle, unitTitle }: ScienceConceptVisualProps) {
  const context = `${unitTitle} ${topicTitle}`
  let family: string
  let visual: ReactNode
  if (subjectId === 'physics') {
    family = physicsFamily(context)
    if (family === 'electric') visual = <PhysicsElectricVisual topicTitle={topicTitle} />
    else if (family === 'magnet') visual = <PhysicsMagnetVisual topicTitle={topicTitle} />
    else if (family === 'wave') visual = <PhysicsWaveVisual topicTitle={topicTitle} />
    else if (family === 'thermal') visual = <PhysicsThermalVisual topicTitle={topicTitle} />
    else if (family === 'induction') visual = <PhysicsInductionVisual topicTitle={topicTitle} />
    else if (family === 'modern') visual = <PhysicsModernVisual topicTitle={topicTitle} />
    else visual = <PhysicsMotionVisual topicTitle={topicTitle} />
  } else if (subjectId === 'chemistry') {
    family = chemistryFamily(topicTitle, unitTitle)
    if (family === 'electrochem') visual = <ChemistryElectrochemVisual topicTitle={topicTitle} />
    else if (family === 'acid') visual = <ChemistryAcidVisual topicTitle={topicTitle} />
    else if (family === 'rate') visual = <ChemistryRateVisual topicTitle={topicTitle} />
    else if (family === 'equilibrium') visual = <ChemistryEquilibriumVisual topicTitle={topicTitle} />
    else if (family === 'organic') visual = <ChemistryOrganicVisual topicTitle={topicTitle} />
    else if (family === 'structure') visual = <ChemistryStructureVisual topicTitle={topicTitle} />
    else if (family === 'experiment') visual = <ChemistryExperimentVisual topicTitle={topicTitle} />
    else visual = <ChemistryStoichVisual topicTitle={topicTitle} />
  } else {
    return null
  }
  return <div className={`science-visual theme-${subjectId}`} data-science-concept-visual={topicTitle} data-science-family={family}>{visual}</div>
}
