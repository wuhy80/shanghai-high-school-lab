import { useState } from 'react'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'

function svgPoints(values: ReadonlyArray<{ x: number; y: number }>) {
  return values.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

export function ACWaveVisual({ topicTitle }: { topicTitle: string }) {
  const [peakVoltage, setPeakVoltage] = useState(311)
  const [frequency, setFrequency] = useState(50)
  const [phase, setPhase] = useState(0)
  const rms = peakVoltage / Math.sqrt(2)
  const points = Array.from({ length: 121 }, (_, index) => {
    const x = 58 + index * 4.35
    const angle = index / 120 * Math.PI * 4 * frequency / 50 + phase / 180 * Math.PI
    return { x, y: 150 - 70 * Math.sin(angle) }
  })
  return <MathVisualFrame
    title={`${topicTitle}：峰值、有效值与相位`}
    summary="把正弦式交变电压画成一段完整周期，改变峰值和频率，比较瞬时值与有效值。有效值对应相同电阻上的等效热效应，不能直接当作峰值。"
    controls={<><MathRange label="峰值 Uₘ" value={peakVoltage} min={100} max={400} step={10} output={`${peakVoltage} V`} onChange={setPeakVoltage} /><MathRange label="频率 f" value={frequency} min={25} max={100} step={25} output={`${frequency} Hz`} onChange={setFrequency} /><MathRange label="初相位 φ" value={phase} min={0} max={360} step={15} output={`${phase}°`} onChange={setPhase} /></>}
    takeaway={<>正弦交流满足 <code>u=Uₘsin(ωt+φ)</code>，有效值 <code>U=Uₘ/√2</code>。家庭额定电压和功率计算通常使用有效值，示波器瞬时读数则跟随波形变化。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-ac-rms={rms.toFixed(3)} data-ac-frequency={frequency} aria-label={`${topicTitle}正弦交流波形，峰值${peakVoltage}伏，有效值${rms.toFixed(1)}伏`}>
      <title>{topicTitle}正弦交流波形</title><desc>横轴为时间，纵轴为电压，显示峰值、有效值参考线和相位改变后的正弦波。</desc>
      <line className="science-axis" x1="58" y1="150" x2="582" y2="150" /><line className="science-axis" x1="58" y1="42" x2="58" y2="258" />
      <line className="science-guide" x1="58" y1="80" x2="582" y2="80" /><line className="science-guide" x1="58" y1="220" x2="582" y2="220" />
      <polyline className="science-trend-line" points={svgPoints(points)} />
      <text className="science-label" x="70" y="58">u / V</text><text className="science-label" x="530" y="278">t / ms</text>
      <text className="science-label" x="72" y="76">+Uₘ={peakVoltage} V</text><text className="science-label" x="72" y="238">−Uₘ</text>
      <rect className="science-meter" x="346" y="46" width="216" height="72" rx="4" /><text className="science-meter-label" x="362" y="72">有效值</text><text className="science-meter-value" x="362" y="99">U={rms.toFixed(1)} V · f={frequency} Hz</text>
    </svg>
  </MathVisualFrame>
}

export function EMOscillationVisual({ topicTitle }: { topicTitle: string }) {
  const [inductance, setInductance] = useState(2)
  const [capacitance, setCapacitance] = useState(2)
  const [phase, setPhase] = useState(45)
  const omega = 1 / Math.sqrt(inductance * capacitance)
  const electric = Math.cos(phase / 180 * Math.PI) ** 2
  const magnetic = 1 - electric
  return <MathVisualFrame
    title={`${topicTitle}：电场能与磁场能交替转化`}
    summary="LC 振荡把电容器的电场能和线圈的磁场能周期性交换。调节 L、C 只改变固有角频率，不会凭空增加总能量；真实电路还会有电阻损耗。"
    controls={<><MathRange label="电感 L" value={inductance} min={1} max={4} step={1} output={`${inductance} mH`} onChange={setInductance} /><MathRange label="电容 C" value={capacitance} min={1} max={4} step={1} output={`${capacitance} μF`} onChange={setCapacitance} /><MathRange label="相位 ωt" value={phase} min={0} max={360} step={15} output={`${phase}°`} onChange={setPhase} /></>}
    takeaway={<>理想 LC 振荡满足 <code>ω₀=1/√LC</code>，总能量 <code>E=Eₑ+Eₘ</code> 保持不变。图中相位为 0° 时电容器能量最大，90° 时线圈能量最大。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-lc-frequency={omega.toFixed(5)} data-electric-energy={electric.toFixed(3)} data-magnetic-energy={magnetic.toFixed(3)} aria-label={`${topicTitle}，电场能${(electric * 100).toFixed(0)}%，磁场能${(magnetic * 100).toFixed(0)}%`}>
      <title>{topicTitle}能量交换</title><desc>两根能量条显示电容器电场能和线圈磁场能，总能量归一化为 100%。</desc>
      <text className="science-label" x="58" y="54">电容器电场能 Eₑ</text><rect className="science-bar-track" x="58" y="72" width="524" height="38" rx="5" /><rect className="science-energy-potential" x="58" y="72" width={524 * electric} height="38" rx="5" />
      <text className="science-label" x="58" y="150">线圈磁场能 Eₘ</text><rect className="science-bar-track" x="58" y="168" width="524" height="38" rx="5" /><rect className="science-energy-kinetic" x="58" y="168" width={524 * magnetic} height="38" rx="5" />
      <text className="science-meter-value" x="58" y="250">Eₑ={electric.toFixed(2)} · Eₘ={magnetic.toFixed(2)} · E总=1</text><text className="science-label" x="58" y="278">ω₀ ∝ 1/√(LC) = {omega.toFixed(2)}（归一化）</text>
    </svg>
  </MathVisualFrame>
}

export function HeatEngineVisual({ topicTitle }: { topicTitle: string }) {
  const [hotTemperature, setHotTemperature] = useState(600)
  const [coldTemperature, setColdTemperature] = useState(300)
  const efficiency = Math.max(0, 1 - coldTemperature / hotTemperature)
  const cycle = 'M 150 220 L 210 84 L 470 84 L 530 220 Z'
  return <MathVisualFrame
    title={`${topicTitle}：热机循环的方向与效率上限`}
    summary="在 p-V 图上，顺时针循环表示气体对外净做功。调节高温热源和低温冷源，观察理想可逆热机的效率上限；真实热机还会因摩擦、传热温差和排气损失而更低。"
    controls={<><MathRange label="高温热源 Tₕ" value={hotTemperature} min={400} max={1000} step={50} output={`${hotTemperature} K`} onChange={(value) => { setHotTemperature(value); setColdTemperature((current) => Math.min(current, value - 50)) }} /><MathRange label="低温冷源 T𝚌" value={coldTemperature} min={200} max={500} step={25} output={`${coldTemperature} K`} onChange={(value) => setColdTemperature(Math.min(value, hotTemperature - 50))} /></>}
    takeaway={<>理想可逆热机效率 <code>η≤1−T𝚌/Tₕ</code>，只由两个热源温度决定。效率不是“把能量变多”，而是说明吸热中最多有多少能转化为净功。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-heat-efficiency={efficiency.toFixed(4)} aria-label={`${topicTitle}理想热机效率${(efficiency * 100).toFixed(1)}%`}>
      <title>{topicTitle}热机循环</title><desc>压强体积图中显示顺时针循环，旁边标出高温热源、低温冷源和理想效率上限。</desc>
      <line className="science-axis" x1="58" y1="238" x2="580" y2="238" /><line className="science-axis" x1="58" y1="238" x2="58" y2="42" /><path className="science-reaction-curve" d={cycle} /><polygon className="science-arrow-head" points="467,84 451,78 455,94" /><text className="science-label" x="70" y="56">p</text><text className="science-label" x="548" y="270">V</text>
      <rect className="science-meter" x="82" y="72" width="136" height="64" rx="4" /><text className="science-meter-label" x="96" y="98">高温热源</text><text className="science-meter-value" x="96" y="122">Tₕ={hotTemperature} K</text>
      <rect className="science-meter science-meter-alt" x="82" y="154" width="136" height="64" rx="4" /><text className="science-meter-label" x="96" y="180">低温冷源</text><text className="science-meter-value" x="96" y="204">T𝚌={coldTemperature} K</text>
      <text className="science-label" x="322" y="278">ηmax=1−T𝚌/Tₕ={(efficiency * 100).toFixed(1)}%</text>
    </svg>
  </MathVisualFrame>
}

type FitMode = 'a-F' | 'a-1/m'

export function ExperimentFitVisual({ topicTitle }: { topicTitle: string }) {
  const [mode, setMode] = useState<FitMode>('a-F')
  const [noise, setNoise] = useState(0.12)
  const base = mode === 'a-F'
    ? [0.96, 1.92, 3.08, 4.04, 5.08]
    : [4.08, 2.05, 1.35, 1.02, 0.81]
  const xValues = mode === 'a-F' ? [0.5, 1, 1.5, 2, 2.5] : [0.25, 0.5, 0.75, 1, 1.25]
  const values = base.map((value, index) => value + (index % 2 ? noise : -noise / 2))
  const mean = (items: ReadonlyArray<number>) => items.reduce((sum, value) => sum + value, 0) / items.length
  const xMean = mean(xValues)
  const yMean = mean(values)
  const slope = xValues.reduce((sum, x, index) => sum + (x - xMean) * (values[index] - yMean), 0) / xValues.reduce((sum, x) => sum + (x - xMean) ** 2, 0)
  const intercept = yMean - slope * xMean
  const xMax = mode === 'a-F' ? 2.8 : 1.4
  const yMax = mode === 'a-F' ? 5.8 : 4.8
  const mapX = (x: number) => 76 + x / xMax * 480
  const mapY = (y: number) => 242 - y / yMax * 180
  const linePoints = `${mapX(0)},${mapY(intercept)} ${mapX(xMax)},${mapY(intercept + slope * xMax)}`
  return <MathVisualFrame
    title={`${topicTitle}：用斜率、截距和残差检查模型`}
    summary="实验图像不是把点连成折线，而是先选理论变量，再用拟合直线观察斜率、截距和离群点。噪声增大时，斜率会有不确定度，截距偏离零可能暴露摩擦或零点偏差。"
    controls={<><MathChoices label="拟合变量" value={mode} choices={[{ value: 'a-F', label: 'a—F' }, { value: 'a-1/m', label: 'a—1/m' }]} onChange={(value) => setMode(value as FitMode)} /><MathRange label="测量噪声" value={noise} min={0} max={0.3} step={0.03} output={`±${noise.toFixed(2)}`} onChange={setNoise} /></>}
    takeaway={<>当前拟合为 <code>y={slope.toFixed(2)}x${intercept >= 0 ? '+' : ''}${intercept.toFixed(2)}</code>。斜率应回到物理量关系解释，不能只追求“直线最漂亮”；还要报告单位、截距和残差。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-fit-slope={slope.toFixed(4)} data-fit-intercept={intercept.toFixed(4)} aria-label={`${topicTitle}${mode}拟合，斜率${slope.toFixed(2)}，截距${intercept.toFixed(2)}`}>
      <title>{topicTitle}实验拟合</title><desc>散点和最小二乘拟合直线显示斜率、截距与测量噪声的关系。</desc>
      <line className="science-axis" x1="76" y1="242" x2="570" y2="242" /><line className="science-axis" x1="76" y1="242" x2="76" y2="48" /><polyline className="science-trend-line" points={linePoints} />
      {xValues.map((x, index) => <circle key={x} className="science-trend-point" cx={mapX(x)} cy={mapY(values[index])} r="8" />)}
      <text className="science-label" x="84" y="60">y</text><text className="science-label" x="568" y="278" textAnchor="end">{mode === 'a-F' ? 'F / N' : '1/m / kg⁻¹'}</text><text className="science-meter-value" x="334" y="58">斜率={slope.toFixed(2)}</text><text className="science-label" x="334" y="84">截距={intercept.toFixed(2)}</text>
    </svg>
  </MathVisualFrame>
}
