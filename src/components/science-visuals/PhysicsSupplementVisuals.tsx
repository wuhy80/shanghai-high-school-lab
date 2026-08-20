import { useState } from 'react'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function TransformerVisual({ topicTitle }: { topicTitle: string }) {
  const [primaryTurns, setPrimaryTurns] = useState(800)
  const [secondaryTurns, setSecondaryTurns] = useState(400)
  const inputVoltage = 220
  const inputCurrent = 1
  const turnsRatio = secondaryTurns / primaryTurns
  const outputVoltage = inputVoltage * turnsRatio
  const outputCurrent = inputCurrent / turnsRatio
  const inputPower = inputVoltage * inputCurrent
  const mode = turnsRatio > 1.04 ? '升压' : turnsRatio < 0.96 ? '降压' : '近似等压'
  const primaryLines = Math.round(primaryTurns / 100)
  const secondaryLines = Math.round(secondaryTurns / 100)

  return <MathVisualFrame
    title={`${topicTitle}：匝数比同时约束电压与电流`}
    summary="改变原、副线圈匝数，观察电压比和电流比反向变化。理想模型中输入、输出功率相等，真实变压器还会有铜损、铁损和漏磁。"
    controls={<><MathRange label="原线圈匝数 N₁" value={primaryTurns} min={200} max={1200} step={100} output={`${primaryTurns} 匝`} onChange={setPrimaryTurns} /><MathRange label="副线圈匝数 N₂" value={secondaryTurns} min={200} max={1200} step={100} output={`${secondaryTurns} 匝`} onChange={setSecondaryTurns} /></>}
    takeaway={<>理想变压器满足 <code>U₂/U₁=N₂/N₁</code>、<code>I₂/I₁=N₁/N₂</code>。功率近似守恒只适用于损耗可忽略、磁通充分耦合的交流稳态。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-turns-ratio={turnsRatio.toFixed(3)} data-output-voltage={outputVoltage.toFixed(3)} data-output-current={outputCurrent.toFixed(3)} aria-label={`${topicTitle}${mode}变压器，输出电压${outputVoltage.toFixed(0)}伏，输出电流${outputCurrent.toFixed(2)}安`}>
      <title>{topicTitle}理想变压器</title><desc>铁芯两侧是原线圈和副线圈，匝数改变时，电压按匝数比变化，电流按匝数比的倒数变化。</desc>
      <rect className="science-field" x="232" y="38" width="176" height="218" rx="8" />
      <rect className="science-container" x="266" y="70" width="108" height="150" rx="6" />
      {Array.from({ length: primaryLines }, (_, index) => { const y = 76 + index * 138 / Math.max(1, primaryLines - 1); return <path key={`p-${index}`} className="science-coil-inner" d={`M 218 ${y} C 188 ${y} 188 ${y + 10} 218 ${y + 10}`} /> })}
      {Array.from({ length: secondaryLines }, (_, index) => { const y = 76 + index * 138 / Math.max(1, secondaryLines - 1); return <path key={`s-${index}`} className="science-coil-inner" d={`M 422 ${y} C 452 ${y} 452 ${y + 10} 422 ${y + 10}`} /> })}
      <text className="science-label" x="78" y="52">输入 U₁={inputVoltage} V</text><text className="science-label" x="444" y="52">输出 U₂={outputVoltage.toFixed(0)} V</text>
      <text className="science-label" x="78" y="276">I₁={inputCurrent.toFixed(2)} A</text><text className="science-label" x="444" y="276">I₂={outputCurrent.toFixed(2)} A</text>
      <rect className="science-meter" x="68" y="116" width="132" height="76" rx="4" /><text className="science-meter-label" x="84" y="143">N₁</text><text className="science-meter-value" x="84" y="174">{primaryTurns} 匝</text>
      <rect className="science-meter science-meter-alt" x="440" y="116" width="132" height="76" rx="4" /><text className="science-meter-label" x="456" y="143">N₂ · {mode}</text><text className="science-meter-value" x="456" y="174">{secondaryTurns} 匝</text>
      <text className="science-label" x="320" y="286" textAnchor="middle">P₁≈P₂≈{inputPower} W</text>
    </svg>
  </MathVisualFrame>
}

type SensorKind = '温度传感器' | '光敏传感器'

function sensorVoltage(kind: SensorKind, level: number) {
  const resistance = kind === '温度传感器'
    ? 30 * Math.exp(-0.035 * level * 0.8)
    : 40 / (1 + level * 10 / 100)
  return 5 * 10 / (10 + resistance)
}

export function SensorVisual({ topicTitle }: { topicTitle: string }) {
  const [kind, setKind] = useState<SensorKind>('温度传感器')
  const [level, setLevel] = useState(50)
  const [threshold, setThreshold] = useState(2.5)
  const inputValue = kind === '温度传感器' ? level * 0.8 : level * 10
  const unit = kind === '温度传感器' ? '°C' : 'lx'
  const voltage = sensorVoltage(kind, level)
  const triggered = voltage >= threshold
  const curve = Array.from({ length: 51 }, (_, index) => {
    const sample = index * 2
    return `${68 + sample * 4.9},${242 - sensorVoltage(kind, sample) * 36}`
  }).join(' ')
  const pointX = 68 + level * 4.9
  const pointY = 242 - voltage * 36
  const thresholdY = 242 - threshold * 36

  return <MathVisualFrame
    title={`${topicTitle}：从敏感元件到阈值判断`}
    summary="切换温敏或光敏元件并改变输入，曲线给出分压输出。阈值只是控制规则，必须建立在覆盖工作范围的多点标定之上。"
    controls={<><MathChoices label="敏感元件" value={kind} choices={[{ value: '温度传感器', label: '温敏' }, { value: '光敏传感器', label: '光敏' }]} onChange={(value) => setKind(value as SensorKind)} /><MathRange label="输入量" value={level} min={0} max={100} step={1} output={`${inputValue.toFixed(0)} ${unit}`} onChange={setLevel} /><MathRange label="触发阈值" value={threshold} min={1} max={4} step={0.1} output={`${threshold.toFixed(1)} V`} onChange={setThreshold} /></>}
    takeaway={<>传感器输出通常不是输入量本身，而是经过敏感元件和转换电路得到的电信号。阈值附近还应考虑噪声、迟滞与标定误差。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-sensor-kind={kind} data-sensor-output={voltage.toFixed(3)} data-sensor-triggered={triggered} aria-label={`${topicTitle}${kind}标定曲线，输入${inputValue.toFixed(0)}${unit}，输出${voltage.toFixed(2)}伏，${triggered ? '已经触发' : '尚未触发'}`}>
      <title>{topicTitle}传感器输入输出曲线</title><desc>横轴是温度或照度，纵轴是分压输出，当前输入点与可调阈值线同步显示。</desc>
      <line className="science-axis" x1="58" y1="242" x2="580" y2="242" /><line className="science-axis" x1="58" y1="242" x2="58" y2="42" />
      <polyline className="science-trend-line" points={curve} /><line className="science-guide" x1="58" y1={thresholdY} x2="580" y2={thresholdY} />
      <circle className="science-trend-point" cx={pointX} cy={pointY} r="8" /><line className="science-guide" x1={pointX} y1={pointY} x2={pointX} y2="242" />
      <text className="science-label" x="72" y="54">输出电压 / V</text><text className="science-label" x="508" y="278">输入 / {unit}</text>
      <text className="science-label" x="426" y={clamp(thresholdY - 10, 32, 230)}>阈值 {threshold.toFixed(1)} V</text>
      <rect className={triggered ? 'science-meter' : 'science-meter science-meter-alt'} x="384" y="66" width="184" height="72" rx="4" /><text className="science-meter-label" x="400" y="93">当前输出</text><text className="science-meter-value" x="400" y="120">{voltage.toFixed(2)} V · {triggered ? '触发' : '未触发'}</text>
    </svg>
  </MathVisualFrame>
}

type GasProcess = '等温' | '等容' | '等压'

export function PVProcessVisual({ topicTitle }: { topicTitle: string }) {
  const [process, setProcess] = useState<GasProcess>('等温')
  const [ratio, setRatio] = useState(1.3)
  const basePressure = 100
  const baseVolume = 2
  const baseTemperature = 300
  const volume = process === '等容' ? baseVolume : baseVolume * ratio
  const pressure = process === '等温' ? basePressure / ratio : process === '等容' ? basePressure * ratio : basePressure
  const temperature = process === '等温' ? baseTemperature : baseTemperature * ratio
  const mapX = (value: number) => 66 + (value - 0.8) / 2.8 * 510
  const mapY = (value: number) => 248 - (value - 45) / 135 * 194
  const curve = process === '等温'
    ? Array.from({ length: 49 }, (_, index) => { const v = 1.2 + index * 0.05; return `${mapX(v)},${mapY(basePressure * baseVolume / v)}` }).join(' ')
    : process === '等压'
      ? `${mapX(0.8)},${mapY(basePressure)} ${mapX(3.6)},${mapY(basePressure)}`
      : `${mapX(baseVolume)},${mapY(50)} ${mapX(baseVolume)},${mapY(170)}`
  const parameterLabel = process === '等容' ? '温度比 T/T₀' : '体积比 V/V₀'
  const constraint = process === '等温' ? 'pV=常量' : process === '等容' ? 'p/T=常量' : 'V/T=常量'

  return <MathVisualFrame
    title={`${topicTitle}：过程约束决定 p-V 路径`}
    summary="切换等温、等容或等压过程，调节状态比值。图上的点与压强、体积、温度读数同步变化，状态方程和过程约束必须同时满足。"
    controls={<><MathChoices label="气体过程" value={process} choices={[{ value: '等温', label: '等温' }, { value: '等容', label: '等容' }, { value: '等压', label: '等压' }]} onChange={(value) => setProcess(value as GasProcess)} /><MathRange label={parameterLabel} value={ratio} min={0.6} max={1.6} step={0.05} output={ratio.toFixed(2)} onChange={setRatio} /></>}
    takeaway={<>状态方程 <code>pV=nRT</code> 连接平衡态，过程条件决定走哪条路径。只有 p-V 图线下的面积才表示气体做功。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-gas-process={process} data-pressure={pressure.toFixed(3)} data-volume={volume.toFixed(3)} data-temperature={temperature.toFixed(3)} aria-label={`${topicTitle}${process}过程，压强${pressure.toFixed(0)}千帕，体积${volume.toFixed(2)}升，温度${temperature.toFixed(0)}开尔文`}>
      <title>{topicTitle}气体过程 p-V 图</title><desc>压强体积坐标中显示等温曲线、等容直线或等压直线，当前状态点和三个状态量同步更新。</desc>
      <line className="science-axis" x1="58" y1="248" x2="590" y2="248" /><line className="science-axis" x1="58" y1="248" x2="58" y2="34" />
      <polyline className="science-trend-line" points={curve} /><circle className="science-trend-point" cx={mapX(volume)} cy={mapY(pressure)} r="9" />
      <line className="science-guide" x1={mapX(volume)} y1={mapY(pressure)} x2={mapX(volume)} y2="248" /><line className="science-guide" x1="58" y1={mapY(pressure)} x2={mapX(volume)} y2={mapY(pressure)} />
      <text className="science-label" x="72" y="48">p / kPa</text><text className="science-label" x="520" y="282">V / L</text>
      <rect className="science-meter" x="330" y="48" width="246" height="98" rx="4" /><text className="science-meter-label" x="346" y="74">{process} · {constraint}</text><text className="science-meter-value" x="346" y="101">p={pressure.toFixed(0)} kPa · V={volume.toFixed(2)} L</text><text className="science-meter-value" x="346" y="128">T={temperature.toFixed(0)} K</text>
    </svg>
  </MathVisualFrame>
}

export function NuclearDecayVisual({ topicTitle }: { topicTitle: string }) {
  const [halfLife, setHalfLife] = useState(6)
  const [time, setTime] = useState(12)
  const initialNuclei = 64
  const parentNuclei = Math.round(initialNuclei * 2 ** (-time / halfLife))
  const daughterNuclei = initialNuclei - parentNuclei
  const curve = Array.from({ length: 81 }, (_, index) => {
    const sampleTime = index * 0.5
    const fraction = 2 ** (-sampleTime / halfLife)
    return `${54 + sampleTime * 6.6},${232 - fraction * 174}`
  }).join(' ')
  const pointX = 54 + time * 6.6
  const pointY = 232 - parentNuclei / initialNuclei * 174

  return <MathVisualFrame
    title={`${topicTitle}：半衰期描述大量核的统计衰变`}
    summary="调节半衰期和经过时间，指数曲线与64个核素方格同步更新。单个原子核何时衰变不可预言，但大量同种核的剩余比例稳定。"
    controls={<><MathRange label="半衰期 T½" value={halfLife} min={2} max={10} step={1} output={`${halfLife} h`} onChange={setHalfLife} /><MathRange label="经过时间 t" value={time} min={0} max={40} step={1} output={`${time} h`} onChange={setTime} /></>}
    takeaway={<>母核数满足 <code>N=N₀·2^(-t/T½)</code>。半衰期不表示每个核活到该时刻，也通常不随温度、压强或样品初始数量改变。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-parent-nuclei={parentNuclei} data-daughter-nuclei={daughterNuclei} aria-label={`${topicTitle}衰变过程，母核${parentNuclei}个，子核${daughterNuclei}个`}>
      <title>{topicTitle}核衰变统计模型</title><desc>左侧指数曲线显示母核数量随时间减少，右侧八乘八核素方格显示当前母核和子核数量。</desc>
      <line className="science-axis" x1="46" y1="232" x2="326" y2="232" /><line className="science-axis" x1="46" y1="232" x2="46" y2="42" />
      <polyline className="science-trend-line" points={curve} /><circle className="science-trend-point" cx={pointX} cy={pointY} r="8" />
      <line className="science-guide" x1={pointX} y1={pointY} x2={pointX} y2="232" />
      <text className="science-label" x="54" y="48">母核数 N</text><text className="science-label" x="250" y="266">时间 / h</text>
      {Array.from({ length: initialNuclei }, (_, index) => <circle key={index} className={index < parentNuclei ? 'science-crystal-particle' : 'science-crystal-particle science-crystal-center'} cx={370 + (index % 8) * 31} cy={66 + Math.floor(index / 8) * 25} r="8" />)}
      <text className="science-label" x="360" y="286">母核 {parentNuclei}</text><text className="science-label" x="522" y="286">子核 {daughterNuclei}</text>
    </svg>
  </MathVisualFrame>
}
