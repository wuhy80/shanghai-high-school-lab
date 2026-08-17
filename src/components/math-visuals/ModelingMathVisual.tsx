import { useState, type ReactNode } from 'react'
import { CoordinateAxes, MathChoices, MathRange, MathVisualFrame } from './AdvancedMathVisualFrame'
import { formatMath, plotPoints } from './advancedMathUtils'
import './ModelingMathVisual.css'

const observations = [
  { x: 0, y: 1.1 }, { x: 1, y: 2.4 }, { x: 2, y: 4.8 }, { x: 3, y: 8.7 }, { x: 4, y: 13.9 },
]

function ResidualModelVisual({ topicTitle }: { topicTitle: string }): ReactNode {
  const [model, setModel] = useState('quadratic')
  const [parameter, setParameter] = useState(1.4)
  const predict = model === 'linear'
    ? (x: number) => 1 + parameter * x
    : (x: number) => 1 + parameter * x * x / 2
  const residuals = observations.map((point) => point.y - predict(point.x))
  const error = residuals.reduce((total, residual) => total + residual * residual, 0)
  const mapX = (x: number) => 76 + x * 118
  const mapY = (y: number) => 270 - y * 14.5

  return (
    <MathVisualFrame
      title={`${topicTitle}：模型、参数与检验`}
      summary="模型不是套公式：先确定变量和范围，再调参数解释数据，最后用残差和边界情形检查结论。"
      controls={<>
        <MathChoices label="比较模型结构" value={model} onChange={setModel} choices={[{ value: 'linear', label: '线性关系' }, { value: 'quadratic', label: '弯曲关系' }]} />
        <MathRange label="参数 a" value={parameter} min={0.5} max={3} step={0.1} output={`a = ${parameter.toFixed(1)}`} onChange={setParameter} />
      </>}
      takeaway={<>参数变化会同时改变所有预测值。残差较小只是证据之一，还必须说明变量范围、单位、机制和外推边界。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}模型图，当前残差平方和为${error.toFixed(2)}`}>
        <title>{topicTitle}中的模型比较与参数敏感性</title>
        <desc>观测点与候选曲线同时显示，竖直线段表示每个观测值和模型预测值之间的残差。</desc>
        <CoordinateAxes xOrigin={76} yOrigin={270} xLabel="输入 x" yLabel="输出 y" />
        <polyline className="amv-primary" points={plotPoints(predict, 0, 4.2, mapX, mapY)} />
        {observations.map((point, index) => {
          const predicted = predict(point.x)
          return <g key={point.x}>
            <line className="amv-model-residual" x1={mapX(point.x)} y1={mapY(point.y)} x2={mapX(point.x)} y2={mapY(predicted)} />
            <circle className="amv-point-secondary" cx={mapX(point.x)} cy={mapY(point.y)} r="8" />
            <text className="amv-label-small" x={mapX(point.x) + 10} y={(mapY(point.y) + mapY(predicted)) / 2}>{formatMath(residuals[index], 1)}</text>
          </g>
        })}
        <text x="574" y="54" textAnchor="end">● 观测　— 模型</text>
      </svg>
      <p className="amv-readout"><span>当前结构</span><strong>{model === 'linear' ? `y=1+${parameter.toFixed(1)}x` : `y=1+${parameter.toFixed(1)}x²/2`}</strong><span>残差平方和</span><strong>{error.toFixed(2)}</strong></p>
    </MathVisualFrame>
  )
}

function ModelingCycleVisual({ topicTitle }: { topicTitle: string }) {
  const [step, setStep] = useState('model')
  const stages = [
    { value: 'question', label: '界定问题', detail: '明确对象、目标、变量与可用数据' },
    { value: 'assumption', label: '提出假设', detail: '删去次要因素，同时写清适用范围' },
    { value: 'model', label: '建立模型', detail: '用图形、函数或统计关系连接变量' },
    { value: 'solve', label: '求解解释', detail: '计算后回到现实语境解释单位与意义' },
    { value: 'verify', label: '检验修正', detail: '用新数据、残差和极端情形检查模型' },
  ]
  const selected = stages.find((stage) => stage.value === step) ?? stages[0]

  return (
    <MathVisualFrame
      title={`${topicTitle}：建模闭环`}
      summary="建模报告不是计算步骤的堆叠。问题、假设、模型、解释和检验必须首尾相接，检验失败时要回到前面修正。"
      controls={<MathChoices label="查看建模阶段" value={step} onChange={setStep} choices={stages.map(({ value, label }) => ({ value, label }))} />}
      takeaway={<>当前阶段的产出必须能被下一阶段使用；一份完整报告还要让读者能够复核数据、单位、计算和限制。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}建模循环，当前阶段为${selected.label}`}>
        <title>{topicTitle}的数学建模循环</title>
        <desc>五个建模阶段由箭头构成闭环，当前选择的阶段突出显示。</desc>
        <path className="amv-cycle-path" d="M 108 166 C 108 72 214 48 320 48 C 450 48 532 88 532 166 C 532 252 438 282 320 282 C 194 282 108 246 108 166 Z" />
        {stages.map((stage, index) => {
          const positions = [[108, 166], [226, 64], [430, 76], [528, 184], [298, 274]][index]
          const active = stage.value === step
          return <g key={stage.value} className={active ? 'amv-cycle-node active' : 'amv-cycle-node'}>
            <circle cx={positions[0]} cy={positions[1]} r={active ? 39 : 31} />
            <text x={positions[0]} y={positions[1] + 7} textAnchor="middle">{index + 1}</text>
          </g>
        })}
        <text className="amv-cycle-title" x="320" y="155" textAnchor="middle">{selected.label}</text>
        <text className="amv-label-small" x="320" y="190" textAnchor="middle">{selected.detail}</text>
      </svg>
      <p className="amv-readout"><span>当前检查</span><strong>{selected.label}</strong><span>{selected.detail}</span></p>
    </MathVisualFrame>
  )
}

function PiecewiseCostVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }) {
  const taxi = /出租车/.test(unitTitle)
  const [threshold, setThreshold] = useState(taxi ? 3 : 100)
  const [rate, setRate] = useState(taxi ? 2.7 : 0.8)
  const inputMax = taxi ? 12 : 240
  const base = taxi ? 14 : 0
  const alternative = (x: number) => taxi ? 2.15 * x + 7 : x * 0.85
  const piecewise = (x: number) => {
    if (taxi) return x <= threshold ? base : base + (x - threshold) * rate
    return x < threshold ? x : x * rate
  }
  const mapX = (x: number) => 64 + x / inputMax * 524
  const maxY = taxi ? 42 : 220
  const mapY = (y: number) => 276 - y / maxY * 218
  const crossing = Array.from({ length: 201 }, (_, index) => inputMax * index / 200)
    .find((x) => x > threshold && piecewise(x) <= alternative(x))

  return (
    <MathVisualFrame
      title={`${topicTitle}：分段规则与临界点`}
      summary={taxi ? '起步价覆盖一段里程，超过起步里程后才按增量计费；计价器离散跳价还会带来读数差异。' : '优惠是否划算取决于门槛、折扣后实付和原本需求，跨过门槛不等于节省更多。'}
      controls={<>
        <MathRange label={taxi ? '起步里程' : '优惠门槛'} value={threshold} min={taxi ? 2 : 60} max={taxi ? 5 : 160} step={taxi ? 0.5 : 10} output={`${threshold}${taxi ? ' km' : ' 元'}`} onChange={setThreshold} />
        <MathRange label={taxi ? '超程单价' : '折扣系数'} value={rate} min={taxi ? 1.5 : 0.6} max={taxi ? 4 : 0.95} step={taxi ? 0.1 : 0.05} output={taxi ? `${rate.toFixed(1)} 元/km` : `${Math.round(rate * 100)} 折`} onChange={setRate} />
      </>}
      takeaway={<>先把自然语言规则写成互不重叠的区间，再在临界点两侧分别代入。图像交点只表示两方案费用相同，不自动代表需求合理。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}分段费用比较图`}>
        <title>{topicTitle}的分段函数和方案比较</title>
        <desc>主方案在门槛前后采用不同表达式，并与另一方案比较。</desc>
        <CoordinateAxes xOrigin={64} yOrigin={276} xLabel={taxi ? '里程/km' : '标价/元'} yLabel="实付/元" />
        <polyline className="amv-primary" points={plotPoints(piecewise, 0, inputMax, mapX, mapY)} />
        <polyline className="amv-secondary" points={plotPoints(alternative, 0, inputMax, mapX, mapY)} />
        <line className="amv-guide" x1={mapX(threshold)} y1="42" x2={mapX(threshold)} y2="276" />
        <circle className="amv-point" cx={mapX(threshold)} cy={mapY(piecewise(threshold))} r="8" />
        <text x={Math.min(558, mapX(threshold) + 12)} y="70">门槛 {threshold}</text>
        <text className="amv-label-small" x="570" y="102" textAnchor="end">— 当前规则</text>
        <text className="amv-label-small" x="570" y="132" textAnchor="end">— 对照方案</text>
      </svg>
      <p className="amv-readout"><span>规则转写</span><strong>{taxi ? `y=${base}（x≤${threshold}）；y=${base}+${rate.toFixed(1)}(x−${threshold})` : `y=x（x<${threshold}）；y=${rate.toFixed(2)}x（x≥${threshold}）`}</strong>{crossing !== undefined && <><span>比较起点</span><strong>x≈{formatMath(crossing, 1)}</strong></>}</p>
    </MathVisualFrame>
  )
}

function MotionConstraintVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }) {
  const traffic = /红绿灯/.test(unitTitle)
  const hiking = /登山/.test(unitTitle)
  const [speed, setSpeed] = useState(traffic ? 18 : hiking ? 3.5 : 5)
  const [condition, setCondition] = useState(traffic ? 22 : hiking ? 8 : 4)
  const samples = Array.from({ length: 9 }, (_, index) => index)
  const valueAt = (time: number) => {
    if (traffic) return Math.max(0, condition * time - speed * Math.max(0, time - 2.5))
    if (hiking) return 420 + condition * 52 * Math.sin(time / 8 * Math.PI) + time * 34
    return Math.max(0, condition * 4.5 - speed * 2.6 + time * 1.4)
  }
  const values = samples.map(valueAt)
  const maxValue = Math.max(...values, 1)
  const mapX = (time: number) => 70 + time * 64
  const mapY = (value: number) => 272 - value / maxValue * 200

  return (
    <MathVisualFrame
      title={`${topicTitle}：变化率与约束`}
      summary={traffic ? '到达率和放行率共同决定队列长度；绿灯放行率较大也不代表队列能立即清空。' : hiking ? '距离、累计爬升、体能和日照时间同时约束行程，平均速度不能替代分段估计。' : '相对运动要先统一参考系，把各方向分量和暴露时间同时放进模型。'}
      controls={<>
        <MathRange label={traffic ? '放行率' : hiking ? '平地速度' : '行走速度'} value={speed} min={traffic ? 10 : 2} max={traffic ? 30 : 8} step={traffic ? 1 : 0.5} output={`${speed}${traffic ? ' 辆/min' : ' km/h'}`} onChange={setSpeed} />
        <MathRange label={traffic ? '到达率' : hiking ? '坡度强度' : '风雨强度'} value={condition} min={traffic ? 12 : 1} max={traffic ? 30 : 12} output={`${condition}${traffic ? ' 辆/min' : ''}`} onChange={setCondition} />
      </>}
      takeaway={<>先写出每一阶段的净变化率，再累计得到总量。安全、时间、容量等约束必须与优化目标同时满足。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}随时间变化图`}>
        <title>{topicTitle}的分段变化与约束</title>
        <desc>折线表示不同阶段的累计状态，参数改变后整条状态轨迹同步更新。</desc>
        <line className="amv-sequence-baseline" x1="54" y1="272" x2="606" y2="272" />
        <polyline className="amv-primary" points={values.map((value, index) => `${mapX(index)},${mapY(value)}`).join(' ')} />
        {values.map((value, index) => <g key={index}><circle className="amv-point" cx={mapX(index)} cy={mapY(value)} r="7" /><text className="amv-label-small" x={mapX(index)} y="304" textAnchor="middle">{index}</text></g>)}
        <line className="amv-guide" x1={mapX(2.5)} y1="42" x2={mapX(2.5)} y2="272" />
        <text x={mapX(2.5) + 12} y="68">阶段切换</text>
      </svg>
      <p className="amv-readout"><span>当前峰值</span><strong>{formatMath(maxValue, 1)}</strong><span>判断</span><strong>{traffic && condition > speed ? '到达率大于放行率，队列仍会增长' : '分段累计后再检查约束'}</strong></p>
    </MathVisualFrame>
  )
}

function GeometryMeasureVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }) {
  const height = /高度测量/.test(unitTitle)
  const turn = /车辆转弯/.test(unitTitle)
  const [angle, setAngle] = useState(height ? 38 : 32)
  const [length, setLength] = useState(height ? 24 : turn ? 10 : 6)
  const radians = angle * Math.PI / 180
  const result = height ? length * Math.tan(radians) + 1.6 : turn ? length * Math.sin(radians) : 2 * length + 4 * Math.sin(radians)

  return (
    <MathVisualFrame
      title={`${topicTitle}：几何参数与安全余量`}
      summary={height ? '测高要同时记录水平距离、仰角和仪器高度；角度误差会经正切关系放大。' : turn ? '车辆并非质点，转弯时前后轮轨迹和车身扫掠区域不同，必须保留安全余量。' : '把实物尺寸、路径和姿态抽象成几何量，再用缩尺实验或实测数据检查理想图形的偏差。'}
      controls={<>
        <MathRange label={height ? '仰角' : '转角或倾角'} value={angle} min={10} max={70} output={`${angle}°`} onChange={setAngle} />
        <MathRange label={height ? '水平距离' : '主要长度'} value={length} min={2} max={height ? 50 : 14} step={0.5} output={`${length} m`} onChange={setLength} />
      </>}
      takeaway={<>图中的长度是模型量，不是自动得到的真实值。测量误差、物体厚度、地面坡度和安全余量都应写进最终结论。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}几何测量图，估计值${result.toFixed(2)}米`}>
        <title>{topicTitle}的参数化几何模型</title>
        <desc>直角三角形展示距离、角度和目标量之间的关系，并标出需要保留的安全边界。</desc>
        <path className="amv-soft-fill" d="M 96 274 L 548 274 L 548 72 Z" />
        <line className="amv-primary" x1="96" y1="274" x2="548" y2="72" />
        <line className="amv-secondary" x1="548" y1="274" x2="548" y2="72" />
        <path className="amv-angle-arc" d={`M 160 274 A 64 64 0 0 0 ${96 + 64 * Math.cos(radians)} ${274 - 64 * Math.sin(radians)}`} />
        <text x="154" y="252">{angle}°</text>
        <text x="320" y="306" textAnchor="middle">{length} m</text>
        <text x="530" y="58" textAnchor="end">目标量 ≈ {formatMath(result)} m</text>
        <line className="amv-guide" x1="566" y1="274" x2="566" y2="72" />
        <text className="amv-label-small" x="582" y="174" textAnchor="middle" transform="rotate(-90 582 174)">误差与余量</text>
      </svg>
      <p className="amv-readout"><span>关系</span><strong>{height ? `h=${length}tan${angle}°+1.6` : '尺寸 + 角度 → 包络或路径'}</strong><span>估计</span><strong>{formatMath(result)} m</strong></p>
    </MathVisualFrame>
  )
}

function SurveyEstimateVisual({ topicTitle }: { topicTitle: string }) {
  const [sample, setSample] = useState(80)
  const [mean, setMean] = useState(2.4)
  const population = 1200
  const estimate = population * mean
  const uncertainty = estimate * Math.min(0.3, 2 / Math.sqrt(sample))
  const bars = [0.72, 0.92, 1.08, 0.83, 1.16, 1.01, 0.88, 1.12]

  return (
    <MathVisualFrame
      title={`${topicTitle}：样本、外推与不确定性`}
      summary="从样本均值推到总体总量必须说明抽样方式；样本量增大通常会降低随机波动，但不能自动消除选择偏差。"
      controls={<>
        <MathRange label="有效样本量" value={sample} min={20} max={240} step={10} output={`${sample} 份`} onChange={setSample} />
        <MathRange label="样本人均值" value={mean} min={0.5} max={5} step={0.1} output={`${mean.toFixed(1)} 件`} onChange={setMean} />
      </>}
      takeaway={<>总体估计等于总体规模乘样本均值；误差带只表达抽样不确定性，问卷遗漏、口径不同和非随机抽样要另行讨论。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}总体估计${estimate.toFixed(0)}，不确定范围正负${uncertainty.toFixed(0)}`}>
        <title>{topicTitle}中的抽样与总体外推</title>
        <desc>样本柱形围绕均值波动，并通过箭头外推到带有不确定区间的总体估计。</desc>
        {bars.map((factor, index) => {
          const height = 116 * factor
          return <rect key={index} className="amv-soft-fill" x={56 + index * 38} y={246 - height} width="25" height={height} />
        })}
        <line className="amv-primary" x1="48" y1={246 - 116} x2="356" y2={246 - 116} />
        <path className="amv-secondary" d="M 374 164 H 454 l -14 -12 m 14 12 l -14 12" />
        <rect className="amv-secondary-fill" x="482" y="88" width="104" height="154" />
        <line className="amv-primary" x1="482" y1="165" x2="586" y2="165" />
        <text x="204" y="286" textAnchor="middle">样本 n={sample}</text>
        <text x="534" y="58" textAnchor="middle">总体 N={population}</text>
        <text className="amv-label-small" x="534" y="158" textAnchor="middle">{estimate.toFixed(0)}</text>
        <text className="amv-label-small" x="534" y="214" textAnchor="middle">±{uncertainty.toFixed(0)}</text>
      </svg>
      <p className="amv-readout"><span>点估计</span><strong>{population}×{mean.toFixed(1)}={estimate.toFixed(0)}</strong><span>示意误差带</span><strong>±{uncertainty.toFixed(0)}</strong></p>
    </MathVisualFrame>
  )
}

export function ModelingMathVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }): ReactNode {
  if (/引论|报告|样例|附录3/.test(unitTitle)) return <ModelingCycleVisual topicTitle={topicTitle} />
  if (/优惠券|出租车/.test(unitTitle)) return <PiecewiseCostVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  if (/红绿灯|雨中行|登山/.test(unitTitle)) return <MotionConstraintVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  if (/转弯|家具|包装彩带|削菠萝|高度测量/.test(unitTitle)) return <GeometryMeasureVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  if (/外卖与环保/.test(unitTitle)) return <SurveyEstimateVisual topicTitle={topicTitle} />
  return <ResidualModelVisual topicTitle={topicTitle} />
}
