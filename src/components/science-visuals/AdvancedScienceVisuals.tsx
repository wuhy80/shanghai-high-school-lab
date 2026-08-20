import { useEffect, useMemo, useState } from 'react'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function PlayButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return <button className="science-play" type="button" aria-pressed={playing} onClick={onToggle}>{playing ? '暂停动画' : '播放动画'}</button>
}

function useTicker(initial = 0, step = 0.025, max = 1) {
  const [value, setValue] = useState(initial)
  const [playing, setPlaying] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(reducedMotion)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!playing || reduceMotion) return undefined
    const timer = window.setInterval(() => setValue((current) => (current + step >= max ? 0 : current + step)), 40)
    return () => window.clearInterval(timer)
  }, [max, playing, reduceMotion, step])
  return { value, setValue, playing, setPlaying }
}

export function PhysicsProjectileVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, setValue: setPhase, playing, setPlaying } = useTicker()
  const [angle, setAngle] = useState(45)
  const speed = 24
  const gravity = 9.8
  const radians = angle * Math.PI / 180
  const flightTime = 2 * speed * Math.sin(radians) / gravity
  const range = speed * speed * Math.sin(2 * radians) / gravity
  const pointAt = (progress: number) => {
    const time = progress * flightTime
    return {
      x: 66 + speed * Math.cos(radians) * time * 7.2,
      y: 242 - (speed * Math.sin(radians) * time - gravity * time * time / 2) * 5,
      vy: speed * Math.sin(radians) - gravity * time,
    }
  }
  const points = Array.from({ length: 61 }, (_, index) => pointAt(index / 60)).map(({ x, y }) => `${x},${y}`).join(' ')
  const ball = pointAt(phase)
  const vx = speed * Math.cos(radians)
  return <MathVisualFrame
    title={`${topicTitle}：两个分运动共享同一时间`}
    summary="改变抛射角并播放运动，水平分运动保持匀速，竖直分运动只受重力；轨迹上的每一点都来自同一时刻的两组坐标。"
    controls={<><MathRange label="抛射角 θ" value={angle} min={20} max={70} step={5} output={`${angle}°`} onChange={setAngle} /><MathRange label="过程 t/T" value={phase} min={0} max={1} step={0.01} output={`${Math.round(phase * 100)}%`} onChange={setPhase} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>最高点只满足竖直分速度为零，水平分速度仍为 <code>v₀cosθ</code>；射程公式要求落点与抛出点等高且忽略空气阻力。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}抛体轨迹，抛射角${angle}度，射程${range.toFixed(1)}米`}>
      <title>{topicTitle}抛体运动</title><desc>小球沿抛物线飞行，当前位置同时标出水平速度和竖直速度分量。</desc>
      <line className="science-axis" x1="48" y1="242" x2="602" y2="242" /><line className="science-axis" x1="66" y1="254" x2="66" y2="32" />
      <polyline className="science-trajectory" points={points} /><circle className="science-dot" cx={ball.x} cy={ball.y} r="11" />
      <line className="science-vector" x1={ball.x} y1={ball.y} x2={ball.x + vx * 2.2} y2={ball.y} /><line className="science-force" x1={ball.x} y1={ball.y} x2={ball.x} y2={ball.y - ball.vy * 2.2} />
      <text className="science-label" x={clamp(ball.x + 10, 76, 548)} y={clamp(ball.y - 16, 28, 270)}>vᵧ={ball.vy.toFixed(1)}</text>
      <text className="science-label" x="80" y="282">T={flightTime.toFixed(2)} s</text><text className="science-label" x="444" y="282">R={range.toFixed(1)} m</text>
    </svg>
  </MathVisualFrame>
}

export function PhysicsForceVisual({ topicTitle }: { topicTitle: string }) {
  const [angle, setAngle] = useState(28)
  const [friction, setFriction] = useState(0.25)
  const mass = 2
  const gravity = 10
  const radians = angle * Math.PI / 180
  const downhill = mass * gravity * Math.sin(radians)
  const normal = mass * gravity * Math.cos(radians)
  const frictionLimit = friction * normal
  const acceleration = Math.max(0, (downhill - frictionLimit) / mass)
  const endY = 244 - 300 * Math.tan(radians)
  const blockX = 322
  const blockY = 244 - (blockX - 90) * Math.tan(radians)
  const state = downhill <= frictionLimit ? '静摩擦可维持平衡' : `沿斜面下滑，a=${acceleration.toFixed(2)} m/s²`
  return <MathVisualFrame
    title={`${topicTitle}：从受力图到合力方程`}
    summary="隔离斜面上的物块，比较重力沿斜面的分量与最大静摩擦力。角度或摩擦因数改变时，临界状态和加速度同步更新。"
    controls={<><MathRange label="斜面角 θ" value={angle} min={5} max={35} step={1} output={`${angle}°`} onChange={setAngle} /><MathRange label="摩擦因数 μ" value={friction} min={0} max={0.6} step={0.05} output={friction.toFixed(2)} onChange={setFriction} /></>}
    takeaway={<>受力图只画物块真正受到的力；“向心力”“下滑力”不是额外新力。临界平衡满足 <code>mgsinθ=μmgcosθ</code>。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}斜面受力图，${state}`}>
      <title>{topicTitle}斜面受力分析</title><desc>斜面上的物块受到重力、支持力和摩擦力，旁边列出沿斜面方向的分量比较。</desc>
      <path className="science-ramp" d={`M 66 244 H 520 L 390 ${endY} Z`} />
      <g transform={`translate(${blockX} ${blockY}) rotate(${-angle})`}><rect className="science-block" x="-28" y="-38" width="56" height="38" rx="4" /></g>
      <line className="science-force" x1={blockX} y1={blockY - 20} x2={blockX} y2={blockY + 58} /><text className="science-label" x={blockX + 10} y={blockY + 54}>mg</text>
      <line className="science-vector" x1={blockX} y1={blockY - 20} x2={blockX - 46 * Math.sin(radians)} y2={blockY - 20 - 46 * Math.cos(radians)} /><text className="science-label" x={blockX - 72} y={blockY - 38}>N</text>
      <line className="science-friction" x1={blockX} y1={blockY - 8} x2={blockX + 54 * Math.cos(radians)} y2={blockY - 8 - 54 * Math.sin(radians)} /><text className="science-label" x={blockX + 52} y={blockY - 30}>f</text>
      <rect className="science-meter" x="58" y="38" width="214" height="78" rx="4" /><text className="science-meter-label" x="74" y="65">沿斜面向下 / 摩擦上限</text><text className="science-meter-value" x="74" y="94">{downhill.toFixed(1)} N / {frictionLimit.toFixed(1)} N</text>
      <text className="science-label" x="58" y="278">{state}</text>
    </svg>
  </MathVisualFrame>
}

export function PhysicsEnergyVisual({ topicTitle }: { topicTitle: string }) {
  const [progress, setProgress] = useState(0.45)
  const [loss, setLoss] = useState(18)
  const potential = 100 * (1 - progress)
  const thermal = loss * progress
  const kinetic = Math.max(0, 100 - potential - thermal)
  const x = 126 + progress * 330
  const y = 62 + progress * 164
  const bars = [
    { label: '重力势能', value: potential, className: 'science-energy-potential' },
    { label: '动能', value: kinetic, className: 'science-energy-kinetic' },
    { label: '内能', value: thermal, className: 'science-energy-thermal' },
  ]
  return <MathVisualFrame
    title={`${topicTitle}：能量去向逐项对账`}
    summary="滑块从斜面高处下行，重力势能减少；其中一部分转化为动能，摩擦耗散的部分进入物块与斜面的内能，总量始终保持100%。"
    controls={<><MathRange label="运动进程" value={progress} min={0} max={1} step={0.01} output={`${Math.round(progress * 100)}%`} onChange={setProgress} /><MathRange label="全程耗散比例" value={loss} min={0} max={45} step={5} output={`${loss}%`} onChange={setLoss} /></>}
    takeaway={<>机械能不守恒不等于总能量不守恒。先明确系统，再写 <code>Eₚ+Eₖ+E内=常量</code>，摩擦生热使用相对滑程。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}能量流图，势能${potential.toFixed(0)}%，动能${kinetic.toFixed(0)}%，内能${thermal.toFixed(0)}%`}>
      <title>{topicTitle}能量转化</title><desc>物块沿斜面下降，右侧三段能量条显示势能、动能和内能之和保持不变。</desc>
      <path className="science-ramp" d="M 76 236 H 492 L 104 42 Z" /><circle className="science-dot" cx={x} cy={y} r="13" />
      {bars.map((bar, index) => <g key={bar.label}><text className="science-label" x="500" y={76 + index * 66}>{bar.label}</text><rect className="science-bar-track" x="500" y={88 + index * 66} width="112" height="20" rx="3" /><rect className={bar.className} x="500" y={88 + index * 66} width={bar.value * 1.12} height="20" rx="3" /><text className="science-label" x="610" y={76 + index * 66} textAnchor="end">{bar.value.toFixed(0)}%</text></g>)}
      <text className="science-label" x="72" y="278">总能量 = 100%</text>
    </svg>
  </MathVisualFrame>
}

export function PhysicsMomentumVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, setValue: setPhase, playing, setPlaying } = useTicker()
  const [mass, setMass] = useState(1)
  const [collision, setCollision] = useState<'弹性碰撞' | '完全非弹性'>('弹性碰撞')
  const secondMass = 2
  const initialVelocity = 4
  const elastic = collision === '弹性碰撞'
  const v1 = elastic ? (mass - secondMass) / (mass + secondMass) * initialVelocity : mass / (mass + secondMass) * initialVelocity
  const v2 = elastic ? 2 * mass / (mass + secondMass) * initialVelocity : v1
  const initialEnergy = mass * initialVelocity * initialVelocity / 2
  const finalEnergy = mass * v1 * v1 / 2 + secondMass * v2 * v2 / 2
  const before = phase < 0.5
  const preProgress = Math.min(1, phase * 2)
  const postProgress = Math.max(0, (phase - 0.5) * 2)
  const cart1X = before ? 92 + preProgress * 230 : 322 + v1 * 24 * postProgress
  const cart2X = before ? 402 : 402 + v2 * 24 * postProgress
  return <MathVisualFrame
    title={`${topicTitle}：系统动量与碰撞类型`}
    summary="第一辆小车撞向静止小车。改变质量和碰撞类型，观察碰后速度；两车系统动量守恒，但只有弹性碰撞还保持总动能。"
    controls={<><MathRange label="小车1质量 m₁" value={mass} min={1} max={4} step={1} output={`${mass} kg`} onChange={setMass} /><MathChoices label="碰撞类型" value={collision} choices={[{ value: '弹性碰撞', label: '弹性碰撞' }, { value: '完全非弹性', label: '粘在一起' }]} onChange={(value) => setCollision(value as typeof collision)} /><MathRange label="碰撞进程" value={phase} min={0} max={1} step={0.01} output={`${Math.round(phase * 100)}%`} onChange={setPhase} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>先选系统与正方向，再写 <code>Σp初=Σp末</code>。动量守恒来自外力冲量可忽略，不能据此自动推出动能守恒。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${collision}，碰后速度${v1.toFixed(2)}和${v2.toFixed(2)}米每秒`}>
      <title>{topicTitle}碰撞过程</title><desc>两辆小车从碰撞前运动到碰撞后，读数给出系统动量和动能损失。</desc>
      <line className="science-axis" x1="42" y1="208" x2="598" y2="208" />
      <g transform={`translate(${cart1X} 166)`}><rect className="science-cart science-cart-a" x="-34" y="-30" width="68" height="38" rx="4" /><circle className="science-wheel" cx="-20" cy="14" r="8" /><circle className="science-wheel" cx="20" cy="14" r="8" /></g>
      <g transform={`translate(${cart2X} 166)`}><rect className="science-cart science-cart-b" x="-34" y="-30" width="68" height="38" rx="4" /><circle className="science-wheel" cx="-20" cy="14" r="8" /><circle className="science-wheel" cx="20" cy="14" r="8" /></g>
      <rect className="science-meter" x="54" y="34" width="236" height="72" rx="4" /><text className="science-meter-label" x="70" y="61">系统动量（碰前 = 碰后）</text><text className="science-meter-value" x="70" y="88">{(mass * initialVelocity).toFixed(1)} kg·m/s</text>
      <rect className="science-meter science-meter-alt" x="312" y="34" width="272" height="72" rx="4" /><text className="science-meter-label" x="328" y="61">机械能损失</text><text className="science-meter-value" x="328" y="88">{Math.max(0, initialEnergy - finalEnergy).toFixed(1)} J</text>
      <text className="science-label" x="54" y="268">v₁′={v1.toFixed(2)} m/s</text><text className="science-label" x="390" y="268">v₂′={v2.toFixed(2)} m/s</text>
    </svg>
  </MathVisualFrame>
}

export function PhysicsOscillationVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, setValue: setPhase, playing, setPlaying } = useTicker()
  const [amplitude, setAmplitude] = useState(70)
  const angle = phase * Math.PI * 2
  const displacement = amplitude * Math.cos(angle)
  const velocityRatio = -Math.sin(angle)
  const massX = 320 + displacement
  const springPoints = Array.from({ length: 15 }, (_, index) => {
    const x = 62 + (massX - 92) * index / 14
    const y = index === 0 || index === 14 ? 150 : 150 + (index % 2 ? -13 : 13)
    return `${x},${y}`
  }).join(' ')
  const potential = Math.cos(angle) ** 2
  const kinetic = 1 - potential
  return <MathVisualFrame
    title={`${topicTitle}：相位、回复力与能量同步`}
    summary="播放弹簧振子，位移、速度和加速度在同一相位上变化。最大位移处速度为零而回复力最大，平衡位置则相反。"
    controls={<><MathRange label="振幅 A" value={amplitude} min={35} max={100} step={5} output={`${amplitude} mm`} onChange={setAmplitude} /><MathRange label="相位" value={phase} min={0} max={1} step={0.01} output={`${Math.round(phase * 360)}°`} onChange={setPhase} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>简谐运动满足 <code>a=-ω²x</code>。负号表示回复加速度始终指向平衡位置，不表示振子一直向负方向运动。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}弹簧振子，位移${displacement.toFixed(0)}毫米`}>
      <title>{topicTitle}简谐振动</title><desc>弹簧连接的物块往复运动，位移、速度以及动能和势能比例随相位变化。</desc>
      <rect className="science-wall" x="42" y="92" width="20" height="116" /><polyline className="science-spring" points={springPoints} /><rect className="science-block" x={massX - 30} y="120" width="60" height="60" rx="5" />
      <line className="science-guide" x1="320" y1="92" x2="320" y2="216" /><line className="science-vector" x1={massX} y1="196" x2={massX + velocityRatio * 64} y2="196" />
      <text className="science-label" x="76" y="246">x={displacement.toFixed(0)} mm</text><text className="science-label" x="264" y="246">Eₖ {(kinetic * 100).toFixed(0)}%</text><text className="science-label" x="464" y="246">Eₚ {(potential * 100).toFixed(0)}%</text>
    </svg>
  </MathVisualFrame>
}

export function PhysicsOpticsVisual({ topicTitle }: { topicTitle: string }) {
  const [position, setPosition] = useState<'二倍焦距外' | '一至二倍焦距' | '焦距以内'>('二倍焦距外')
  const focalLength = 80
  const objectDistances = { 二倍焦距外: 200, 一至二倍焦距: 120, 焦距以内: 55 }
  const objectDistance = objectDistances[position]
  const imageDistance = focalLength * objectDistance / (objectDistance - focalLength)
  const objectX = 320 - objectDistance
  const imageX = 320 + imageDistance
  const objectHeight = 28
  const objectTopY = 164 - objectHeight
  const imageHeight = imageDistance / objectDistance * objectHeight
  const imageY = 164 + imageHeight
  const real = imageDistance > 0
  const ray1EndX = real ? imageX : 520
  const ray1EndY = real ? imageY : objectTopY + (ray1EndX - 320) * objectHeight / focalLength
  const centralEndX = real ? imageX : 540
  const centralEndY = real ? imageY : objectTopY + (centralEndX - objectX) * objectHeight / objectDistance
  return <MathVisualFrame
    title={`${topicTitle}：凸透镜三条特殊光线`}
    summary="切换物距区域，平行光经透镜后通过像方焦点，过光心的光近似不偏折；真实光线或反向延长线的交点决定像的位置与性质。"
    controls={<MathChoices label="物体位置" value={position} choices={[{ value: '二倍焦距外', label: 'u > 2f' }, { value: '一至二倍焦距', label: 'f < u < 2f' }, { value: '焦距以内', label: 'u < f' }]} onChange={(value) => setPosition(value as typeof position)} />}
    takeaway={<>薄透镜公式 <code>1/f=1/u+1/v</code> 要配合正负与光路判断；光屏只能承接真实光线会聚形成的实像。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}凸透镜成像，${real ? '实像' : '虚像'}，像距${Math.abs(imageDistance).toFixed(0)}`}>
      <title>{topicTitle}凸透镜光路</title><desc>物体、凸透镜、焦点和两条特殊光线共同确定实像或虚像的位置。</desc>
      <line className="science-axis" x1="42" y1="164" x2="598" y2="164" /><path className="science-lens" d="M 320 44 Q 282 164 320 284 Q 358 164 320 44 Z" />
      {[240, 400].map((x) => <g key={x}><line className="science-tick" x1={x} y1="154" x2={x} y2="174" /><text className="science-label" x={x} y="194" textAnchor="middle">F</text></g>)}
      <line className="science-object" x1={objectX} y1="164" x2={objectX} y2={objectTopY} /><polygon className="science-object-head" points={`${objectX - 7},${objectTopY + 8} ${objectX + 7},${objectTopY + 8} ${objectX},${objectTopY - 5}`} />
      <path className="science-ray" d={`M ${objectX} ${objectTopY} H 320 L ${ray1EndX} ${ray1EndY}`} /><line className="science-ray" x1={objectX} y1={objectTopY} x2={centralEndX} y2={centralEndY} />
      {!real && <><line className="science-ray-extension" x1="320" y1={objectTopY} x2={imageX} y2={imageY} /><line className="science-ray-extension" x1="320" y1="164" x2={imageX} y2={imageY} /></>}
      <line className={real ? 'science-image' : 'science-image science-image-virtual'} x1={imageX} y1="164" x2={imageX} y2={imageY} />
      <text className="science-label" x="46" y="282">{real ? (Math.abs(imageDistance / objectDistance) > 1 ? '倒立、放大的实像' : '倒立、缩小的实像') : '正立、放大的虚像'}</text>
    </svg>
  </MathVisualFrame>
}

export function PhysicsOrbitVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, setValue: setPhase, playing, setPlaying } = useTicker()
  const [radius, setRadius] = useState(125)
  const angle = phase * Math.PI * 2
  const x = 320 + radius * Math.cos(angle)
  const y = 150 + radius * 0.62 * Math.sin(angle)
  const speedRatio = Math.sqrt(125 / radius)
  const periodRatio = (radius / 125) ** 1.5
  const tangentX = -Math.sin(angle) * 54
  const tangentY = Math.cos(angle) * 34
  return <MathVisualFrame
    title={`${topicTitle}：轨道半径联动速度与周期`}
    summary="卫星绕同一中心天体作圆轨道运动。增大轨道半径，万有引力减弱，所需圆轨道速度降低，而运行周期按r的3/2次方增长。"
    controls={<><MathRange label="轨道半径 r" value={radius} min={85} max={175} step={5} output={`${radius} ×10³ km`} onChange={setRadius} /><MathRange label="轨道相位" value={phase} min={0} max={1} step={0.01} output={`${Math.round(phase * 360)}°`} onChange={setPhase} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>圆轨道满足 <code>GMm/r²=mv²/r</code>。半径增大时速度变小、周期变长；短时点火后的转移轨道不能直接当作圆轨道。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}卫星轨道，速度比${speedRatio.toFixed(2)}，周期比${periodRatio.toFixed(2)}`}>
      <title>{topicTitle}圆轨道运动</title><desc>卫星沿椭圆透视的圆轨道运动，速度沿切线，万有引力指向中心天体。</desc>
      <ellipse className="science-orbit" cx="320" cy="150" rx={radius} ry={radius * 0.62} /><circle className="science-planet" cx="320" cy="150" r="34" /><circle className="science-satellite" cx={x} cy={y} r="11" />
      <line className="science-vector" x1={x} y1={y} x2={x + tangentX} y2={y + tangentY} /><line className="science-force" x1={x} y1={y} x2={x + (320 - x) * 0.35} y2={y + (150 - y) * 0.35} />
      <text className="science-label" x="54" y="64">v/v₀={speedRatio.toFixed(2)}</text><text className="science-label" x="472" y="64">T/T₀={periodRatio.toFixed(2)}</text>
    </svg>
  </MathVisualFrame>
}

export function PhysicsElectrostaticVisual({ topicTitle }: { topicTitle: string }) {
  const [configuration, setConfiguration] = useState<'异号电荷' | '同号电荷'>('异号电荷')
  const [probeX, setProbeX] = useState(320)
  const q1 = 1
  const q2 = configuration === '异号电荷' ? -1 : 1
  const field = q1 * Math.sign(probeX - 210) / Math.max(22, Math.abs(probeX - 210)) ** 2 + q2 * Math.sign(probeX - 430) / Math.max(22, Math.abs(probeX - 430)) ** 2
  const direction = Math.abs(field) < 0.00001 ? '合场强接近零' : field > 0 ? '合场强向右' : '合场强向左'
  const arrowLength = clamp(Math.abs(field) * 900000, 0, 86) * Math.sign(field)
  return <MathVisualFrame
    title={`${topicTitle}：场强按矢量叠加`}
    summary="移动正检验电荷，分别判断两个点电荷在该处产生的场强方向和大小，再作矢量和；同号电荷中点可抵消，异号电荷之间方向相同。"
    controls={<><MathChoices label="源电荷组合" value={configuration} choices={[{ value: '异号电荷', label: '+Q 与 −Q' }, { value: '同号电荷', label: '+Q 与 +Q' }]} onChange={(value) => setConfiguration(value as typeof configuration)} /><MathRange label="检验位置 x" value={probeX} min={260} max={380} step={5} output={`${probeX - 320}`} onChange={setProbeX} /></>}
    takeaway={<>场强是源电荷建立的场的性质，放入检验电荷只是探测。叠加时先逐个确定方向，再把各场强按矢量相加。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}点电荷电场，${direction}`}>
      <title>{topicTitle}电场叠加</title><desc>两个源电荷与可移动检验点位于同一直线上，箭头显示检验点处的合场强。</desc>
      <line className="science-axis" x1="64" y1="154" x2="576" y2="154" />
      <circle className="science-charge science-charge-positive" cx="210" cy="154" r="28" /><text className="science-charge-label" x="210" y="162" textAnchor="middle">+Q</text>
      <circle className={q2 > 0 ? 'science-charge science-charge-positive' : 'science-charge science-charge-negative'} cx="430" cy="154" r="28" /><text className="science-charge-label" x="430" y="162" textAnchor="middle">{q2 > 0 ? '+Q' : '−Q'}</text>
      <circle className="science-probe" cx={probeX} cy="154" r="10" /><line className="science-vector" x1={probeX} y1="112" x2={probeX + arrowLength} y2="112" />
      <text className="science-label" x={clamp(probeX - 56, 68, 470)} y="88">{direction}</text>
      <path className="science-field-line" d={configuration === '异号电荷' ? 'M 238 126 C 300 60 352 60 402 126 M 238 182 C 300 248 352 248 402 182' : 'M 182 128 C 100 80 92 46 80 34 M 458 128 C 540 80 548 46 560 34 M 182 180 C 100 224 92 252 80 272 M 458 180 C 540 224 548 252 560 272'} />
      <text className="science-label" x="62" y="278">正检验电荷受力方向与 E 同向</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryIonVisual({ topicTitle }: { topicTitle: string }) {
  const [mixing, setMixing] = useState(0)
  const precipitate = Math.round(mixing * 6)
  const freeReactive = 6 - precipitate
  const leftIons = useMemo(() => Array.from({ length: 6 }, (_, index) => ({ x: 104 + (index % 3) * 45, y: 102 + Math.floor(index / 3) * 55 })), [])
  const rightIons = useMemo(() => Array.from({ length: 6 }, (_, index) => ({ x: 424 + (index % 3) * 45, y: 102 + Math.floor(index / 3) * 55 })), [])
  return <MathVisualFrame
    title={`${topicTitle}：反应微粒与旁观离子`}
    summary="把含Ba²⁺和SO₄²⁻的两份溶液逐步混合。真正减少的是参与沉淀的离子，Na⁺和Cl⁻仍分散在水中，因此净离子方程式只保留发生变化的微粒。"
    controls={<MathRange label="混合进程" value={mixing} min={0} max={1} step={0.1} output={`${Math.round(mixing * 100)}%`} onChange={setMixing} />}
    takeaway={<>离子方程式先拆强电解质，再删除反应前后相同的旁观离子；沉淀、气体、弱电解质和氧化物不能随意拆写。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}离子反应，生成${precipitate}组沉淀`}>
      <title>{topicTitle}离子反应微粒变化</title><desc>两个烧杯中的反应离子随混合减少，底部沉淀增加，旁观离子数量不变。</desc>
      <rect className="science-beaker" x="58" y="54" width="218" height="176" rx="7" /><rect className="science-beaker" x="364" y="54" width="218" height="176" rx="7" />
      {leftIons.slice(0, freeReactive).map((ion, index) => <g key={`ba-${index}`}><circle className="science-ion science-ion-a" cx={ion.x} cy={ion.y} r="13" /><text className="science-ion-label" x={ion.x} y={ion.y + 5} textAnchor="middle">Ba</text></g>)}
      {rightIons.slice(0, freeReactive).map((ion, index) => <g key={`so4-${index}`}><circle className="science-ion science-ion-b" cx={ion.x} cy={ion.y} r="15" /><text className="science-ion-label" x={ion.x} y={ion.y + 5} textAnchor="middle">SO₄</text></g>)}
      {Array.from({ length: 4 }, (_, index) => <g key={`spectator-${index}`}><circle className="science-spectator" cx={102 + index * 42} cy="202" r="9" /><circle className="science-spectator" cx={408 + index * 42} cy="202" r="9" /></g>)}
      {Array.from({ length: precipitate }, (_, index) => <rect key={index} className="science-precipitate" x={252 + (index % 3) * 45} y={224 - Math.floor(index / 3) * 24} width="38" height="18" rx="5" />)}
      <path className="science-process-arrow" d="M 284 136 H 350" /><text className="science-label" x="276" y="112">混合</text>
      <text className="science-label" x="54" y="278">Ba²⁺ + SO₄²⁻ → BaSO₄↓</text><text className="science-label" x="432" y="278">Na⁺、Cl⁻旁观</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryRedoxVisual({ topicTitle }: { topicTitle: string }) {
  const { value: progress, setValue: setProgress, playing, setPlaying } = useTicker(0, 0.02, 1)
  const transferred = Math.round(progress * 2)
  const electronX = 188 + progress * 252
  return <MathVisualFrame
    title={`${topicTitle}：电子转移与氧化数变化`}
    summary="铁原子失去电子成为Fe²⁺，Cu²⁺得到电子析出铜。播放电子转移，氧化、还原和氧化剂、还原剂四个角色可由同一条电子流确定。"
    controls={<><MathRange label="反应进程" value={progress} min={0} max={1} step={0.01} output={`${Math.round(progress * 100)}%`} onChange={setProgress} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>化合价升高者失电子、被氧化，是还原剂；化合价降低者得电子、被还原，是氧化剂。配平时得失电子总数必须相等。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}氧化还原电子转移，已转移${transferred}个电子`}>
      <title>{topicTitle}电子转移</title><desc>铁从零价升到正二价，铜从正二价降到零价，电子由铁转移给铜离子。</desc>
      <circle className="science-redox-donor" cx="150" cy="144" r="48" /><text className="science-charge-label" x="150" y="151" textAnchor="middle">Fe⁰</text>
      <circle className="science-redox-acceptor" cx="490" cy="144" r="48" /><text className="science-charge-label" x="490" y="151" textAnchor="middle">Cu²⁺</text>
      <line className="science-electron-path" x1="206" y1="144" x2="434" y2="144" />
      {Array.from({ length: 2 }, (_, index) => <circle key={index} className={index < transferred ? 'science-electron' : 'science-electron science-electron-pending'} cx={electronX - index * 34} cy={132 + index * 24} r="7" />)}
      <text className="science-label" x="84" y="226">Fe⁰ − 2e⁻ → Fe²⁺</text><text className="science-label" x="362" y="226">Cu²⁺ + 2e⁻ → Cu⁰</text>
      <text className="science-label" x="70" y="270">还原剂：失电子，被氧化</text><text className="science-label" x="356" y="270">氧化剂：得电子，被还原</text>
    </svg>
  </MathVisualFrame>
}

const periodicData = {
  原子半径: { values: [186, 160, 143, 118, 110, 103, 99], unit: 'pm', conclusion: '同周期总体减小' },
  第一电离能: { values: [496, 738, 578, 787, 1012, 1000, 1251], unit: 'kJ/mol', conclusion: '总体增大，但有局部例外' },
  电负性: { values: [0.93, 1.31, 1.61, 1.90, 2.19, 2.58, 3.16], unit: '', conclusion: '同周期总体增大' },
} as const

export function ChemistryPeriodicVisual({ topicTitle }: { topicTitle: string }) {
  const [trend, setTrend] = useState<keyof typeof periodicData>('原子半径')
  const elements = ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl']
  const data = periodicData[trend]
  const min = Math.min(...data.values)
  const max = Math.max(...data.values)
  const points = data.values.map((value, index) => `${76 + index * 80},${226 - (value - min) / Math.max(max - min, 1) * 132}`).join(' ')
  return <MathVisualFrame
    title={`${topicTitle}：把周期趋势还原为结构变化`}
    summary="切换第三周期的原子半径、第一电离能和电负性。总体趋势来自有效核电荷增强，局部折点则提醒我们还要检查能级和电子排布。"
    controls={<MathChoices label="比较量" value={trend} choices={(Object.keys(periodicData) as Array<keyof typeof periodicData>).map((value) => ({ value, label: value }))} onChange={(value) => setTrend(value as keyof typeof periodicData)} />}
    takeaway={<>周期趋势不是无条件箭头。比较微粒前先判断电子层数和电子总数，再讨论有效核电荷、屏蔽与半满或全满排布。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${trend}变化，${data.conclusion}`}>
      <title>{topicTitle}元素周期趋势</title><desc>第三周期七种元素的所选性质以折线和数值表示，局部例外保持可见。</desc>
      <line className="science-axis" x1="58" y1="242" x2="584" y2="242" /><polyline className="science-trend-line" points={points} />
      {data.values.map((value, index) => { const [, y] = points.split(' ')[index].split(','); return <g key={elements[index]}><circle className="science-trend-point" cx={76 + index * 80} cy={Number(y)} r="7" /><text className="science-label" x={76 + index * 80} y="268" textAnchor="middle">{elements[index]}</text><text className="science-chart-value" x={76 + index * 80} y={Number(y) - 14} textAnchor="middle">{value}</text></g> })}
      <text className="science-label" x="58" y="42">{trend} {data.unit}</text><text className="science-label" x="582" y="42" textAnchor="end">{data.conclusion}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryThermochemistryVisual({ topicTitle }: { topicTitle: string }) {
  const [reaction, setReaction] = useState<'放热反应' | '吸热反应'>('放热反应')
  const [catalyst, setCatalyst] = useState<'无催化剂' | '有催化剂'>('无催化剂')
  const [progress, setProgress] = useState(0.35)
  const reactantY = 190
  const productY = reaction === '放热反应' ? 238 : 132
  const peakY = catalyst === '有催化剂' ? 104 : 54
  const pointOnCurve = (value: number) => {
    if (value <= 0.5) {
      const t = value * 2
      return {
        x: (1 - t) ** 2 * 76 + 2 * (1 - t) * t * 222 + t ** 2 * 320,
        y: (1 - t) ** 2 * reactantY + 2 * (1 - t) * t * peakY + t ** 2 * peakY,
      }
    }
    const t = (value - 0.5) * 2
    return {
      x: (1 - t) ** 2 * 320 + 2 * (1 - t) * t * 424 + t ** 2 * 564,
      y: (1 - t) ** 2 * peakY + 2 * (1 - t) * t * peakY + t ** 2 * productY,
    }
  }
  const marker = pointOnCurve(progress)
  const deltaH = reaction === '放热反应' ? -120 : 80
  return <MathVisualFrame
    title={`${topicTitle}：反应焓与活化能分开判断`}
    summary="切换吸热或放热以及催化路径。催化剂降低能垒，却不改变反应物、生成物的能量差，因此ΔH和化学平衡常数不会因催化剂改变。"
    controls={<><MathChoices label="反应类型" value={reaction} choices={[{ value: '放热反应', label: '放热' }, { value: '吸热反应', label: '吸热' }]} onChange={(value) => setReaction(value as typeof reaction)} /><MathChoices label="反应路径" value={catalyst} choices={[{ value: '无催化剂', label: '无催化剂' }, { value: '有催化剂', label: '有催化剂' }]} onChange={(value) => setCatalyst(value as typeof catalyst)} /><MathRange label="反应进程" value={progress} min={0} max={1} step={0.01} output={`${Math.round(progress * 100)}%`} onChange={setProgress} /></>}
    takeaway={<>断键吸能、成键放能；<code>ΔH=H生成物−H反应物</code>。催化剂只改变路径和活化能，不改变始末态。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${reaction}${catalyst}能量曲线，焓变${deltaH}千焦每摩尔`}>
      <title>{topicTitle}反应能量曲线</title><desc>反应物经过活化能峰到达生成物，催化路径峰值更低而始末能量不变。</desc>
      <line className="science-axis" x1="58" y1="258" x2="586" y2="258" /><line className="science-axis" x1="58" y1="258" x2="58" y2="30" />
      <path className="science-reaction-curve" d={`M 76 ${reactantY} Q 222 ${peakY} 320 ${peakY} Q 424 ${peakY} 564 ${productY}`} /><circle className="science-collision" cx={marker.x} cy={marker.y} r="10" />
      <line className="science-energy-level" x1="76" y1={reactantY} x2="154" y2={reactantY} /><line className="science-energy-level" x1="486" y1={productY} x2="564" y2={productY} />
      <text className="science-label" x="78" y={reactantY - 14}>反应物</text><text className="science-label" x="484" y={productY - 14}>生成物</text><text className="science-label" x="258" y="278">反应进程</text><text className="science-label" x="360" y="46">ΔH={deltaH} kJ/mol</text>
    </svg>
  </MathVisualFrame>
}

const inorganicNetworks = {
  氯: ['Cl⁻', 'Cl₂', 'HClO', 'ClO⁻'],
  硫: ['S²⁻', 'S', 'SO₂', 'SO₄²⁻'],
  氮: ['NH₃', 'N₂', 'NO', 'NO₃⁻'],
  铁: ['Fe', 'Fe²⁺', 'Fe³⁺', 'Fe(OH)₃'],
} as const

export function ChemistryInorganicVisual({ topicTitle }: { topicTitle: string }) {
  const [element, setElement] = useState<keyof typeof inorganicNetworks>('硫')
  const [step, setStep] = useState(1)
  const nodes = inorganicNetworks[element]
  return <MathVisualFrame
    title={`${topicTitle}：按价态组织无机转化网络`}
    summary="选择氯、硫、氮或铁，把零散反应放到同一条价态链。沿箭头向右通常是氧化，向左通常是还原；酸碱、沉淀等非氧化还原转化另看微粒条件。"
    controls={<><MathChoices label="元素主线" value={element} choices={(Object.keys(inorganicNetworks) as Array<keyof typeof inorganicNetworks>).map((value) => ({ value, label: value }))} onChange={(value) => setElement(value as keyof typeof inorganicNetworks)} /><MathRange label="当前转化" value={step} min={0} max={2} step={1} output={`${nodes[step]} → ${nodes[step + 1]}`} onChange={setStep} /></>}
    takeaway={<>元素化合物复习应同时标“价态、物质类别、反应条件和证据”。能转化不等于一步直接反应，试剂与介质决定实际路径。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${element}元素转化网络，当前${nodes[step]}转化为${nodes[step + 1]}`}>
      <title>{topicTitle}无机价态网络</title><desc>同一元素的四种代表物质按价态或转化顺序排列，当前相邻转化高亮。</desc>
      {nodes.map((node, index) => <g key={node}><circle className={index === step || index === step + 1 ? 'science-network-node science-network-node-active' : 'science-network-node'} cx={92 + index * 152} cy="146" r="46" /><text className="science-label" x={92 + index * 152} y="153" textAnchor="middle">{node}</text>{index < nodes.length - 1 && <><line className={index === step ? 'science-network-link science-network-link-active' : 'science-network-link'} x1={140 + index * 152} y1="132" x2={194 + index * 152} y2="132" /><line className="science-network-link" x1={194 + index * 152} y1="164" x2={140 + index * 152} y2="164" /></>}</g>)}
      <text className="science-label" x="64" y="242">向右：氧化性条件</text><text className="science-label" x="412" y="242">向左：还原性条件</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryCrystalVisual({ topicTitle }: { topicTitle: string }) {
  const [cell, setCell] = useState<'简单立方' | '体心立方' | '面心立方'>('面心立方')
  const counts = { 简单立方: 1, 体心立方: 2, 面心立方: 4 }
  const corners = [[178, 82], [390, 82], [178, 224], [390, 224], [246, 42], [458, 42], [246, 184], [458, 184]]
  const faceCenters = [[284, 82], [352, 184], [212, 133], [424, 133], [318, 42], [318, 224]]
  return <MathVisualFrame
    title={`${topicTitle}：共享份额决定晶胞计数`}
    summary="切换简单、体心和面心立方晶胞。图中画出的球并不都完整属于一个晶胞，必须按顶点1/8、面心1/2、体心1计入。"
    controls={<MathChoices label="晶胞类型" value={cell} choices={[{ value: '简单立方', label: '简单立方' }, { value: '体心立方', label: '体心立方' }, { value: '面心立方', label: '面心立方' }]} onChange={(value) => setCell(value as typeof cell)} />}
    takeaway={<>计数先标位置，再乘共享份额。密度题继续用 <code>ρ=ZM/(Nₐa³)</code>，其中Z是一个晶胞中有效粒子数。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${cell}晶胞，有效粒子数${counts[cell]}`}>
      <title>{topicTitle}晶胞计数</title><desc>透视立方体标出顶点、体心或面心粒子，并给出共享份额计算。</desc>
      <path className="science-cell" d="M 178 82 H 390 V 224 H 178 Z M 246 42 H 458 V 184 H 246 Z M 178 82 L 246 42 M 390 82 L 458 42 M 390 224 L 458 184 M 178 224 L 246 184" />
      {corners.map(([x, y], index) => <circle key={`corner-${index}`} className="science-crystal-particle" cx={x} cy={y} r="12" />)}
      {cell === '体心立方' && <circle className="science-crystal-particle science-crystal-center" cx="318" cy="133" r="16" />}
      {cell === '面心立方' && faceCenters.map(([x, y], index) => <circle key={`face-${index}`} className="science-crystal-particle science-crystal-face" cx={x} cy={y} r="14" />)}
      <rect className="science-meter" x="472" y="76" width="148" height="108" rx="4" /><text className="science-meter-label" x="546" y="104" textAnchor="middle">有效粒子数 Z</text><text className="science-cell-count" x="546" y="154" textAnchor="middle">{counts[cell]}</text>
      <text className="science-label" x="68" y="270">{cell === '简单立方' ? '8×1/8=1' : cell === '体心立方' ? '8×1/8+1=2' : '8×1/8+6×1/2=4'}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryPrecipitationVisual({ topicTitle }: { topicTitle: string }) {
  const [ratio, setRatio] = useState(1)
  const precipitate = Math.round(Math.max(0, ratio - 1) * 8)
  const state = ratio < 1 ? '未饱和，可继续溶解' : ratio === 1 ? '饱和临界' : '过饱和，生成沉淀'
  const freeIons = Math.max(4, 12 - precipitate)
  return <MathVisualFrame
    title={`${topicTitle}：用 Qsp 与 Ksp 判断方向`}
    summary="调节离子积与溶度积之比。Qsp小于Ksp时未达到饱和，等于时处在沉淀临界，大于时体系通过析出固体降低自由离子浓度。"
    controls={<MathRange label="Qsp / Ksp" value={ratio} min={0.2} max={2} step={0.1} output={ratio.toFixed(1)} onChange={setRatio} />}
    takeaway={<>比较必须使用混合后的自由离子浓度；刚出现沉淀的边界是 <code>Qsp=Ksp</code>，不是相关离子已经完全反应。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}沉淀平衡，${state}`}>
      <title>{topicTitle}沉淀生成与溶解</title><desc>烧杯中自由离子和底部固体数量随离子积与溶度积比值变化。</desc>
      <rect className="science-beaker" x="120" y="38" width="400" height="210" rx="8" />
      {Array.from({ length: freeIons }, (_, index) => <circle key={index} className={index % 2 ? 'science-ion science-ion-b' : 'science-ion science-ion-a'} cx={162 + (index % 6) * 63} cy={76 + Math.floor(index / 6) * 64} r="13" />)}
      {Array.from({ length: precipitate }, (_, index) => <rect key={index} className="science-precipitate" x={220 + (index % 5) * 42} y={224 - Math.floor(index / 5) * 22} width="34" height="16" rx="4" />)}
      <line className="science-equilibrium-arrow" x1="268" y1="176" x2="372" y2="176" /><text className="science-label" x="274" y="164">溶解 ⇌ 沉淀</text>
      <text className="science-label" x="70" y="282">{state}</text><text className="science-label" x="486" y="282">Q/K={ratio.toFixed(1)}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistrySpectrumVisual({ topicTitle }: { topicTitle: string }) {
  const [evidence, setEvidence] = useState<'质谱' | '红外' | '核磁'>('红外')
  const peaks = evidence === '质谱'
    ? [{ x: 100, h: 48, label: '31' }, { x: 206, h: 94, label: '45' }, { x: 344, h: 58, label: '46' }, { x: 500, h: 124, label: 'M⁺' }]
    : evidence === '核磁'
      ? [{ x: 126, h: 88, label: '3H' }, { x: 306, h: 124, label: '2H' }, { x: 486, h: 54, label: '1H' }]
      : []
  return <MathVisualFrame
    title={`${topicTitle}：多种谱图证据相互闭合`}
    summary="切换质谱、红外和核磁证据。质谱约束相对分子质量，红外识别官能团，核磁给化学环境数和氢数比例；任何单张谱图都不应孤立定结构。"
    controls={<MathChoices label="证据类型" value={evidence} choices={[{ value: '质谱', label: '质谱' }, { value: '红外', label: '红外' }, { value: '核磁', label: '¹H NMR' }]} onChange={(value) => setEvidence(value as typeof evidence)} />}
    takeaway={<>结构鉴定的顺序是“分子式与不饱和度→官能团→氢环境→全部证据复核”，最高峰不一定就是分子离子峰。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${evidence}示意谱图`}>
      <title>{topicTitle}{evidence}证据</title><desc>{evidence === '红外' ? '红外透过率曲线在羟基和碳氧键区域出现特征吸收。' : `${evidence}谱图显示多组特征峰及其标签。`}</desc>
      <line className="science-axis" x1="58" y1="242" x2="590" y2="242" /><line className="science-axis" x1="58" y1="242" x2="58" y2="38" />
      {evidence === '红外'
        ? <><path className="science-spectrum-line" d="M 68 70 C 110 68 122 148 174 178 C 220 202 244 80 318 78 C 370 76 398 164 430 194 C 466 224 484 86 574 82" /><text className="science-label" x="110" y="214">O—H 宽峰</text><text className="science-label" x="402" y="224">C—O</text></>
        : peaks.map((peak) => <g key={peak.x}><line className="science-spectrum-peak" x1={peak.x} y1="242" x2={peak.x} y2={242 - peak.h} /><text className="science-label" x={peak.x} y={226 - peak.h} textAnchor="middle">{peak.label}</text></g>)}
      <text className="science-label" x="64" y="278">{evidence === '质谱' ? 'm/z → 相对分子质量与碎片' : evidence === '红外' ? '波数 → 官能团' : '化学位移 → 氢环境与积分比'}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryMaterialsVisual({ topicTitle }: { topicTitle: string }) {
  const [recovery, setRecovery] = useState(45)
  const [route, setRoute] = useState<'线性使用' | '循环利用'>('循环利用')
  const recycled = route === '循环利用' ? recovery : 0
  const waste = 100 - recycled
  return <MathVisualFrame
    title={`${topicTitle}：把性能、资源与环境放进全生命周期`}
    summary="材料评价不能只看制得时的性能。改变回收率并比较线性使用与循环利用，观察原料回流和最终废弃量，进一步结合能耗、毒性与原子经济性作选择。"
    controls={<><MathChoices label="资源路线" value={route} choices={[{ value: '线性使用', label: '开采→使用→废弃' }, { value: '循环利用', label: '回收再利用' }]} onChange={(value) => setRoute(value as typeof route)} /><MathRange label="回收率" value={recovery} min={10} max={90} step={5} output={`${recovery}%`} onChange={setRecovery} /></>}
    takeaway={<>“绿色”是多指标判断：原料是否可再生、原子利用率、能耗、毒性、排放、耐用性和回收路径都需要边界清楚的数据。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${route}，回收${recycled}%，废弃${waste}%`}>
      <title>{topicTitle}材料生命周期</title><desc>原料、制造、使用和回收处置四个阶段相连，循环路线把部分材料返回制造阶段。</desc>
      {['原料', '制造', '使用', '回收/处置'].map((label, index) => <g key={label}><rect className="science-stage" x={48 + index * 145} y="102" width="112" height="66" rx="6" /><text className="science-label" x={104 + index * 145} y="142" textAnchor="middle">{label}</text>{index < 3 && <path className="science-process-arrow" d={`M ${162 + index * 145} 135 h 27`} />}</g>)}
      {route === '循环利用' && <path className="science-recycle-path" d="M 540 178 C 520 252 240 262 210 178" />}
      <rect className="science-bar-track" x="90" y="222" width="460" height="22" rx="3" /><rect className="science-material-recycled" x="90" y="222" width={460 * recycled / 100} height="22" rx="3" /><rect className="science-material-waste" x={90 + 460 * recycled / 100} y="222" width={460 * waste / 100} height="22" rx="3" />
      <text className="science-label" x="90" y="278">回流 {recycled}%</text><text className="science-label" x="550" y="278" textAnchor="end">最终废弃 {waste}%</text>
    </svg>
  </MathVisualFrame>
}
