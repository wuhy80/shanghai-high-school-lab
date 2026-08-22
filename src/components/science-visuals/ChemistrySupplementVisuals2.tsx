import { useState } from 'react'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'

type SeparationMode = '过滤' | '蒸馏' | '萃取' | '色谱'

const separationDetails: Record<SeparationMode, { summary: string; takeaway: string; stages: string[] }> = {
  过滤: { summary: '利用固体颗粒不能通过滤纸而液体可以通过的差异，分离不溶性固体和液体。', takeaway: '过滤后仍要洗涤、干燥并检查滤液或滤渣；滤纸孔径和沉淀胶体性会限制分离效果。', stages: ['混合物', '滤纸截留固体', '滤液', '滤渣'] },
  蒸馏: { summary: '利用沸点差让更易挥发的组分先汽化、冷凝，适合互溶液体或溶液的分离。', takeaway: '蒸馏不是把所有沸点接近的液体一次分开；应控制沸程、温度计位置并弃去前馏分或尾馏分。', stages: ['混合液', '加热汽化', '冷凝', '馏分'] },
  萃取: { summary: '利用溶质在两种互不相溶溶剂中的分配差异，使目标物转移到更合适的一相。', takeaway: '少量多次通常比一次等体积萃取更充分；分液前要判断上下层并及时放气。', stages: ['两相混合', '振荡分配', '静置分层', '目标相'] },
  色谱: { summary: '利用各组分与固定相、流动相作用强弱不同造成迁移速度差，常用于少量样品的分离与检验。', takeaway: '斑点位置和颜色不能脱离对照样判断；展开剂、固定相和前沿距离都会影响 Rf。', stages: ['点样', '展开', '组分迁移', '对照判定'] },
}

export function SeparationVisual({ topicTitle }: { topicTitle: string }) {
  const [mode, setMode] = useState<SeparationMode>('过滤')
  const [progress, setProgress] = useState(55)
  const detail = separationDetails[mode]
  const active = Math.min(3, Math.floor(progress / 26))
  return <MathVisualFrame
    title={`${topicTitle}：从物性差异到分离路线`}
    summary={detail.summary}
    controls={<><MathChoices label="分离方法" value={mode} choices={(Object.keys(separationDetails) as SeparationMode[]).map((value) => ({ value, label: value }))} onChange={(value) => setMode(value as SeparationMode)} /><MathRange label="过程进度" value={progress} min={0} max={100} step={5} output={`${progress}%`} onChange={setProgress} /></>}
    takeaway={detail.takeaway}
  >
    <svg viewBox="0 0 640 300" role="img" data-separation-mode={mode} data-separation-stage={active} aria-label={`${topicTitle}${mode}，当前${detail.stages[active]}`}>
      <title>{topicTitle}{mode}分离过程</title><desc>四个节点显示混合物如何依据物性差异转化为目标相、馏分、滤液或色谱分离结果。</desc>
      {detail.stages.map((stage, index) => { const x = 34 + index * 151; return <g key={stage}><rect className={index === active ? 'science-stage science-stage-active' : 'science-stage'} x={x} y="92" width="122" height="78" rx="6" /><text className="science-label" x={x + 61} y="137" textAnchor="middle">{stage}</text>{index < 3 && <path className="science-process-arrow" d={`M ${x + 124} 131 h 24`} />}</g> })}
      {mode === '过滤' && <><line className="science-guide" x1="90" y1="206" x2="90" y2="258" /><circle className="science-precipitate" cx="90" cy="232" r="20" /><text className="science-label" x="130" y="238">固体被滤纸截留</text></>}
      {mode === '蒸馏' && <><path className="science-reaction-curve" d="M 88 244 C 170 180 250 178 338 228 S 480 264 550 198" /><text className="science-label" x="90" y="278">温度升高 → 低沸点组分先进入馏分</text></>}
      {mode === '萃取' && <><rect className="science-container" x="106" y="198" width="160" height="54" rx="5" /><rect className="science-meter" x="106" y="225" width="160" height="27" rx="0" /><text className="science-label" x="300" y="222">有机相 / 水相</text><text className="science-label" x="300" y="250">分配系数决定转移程度</text></>}
      {mode === '色谱' && <><line className="science-axis" x1="110" y1="258" x2="510" y2="258" /><line className="science-guide" x1="142" y1="242" x2="142" y2="106" /><circle className="science-trend-point" cx="270" cy="180" r="9" /><circle className="science-trend-point" cx="380" cy="132" r="9" /><text className="science-label" x="110" y="282">起点</text><text className="science-label" x="454" y="282">溶剂前沿</text></>}
      <text className="science-meter-value" x="390" y="58">当前：{detail.stages[active]}</text>
    </svg>
  </MathVisualFrame>
}

type ErrorMode = '配制' | '滴定' | '称量'

export function QuantitativeErrorVisual({ topicTitle }: { topicTitle: string }) {
  const [mode, setMode] = useState<ErrorMode>('配制')
  const [error, setError] = useState(0)
  const details: Record<ErrorMode, { target: string; direction: string; fix: string }> = {
    配制: { target: '浓度 c', direction: error >= 0 ? '偏高' : '偏低', fix: '检查转移、洗涤、定容和容量瓶刻度' },
    滴定: { target: '待测浓度', direction: error >= 0 ? '偏高' : '偏低', fix: '平行滴定并规范读初末刻度' },
    称量: { target: '物质的量', direction: error >= 0 ? '偏高' : '偏低', fix: '校零、去皮并避免吸湿或失重' },
  }
  const detail = details[mode]
  const measured = 100 + error
  return <MathVisualFrame
    title={`${topicTitle}：把误差方向放回测量链`}
    summary="误差分析先画出测量链，再判断某一步让分子、体积、读数或终点向哪边偏移，最后判断计算结果方向。随机误差靠重复测量减小，系统误差要校准、空白或改进方案。"
    controls={<><MathChoices label="实验环节" value={mode} choices={[{ value: '配制', label: '溶液配制' }, { value: '滴定', label: '滴定读数' }, { value: '称量', label: '称量取样' }]} onChange={(value) => setMode(value as ErrorMode)} /><MathRange label="系统偏移" value={error} min={-10} max={10} step={1} output={`${error >= 0 ? '+' : ''}${error}%`} onChange={setError} /></>}
    takeaway={<>当前测得{detail.target}{detail.direction}，对应读数为 {measured.toFixed(0)}% 基准值。改进建议：{detail.fix}；重复测量不能消除固定的系统偏差。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-error-mode={mode} data-error-percent={error} aria-label={`${topicTitle}${mode}，结果${detail.direction}${Math.abs(error)}%`}>
      <title>{topicTitle}系统误差方向</title><desc>基准值与偏移后的测量值用两根水平条比较，并标注当前误差来源和改进方向。</desc>
      <text className="science-label" x="62" y="62">基准值</text><rect className="science-bar-track" x="62" y="78" width="500" height="38" rx="5" /><rect className="science-energy-potential" x="62" y="78" width="500" height="38" rx="5" />
      <text className="science-label" x="62" y="154">当前测量</text><rect className="science-bar-track" x="62" y="170" width="500" height="38" rx="5" /><rect className={error >= 0 ? 'science-material-waste' : 'science-energy-kinetic'} x="62" y="170" width={500 * measured / 110} height="38" rx="5" />
      <text className="science-meter-value" x="62" y="252">{mode}：{detail.target}{detail.direction} {Math.abs(error)}%</text><text className="science-label" x="62" y="280">修正：{detail.fix}</text>
    </svg>
  </MathVisualFrame>
}
