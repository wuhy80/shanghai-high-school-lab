import { useState, type ReactNode } from 'react'
import { CoordinateAxes, MathChoices, MathRange, MathVisualFrame } from './AdvancedMathVisualFrame'
import { formatMath, plotPoints } from './advancedMathUtils'
import './AlgebraMathVisuals.css'

function SequenceVisual({ topicTitle }: { topicTitle: string }) {
  const preferred = /等比|增长|分期/.test(topicTitle) ? 'geometric' : 'arithmetic'
  const [kind, setKind] = useState(preferred)
  const [n, setN] = useState(6)
  const values = Array.from({ length: n }, (_, index) => kind === 'arithmetic' ? 2 + index * 3 : 2 ** index)
  const sum = values.reduce((total, value) => total + value, 0)
  const maximum = Math.max(...values, 1)
  const mapX = (index: number) => 84 + index * (490 / Math.max(1, n - 1))
  const mapY = (value: number) => 270 - value / maximum * 190

  return (
    <MathVisualFrame
      title={`${topicTitle}：逐项变化与累计`}
      summary="数列是定义域为正整数的函数。先看相邻项怎样变化，再区分通项描述和前 n 项累计。"
      controls={<>
        <MathChoices label="比较两种结构" value={kind} onChange={setKind} choices={[{ value: 'arithmetic', label: '等差：每次 +3' }, { value: 'geometric', label: '等比：每次 ×2' }]} />
        <MathRange label="观察项数 n" value={n} min={3} max={8} output={`n = ${n}`} onChange={setN} />
      </>}
      takeaway={kind === 'arithmetic'
        ? <>等差数列保持相邻两项的<strong>差</strong>不变，图上各点落在直线上；前 n 项和还要累计每一项。</>
        : <>等比数列保持相邻两项的<strong>比</strong>不变，绝对增量越来越大；公比和定义域决定模型能否外推。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}，当前展示${n}项，前n项和为${sum}`}>
        <title>{topicTitle}的项、递推关系和前项和</title>
        <desc>柱高和折线共同表示各项大小，相邻标记显示固定差或固定比。</desc>
        <line className="amv-sequence-baseline" x1="54" y1="270" x2="606" y2="270" />
        {values.map((value, index) => <g key={index}>
          <rect className="amv-soft-fill" x={mapX(index) - 18} y={mapY(value)} width="36" height={270 - mapY(value)} />
          {index > 0 && <line className="amv-primary" x1={mapX(index - 1)} y1={mapY(values[index - 1])} x2={mapX(index)} y2={mapY(value)} />}
          <circle className="amv-point" cx={mapX(index)} cy={mapY(value)} r="7" />
          <text x={mapX(index)} y="302" textAnchor="middle">a{index + 1}</text>
          <text className="amv-label-small" x={mapX(index)} y={Math.max(32, mapY(value) - 12)} textAnchor="middle">{value}</text>
        </g>)}
        <text x="594" y="46" textAnchor="end">{kind === 'arithmetic' ? 'aₙ₊₁−aₙ=3' : 'aₙ₊₁/aₙ=2'}</text>
      </svg>
      <p className="amv-readout"><span>通项</span><strong>{kind === 'arithmetic' ? 'aₙ=2+3(n−1)' : 'aₙ=2ⁿ⁻¹'}</strong><span>前 {n} 项和</span><strong>Sₙ={sum}</strong></p>
    </MathVisualFrame>
  )
}

function ComplexVisual({ topicTitle }: { topicTitle: string }) {
  const [real, setReal] = useState(3)
  const [imaginary, setImaginary] = useState(2)
  const mapX = (value: number) => 310 + value * 46
  const mapY = (value: number) => 168 - value * 34
  const modulus = Math.hypot(real, imaginary)

  return (
    <MathVisualFrame
      title={`${topicTitle}：代数式与复平面同步`}
      summary="复数 z=a+bi 同时表示一个代数对象和复平面上的点 (a,b)；共轭、模与乘 i 都有直接的几何意义。"
      controls={<>
        <MathRange label="实部 a" value={real} min={-4} max={4} output={`a = ${real}`} onChange={setReal} />
        <MathRange label="虚部 b" value={imaginary} min={-4} max={4} output={`b = ${imaginary}`} onChange={setImaginary} />
      </>}
      takeaway={<>共轭把点关于实轴对称，模是点到原点的距离；乘以 <i>i</i> 把向量逆时针旋转 90°，不是只做符号替换。</>}
    >
      <svg viewBox="0 0 640 336" role="img" aria-label={`复数${real}加${imaginary}i，模为${modulus.toFixed(2)}`}>
        <title>{topicTitle}在复平面上的表示</title>
        <desc>原复数、共轭复数和乘以i后的复数用不同点和向量表示。</desc>
        <CoordinateAxes xOrigin={310} yOrigin={168} xLabel="实轴" yLabel="虚轴" />
        <line className="amv-guide" x1={mapX(real)} y1={mapY(imaginary)} x2={mapX(real)} y2={mapY(-imaginary)} />
        <line className="amv-primary" x1="310" y1="168" x2={mapX(real)} y2={mapY(imaginary)} />
        <line className="amv-secondary" x1="310" y1="168" x2={mapX(-imaginary)} y2={mapY(real)} />
        <circle className="amv-point" cx={mapX(real)} cy={mapY(imaginary)} r="9" />
        <circle className="amv-point-secondary" cx={mapX(real)} cy={mapY(-imaginary)} r="8" />
        <rect className="amv-secondary-fill" x={mapX(-imaginary) - 7} y={mapY(real) - 7} width="14" height="14" />
        <text x={mapX(real) + 12} y={mapY(imaginary) - 12}>z</text>
        <text x={mapX(real) + 12} y={mapY(-imaginary) + 26}>z̄</text>
        <text x={mapX(-imaginary) - 12} y={mapY(real) - 14} textAnchor="end">iz</text>
      </svg>
      <p className="amv-readout"><strong>z={real}{imaginary >= 0 ? '+' : '−'}{Math.abs(imaginary)}i</strong><span>共轭</span><strong>z̄={real}{imaginary >= 0 ? '−' : '+'}{Math.abs(imaginary)}i</strong><span>模</span><strong>|z|={formatMath(modulus)}</strong></p>
    </MathVisualFrame>
  )
}

function FunctionReviewVisual({ topicTitle }: { topicTitle: string }) {
  const preferred = /指数|对数/.test(topicTitle) ? 'exponential' : 'cubic'
  const [kind, setKind] = useState(preferred)
  const [parameter, setParameter] = useState(0)
  const fn = kind === 'cubic'
    ? (x: number) => x * x * x - 3 * x + parameter
    : (x: number) => 2 ** x + parameter
  const mapX = (x: number) => 310 + x * 82
  const mapY = (y: number) => 168 - y * 24
  const domain: [number, number] = kind === 'cubic' ? [-2.25, 2.25] : [-3, 2.4]
  const samples = Array.from({ length: 5 }, (_, index) => -2 + index)

  return (
    <MathVisualFrame
      title={`${topicTitle}：式、图像与参数联动`}
      summary="函数综合题要先固定定义域，再把零点、单调变化和参数位置放在同一幅图上核对。"
      controls={<>
        <MathChoices label="观察函数结构" value={kind} onChange={setKind} choices={[{ value: 'cubic', label: '多项式' }, { value: 'exponential', label: '指数函数' }]} />
        <MathRange label="竖直参数 a" value={parameter} min={-2} max={2} step={0.5} output={`a = ${parameter}`} onChange={setParameter} />
      </>}
      takeaway={<>参数 a 改变时，整条曲线同步移动。零点是图像与 x 轴交点，也是方程 <i>f(x)=0</i> 的实根；结论必须注明定义域和参数范围。</>}
    >
      <svg viewBox="0 0 640 330" role="img" aria-label={`${topicTitle}函数图像，参数a等于${parameter}`}>
        <title>{topicTitle}的解析式、图像和参数</title>
        <desc>曲线随参数竖直移动，采样点用于比较函数值正负和变化方向。</desc>
        <CoordinateAxes />
        <polyline className="amv-primary" points={plotPoints(fn, domain[0], domain[1], mapX, mapY)} />
        {samples.filter((x) => kind === 'cubic' || x <= 2).map((x) => {
          const y = fn(x)
          return y >= -5.2 && y <= 5.2 ? <circle key={x} className="amv-point" cx={mapX(x)} cy={mapY(y)} r="6" /> : null
        })}
        <line className="amv-guide" x1="54" y1={mapY(parameter)} x2="590" y2={mapY(parameter)} />
        <text x="578" y={mapY(parameter) - 12} textAnchor="end">a={parameter}</text>
      </svg>
      <p className="amv-readout"><span>当前函数</span><strong>{kind === 'cubic' ? `f(x)=x³−3x${parameter >= 0 ? '+' : '−'}${Math.abs(parameter)}` : `f(x)=2ˣ${parameter >= 0 ? '+' : '−'}${Math.abs(parameter)}`}</strong></p>
    </MathVisualFrame>
  )
}

export function AlgebraMathVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }): ReactNode {
  const context = `${unitTitle} ${topicTitle}`
  if (/数列|递推|等差|等比|前.?项和|求和|分期/.test(context)) return <SequenceVisual topicTitle={topicTitle} />
  if (/复数|虚数|共轭|复平面/.test(context)) return <ComplexVisual topicTitle={topicTitle} />
  if (/函数|方程|不等式|零点|单调|奇偶|指数|对数|参数/.test(context)) return <FunctionReviewVisual topicTitle={topicTitle} />
  return null
}
