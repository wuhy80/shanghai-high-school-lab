import { useId, useMemo, useState, type ReactNode } from 'react'
import { CoordinateAxes, MathChoices, MathRange, MathVisualFrame } from './AdvancedMathVisualFrame'
import { formatMath, plotPoints } from './advancedMathUtils'
import { ModelingMathVisual } from './ModelingMathVisual'
import './G12MathVisuals.css'

type G12MathVisualProps = {
  topicTitle: string
  unitTitle: string
  chapter: string
}

type VisualProps = Omit<G12MathVisualProps, 'chapter'>

const factorial = (value: number) => Array.from({ length: value }, (_, index) => index + 1).reduce((product, item) => product * item, 1)
const combination = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r))
const permutation = (n: number, r: number) => factorial(n) / factorial(n - r)
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const svgId = (id: string) => id.replaceAll(':', '')

function DerivativeVisual({ topicTitle }: VisualProps) {
  const [a, setA] = useState(2)
  const [x0, setX0] = useState(1)
  const f = (x: number) => x ** 3 / 3 - a * x
  const derivative = (x: number) => x * x - a
  const mapX = (x: number) => 320 + x * 82
  const mapY = (y: number) => 176 - y * 34
  const slope = derivative(x0)
  const y0 = f(x0)
  const tangent = (x: number) => y0 + slope * (x - x0)
  const turning = Math.sqrt(a)

  return (
    <MathVisualFrame
      title={`${topicTitle}：从割线逼近到导数符号`}
      summary="图像、切线和导数符号表同步变化。切线处理一个点附近的变化，符号表把局部信息拼成整段函数的增减与极值。"
      controls={<>
        <MathRange label="函数参数 a" value={a} min={0.5} max={3} step={0.5} output={`a=${a.toFixed(1)}`} onChange={setA} />
        <MathRange label="观察点 x₀" value={x0} min={-2.5} max={2.5} step={0.1} output={`x₀=${x0.toFixed(1)}`} onChange={setX0} />
      </>}
      takeaway={<>先求导，再按导数的零点和无定义点分区间。<code>f′(x₀)=0</code> 只是极值候选，只有导数在两侧变号时才出现极值。</>}
    >
      <svg viewBox="0 0 640 370" role="img" aria-label={`${topicTitle}函数、切线与导数符号图，当前切线斜率${formatMath(slope)}`}>
        <title>{topicTitle}的函数切线与导数符号表</title>
        <desc>三次函数曲线、观察点处切线和下方导数正负区间随参数同步变化。</desc>
        <CoordinateAxes xOrigin={320} yOrigin={176} />
        <polyline className="amv-primary" points={plotPoints(f, -3.1, 3.1, mapX, mapY, 161)} />
        <line className="g12mv-tangent" x1={mapX(-2.9)} y1={mapY(tangent(-2.9))} x2={mapX(2.9)} y2={mapY(tangent(2.9))} />
        <line className="amv-guide" x1={mapX(x0)} y1="38" x2={mapX(x0)} y2="290" />
        <circle className="amv-point" cx={mapX(x0)} cy={mapY(y0)} r="8" />
        <text x={mapX(x0) + 12} y={mapY(y0) - 12}>P</text>
        <g className="g12mv-sign-chart">
          <line x1="72" y1="326" x2="568" y2="326" />
          <circle cx={mapX(-turning)} cy="326" r="6" />
          <circle cx={mapX(turning)} cy="326" r="6" />
          <text x={mapX(-turning)} y="358" textAnchor="middle">−√a</text>
          <text x={mapX(turning)} y="358" textAnchor="middle">√a</text>
          <text x={(72 + mapX(-turning)) / 2} y="317" textAnchor="middle">f′ &gt; 0 ↑</text>
          <text x="320" y="317" textAnchor="middle">f′ &lt; 0 ↓</text>
          <text x={(568 + mapX(turning)) / 2} y="317" textAnchor="middle">f′ &gt; 0 ↑</text>
        </g>
      </svg>
      <p className="amv-readout"><span>点 P</span><strong>({x0.toFixed(1)}, {formatMath(y0)})</strong><span>切线斜率</span><strong>f′(x₀)={formatMath(slope)}</strong><span>当前变化</span><strong>{slope > 0.05 ? '递增' : slope < -0.05 ? '递减' : '驻点'}</strong></p>
    </MathVisualFrame>
  )
}

type DerivativeRule = 'basic' | 'product' | 'quotient' | 'chain'

function derivativeRuleDefault(topicTitle: string): DerivativeRule {
  if (/乘积/.test(topicTitle)) return 'product'
  if (/商|除/.test(topicTitle)) return 'quotient'
  if (/复合|链式/.test(topicTitle)) return 'chain'
  return 'basic'
}

function DerivativeRulesVisual({ topicTitle }: VisualProps) {
  const [rule, setRule] = useState<DerivativeRule>(() => derivativeRuleDefault(topicTitle))
  const [parameter, setParameter] = useState(2)
  const [x0, setX0] = useState(1)
  const functions: Record<DerivativeRule, { f: (x: number) => number; derivative: (x: number) => number; formula: string; result: string }> = {
    basic: { f: (x) => x ** 3 / 3, derivative: (x) => x * x, formula: 'f(x)=x³/3', result: 'f′(x)=x²' },
    product: { f: (x) => x * Math.exp(0.25 * x), derivative: (x) => Math.exp(0.25 * x) * (1 + 0.25 * x), formula: 'f(x)=x·e^(x/4)', result: 'f′(x)=e^(x/4)(1+x/4)' },
    quotient: { f: (x) => x / (1 + x * x), derivative: (x) => (1 - x * x) / (1 + x * x) ** 2, formula: 'f(x)=x/(1+x²)', result: 'f′(x)=(1−x²)/(1+x²)²' },
    chain: { f: (x) => Math.sin(parameter * x), derivative: (x) => parameter * Math.cos(parameter * x), formula: `f(x)=sin(${parameter}x)`, result: `f′(x)=${parameter}cos(${parameter}x)` },
  }
  const selected = functions[rule]
  const mapX = (x: number) => 320 + x * 98
  const mapY = (y: number) => 176 - y * 30
  const currentF = selected.f(x0)
  const currentDerivative = selected.derivative(x0)

  return <MathVisualFrame title={`${topicTitle}：函数与导函数联动`} summary="求导法则不是符号替换。图中原函数与导函数同时显示，导函数在某个横坐标的值就是原函数在该处的切线斜率。" controls={<>
    <MathChoices label="求导结构" value={rule} onChange={(value) => setRule(value as DerivativeRule)} choices={[{ value: 'basic', label: '基本函数' }, { value: 'product', label: '乘积' }, { value: 'quotient', label: '商' }, { value: 'chain', label: '复合' }]} />
    {rule === 'chain' && <MathRange label="内层倍率 k" value={parameter} min={1} max={4} output={`k=${parameter}`} onChange={setParameter} />}
    <MathRange label="观察点 x₀" value={x0} min={-2.5} max={2.5} step={0.1} output={`x₀=${x0.toFixed(1)}`} onChange={setX0} />
  </>} takeaway={rule === 'chain' ? <>复合函数先识别外层与内层，再用“外层导数代入内层”乘以内层导数；这里的倍率 <code>k</code> 不能漏掉。</> : rule === 'product' ? <>乘积求导是 <code>(uv)′=u′v+uv′</code>，不能写成两个导数相乘。</> : rule === 'quotient' ? <>商的求导分母是 <code>v²</code>，分子按 <code>u′v−uv′</code> 保持次序。</> : <>基本初等函数导数是后续法则的积木；每条公式都要连同定义域一起使用。</>}>
    <svg viewBox="0 0 640 350" role="img" aria-label={`${topicTitle}原函数和导函数图，当前导数${formatMath(currentDerivative)}`}>
      <title>{topicTitle}的函数与导函数联动图</title><desc>实线为原函数，另一条曲线为导函数，竖线标出当前观察横坐标。</desc>
      <CoordinateAxes xOrigin={320} yOrigin={176} />
      <polyline className="amv-primary" points={plotPoints(selected.f, -2.6, 2.6, mapX, mapY, 151)} />
      <polyline className="amv-secondary" points={plotPoints(selected.derivative, -2.6, 2.6, mapX, mapY, 151)} />
      <line className="amv-guide" x1={mapX(x0)} y1="34" x2={mapX(x0)} y2="304" />
      <circle className="amv-point" cx={mapX(x0)} cy={mapY(currentF)} r="8" /><circle className="amv-point-secondary" cx={mapX(x0)} cy={mapY(currentDerivative)} r="8" />
      <text x="70" y="54">f(x)</text><text x="70" y="84">f′(x)</text>
    </svg>
    <p className="amv-readout"><span>{selected.formula}</span><strong>{selected.result}</strong><span>x₀处</span><strong>f′({x0.toFixed(1)})={formatMath(currentDerivative)}</strong></p>
  </MathVisualFrame>
}

function OptimizationVisual({ topicTitle }: VisualProps) {
  const [perimeter, setPerimeter] = useState(24)
  const [width, setWidth] = useState(4)
  const height = perimeter / 2 - width
  const area = Math.max(0, width * height)
  const optimum = perimeter / 4
  const maxArea = optimum ** 2
  const plotWidth = (x: number) => 76 + x / (perimeter / 2) * 488
  const plotArea = (value: number) => 272 - value / maxArea * 200

  return (
    <MathVisualFrame
      title={`${topicTitle}：约束、目标函数与最优点`}
      summary="固定周长的矩形把现实约束化成一个变量，再比较驻点和端点。图上的最高点必须回到原问题解释，不能停在求导结果。"
      controls={<>
        <MathRange label="矩形周长 P" value={perimeter} min={16} max={36} step={2} output={`P=${perimeter}`} onChange={(value) => { setPerimeter(value); setWidth(Math.min(width, value / 2 - 1)) }} />
        <MathRange label="矩形宽 x" value={width} min={1} max={perimeter / 2 - 1} step={0.5} output={`x=${width.toFixed(1)}`} onChange={setWidth} />
      </>}
      takeaway={<>建模时先写定义域 <code>0&lt;x&lt;P/2</code>，再求 <code>A′(x)</code>。闭区间问题还要比较驻点、不可导点和端点。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`固定周长${perimeter}的矩形面积优化图，当前面积${formatMath(area)}`}>
        <title>{topicTitle}的矩形面积优化</title>
        <desc>左侧矩形和右侧面积函数随宽度变化，面积函数最高点表示最优尺寸。</desc>
        <rect className="g12mv-rectangle" x="76" y={172 - height * 7} width={width * 14} height={height * 14} />
        <text x="150" y="222" textAnchor="middle">x={width.toFixed(1)}</text>
        <text x="150" y="250" textAnchor="middle">y={height.toFixed(1)}</text>
        <line className="g12mv-axis" x1="302" y1="272" x2="590" y2="272" />
        <line className="g12mv-axis" x1="320" y1="52" x2="320" y2="292" />
        <polyline className="amv-primary" points={plotPoints((x) => x * (perimeter / 2 - x), 0, perimeter / 2, plotWidth, plotArea, 101)} />
        <line className="amv-guide" x1={plotWidth(optimum)} y1="62" x2={plotWidth(optimum)} y2="272" />
        <circle className="amv-point-secondary" cx={plotWidth(optimum)} cy={plotArea(maxArea)} r="8" />
        <circle className="amv-point" cx={plotWidth(width)} cy={plotArea(area)} r="8" />
        <text x={plotWidth(optimum)} y={plotArea(maxArea) - 14} textAnchor="middle">最大值</text>
      </svg>
      <p className="amv-readout"><span>目标函数</span><strong>A(x)=x({perimeter / 2}−x)</strong><span>当前面积</span><strong>{formatMath(area)}</strong><span>最大面积</span><strong>{formatMath(maxArea)}（x={optimum}）</strong></p>
    </MathVisualFrame>
  )
}

type CountingMode = 'principle' | 'permutation' | 'combination' | 'pascal'

function countingDefault(topicTitle: string): CountingMode {
  if (/二项式|杨辉|展开|指定项|常数项|系数|赋值法|恒等式/.test(topicTitle)) return 'pascal'
  if (/组合|无序|集合|对称|递推关系/.test(topicTitle)) return 'combination'
  if (/排列|有序|顺序|相邻|不相邻|定序|阶乘|全排列|选排/.test(topicTitle)) return 'permutation'
  return 'principle'
}

function CountingVisual({ topicTitle }: VisualProps) {
  const [mode, setMode] = useState<CountingMode>(() => countingDefault(topicTitle))
  const [n, setN] = useState(6)
  const [r, setR] = useState(3)
  const safeR = Math.min(r, n)
  const row = Array.from({ length: n + 1 }, (_, index) => combination(n, index))
  const result = mode === 'permutation' ? permutation(n, safeR) : mode === 'combination' ? combination(n, safeR) : mode === 'principle' ? n * safeR : 2 ** n

  return (
    <MathVisualFrame
      title={`${topicTitle}：先判结构，再选择公式`}
      summary="分类对应相加，分步对应相乘；从 n 个不同对象取 r 个时，是否关心顺序决定使用排列还是组合。杨辉三角把组合数和二项展开统一起来。"
      controls={<>
        <MathChoices label="计数结构" value={mode} onChange={(value) => setMode(value as CountingMode)} choices={[{ value: 'principle', label: '分类/分步' }, { value: 'permutation', label: '排列' }, { value: 'combination', label: '组合' }, { value: 'pascal', label: '二项式' }]} />
        <MathRange label="对象数 n" value={n} min={3} max={8} output={`n=${n}`} onChange={(value) => { setN(value); setR(Math.min(r, value)) }} />
        {mode !== 'pascal' && <MathRange label={mode === 'principle' ? '第二步选择数 r' : '选取数 r'} value={safeR} min={1} max={n} output={`r=${safeR}`} onChange={setR} />}
      </>}
      takeaway={mode === 'permutation' ? <>排列把同一组选中对象的不同顺序看成不同结果，<code>A(n,r)=n!/(n−r)!</code>。</> : mode === 'combination' ? <>组合不计顺序；每个组合对应 <code>r!</code> 个排列，所以 <code>C(n,r)=A(n,r)/r!</code>。</> : mode === 'pascal' ? <>第 n 行系数是 <code>C(n,0)…C(n,n)</code>，相邻两项之和生成下一行，且系数和为 <code>2ⁿ</code>。</> : <>先画决策树判断过程是“任选一类”还是“连续完成”。分类相加，分步相乘，混合问题要分层处理。</>}
    >
      {mode === 'pascal' ? <svg viewBox="0 0 640 370" role="img" aria-label={`杨辉三角第${n}行，系数为${row.join('、')}`}>
        <title>{topicTitle}的杨辉三角</title><desc>从第零行到第n行的组合数按三角形排列，目标行被突出显示。</desc>
        {Array.from({ length: n + 1 }, (_, level) => Array.from({ length: level + 1 }, (_, index) => {
          const x = 320 + (index - level / 2) * 62
          const y = 40 + level * 40
          return <g key={`${level}-${index}`} className={level === n ? 'g12mv-pascal-active' : 'g12mv-pascal-cell'}><circle cx={x} cy={y} r="17" /><text x={x} y={y + 6} textAnchor="middle">{combination(level, index)}</text></g>
        }))}
        <text x="320" y="352" textAnchor="middle">(a+b)ⁿ 的系数</text>
      </svg> : <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}计数树，当前结果${result}`}>
        <title>{topicTitle}的计数结构图</title><desc>对象经过选择和排序形成结果，图中分支数量与计数公式同步。</desc>
        {mode === 'principle' ? <>
          <circle className="g12mv-node-start" cx="90" cy="170" r="30" /><text x="90" y="177" textAnchor="middle">开始</text>
          {Array.from({ length: n }, (_, index) => {
            const y = 48 + index * 244 / Math.max(1, n - 1)
            return <g key={index}><line className="g12mv-branch" x1="122" y1="170" x2="270" y2={y} /><circle className="g12mv-node" cx="292" cy={y} r="22" /><text x="292" y={y + 6} textAnchor="middle">{index + 1}</text><text x="452" y={y + 6} textAnchor="middle">× {safeR} 种后续</text></g>
          })}
        </> : <>
          {Array.from({ length: n }, (_, index) => {
            const x = 72 + index * 496 / Math.max(1, n - 1)
            const selected = index < safeR
            return <g key={index} className={selected ? 'g12mv-object-selected' : 'g12mv-object'}><circle cx={x} cy="148" r="25" /><text x={x} y="155" textAnchor="middle">{String.fromCharCode(65 + index)}</text></g>
          })}
          <path className="g12mv-selection-brace" d={`M 72 198 Q 320 250 568 198`} />
          <text x="320" y="278" textAnchor="middle">{mode === 'permutation' ? `选出后还要排入 ${safeR} 个有序位置` : `只记录选中的 ${safeR} 个对象`}</text>
        </>}
      </svg>}
      <p className="amv-readout"><span>结构</span><strong>{mode === 'principle' ? `${n}×${safeR}` : mode === 'permutation' ? `A(${n},${safeR})` : mode === 'combination' ? `C(${n},${safeR})` : `(a+b)^${n}`}</strong><span>结果</span><strong>{result}</strong>{mode === 'pascal' && <><span>目标行</span><strong>{row.join('，')}</strong></>}</p>
    </MathVisualFrame>
  )
}

function ConditionalProbabilityVisual({ topicTitle }: VisualProps) {
  const [prior, setPrior] = useState(0.2)
  const [sensitivity, setSensitivity] = useState(0.8)
  const [falsePositive, setFalsePositive] = useState(0.15)
  const positive = prior * sensitivity + (1 - prior) * falsePositive
  const posterior = positive === 0 ? 0 : prior * sensitivity / positive
  const percent = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <MathVisualFrame
      title={`${topicTitle}：沿概率树更新信息`}
      summary="先验概率沿不同条件分支传播；观察到 B 后，只保留到达 B 的路径并重新归一化。树图可同时检查全概率公式、乘法公式与贝叶斯公式。"
      controls={<>
        <MathRange label="先验 P(A)" value={prior} min={0.05} max={0.8} step={0.05} output={percent(prior)} onChange={setPrior} />
        <MathRange label="P(B|A)" value={sensitivity} min={0.1} max={0.95} step={0.05} output={percent(sensitivity)} onChange={setSensitivity} />
        <MathRange label="P(B|非A)" value={falsePositive} min={0.05} max={0.8} step={0.05} output={percent(falsePositive)} onChange={setFalsePositive} />
      </>}
      takeaway={<>条件概率改变的是样本空间。<code>P(A|B)</code> 与 <code>P(B|A)</code> 通常不同；只有当 <code>P(B|A)=P(B)</code> 时 A、B 才独立。</>}
    >
      <svg viewBox="0 0 640 350" role="img" aria-label={`${topicTitle}概率树，观察B后的后验概率为${percent(posterior)}`}>
        <title>{topicTitle}的概率树与贝叶斯更新</title><desc>样本先分成A和非A，再分别分成B和非B，B路径用于计算后验概率。</desc>
        <circle className="g12mv-node-start" cx="72" cy="174" r="25" /><text x="72" y="181" textAnchor="middle">Ω</text>
        <line className="g12mv-branch active" x1="98" y1="166" x2="254" y2="88" /><line className="g12mv-branch" x1="98" y1="182" x2="254" y2="260" />
        <circle className="g12mv-node" cx="276" cy="78" r="26" /><text x="276" y="85" textAnchor="middle">A</text>
        <circle className="g12mv-node" cx="276" cy="270" r="26" /><text x="276" y="277" textAnchor="middle">非A</text>
        <text x="164" y="104" textAnchor="middle">{percent(prior)}</text><text x="164" y="260" textAnchor="middle">{percent(1 - prior)}</text>
        <line className="g12mv-branch active" x1="302" y1="73" x2="494" y2="42" /><line className="g12mv-branch" x1="300" y1="90" x2="494" y2="138" />
        <line className="g12mv-branch active" x1="300" y1="256" x2="494" y2="214" /><line className="g12mv-branch" x1="302" y1="280" x2="494" y2="308" />
        <circle className="g12mv-node-active" cx="522" cy="38" r="25" /><text x="522" y="45" textAnchor="middle">B</text>
        <circle className="g12mv-node" cx="522" cy="144" r="25" /><text x="522" y="151" textAnchor="middle">非B</text>
        <circle className="g12mv-node-active" cx="522" cy="208" r="25" /><text x="522" y="215" textAnchor="middle">B</text>
        <circle className="g12mv-node" cx="522" cy="314" r="25" /><text x="522" y="321" textAnchor="middle">非B</text>
        <text x="402" y="48" textAnchor="middle">{percent(sensitivity)}</text><text x="402" y="130" textAnchor="middle">{percent(1 - sensitivity)}</text>
        <text x="402" y="222" textAnchor="middle">{percent(falsePositive)}</text><text x="402" y="302" textAnchor="middle">{percent(1 - falsePositive)}</text>
      </svg>
      <p className="amv-readout"><span>P(B)</span><strong>{percent(positive)}</strong><span>P(AB)</span><strong>{percent(prior * sensitivity)}</strong><span>P(A|B)</span><strong>{percent(posterior)}</strong></p>
    </MathVisualFrame>
  )
}

type DistributionMode = 'binomial' | 'hypergeometric'

function DistributionVisual({ topicTitle }: VisualProps) {
  const [mode, setMode] = useState<DistributionMode>(() => /超几何/.test(topicTitle) ? 'hypergeometric' : 'binomial')
  const [n, setN] = useState(8)
  const [p, setP] = useState(0.45)
  const [successes, setSuccesses] = useState(5)
  const population = 14
  const sample = Math.min(n, 8)
  const values = useMemo(() => {
    if (mode === 'binomial') return Array.from({ length: n + 1 }, (_, k) => combination(n, k) * p ** k * (1 - p) ** (n - k))
    return Array.from({ length: sample + 1 }, (_, k) => k <= successes && sample - k <= population - successes ? combination(successes, k) * combination(population - successes, sample - k) / combination(population, sample) : 0)
  }, [mode, n, p, sample, successes])
  const expectation = mode === 'binomial' ? n * p : sample * successes / population
  const variance = mode === 'binomial' ? n * p * (1 - p) : sample * successes / population * (1 - successes / population) * (population - sample) / (population - 1)
  const maxProbability = Math.max(...values, 0.01)
  const barWidth = 430 / values.length

  return (
    <MathVisualFrame
      title={`${topicTitle}：把随机结果组织成分布`}
      summary="横轴列出随机变量的所有可能取值，柱高是对应概率。每根柱之和必须为 1；期望描述分布中心，方差描述围绕中心的离散程度。"
      controls={<>
        <MathChoices label="抽样模型" value={mode} onChange={(value) => setMode(value as DistributionMode)} choices={[{ value: 'binomial', label: '独立重复' }, { value: 'hypergeometric', label: '不放回抽样' }]} />
        <MathRange label={mode === 'binomial' ? '试验次数 n' : '抽取个数 n'} value={n} min={4} max={mode === 'binomial' ? 12 : 8} output={`n=${n}`} onChange={setN} />
        {mode === 'binomial' ? <MathRange label="单次成功概率 p" value={p} min={0.1} max={0.9} step={0.05} output={`p=${p.toFixed(2)}`} onChange={setP} /> : <MathRange label="总体成功数 K（N=14）" value={successes} min={2} max={10} output={`K=${successes}`} onChange={setSuccesses} />}
      </>}
      takeaway={mode === 'binomial' ? <>二项分布要求固定次数、每次只有成败、成功概率不变且各次独立；少一个条件都不能直接套 <code>B(n,p)</code>。</> : <>不放回抽样会改变下一次成功概率，因此使用超几何分布；有限总体修正会让它的方差小于同参数近似二项分布。</>}
    >
      <svg viewBox="0 0 640 350" role="img" aria-label={`${topicTitle}概率分布图，期望${formatMath(expectation)}，方差${formatMath(variance)}`}>
        <title>{topicTitle}的离散概率分布</title><desc>随机变量每个取值的概率以柱形表示，并标出期望所在位置。</desc>
        <line className="g12mv-axis" x1="82" y1="280" x2="570" y2="280" /><line className="g12mv-axis" x1="92" y1="48" x2="92" y2="296" />
        {values.map((probability, index) => {
          const x = 102 + index * barWidth
          const height = probability / maxProbability * 194
          return <g key={index}><rect className="g12mv-bar" x={x} y={280 - height} width={Math.max(9, barWidth - 8)} height={height} /><text x={x + Math.max(9, barWidth - 8) / 2} y="310" textAnchor="middle">{index}</text>{probability === maxProbability && <text x={x + Math.max(9, barWidth - 8) / 2} y={270 - height} textAnchor="middle">{probability.toFixed(2)}</text>}</g>
        })}
        <line className="g12mv-mean-marker" x1={102 + expectation * barWidth + barWidth / 2} y1="58" x2={102 + expectation * barWidth + barWidth / 2} y2="280" />
        <text x={102 + expectation * barWidth + barWidth / 2} y="48" textAnchor="middle">E(X)</text>
      </svg>
      <p className="amv-readout"><span>模型</span><strong>{mode === 'binomial' ? `X~B(${n}, ${p.toFixed(2)})` : `X~H(14, ${successes}, ${sample})`}</strong><span>E(X)</span><strong>{formatMath(expectation)}</strong><span>Var(X)</span><strong>{formatMath(variance)}</strong></p>
    </MathVisualFrame>
  )
}

function erf(value: number) {
  const sign = value < 0 ? -1 : 1
  const x = Math.abs(value)
  const t = 1 / (1 + 0.3275911 * x)
  const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t
  return sign * (1 - polynomial * Math.exp(-x * x))
}

function NormalDistributionVisual({ topicTitle }: VisualProps) {
  const [mean, setMean] = useState(0)
  const [sigma, setSigma] = useState(1)
  const [xValue, setXValue] = useState(1)
  const density = (x: number) => Math.exp(-0.5 * ((x - mean) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
  const minX = mean - 4 * sigma
  const maxX = mean + 4 * sigma
  const mapX = (x: number) => 74 + (x - minX) / (maxX - minX) * 500
  const maxDensity = density(mean)
  const mapY = (value: number) => 278 - value / maxDensity * 205
  const clampedX = clamp(xValue, minX, maxX)
  const cdf = 0.5 * (1 + erf((clampedX - mean) / (sigma * Math.SQRT2)))
  const shadePoints = `${mapX(minX)},278 ${plotPoints(density, minX, clampedX, mapX, mapY, 81)} ${mapX(clampedX)},278`

  return (
    <MathVisualFrame
      title={`${topicTitle}：中心、尺度与标准化`}
      summary="均值平移钟形曲线，标准差控制分散程度。把任意正态变量标准化为 z 后，就能在同一条标准正态曲线上读取累计概率。"
      controls={<>
        <MathRange label="均值 μ" value={mean} min={-2} max={2} step={0.5} output={`μ=${mean.toFixed(1)}`} onChange={setMean} />
        <MathRange label="标准差 σ" value={sigma} min={0.5} max={2} step={0.25} output={`σ=${sigma.toFixed(2)}`} onChange={setSigma} />
        <MathRange label="概率边界 x" value={xValue} min={-4} max={4} step={0.25} output={`x=${xValue.toFixed(2)}`} onChange={setXValue} />
      </>}
      takeaway={<>标准化使用 <code>z=(x−μ)/σ</code>。正态曲线下总面积为 1，概率对应区间面积，不是某一点的曲线高度。</>}
    >
      <svg viewBox="0 0 640 350" role="img" aria-label={`${topicTitle}正态曲线，边界左侧概率${(cdf * 100).toFixed(1)}%`}>
        <title>{topicTitle}的正态分布曲线</title><desc>钟形密度曲线随均值和标准差改变，边界左侧区域表示累计概率。</desc>
        <line className="g12mv-axis" x1="62" y1="278" x2="590" y2="278" />
        <polygon className="g12mv-normal-area" points={shadePoints} />
        <polyline className="amv-primary" points={plotPoints(density, minX, maxX, mapX, mapY, 161)} />
        <line className="g12mv-mean-marker" x1={mapX(mean)} y1="54" x2={mapX(mean)} y2="278" />
        <line className="amv-guide" x1={mapX(clampedX)} y1="66" x2={mapX(clampedX)} y2="278" />
        {[-2, -1, 0, 1, 2].map((offset) => <g key={offset}><line className="g12mv-tick" x1={mapX(mean + offset * sigma)} y1="272" x2={mapX(mean + offset * sigma)} y2="286" /><text x={mapX(mean + offset * sigma)} y="314" textAnchor="middle">{offset === 0 ? 'μ' : `${offset > 0 ? '+' : '−'}${Math.abs(offset)}σ`}</text></g>)}
        <text x={mapX(clampedX)} y="54" textAnchor="middle">x</text>
      </svg>
      <p className="amv-readout"><span>标准分</span><strong>z={formatMath((clampedX - mean) / sigma)}</strong><span>左侧面积</span><strong>P(X≤{clampedX.toFixed(2)})≈{(cdf * 100).toFixed(1)}%</strong><span>方差</span><strong>σ²={formatMath(sigma ** 2)}</strong></p>
    </MathVisualFrame>
  )
}

type StatisticsMode = 'regression' | 'contingency'

function StatisticsAnalysisVisual({ topicTitle }: VisualProps) {
  const initial: StatisticsMode = /列联|分类|频数|卡方|显著/.test(topicTitle) ? 'contingency' : 'regression'
  const [mode, setMode] = useState<StatisticsMode>(initial)
  const [outlier, setOutlier] = useState(2)
  const [rateA, setRateA] = useState(0.7)
  const [rateB, setRateB] = useState(0.45)
  const points = [1, 2, 3, 4, 5, 6, 7, 8].map((x, index) => ({ x, y: 1.15 * x + 1.1 + [-0.4, 0.35, -0.2, 0.45, -0.3, 0.2, -0.25, outlier][index] }))
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length
  const covariance = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0)
  const squareX = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  const squareY = points.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0)
  const slope = covariance / squareX
  const intercept = meanY - slope * meanX
  const correlation = covariance / Math.sqrt(squareX * squareY)
  const mapX = (x: number) => 82 + x / 9 * 476
  const mapY = (y: number) => 292 - y / 13 * 240
  const groupSize = 100
  const observed = [Math.round(groupSize * rateA), groupSize - Math.round(groupSize * rateA), Math.round(groupSize * rateB), groupSize - Math.round(groupSize * rateB)]
  const successTotal = observed[0] + observed[2]
  const expectedSuccess = successTotal / 2
  const expectedFailure = groupSize - expectedSuccess
  const chiSquare = observed.reduce((sum, value, index) => sum + (value - (index % 2 === 0 ? expectedSuccess : expectedFailure)) ** 2 / (index % 2 === 0 ? expectedSuccess : expectedFailure), 0)

  return <MathVisualFrame title={`${topicTitle}：从数据结构到统计结论`} summary={mode === 'regression' ? '散点图先判断方向、形态、分组和异常点，再用最小二乘直线概括线性趋势；相关系数只度量线性相关。' : '2×2 列联表同时保留行列分类、边际频数和条件比例；独立性检验比较观察频数与独立假设下的期望频数。'} controls={<>
    <MathChoices label="分析结构" value={mode} onChange={(value) => setMode(value as StatisticsMode)} choices={[{ value: 'regression', label: '成对数据' }, { value: 'contingency', label: '2×2列联表' }]} />
    {mode === 'regression' ? <MathRange label="末端异常偏移" value={outlier} min={-4} max={4} step={0.5} output={outlier.toFixed(1)} onChange={setOutlier} /> : <>
      <MathRange label="A组成功比例" value={rateA} min={0.1} max={0.9} step={0.05} output={`${Math.round(rateA * 100)}%`} onChange={setRateA} />
      <MathRange label="B组成功比例" value={rateB} min={0.1} max={0.9} step={0.05} output={`${Math.round(rateB * 100)}%`} onChange={setRateB} />
    </>}
  </>} takeaway={mode === 'regression' ? <>相关不等于因果；异常点、隐藏分组和外推范围都会改变解释。预测前应检查残差图是否仍有系统结构。</> : <>显著性说明样本差异在独立假设下是否罕见，不等于差异具有实际重要性，更不能单独证明因果关系。</>}>
    {mode === 'regression' ? <svg viewBox="0 0 640 360" role="img" aria-label={`${topicTitle}散点和回归直线图，相关系数${formatMath(correlation, 3)}`}>
      <title>{topicTitle}的散点回归图</title><desc>八组成对数据、最小二乘回归直线和每个点的残差随异常点偏移变化。</desc>
      <line className="g12mv-axis" x1="68" y1="292" x2="582" y2="292" /><line className="g12mv-axis" x1="82" y1="36" x2="82" y2="310" />
      <line className="g12mv-regression-line" x1={mapX(0.5)} y1={mapY(slope * 0.5 + intercept)} x2={mapX(8.5)} y2={mapY(slope * 8.5 + intercept)} />
      {points.map((point, index) => <g key={index}><line className="g12mv-residual" x1={mapX(point.x)} y1={mapY(point.y)} x2={mapX(point.x)} y2={mapY(slope * point.x + intercept)} /><circle className={index === points.length - 1 ? 'g12mv-data-outlier' : 'g12mv-data-point'} cx={mapX(point.x)} cy={mapY(point.y)} r="8" /></g>)}
      <text x="320" y="332" textAnchor="middle">解释变量 x</text><text x="104" y="58">响应变量 y</text>
    </svg> : <svg viewBox="0 0 640 360" role="img" aria-label={`${topicTitle}二乘二列联表，卡方统计量${formatMath(chiSquare)}`}>
      <title>{topicTitle}的2×2列联表</title><desc>A组和B组按成功失败分类，单元格同时显示观察频数与独立假设下期望频数。</desc>
      <line className="g12mv-table-line" x1="92" y1="82" x2="568" y2="82" /><line className="g12mv-table-line" x1="92" y1="162" x2="568" y2="162" /><line className="g12mv-table-line" x1="92" y1="242" x2="568" y2="242" /><line className="g12mv-table-line" x1="92" y1="322" x2="568" y2="322" />
      <line className="g12mv-table-line" x1="208" y1="42" x2="208" y2="322" /><line className="g12mv-table-line" x1="378" y1="42" x2="378" y2="322" /><line className="g12mv-table-line" x1="568" y1="42" x2="568" y2="322" />
      <text x="292" y="68" textAnchor="middle">成功</text><text x="472" y="68" textAnchor="middle">失败</text>
      <text x="150" y="128" textAnchor="middle">A组</text><text x="150" y="208" textAnchor="middle">B组</text><text x="150" y="288" textAnchor="middle">合计</text>
      <text x="292" y="120" textAnchor="middle">{observed[0]}</text><text className="g12mv-expected" x="292" y="148" textAnchor="middle">期望 {expectedSuccess}</text>
      <text x="472" y="120" textAnchor="middle">{observed[1]}</text><text className="g12mv-expected" x="472" y="148" textAnchor="middle">期望 {expectedFailure}</text>
      <text x="292" y="200" textAnchor="middle">{observed[2]}</text><text className="g12mv-expected" x="292" y="228" textAnchor="middle">期望 {expectedSuccess}</text>
      <text x="472" y="200" textAnchor="middle">{observed[3]}</text><text className="g12mv-expected" x="472" y="228" textAnchor="middle">期望 {expectedFailure}</text>
      <text x="292" y="288" textAnchor="middle">{successTotal}</text><text x="472" y="288" textAnchor="middle">{200 - successTotal}</text>
    </svg>}
    <p className="amv-readout">{mode === 'regression' ? <><span>回归直线</span><strong>ŷ={formatMath(slope)}x+{formatMath(intercept)}</strong><span>相关系数</span><strong>r={formatMath(correlation, 3)}</strong><span>外推</span><strong>需另行论证</strong></> : <><span>A组成功率</span><strong>{Math.round(rateA * 100)}%</strong><span>B组成功率</span><strong>{Math.round(rateB * 100)}%</strong><span>χ²</span><strong>{formatMath(chiSquare)}</strong></>}</p>
  </MathVisualFrame>
}

type FunctionFamily = 'quadratic' | 'exponential' | 'logarithm'

function FunctionReviewVisual({ topicTitle }: VisualProps) {
  const initial: FunctionFamily = /指数/.test(topicTitle) ? 'exponential' : /对数/.test(topicTitle) ? 'logarithm' : 'quadratic'
  const [family, setFamily] = useState<FunctionFamily>(initial)
  const [parameter, setParameter] = useState(1)
  const fn = (x: number) => family === 'quadratic' ? x * x - parameter : family === 'exponential' ? Math.exp(parameter * x / 2) - 1 : x > 0 ? Math.log(x) / Math.max(0.25, parameter) : Number.NaN
  const mapX = (x: number) => 320 + x * 84
  const mapY = (y: number) => 182 - y * 45
  const domainMin = family === 'logarithm' ? 0.05 : -3.1
  const domainMax = family === 'logarithm' ? 3.1 : 3.1

  return (
    <MathVisualFrame title={`${topicTitle}：性质、图像与方程同屏检查`} summary="函数综合题先固定定义域，再把单调、奇偶、周期、零点和参数变化落到图像上。方程根就是函数图像与横轴或另一函数的交点。" controls={<>
      <MathChoices label="函数族" value={family} onChange={(value) => setFamily(value as FunctionFamily)} choices={[{ value: 'quadratic', label: '二次' }, { value: 'exponential', label: '指数' }, { value: 'logarithm', label: '对数' }]} />
      <MathRange label="参数 a" value={parameter} min={0.5} max={3} step={0.25} output={`a=${parameter.toFixed(2)}`} onChange={setParameter} />
    </>} takeaway={<>先写定义域，再判断性质；参数分类的分界点通常来自定义域改变、临界点重合、判别式为零或切线相切。</>}>
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}${family}函数图像`}>
        <title>{topicTitle}的函数性质复习图</title><desc>选择函数族并改变参数，观察图像、零点与定义域的变化。</desc>
        <CoordinateAxes xOrigin={320} yOrigin={182} />
        <polyline className="amv-primary" points={plotPoints(fn, domainMin, domainMax, mapX, mapY, 151)} />
        {family === 'quadratic' && parameter >= 0 && <><circle className="amv-point" cx={mapX(Math.sqrt(parameter))} cy={mapY(0)} r="7" /><circle className="amv-point" cx={mapX(-Math.sqrt(parameter))} cy={mapY(0)} r="7" /></>}
        {family === 'logarithm' && <line className="amv-guide" x1={mapX(0)} y1="36" x2={mapX(0)} y2="306" />}
        <text x="72" y="58">{family === 'quadratic' ? `y=x²−${parameter.toFixed(2)}` : family === 'exponential' ? `y=e^(${parameter.toFixed(2)}x/2)−1` : `y=ln x/${parameter.toFixed(2)}`}</text>
      </svg>
      <p className="amv-readout"><span>定义域</span><strong>{family === 'logarithm' ? 'x>0' : 'R'}</strong><span>单调</span><strong>{family === 'quadratic' ? '先减后增' : '递增'}</strong><span>零点</span><strong>{family === 'quadratic' ? `±${formatMath(Math.sqrt(parameter))}` : '0'}</strong></p>
    </MathVisualFrame>
  )
}

function TrigReviewVisual({ topicTitle }: VisualProps) {
  const [amplitude, setAmplitude] = useState(2)
  const [period, setPeriod] = useState(2)
  const [phase, setPhase] = useState(0)
  const fn = (x: number) => amplitude * Math.sin(period * x + phase * Math.PI / 6)
  const mapX = (x: number) => 74 + (x + Math.PI) / (2 * Math.PI) * 500
  const mapY = (y: number) => 178 - y * 62

  return <MathVisualFrame title={`${topicTitle}：参数逐项控制图像`} summary="A 控制振幅，ω 控制周期，φ 控制水平位置。先读清参数对图像的作用，再用关键点或单位圆检查恒等变换。" controls={<>
    <MathRange label="振幅 A" value={amplitude} min={0.5} max={2.5} step={0.5} output={`A=${amplitude}`} onChange={setAmplitude} />
    <MathRange label="角频率 ω" value={period} min={1} max={4} output={`ω=${period}`} onChange={setPeriod} />
    <MathRange label="相位 φ（π/6）" value={phase} min={-3} max={3} output={`φ=${phase}π/6`} onChange={setPhase} />
  </>} takeaway={<>函数 <code>y=A sin(ωx+φ)</code> 的周期是 <code>2π/|ω|</code>，水平位移是 <code>−φ/ω</code>；不要把相位 φ 直接当成位移。</>}>
    <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}三角函数图像，振幅${amplitude}，周期${formatMath(2 * Math.PI / period)}`}>
      <title>{topicTitle}的三角函数参数图</title><desc>正弦曲线随振幅、角频率和相位参数改变。</desc>
      <line className="g12mv-axis" x1="56" y1="178" x2="592" y2="178" /><line className="g12mv-axis" x1="320" y1="38" x2="320" y2="304" />
      <polyline className="amv-primary" points={plotPoints(fn, -Math.PI, Math.PI, mapX, mapY, 181)} />
      {[-1, 0, 1].map((multiple) => <text key={multiple} x={mapX(multiple * Math.PI)} y="312" textAnchor="middle">{multiple === 0 ? '0' : multiple === -1 ? '−π' : 'π'}</text>)}
    </svg>
    <p className="amv-readout"><span>值域</span><strong>[−{amplitude}, {amplitude}]</strong><span>周期</span><strong>{formatMath(2 * Math.PI / period)} ≈ {period === 1 ? '2π' : `${2}/${period}π`}</strong><span>水平位移</span><strong>{formatMath(-phase * Math.PI / 6 / period)}</strong></p>
  </MathVisualFrame>
}

function VectorReviewVisual({ topicTitle }: VisualProps) {
  const markerId = `${svgId(useId())}-g12-vector`
  const [angle, setAngle] = useState(65)
  const [length, setLength] = useState(3)
  const radians = angle * Math.PI / 180
  const u = { x: 4, y: 1 }
  const v = { x: length * Math.cos(radians), y: length * Math.sin(radians) }
  const dot = u.x * v.x + u.y * v.y
  const origin = { x: 270, y: 216 }
  const point = (value: { x: number; y: number }) => ({ x: origin.x + value.x * 60, y: origin.y - value.y * 60 })
  const pu = point(u)
  const pv = point(v)
  const projectionScale = dot / (u.x ** 2 + u.y ** 2)
  const projection = point({ x: projectionScale * u.x, y: projectionScale * u.y })

  return <MathVisualFrame title={`${topicTitle}：数量积连接坐标与几何`} summary="向量分量用于稳定计算，箭头保留方向与投影的几何意义。数量积把长度、夹角和垂直关系压缩成一个实数。" controls={<>
    <MathRange label="向量 v 的方向" value={angle} min={0} max={180} output={`${angle}°`} onChange={setAngle} />
    <MathRange label="向量 v 的长度" value={length} min={1} max={4} step={0.5} output={`|v|=${length}`} onChange={setLength} />
  </>} takeaway={<>用 <code>u·v=|u||v|cosθ</code> 求夹角和投影；若两个非零向量数量积为 0，才可判断它们垂直。</>}>
    <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}向量数量积与投影图，数量积${formatMath(dot)}`}>
      <title>{topicTitle}的平面向量投影</title><desc>两个向量及向量v在u方向的投影随夹角和长度改变。</desc>
      <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path className="g12mv-arrow-head" d="M0,0 L10,5 L0,10 Z" /></marker></defs>
      <line className="g12mv-axis" x1="46" y1={origin.y} x2="590" y2={origin.y} /><line className="g12mv-axis" x1={origin.x} y1="38" x2={origin.x} y2="304" />
      <line className="amv-primary" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pu.x} y2={pu.y} />
      <line className="amv-secondary" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={pv.x} y2={pv.y} />
      <line className="amv-guide" x1={pv.x} y1={pv.y} x2={projection.x} y2={projection.y} />
      <circle className="amv-point-secondary" cx={projection.x} cy={projection.y} r="7" />
      <text x={pu.x - 8} y={pu.y - 12}>u</text><text x={pv.x + 10} y={pv.y - 10}>v</text><text x={projection.x} y={projection.y + 28} textAnchor="middle">投影</text>
    </svg>
    <p className="amv-readout"><span>v 的分量</span><strong>({formatMath(v.x)}, {formatMath(v.y)})</strong><span>u·v</span><strong>{formatMath(dot)}</strong><span>关系</span><strong>{Math.abs(dot) < 0.15 ? '垂直' : dot > 0 ? '夹角为锐角' : '夹角为钝角'}</strong></p>
  </MathVisualFrame>
}

type SequenceMode = 'arithmetic' | 'geometric'

function SequenceReviewVisual({ topicTitle }: VisualProps) {
  const [mode, setMode] = useState<SequenceMode>(() => /等比/.test(topicTitle) ? 'geometric' : 'arithmetic')
  const [parameter, setParameter] = useState(1.5)
  const [count, setCount] = useState(8)
  const values = mode === 'arithmetic' ? Array.from({ length: count }, (_, index) => 2 + index * parameter) : Array.from({ length: count }, (_, index) => 2 * parameter ** index)
  const maximum = Math.max(...values, 1)
  const mapX = (index: number) => 74 + index / Math.max(1, count - 1) * 492
  const mapY = (value: number) => 278 - value / maximum * 210
  const sum = values.reduce((total, value) => total + value, 0)

  return <MathVisualFrame title={`${topicTitle}：通项、递推与求和互相校验`} summary="数列是定义在正整数上的函数。相邻差或相邻比识别基本结构，通项定位单项，递推描述生成过程，前 n 项和记录累计量。" controls={<>
    <MathChoices label="数列结构" value={mode} onChange={(value) => { setMode(value as SequenceMode); setParameter(value === 'geometric' ? 1.3 : 1.5) }} choices={[{ value: 'arithmetic', label: '等差' }, { value: 'geometric', label: '等比' }]} />
    <MathRange label={mode === 'arithmetic' ? '公差 d' : '公比 q'} value={parameter} min={mode === 'arithmetic' ? -1 : 0.5} max={mode === 'arithmetic' ? 3 : 1.7} step={0.1} output={parameter.toFixed(1)} onChange={setParameter} />
    <MathRange label="项数 n" value={count} min={4} max={12} output={`n=${count}`} onChange={setCount} />
  </>} takeaway={<>等差数列关注一阶差，等比数列关注相邻非零项之比；递推求通项时必须同时使用初始条件，求和后可用 <code>aₙ=Sₙ−Sₙ₋₁</code> 回查。</>}>
    <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}${mode === 'arithmetic' ? '等差' : '等比'}数列前${count}项`}>
      <title>{topicTitle}的数列离散图</title><desc>前若干项以离散点和茎线显示，参数改变时项值与前n项和同步更新。</desc>
      <line className="g12mv-axis" x1="52" y1="278" x2="594" y2="278" />
      <polyline className="amv-primary" points={values.map((value, index) => `${mapX(index)},${mapY(value)}`).join(' ')} />
      {values.map((value, index) => <g key={index}><line className="g12mv-stem" x1={mapX(index)} y1="278" x2={mapX(index)} y2={mapY(value)} /><circle className="amv-point" cx={mapX(index)} cy={mapY(value)} r="7" /><text x={mapX(index)} y="310" textAnchor="middle">{index + 1}</text></g>)}
    </svg>
    <p className="amv-readout"><span>aₙ</span><strong>{formatMath(values.at(-1) ?? 0)}</strong><span>Sₙ</span><strong>{formatMath(sum)}</strong><span>结构检查</span><strong>{mode === 'arithmetic' ? `相邻差=${parameter.toFixed(1)}` : `相邻比=${parameter.toFixed(1)}`}</strong></p>
  </MathVisualFrame>
}

type ConicMode = 'circle' | 'ellipse' | 'hyperbola' | 'parabola'

function conicDefault(topicTitle: string): ConicMode {
  if (/双曲线/.test(topicTitle)) return 'hyperbola'
  if (/抛物线/.test(topicTitle)) return 'parabola'
  if (/椭圆|圆锥曲线/.test(topicTitle)) return 'ellipse'
  return 'circle'
}

function AnalyticGeometryVisual({ topicTitle }: VisualProps) {
  const [mode, setMode] = useState<ConicMode>(() => conicDefault(topicTitle))
  const [parameter, setParameter] = useState(2)
  const [t, setT] = useState(55)
  const origin = { x: 320, y: 178 }
  const unit = 55
  const radians = t * Math.PI / 180
  const a = 3
  const b = clamp(parameter, 1, 2.7)
  const cEllipse = Math.sqrt(Math.max(0, a * a - b * b))
  const cHyperbola = Math.sqrt(a * a + b * b)
  const point = mode === 'ellipse' ? { x: a * Math.cos(radians), y: b * Math.sin(radians) } : mode === 'circle' ? { x: parameter * Math.cos(radians), y: parameter * Math.sin(radians) } : mode === 'parabola' ? { x: parameter * (Math.tan(radians / 2) ** 2), y: 2 * parameter * Math.tan(radians / 2) } : { x: a / Math.max(0.28, Math.cos(radians * 0.72)), y: b * Math.tan(radians * 0.72) }
  const px = origin.x + point.x * unit
  const py = origin.y - point.y * unit

  return <MathVisualFrame title={`${topicTitle}：方程、焦点与动点条件`} summary="解析几何把几何定义翻译成坐标方程。选好坐标系后，用焦点、距离和斜率约束控制运算，并把代数结论重新解释为图形性质。" controls={<>
    <MathChoices label="曲线类型" value={mode} onChange={(value) => { setMode(value as ConicMode); setT(value === 'hyperbola' || value === 'parabola' ? 35 : 55) }} choices={[{ value: 'circle', label: '圆' }, { value: 'ellipse', label: '椭圆' }, { value: 'hyperbola', label: '双曲线' }, { value: 'parabola', label: '抛物线' }]} />
    <MathRange label={mode === 'parabola' ? '焦参数 p' : mode === 'circle' ? '半径 r' : '短半轴 b'} value={parameter} min={1} max={mode === 'circle' ? 3 : 2.7} step={0.1} output={parameter.toFixed(1)} onChange={setParameter} />
    <MathRange label="动点参数" value={t} min={mode === 'hyperbola' ? -65 : mode === 'parabola' ? -60 : 5} max={mode === 'hyperbola' ? 65 : mode === 'parabola' ? 60 : 355} step={5} output={`${t}°`} onChange={setT} />
  </>} takeaway={mode === 'ellipse' ? <>椭圆定义是到两焦点距离之和为常数 <code>2a</code>。</> : mode === 'hyperbola' ? <>双曲线定义是到两焦点距离之差的绝对值为常数 <code>2a</code>，渐近线控制远处方向。</> : mode === 'parabola' ? <>抛物线上的点到焦点与准线距离相等；选择标准位置后可写成 <code>y²=4px</code>。</> : <>直线与圆的位置关系可用圆心到直线距离和半径比较，也可联立方程看判别式。</>}>
    <svg viewBox="0 0 640 370" role="img" aria-label={`${topicTitle}${mode}曲线与动点图`}>
      <title>{topicTitle}的解析几何动态图</title><desc>坐标系中的圆锥曲线、焦点、动点和距离线段随参数变化。</desc>
      <CoordinateAxes xOrigin={origin.x} yOrigin={origin.y} />
      {mode === 'circle' && <circle className="g12mv-conic" cx={origin.x} cy={origin.y} r={parameter * unit} />}
      {mode === 'ellipse' && <ellipse className="g12mv-conic" cx={origin.x} cy={origin.y} rx={a * unit} ry={b * unit} />}
      {mode === 'hyperbola' && <><polyline className="g12mv-conic" points={plotPoints((x) => b * Math.sqrt(x * x / (a * a) - 1), a, 4.4, (x) => origin.x + x * unit, (y) => origin.y - y * unit, 61)} /><polyline className="g12mv-conic" points={plotPoints((x) => -b * Math.sqrt(x * x / (a * a) - 1), a, 4.4, (x) => origin.x + x * unit, (y) => origin.y - y * unit, 61)} /><polyline className="g12mv-conic" points={plotPoints((x) => b * Math.sqrt(x * x / (a * a) - 1), -4.4, -a, (x) => origin.x + x * unit, (y) => origin.y - y * unit, 61)} /><polyline className="g12mv-conic" points={plotPoints((x) => -b * Math.sqrt(x * x / (a * a) - 1), -4.4, -a, (x) => origin.x + x * unit, (y) => origin.y - y * unit, 61)} /><line className="amv-guide" x1="72" y1={origin.y + 248 / a * b} x2="568" y2={origin.y - 248 / a * b} /><line className="amv-guide" x1="72" y1={origin.y - 248 / a * b} x2="568" y2={origin.y + 248 / a * b} /></>}
      {mode === 'parabola' && <polyline className="g12mv-conic" points={plotPoints((y) => y * y / (4 * parameter), -2.7, 2.7, (x) => origin.x + x * unit, (x) => origin.y - x * unit, 101)} />}
      {mode === 'ellipse' && <><circle className="amv-point-secondary" cx={origin.x - cEllipse * unit} cy={origin.y} r="7" /><circle className="amv-point-secondary" cx={origin.x + cEllipse * unit} cy={origin.y} r="7" /><line className="amv-guide" x1={px} y1={py} x2={origin.x - cEllipse * unit} y2={origin.y} /><line className="amv-guide" x1={px} y1={py} x2={origin.x + cEllipse * unit} y2={origin.y} /></>}
      {mode === 'hyperbola' && <><circle className="amv-point-secondary" cx={origin.x - cHyperbola * unit} cy={origin.y} r="7" /><circle className="amv-point-secondary" cx={origin.x + cHyperbola * unit} cy={origin.y} r="7" /></>}
      {mode === 'parabola' && <><circle className="amv-point-secondary" cx={origin.x + parameter * unit} cy={origin.y} r="7" /><line className="amv-guide" x1={origin.x - parameter * unit} y1="36" x2={origin.x - parameter * unit} y2="320" /></>}
      <circle className="amv-point" cx={px} cy={py} r="8" /><text x={px + 12} y={py - 12}>P</text>
    </svg>
    <p className="amv-readout"><span>动点 P</span><strong>({formatMath(point.x)}, {formatMath(point.y)})</strong><span>核心参数</span><strong>{mode === 'circle' ? `r=${parameter.toFixed(1)}` : mode === 'parabola' ? `p=${parameter.toFixed(1)}` : `a=${a}, b=${b.toFixed(1)}`}</strong></p>
  </MathVisualFrame>
}

type SolidMode = 'position' | 'metric' | 'volume' | 'vector'

function solidDefault(topicTitle: string): SolidMode {
  if (/体积|表面积|几何体/.test(topicTitle)) return 'volume'
  if (/向量|建系|坐标/.test(topicTitle)) return 'vector'
  if (/角|距离|动点/.test(topicTitle)) return 'metric'
  return 'position'
}

function SolidGeometryVisual({ topicTitle }: VisualProps) {
  const [mode, setMode] = useState<SolidMode>(() => solidDefault(topicTitle))
  const [angle, setAngle] = useState(42)
  const [height, setHeight] = useState(4)
  const radians = angle * Math.PI / 180
  const lineEnd = { x: 122 + 360 * Math.cos(radians), y: 246 - 190 * Math.sin(radians) }
  const baseArea = 18

  return <MathVisualFrame title={`${topicTitle}：作图、建系与度量相互验证`} summary="空间问题先识别线线、线面、面面关系，再选择垂直截面或空间向量降维。角和距离都要明确对象，不能直接从透视图估计。" controls={<>
    <MathChoices label="复习视角" value={mode} onChange={(value) => setMode(value as SolidMode)} choices={[{ value: 'position', label: '位置关系' }, { value: 'metric', label: '角与距离' }, { value: 'volume', label: '面积体积' }, { value: 'vector', label: '空间向量' }]} />
    {mode === 'volume' ? <MathRange label="棱柱高 h" value={height} min={2} max={7} step={0.5} output={`h=${height}`} onChange={setHeight} /> : <MathRange label="示意角 θ" value={angle} min={5} max={85} output={`${angle}°`} onChange={setAngle} />}
  </>} takeaway={mode === 'volume' ? <>棱柱体积是 <code>V=S底·h</code>，其中 h 必须是两底面的垂直距离；斜棱长度不能直接代替高。</> : mode === 'vector' ? <>方向向量处理直线，法向量处理平面；数量积为 0 可把垂直关系转成代数方程。</> : <>线面角取直线与其平面投影的锐角，二面角取垂直于棱的截面内两条射线的夹角。</>}>
    {mode === 'volume' ? <svg viewBox="0 0 640 350" role="img" aria-label={`底面积${baseArea}高${height}的棱柱，体积${baseArea * height}`}>
      <title>{topicTitle}的棱柱体积图</title><desc>棱柱底面积固定，高度可调，体积随垂直高度线性变化。</desc>
      <polygon className="g12mv-solid-top" points={`180,${190 - height * 18} 390,${190 - height * 18} 470,${140 - height * 18} 260,${140 - height * 18}`} />
      <polygon className="g12mv-solid-front" points={`180,${190 - height * 18} 390,${190 - height * 18} 390,286 180,286`} />
      <polygon className="g12mv-solid-side" points={`390,${190 - height * 18} 470,${140 - height * 18} 470,236 390,286`} />
      <line className="amv-guide" x1="154" y1={190 - height * 18} x2="154" y2="286" /><text x="132" y={(476 - height * 18) / 2}>h</text>
      <text x="300" y="322" textAnchor="middle">底面积 S={baseArea}</text>
    </svg> : <svg viewBox="0 0 640 350" role="img" aria-label={`${topicTitle}空间关系图，示意角${angle}度`}>
      <title>{topicTitle}的空间关系与向量图</title><desc>平面、斜线、投影和垂线组成可度量截面，空间向量模式显示三轴分量。</desc>
      <polygon className="g12mv-plane" points="70,246 455,246 574,174 190,174" />
      {mode === 'vector' ? <>
        <line className="g12mv-space-axis" x1="270" y1="228" x2="540" y2="228" /><line className="g12mv-space-axis" x1="270" y1="228" x2="100" y2="318" /><line className="g12mv-space-axis" x1="270" y1="228" x2="270" y2="42" />
        <line className="amv-primary" x1="270" y1="228" x2="466" y2="102" /><line className="amv-secondary" x1="270" y1="228" x2="424" y2="254" />
        <text x="480" y="96">u</text><text x="434" y="278">v</text><text x="538" y="252">x</text><text x="88" y="328">y</text><text x="284" y="48">z</text>
      </> : <>
        <line className="amv-primary" x1="122" y1="246" x2={lineEnd.x} y2={lineEnd.y} />
        <line className="amv-secondary" x1="122" y1="246" x2={lineEnd.x} y2="246" />
        <line className="amv-guide" x1={lineEnd.x} y1={lineEnd.y} x2={lineEnd.x} y2="246" />
        <path className="g12mv-angle" d={`M 182 246 A 60 60 0 0 0 ${122 + 60 * Math.cos(radians)} ${246 - 60 * Math.sin(radians)}`} />
        <text x="178" y="226">θ</text><text x="304" y="278" textAnchor="middle">在平面内的投影</text>
      </>}
    </svg>}
    <p className="amv-readout">{mode === 'volume' ? <><span>体积</span><strong>V={baseArea}×{height}={formatMath(baseArea * height)}</strong><span>高变化 1</span><strong>体积变化 {baseArea}</strong></> : mode === 'vector' ? <><span>方法</span><strong>方向向量 + 法向量</strong><span>核心运算</span><strong>数量积与坐标</strong></> : <><span>线面角</span><strong>{angle}°</strong><span>投影比例</span><strong>cosθ={formatMath(Math.cos(radians))}</strong><span>高度比例</span><strong>sinθ={formatMath(Math.sin(radians))}</strong></>}</p>
  </MathVisualFrame>
}

export function G12MathVisual({ topicTitle, unitTitle, chapter }: G12MathVisualProps): ReactNode {
  const context = `${chapter} ${unitTitle} ${topicTitle}`
  let visual: ReactNode

  if (/基本初等函数的导数|常函数与幂函数|指数函数与对数函数的导数|正弦函数与余弦函数的导数|导数的四则运算|乘积与商的求导|复合函数|链式法则/.test(topicTitle)) visual = <DerivativeRulesVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/成对数据|解释变量|响应变量|散点图|异常点|相关系数|相关关系|线性回归|最小二乘|残差|回归系数|插值|外推|隐变量|因果|列联表|边际频数|条件比例|期望频数|卡方|显著性|独立性检验/.test(topicTitle)) visual = <StatisticsAnalysisVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/优化|最优化|目标函数|现实.*最值|最省/.test(topicTitle)) visual = <OptimizationVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/条件概率|贝叶斯|全概率|独立事件|相互独立|乘法公式/.test(topicTitle)) visual = <ConditionalProbabilityVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/正态/.test(topicTitle)) visual = <NormalDistributionVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/随机变量|分布列|期望|均值|方差|二项分布|超几何/.test(topicTitle)) visual = <DistributionVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/计数|排列|组合|二项式|杨辉/.test(topicTitle)) visual = <CountingVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/导数|变化率|切线|单调|极值|最值|驻点/.test(topicTitle)) visual = <DerivativeVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/三角|正弦|余弦|解三角形/.test(topicTitle)) visual = <TrigReviewVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/平面向量|数量积/.test(topicTitle)) visual = <VectorReviewVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/数列|等差|等比|递推|求和/.test(topicTitle)) visual = <SequenceReviewVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/解析几何|直线与圆|圆锥曲线|椭圆|双曲线|抛物线|焦点|渐近线/.test(topicTitle)) visual = <AnalyticGeometryVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/立体几何|空间向量|空间直角坐标|线面|面面|二面角|空间距离|几何体|体积|表面积/.test(topicTitle)) visual = <SolidGeometryVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/数学建模|模型假设|敏感性|增长衰减/.test(context)) visual = <ModelingMathVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/导数/.test(context)) visual = <DerivativeVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/计数/.test(context)) visual = <CountingVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/随机变量|概率|统计/.test(context)) visual = <DistributionVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/解析几何|圆锥曲线/.test(context)) visual = <AnalyticGeometryVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/立体几何|空间向量/.test(context)) visual = <SolidGeometryVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/三角/.test(context)) visual = <TrigReviewVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/向量/.test(context)) visual = <VectorReviewVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/数列/.test(context)) visual = <SequenceReviewVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else visual = <FunctionReviewVisual topicTitle={topicTitle} unitTitle={unitTitle} />

  return <div className="g12mv">{visual}</div>
}
