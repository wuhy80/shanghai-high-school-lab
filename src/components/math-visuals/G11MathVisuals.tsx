import { useId, useMemo, useState, type ReactNode } from 'react'
import { CoordinateAxes, MathChoices, MathRange, MathVisualFrame } from './AdvancedMathVisualFrame'
import { formatMath, plotPoints } from './advancedMathUtils'
import { ModelingMathVisual } from './ModelingMathVisual'
import './G11MathVisuals.css'

type G11MathVisualProps = {
  topicTitle: string
  unitTitle: string
  chapter: string
}

const radians = (degrees: number) => degrees * Math.PI / 180
const svgId = (id: string) => id.replaceAll(':', '')

function TrigVisual({ topicTitle }: { topicTitle: string }) {
  const [angle, setAngle] = useState(50)
  const [amplitude, setAmplitude] = useState(1)
  const theta = radians(angle)
  const sine = amplitude * Math.sin(theta)
  const cosine = amplitude * Math.cos(theta)
  const circleRadius = 76 * amplitude
  const pointX = 150 + circleRadius * Math.cos(theta)
  const pointY = 170 - circleRadius * Math.sin(theta)
  const wavePoints = Array.from({ length: 181 }, (_, index) => {
    const degree = index * 2
    return `${318 + degree * 0.72},${170 - 76 * amplitude * Math.sin(radians(degree))}`
  }).join(' ')

  return (
    <MathVisualFrame
      title={`${topicTitle}：圆上的角与函数图像`}
      summary="同一个角在单位圆上给出横、纵坐标，也在函数图像上给出对应高度；拖动角度可以看到两个表示同步变化。"
      controls={<>
        <MathRange label="角度 θ" value={angle} min={0} max={360} output={`${angle}°`} onChange={setAngle} />
        <MathRange label="振幅 A" value={amplitude} min={0.5} max={1.4} step={0.1} output={`A = ${amplitude.toFixed(1)}`} onChange={setAmplitude} />
      </>}
      takeaway={<>角度决定相位，振幅只做纵向伸缩；圆上坐标始终满足 <code>(Acosθ)²+(Asinθ)²=A²</code>。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}图，角度${angle}度，正弦值${sine.toFixed(2)}`}>
        <title>{topicTitle}的单位圆与正弦曲线联动</title>
        <desc>左侧圆上的动点与右侧正弦曲线同角度位置对应。</desc>
        <circle className="g11mv-neutral" cx="150" cy="170" r={circleRadius} />
        <line className="g11mv-axis" x1="28" y1="170" x2="278" y2="170" />
        <line className="g11mv-axis" x1="150" y1="42" x2="150" y2="292" />
        <path className="g11mv-angle" d={`M 188 170 A 38 38 0 ${angle > 180 ? 1 : 0} 0 ${150 + 38 * Math.cos(theta)} ${170 - 38 * Math.sin(theta)}`} />
        <line className="amv-primary" x1="150" y1="170" x2={pointX} y2={pointY} />
        <line className="amv-guide" x1={pointX} y1="170" x2={pointX} y2={pointY} />
        <circle className="amv-point" cx={pointX} cy={pointY} r="8" />
        <text x="162" y="155">θ</text>
        <text className="amv-label-small" x="150" y="320" textAnchor="middle">单位圆</text>
        <line className="g11mv-axis" x1="312" y1="170" x2="602" y2="170" />
        <line className="g11mv-axis" x1="318" y1="50" x2="318" y2="290" />
        <polyline className="amv-primary" points={wavePoints} />
        <line className="amv-guide" x1={318 + angle * 0.72} y1="56" x2={318 + angle * 0.72} y2="284" />
        <circle className="amv-point" cx={318 + angle * 0.72} cy={170 - 76 * sine} r="8" />
        <text className="amv-label-small" x="458" y="320" textAnchor="middle">y=A sin θ</text>
      </svg>
      <p className="amv-readout"><span>圆上坐标</span><strong>({formatMath(cosine)}, {formatMath(sine)})</strong><span>当前函数值</span><strong>y={formatMath(sine)}</strong></p>
    </MathVisualFrame>
  )
}

function PlaneVectorVisual({ topicTitle }: { topicTitle: string }) {
  const [angle, setAngle] = useState(55)
  const [length, setLength] = useState(3.5)
  const markerId = `${svgId(useId())}-vector-arrow`
  const theta = radians(angle)
  const ux = 4
  const uy = 1
  const vx = length * Math.cos(theta)
  const vy = length * Math.sin(theta)
  const dot = ux * vx + uy * vy
  const cross = ux * vy - uy * vx
  const end = (x: number, y: number) => ({ x: 320 + x * 52, y: 174 - y * 52 })
  const u = end(ux, uy)
  const v = end(vx, vy)
  const sum = end(ux + vx, uy + vy)

  return (
    <MathVisualFrame
      title={`${topicTitle}：方向、分量与合成`}
      summary="向量不是一支孤立箭头；坐标运算、平行四边形合成、数量积和有向面积描述的是同一组几何关系。"
      controls={<>
        <MathRange label="向量 v 的方向" value={angle} min={0} max={180} output={`${angle}°`} onChange={setAngle} />
        <MathRange label="向量 v 的模" value={length} min={1} max={5} step={0.5} output={`|v| = ${length.toFixed(1)}`} onChange={setLength} />
      </>}
      takeaway={<>数量积判断夹角与垂直，有向面积判断共线与方向；向量相等只看分量，不看箭头画在什么位置。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}向量图，数量积${dot.toFixed(2)}`}>
        <title>{topicTitle}的向量合成图</title>
        <desc>两个向量及其和构成平行四边形，参数改变时分量、数量积和面积同步变化。</desc>
        <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path className="g11mv-arrow-head" d="M0,0 L10,5 L0,10 Z" /></marker></defs>
        <CoordinateAxes xOrigin={320} yOrigin={174} />
        <polygon className="amv-soft-fill" points={`320,174 ${u.x},${u.y} ${sum.x},${sum.y} ${v.x},${v.y}`} />
        <line className="amv-primary" markerEnd={`url(#${markerId})`} x1="320" y1="174" x2={u.x} y2={u.y} />
        <line className="amv-secondary" markerEnd={`url(#${markerId})`} x1="320" y1="174" x2={v.x} y2={v.y} />
        <line className="g11mv-resultant" markerEnd={`url(#${markerId})`} x1="320" y1="174" x2={sum.x} y2={sum.y} />
        <text x={u.x - 8} y={u.y - 14}>u</text>
        <text x={v.x + 8} y={v.y - 8}>v</text>
        <text x={sum.x - 8} y={sum.y - 12} textAnchor="end">u+v</text>
      </svg>
      <p className="amv-readout"><span>v 的分量</span><strong>({formatMath(vx)}, {formatMath(vy)})</strong><span>u·v</span><strong>{formatMath(dot)}</strong><span>有向面积</span><strong>{formatMath(cross)}</strong></p>
    </MathVisualFrame>
  )
}

function ComplexVisual({ topicTitle }: { topicTitle: string }) {
  const [modulus, setModulus] = useState(3)
  const [argument, setArgument] = useState(40)
  const theta = radians(argument)
  const real = modulus * Math.cos(theta)
  const imaginary = modulus * Math.sin(theta)
  const mapX = (x: number) => 320 + x * 58
  const mapY = (y: number) => 170 - y * 58

  return (
    <MathVisualFrame
      title={`${topicTitle}：复平面上的模与辐角`}
      summary="复数的代数形式给出横纵分量，三角形式给出长度和方向；乘法会让长度相乘、角度相加。"
      controls={<>
        <MathRange label="模 |z|" value={modulus} min={0.5} max={4} step={0.5} output={modulus.toFixed(1)} onChange={setModulus} />
        <MathRange label="辐角 arg z" value={argument} min={-180} max={180} output={`${argument}°`} onChange={setArgument} />
      </>}
      takeaway={<>共轭复数关于实轴对称，模保持不变而辐角变号；<code>z·z̄=|z|²</code> 是实数。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}复平面图，复数${real.toFixed(2)}加${imaginary.toFixed(2)}i`}>
        <title>{topicTitle}的复平面表示</title>
        <desc>复数与其共轭关于实轴对称，半径和角度分别表示模和辐角。</desc>
        <CoordinateAxes xOrigin={320} yOrigin={170} xLabel="实轴" yLabel="虚轴" />
        <line className="amv-primary" x1="320" y1="170" x2={mapX(real)} y2={mapY(imaginary)} />
        <line className="amv-secondary" x1="320" y1="170" x2={mapX(real)} y2={mapY(-imaginary)} />
        <line className="amv-guide" x1={mapX(real)} y1={mapY(imaginary)} x2={mapX(real)} y2={mapY(-imaginary)} />
        <circle className="amv-point" cx={mapX(real)} cy={mapY(imaginary)} r="9" />
        <circle className="amv-point-secondary" cx={mapX(real)} cy={mapY(-imaginary)} r="8" />
        <text x={mapX(real) + 12} y={mapY(imaginary) - 10}>z</text>
        <text x={mapX(real) + 12} y={mapY(-imaginary) + 24}>z̄</text>
        <path className="g11mv-angle" d={`M 370 170 A 50 50 0 0 ${argument < 0 ? 1 : 0} ${320 + 50 * Math.cos(theta)} ${170 - 50 * Math.sin(theta)}`} />
      </svg>
      <p className="amv-readout"><span>代数形式</span><strong>z={formatMath(real)}{imaginary >= 0 ? '+' : '−'}{formatMath(Math.abs(imaginary))}i</strong><span>三角形式</span><strong>{modulus.toFixed(1)}(cos {argument}°+i sin {argument}°)</strong></p>
    </MathVisualFrame>
  )
}

type SpaceRelationKind = 'plane-foundation' | 'parallel-lines' | 'skew-angle' | 'line-plane' | 'plane-plane-relation' | 'dihedral' | 'skew-distance' | 'point-plane-distance'

function SpaceRelationVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }) {
  const context = `${unitTitle} ${topicTitle}`
  const kind: SpaceRelationKind = /点到平面的距离/.test(context)
    ? 'point-plane-distance'
    : /10\.1|平面及其基本性质|确定平面|公共直线|点线面/.test(context)
    ? 'plane-foundation'
    : /10\.5|公垂线|异面直线间距离|异面直线的距离/.test(context)
      ? 'skew-distance'
      : /空间平行直线|等角定理/.test(context)
        ? 'parallel-lines'
        : /二面角/.test(context)
        ? 'dihedral'
          : /10\.4|平面与平面/.test(context)
            ? 'plane-plane-relation'
            : /10\.2|直线与直线|异面直线/.test(context)
              ? 'skew-angle'
              : 'line-plane'
  const initial = /垂直/.test(context) ? 90 : /平行/.test(context) ? 0 : kind === 'dihedral' ? 62 : 38
  const [angle, setAngle] = useState(initial)
  const [length, setLength] = useState(6)
  const theta = radians(angle)
  const projection = length * Math.cos(theta)
  const height = length * Math.sin(theta)
  const startX = 96
  const startY = 252
  const endX = startX + projection * 62
  const endY = startY - height * 30
  const relation = angle === 0 ? '平行' : angle === 90 ? '垂直' : '相交'

  if (kind === 'point-plane-distance') {
    const distance = length * 20
    return (
      <MathVisualFrame
        title={`${topicTitle}：沿法向量作垂线`}
        summary="点到平面的距离是点到其正射影的线段长度。用平面的单位法向量做投影，可以把三维最短距离转化为数量积的绝对值。"
        controls={<MathRange label="点 P 到平面的距离 d" value={length} min={3} max={8} step={0.5} output={`d=${length.toFixed(1)}`} onChange={setLength} />}
        takeaway={<>若平面法向量为 <code>n</code>，平面上一点为 A，则距离是 <code>|AP·n|/|n|</code>；绝对值保证距离非负。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}${length.toFixed(1)}`}>
          <title>{topicTitle}的正射影与法向量图</title><desc>点P在平面阿尔法上方，垂足H和垂线段PH标出最短距离。</desc>
          <polygon className="g11mv-plane" points="72,268 500,268 584,194 156,194" />
          <line className="g11mv-distance" x1="332" y1="230" x2="332" y2={230 - distance} />
          <line className="amv-guide" x1="332" y1="230" x2="454" y2="230" />
          <path className="g11mv-right-angle" d="M 332 230 h 18 v -18" />
          <circle className="amv-point" cx="332" cy={230 - distance} r="8" /><circle className="amv-point-secondary" cx="332" cy="230" r="7" />
          <text x="348" y={224 - distance}>P</text><text x="312" y="254">H</text><text x="350" y={224 - distance / 2}>d</text>
          <text className="amv-label-small" x="488" y="292">平面 α</text>
        </svg>
        <p className="amv-readout"><span>垂足条件</span><strong>PH⊥α</strong><span>最短距离</span><strong>d(P,α)=|PH|={length.toFixed(1)}</strong></p>
      </MathVisualFrame>
    )
  }

  if (kind === 'plane-foundation') {
    const offset = (angle - 45) * 0.9
    return (
      <MathVisualFrame
        title={`${topicTitle}：用公共点与公共直线读空间图`}
        summary="三个不共线点确定一个平面；两个不重合平面若有公共点，就沿一条过该点的公共直线相交。图中用两张平面和交线把文字条件落实为可检查的结构。"
        controls={<MathRange label="平面 β 的倾斜" value={angle} min={15} max={75} output={`${angle}°`} onChange={setAngle} />}
        takeaway={<>判断点、线、面关系时先逐条写出“点在线上、线在面内”；公共点属于两个平面时，也必在两平面的交线上。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}平面基本性质示意图`}>
          <title>{topicTitle}的平面与公共直线图</title>
          <desc>平面阿尔法与平面贝塔相交于直线l，三个不共线点标出一个确定的平面。</desc>
          <polygon className="g11mv-plane" points="62,260 472,260 578,184 168,184" />
          <polygon className="g11mv-plane-secondary" points={`${222 + offset},52 ${394 + offset},76 ${438 - offset},290 ${266 - offset},266`} />
          <line className="g11mv-intersection" x1={244 + offset * 0.22} y1="198" x2={432 - offset * 0.22} y2="246" />
          <circle className="amv-point" cx="160" cy="232" r="7" /><text x="142" y="221">A</text>
          <circle className="amv-point" cx="278" cy="207" r="7" /><text x="264" y="193">B</text>
          <circle className="amv-point-secondary" cx="390" cy="234" r="7" /><text x="397" y="224">C</text>
          <text className="amv-label-small" x="94" y="286">平面 α</text>
          <text className="amv-label-small" x="432" y="95">平面 β</text>
          <text x="420" y="268">交线 l</text>
        </svg>
        <p className="amv-readout"><span>确定平面</span><strong>A、B、C 不共线</strong><span>两平面交集</span><strong>α∩β=l</strong></p>
      </MathVisualFrame>
    )
  }

  if (kind === 'skew-angle') {
    const dx = 112 * Math.cos(theta)
    const dy = 112 * Math.sin(theta)
    const pivot = { x: 252, y: 230 }
    return (
      <MathVisualFrame
        title={`${topicTitle}：平移一条直线再量夹角`}
        summary="异面直线既不相交也不平行，不能直接在原位置量角。过一条直线上的点作另一条直线的平行线，异面直线所成角就转化为同一平面内两条相交直线的锐角。"
        controls={<MathRange label="异面直线所成角 θ" value={angle} min={5} max={90} output={`${angle}°`} onChange={setAngle} />}
        takeaway={<>平移不改变直线方向，所以 <code>∠(a,b)=∠(a,b′)</code>；异面直线所成角取锐角或直角，范围是 <code>(0°,90°]</code>。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}异面直线所成角${angle}度`}>
          <title>{topicTitle}的异面直线夹角转化图</title>
          <desc>直线a和直线b位于不同位置，过直线a上的点作b的平行线b撇，再量a与b撇的夹角。</desc>
          <polygon className="g11mv-wire-box" points="76,258 388,258 546,174 234,174 76,258 76,92 388,92 546,38 546,174" />
          <line className="amv-primary" x1="106" y1={pivot.y} x2="402" y2={pivot.y} />
          <line className="amv-secondary" x1="390" y1="144" x2={390 + dx} y2={144 - dy} />
          <line className="g11mv-parallel-copy" x1={pivot.x} y1={pivot.y} x2={pivot.x + dx} y2={pivot.y - dy} />
          <path className="g11mv-angle" d={`M ${pivot.x + 46} ${pivot.y} A 46 46 0 0 0 ${pivot.x + 46 * Math.cos(theta)} ${pivot.y - 46 * Math.sin(theta)}`} />
          <circle className="amv-point" cx={pivot.x} cy={pivot.y} r="7" />
          <text x="112" y={pivot.y - 13}>a</text><text x={404 + dx} y={134 - dy}>b</text><text x={pivot.x + dx + 8} y={pivot.y - dy + 7}>b′</text>
          <text x={pivot.x + 54} y={pivot.y - 15}>θ</text>
          <text className="amv-label-small" x="454" y="292">b′∥b，a 与 b 异面</text>
        </svg>
        <p className="amv-readout"><span>原空间关系</span><strong>a、b 异面</strong><span>转化</span><strong>b′∥b 且 b′∩a=O</strong><span>所成角</span><strong>{angle}°</strong></p>
      </MathVisualFrame>
    )
  }

  if (kind === 'parallel-lines') {
    const dx = 170 * Math.cos(theta)
    const dy = 100 * Math.sin(theta)
    return (
      <MathVisualFrame
        title={`${topicTitle}：用同向平移识别平行`}
        summary="空间平行直线具有相同方向。把同一方向的线段平移到不同位置，它们仍然平行；由平行线得到的对应角保持相等。"
        controls={<MathRange label="公共方向角 θ" value={angle} min={5} max={85} output={`${angle}°`} onChange={setAngle} />}
        takeaway={<>若 <code>a∥b</code> 且 <code>b∥c</code>，则 <code>a∥c</code>；证明等角时，要同时说明角的两边分别同向平行。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}三条空间平行线示意图`}>
          <title>{topicTitle}的空间平行线与等角图</title><desc>三条位于不同位置的直线具有相同方向，并各自与辅助横线形成相等的角。</desc>
          {[[112, 258], [238, 188], [366, 116]].map(([x, y], index) => <g key={index}>
            <line className={index === 1 ? 'amv-secondary' : 'amv-primary'} x1={x} y1={y} x2={x + dx} y2={y - dy} />
            <text x={x - 18} y={y + 7}>{String.fromCharCode(97 + index)}</text>
          </g>)}
          <line className="amv-guide" x1="80" y1="286" x2="540" y2="286" />
          <line className="amv-guide" x1="80" y1="216" x2="540" y2="216" />
          <path className="g11mv-angle" d={`M 142 286 A 30 30 0 0 0 ${112 + 30 * Math.cos(theta)} ${286 - 30 * Math.sin(theta)}`} />
          <path className="g11mv-angle" d={`M 268 216 A 30 30 0 0 0 ${238 + 30 * Math.cos(theta)} ${216 - 30 * Math.sin(theta)}`} />
          <text className="amv-label-small" x="470" y="316">a∥b∥c</text>
        </svg>
        <p className="amv-readout"><span>方向关系</span><strong>a∥b，b∥c</strong><span>传递结论</span><strong>a∥c</strong><span>对应角</span><strong>{angle}°</strong></p>
      </MathVisualFrame>
    )
  }

  if (kind === 'dihedral') {
    const lift = 30 + 112 * Math.sin(theta)
    const retreat = 44 + 58 * Math.cos(theta)
    return (
      <MathVisualFrame
        title={`${topicTitle}：垂直棱作截面得到平面角`}
        summary="二面角由两个半平面和公共棱组成。分别在两个面内作垂直于棱的射线，它们的夹角才是二面角的平面角。"
        controls={<MathRange label="二面角 θ" value={angle} min={10} max={170} output={`${angle}°`} onChange={setAngle} />}
        takeaway={<>量二面角不能随意选两条面内直线；两条射线必须交于棱上同一点，并且都垂直于棱。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}二面角${angle}度`}>
          <title>{topicTitle}的二面角平面角图</title>
          <desc>平面阿尔法和贝塔共用棱l，过棱上一点的两条垂线形成二面角的平面角。</desc>
          <polygon className="g11mv-plane" points="72,264 532,264 592,208 132,208" />
          <polygon className="g11mv-plane-secondary" points={`132,208 592,208 ${592 - retreat},${208 - lift} ${132 - retreat},${208 - lift}`} />
          <line className="g11mv-intersection" x1="132" y1="208" x2="592" y2="208" />
          <line className="amv-primary" x1="338" y1="208" x2="286" y2="268" />
          <line className="amv-secondary" x1="338" y1="208" x2={338 - retreat * 0.82} y2={208 - lift * 0.82} />
          <path className="g11mv-angle" d={`M 313 237 Q ${278 - retreat * 0.2} ${205 - lift * 0.25} ${322 - retreat * 0.42} ${208 - lift * 0.42}`} />
          <path className="g11mv-right-angle" d="M 322 226 l -13 -11 l 12 -13" />
          <circle className="amv-point" cx="338" cy="208" r="7" />
          <text x="548" y="230">棱 l</text><text x="356" y="197">O</text><text x="280" y="288">α</text><text x={278 - retreat * 0.5} y={168 - lift * 0.45}>β</text>
        </svg>
        <p className="amv-readout"><span>公共棱</span><strong>l</strong><span>截面条件</span><strong>OA⊥l，OB⊥l</strong><span>平面角</span><strong>∠AOB={angle}°</strong></p>
      </MathVisualFrame>
    )
  }

  if (kind === 'plane-plane-relation') {
    const planeRelation = /平行/.test(context) ? 'parallel' : /垂直/.test(context) ? 'perpendicular' : 'intersect'
    const planeAngle = planeRelation === 'perpendicular' ? 90 : Math.max(15, angle)
    const planeTheta = radians(planeAngle)
    const lift = 32 + 106 * Math.sin(planeTheta)
    const retreat = 44 + 54 * Math.cos(planeTheta)
    return (
      <MathVisualFrame
        title={`${topicTitle}：先看交线，再找线面条件`}
        summary={planeRelation === 'parallel' ? '两个平面没有公共点时可以平行。证明平面平行通常先在一个平面内找到两条相交直线，并证明它们分别平行于另一个平面。' : '两个平面相交于一条直线。证明两平面垂直时，可在一个平面内寻找一条垂直于另一个平面的直线。'}
        controls={planeRelation === 'parallel'
          ? <MathRange label="两平面间距 d" value={length} min={3} max={8} step={0.5} output={`d=${length.toFixed(1)}`} onChange={setLength} />
          : planeRelation === 'intersect'
            ? <MathRange label="两平面夹角" value={planeAngle} min={15} max={90} output={`${planeAngle}°`} onChange={setAngle} />
            : undefined}
        takeaway={planeRelation === 'parallel' ? <>判定定理需要“两条相交直线”这个条件；只有一条直线平行于另一平面，不能推出两平面平行。</> : <>面面垂直常通过线面垂直来判定；面面垂直后，一个面内垂直交线的直线也垂直另一个面。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}两平面${planeRelation === 'parallel' ? '平行' : planeRelation === 'perpendicular' ? '垂直' : '相交'}图`}>
          <title>{topicTitle}的两平面位置关系图</title>
          <desc>{planeRelation === 'parallel' ? '平面阿尔法和贝塔上下分离且对应边平行。' : '平面阿尔法和贝塔相交于直线l。'}</desc>
          {planeRelation === 'parallel' ? <>
            <polygon className="g11mv-plane" points="82,278 484,278 566,224 164,224" />
            <polygon className="g11mv-plane-secondary" points={`82,${174 - length * 5} 484,${174 - length * 5} 566,${120 - length * 5} 164,${120 - length * 5}`} />
            <line className="g11mv-distance" x1="300" y1="250" x2="300" y2={147 - length * 5} />
            <path className="g11mv-right-angle" d="M 300 250 h 18 v -18" />
            <text x="500" y="298">α</text><text x="500" y={112 - length * 5}>β</text><text x="316" y="205">d</text>
          </> : <>
            <polygon className="g11mv-plane" points="72,264 532,264 592,208 132,208" />
            <polygon className="g11mv-plane-secondary" points={`132,208 592,208 ${592 - retreat},${208 - lift} ${132 - retreat},${208 - lift}`} />
            <line className="g11mv-intersection" x1="132" y1="208" x2="592" y2="208" />
            {planeRelation === 'perpendicular' && <path className="g11mv-right-angle" d="M 338 208 l -18 18 l 18 18" />}
            <text x="548" y="230">交线 l</text><text x="286" y="286">α</text><text x={270 - retreat * 0.35} y={174 - lift * 0.45}>β</text>
          </>}
        </svg>
        <p className="amv-readout"><span>位置关系</span><strong>{planeRelation === 'parallel' ? 'α∥β' : planeRelation === 'perpendicular' ? 'α⊥β' : 'α∩β=l'}</strong><span>关键结构</span><strong>{planeRelation === 'parallel' ? '面内两条相交直线' : '交线与线面垂直'}</strong></p>
      </MathVisualFrame>
    )
  }

  if (kind === 'skew-distance') {
    const distance = length * 18
    return (
      <MathVisualFrame
        title={`${topicTitle}：公垂线段给出最短距离`}
        summary="异面直线间的距离不是任取两点连线。只有同时垂直于两条异面直线的公垂线段，才把空间距离转化为唯一的最短长度。"
        controls={<MathRange label="公垂线段长度 d" value={length} min={3} max={8} step={0.5} output={`d=${length.toFixed(1)}`} onChange={setLength} />}
        takeaway={<>先证明 <code>AB⊥a</code> 且 <code>AB⊥b</code>，再把 <code>|AB|</code> 作为异面直线距离；只满足一个垂直条件还不够。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}公垂线段长度${length}`}>
          <title>{topicTitle}的异面直线公垂线图</title>
          <desc>异面直线a和b之间由线段AB连接，AB同时垂直于两条直线。</desc>
          <line className="amv-primary" x1="72" y1="254" x2="374" y2="254" />
          <line className="amv-secondary" x1="304" y1={226 - distance} x2="560" y2={166 - distance} />
          <line className="g11mv-distance" x1="304" y1="254" x2="334" y2={219 - distance} />
          <path className="g11mv-right-angle" d="M 287 254 v -15 h 17" />
          <path className="g11mv-right-angle" d={`M 334 ${219 - distance} l 13 11 l 9 -14`} />
          <circle className="amv-point" cx="304" cy="254" r="7" /><circle className="amv-point-secondary" cx="334" cy={219 - distance} r="7" />
          <text x="82" y="242">a</text><text x="534" y={148 - distance}>b</text><text x="286" y="284">A</text><text x="340" y={202 - distance}>B</text>
        </svg>
        <p className="amv-readout"><span>垂直条件</span><strong>AB⊥a 且 AB⊥b</strong><span>异面直线距离</span><strong>|AB|={length.toFixed(1)}</strong></p>
      </MathVisualFrame>
    )
  }

  return (
    <MathVisualFrame
      title={`${topicTitle}：把空间关系落到垂直截面`}
      summary="空间图容易受透视误导。先作垂线或投影，把直线与平面的关系转化为一个可度量的直角三角形。"
      controls={<>
        <MathRange label="线面角 θ" value={angle} min={0} max={90} output={`${angle}°`} onChange={setAngle} />
        <MathRange label="线段长度 L" value={length} min={3} max={8} step={0.5} output={`L = ${length.toFixed(1)}`} onChange={setLength} />
      </>}
      takeaway={<>线面角取直线与其平面投影的锐角；<code>投影长=Lcosθ</code>，离开平面的高度为 <code>Lsinθ</code>。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}空间关系图，当前线面角${angle}度`}>
        <title>{topicTitle}的线面投影图</title>
        <desc>斜线、它在平面上的投影和垂线构成直角三角形。</desc>
        <polygon className="g11mv-plane" points="50,252 470,252 586,174 166,174" />
        <line className="amv-primary" x1={startX} y1={startY} x2={endX} y2={endY} />
        <line className="amv-secondary" x1={startX} y1={startY} x2={endX} y2={startY} />
        <line className="amv-guide" x1={endX} y1={startY} x2={endX} y2={endY} />
        <path className="g11mv-right-angle" d={`M ${endX - 17} ${startY} v -17 h 17`} />
        <path className="g11mv-angle" d={`M ${startX + 48} ${startY} A 48 48 0 0 0 ${startX + 48 * Math.cos(theta)} ${startY - 48 * Math.sin(theta)}`} />
        <circle className="amv-point" cx={startX} cy={startY} r="7" />
        <circle className="amv-point-secondary" cx={endX} cy={endY} r="7" />
        <text x={startX + 52} y={startY - 12}>θ</text>
        <text className="amv-label-small" x="500" y="286">平面 α</text>
      </svg>
      <p className="amv-readout"><span>位置关系</span><strong>直线与平面{relation}</strong><span>投影长</span><strong>{formatMath(projection)}</strong><span>高度</span><strong>{formatMath(height)}</strong></p>
    </MathVisualFrame>
  )
}

type SolidKind = 'prism' | 'pyramid' | 'cylinder' | 'cone' | 'sphere'

function SolidGeometryVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }) {
  const context = `${unitTitle} ${topicTitle}`
  const defaultShape: SolidKind = /球/.test(context)
    ? 'sphere'
    : /圆锥/.test(context)
      ? 'cone'
      : /棱锥|正棱锥|锥体/.test(context)
        ? 'pyramid'
        : /圆柱|旋转体|旋转轴|母线/.test(context)
          ? 'cylinder'
          : 'prism'
  const [shape, setShape] = useState<SolidKind>(defaultShape)
  const [radius, setRadius] = useState(3)
  const [height, setHeight] = useState(5)
  const values = useMemo(() => {
    if (shape === 'sphere') return { volume: 4 * Math.PI * radius ** 3 / 3, surface: 4 * Math.PI * radius ** 2 }
    if (shape === 'cone') return { volume: Math.PI * radius ** 2 * height / 3, surface: Math.PI * radius * (radius + Math.hypot(radius, height)) }
    if (shape === 'cylinder') return { volume: Math.PI * radius ** 2 * height, surface: 2 * Math.PI * radius * (radius + height) }
    if (shape === 'pyramid') return { volume: radius ** 2 * height / 3, surface: radius ** 2 + 2 * radius * Math.hypot(radius / 2, height) }
    return { volume: radius ** 2 * height, surface: 2 * radius ** 2 + 4 * radius * height }
  }, [height, radius, shape])

  return (
    <MathVisualFrame
      title={`${topicTitle}：尺寸如何控制表面积和体积`}
      summary="几何体的结构决定公式，尺寸决定缩放速度。把半径或棱长放大后，表面积按平方增长，体积按立方增长。"
      controls={<>
        <MathChoices label="比较几何体" value={shape} onChange={(value) => setShape(value as SolidKind)} choices={[{ value: 'prism', label: '直棱柱' }, { value: 'pyramid', label: '正棱锥' }, { value: 'cylinder', label: '圆柱' }, { value: 'cone', label: '圆锥' }, { value: 'sphere', label: '球' }]} />
        <MathRange label={shape === 'prism' || shape === 'pyramid' ? '底面边长' : '半径 r'} value={radius} min={1} max={5} step={0.5} output={radius.toFixed(1)} onChange={setRadius} />
        {shape !== 'sphere' && <MathRange label="高度 h" value={height} min={2} max={8} step={0.5} output={height.toFixed(1)} onChange={setHeight} />}
      </>}
      takeaway={<>先辨认底面、母线、截面和高，再决定公式；截面图和展开图能帮助检查容易漏算的底面或侧面。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}几何体图，体积${values.volume.toFixed(2)}`}>
        <title>{topicTitle}的尺寸、表面积与体积</title>
        <desc>当前几何体按所选半径和高度绘制，并同步计算表面积和体积。</desc>
        {shape === 'sphere' && <g><circle className="amv-soft-fill" cx="320" cy="168" r={65 + radius * 12} /><ellipse className="g11mv-hidden-edge" cx="320" cy="168" rx={65 + radius * 12} ry={20 + radius * 3} /><line className="amv-secondary" x1="320" y1="168" x2={385 + radius * 12} y2="168" /><text x="354" y="151">r</text></g>}
        {shape === 'cone' && <g><ellipse className="amv-soft-fill" cx="320" cy="260" rx={55 + radius * 10} ry="25" /><path className="amv-primary" d={`M 320 ${48 + (8 - height) * 7} L ${265 - radius * 10} 260 M 320 ${48 + (8 - height) * 7} L ${375 + radius * 10} 260`} /><line className="amv-guide" x1="320" y1={48 + (8 - height) * 7} x2="320" y2="260" /></g>}
        {shape === 'pyramid' && <g><polygon className="amv-soft-fill" points="205,262 402,262 482,218 284,218" /><path className="amv-primary" d={`M 344 ${50 + (8 - height) * 7} L 205 262 M 344 ${50 + (8 - height) * 7} L 402 262 M 344 ${50 + (8 - height) * 7} L 482 218 M 344 ${50 + (8 - height) * 7} L 284 218`} /><line className="amv-guide" x1="344" y1={50 + (8 - height) * 7} x2="344" y2="240" /><path className="g11mv-right-angle" d="M 344 240 h 17 v 17" /></g>}
        {shape === 'cylinder' && <g><path className="amv-soft-fill" d={`M ${265 - radius * 8} 80 A ${55 + radius * 8} 24 0 0 0 ${375 + radius * 8} 80 V 258 A ${55 + radius * 8} 24 0 0 1 ${265 - radius * 8} 258 Z`} /><ellipse className="amv-secondary" cx="320" cy="80" rx={55 + radius * 8} ry="24" /><ellipse className="g11mv-hidden-edge" cx="320" cy="258" rx={55 + radius * 8} ry="24" /></g>}
        {shape === 'prism' && <g><polygon className="amv-soft-fill" points="202,104 430,104 500,62 272,62" /><polygon className="amv-secondary-fill" points="430,104 500,62 500,252 430,286" /><polygon className="g11mv-prism-front" points="202,104 430,104 430,286 202,286" /><line className="amv-guide" x1="202" y1="286" x2="272" y2="252" /><line className="amv-guide" x1="272" y1="62" x2="272" y2="252" /><line className="amv-guide" x1="272" y1="252" x2="500" y2="252" /></g>}
        <text className="amv-label-small" x="320" y="322" textAnchor="middle">尺寸改变时同步比较 S 与 V</text>
      </svg>
      <p className="amv-readout"><span>表面积 S</span><strong>{formatMath(values.surface)}</strong><span>体积 V</span><strong>{formatMath(values.volume)}</strong></p>
    </MathVisualFrame>
  )
}

function ProbabilityVisual({ topicTitle }: { topicTitle: string }) {
  const defaultMode = /频率|模拟|估计/.test(topicTitle) ? 'frequency' : 'tree'
  const [mode, setMode] = useState(defaultMode)
  const [probability, setProbability] = useState(0.6)
  const [sampleSize, setSampleSize] = useState(80)
  const sequence = useMemo(() => {
    let seed = 29
    return Array.from({ length: 240 }, () => {
      seed = (seed * 73 + 41) % 997
      return seed / 997
    })
  }, [])
  const cumulative = sequence.slice(0, sampleSize).map((_, index, values) => values.slice(0, index + 1).filter((item) => item < probability).length / (index + 1))
  const frequency = cumulative.at(-1) ?? 0
  const q = 0.45
  const joint = probability * q
  const union = probability + q - joint
  const curve = cumulative.map((value, index) => `${62 + index / Math.max(1, sampleSize - 1) * 520},${276 - value * 220}`).join(' ')

  return (
    <MathVisualFrame
      title={`${topicTitle}：样本结果与概率关系`}
      summary="概率树负责拆分事件，频率曲线负责观察重复试验；一个给出理论关系，一个展示有限样本的随机波动。"
      controls={<>
        <MathChoices label="观察方式" value={mode} onChange={setMode} choices={[{ value: 'tree', label: '事件树' }, { value: 'frequency', label: '频率稳定' }]} />
        <MathRange label="事件 A 的概率" value={probability} min={0.1} max={0.9} step={0.05} output={`P(A)=${probability.toFixed(2)}`} onChange={setProbability} />
        {mode === 'frequency' && <MathRange label="试验次数 n" value={sampleSize} min={10} max={240} step={10} output={`${sampleSize} 次`} onChange={setSampleSize} />}
      </>}
      takeaway={<>独立事件同时发生用乘法，至少一个发生用加法后减去重复部分；频率接近概率是总体趋势，不要求每一步都更接近。</>}
    >
      {mode === 'tree' ? <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}概率树，交事件概率${joint.toFixed(3)}`}>
        <title>{topicTitle}的概率树</title><desc>第一层分为事件A和其对立事件，第二层继续分为事件B和其对立事件。</desc>
        <circle className="amv-point" cx="76" cy="170" r="9" />
        <line className="amv-primary" x1="84" y1="166" x2="266" y2="82" /><line className="amv-secondary" x1="84" y1="174" x2="266" y2="258" />
        <circle className="amv-point" cx="274" cy="78" r="8" /><circle className="amv-point-secondary" cx="274" cy="262" r="8" />
        <line className="amv-primary" x1="282" y1="76" x2="512" y2="42" /><line className="amv-guide" x1="282" y1="82" x2="512" y2="118" />
        <line className="amv-secondary" x1="282" y1="258" x2="512" y2="220" /><line className="amv-guide" x1="282" y1="266" x2="512" y2="300" />
        <text x="170" y="104">A · {probability.toFixed(2)}</text><text x="164" y="246">Ā · {(1 - probability).toFixed(2)}</text>
        <text x="528" y="49">AB</text><text x="528" y="126">AB̄</text><text x="528" y="228">ĀB</text><text x="528" y="308">ĀB̄</text>
        <text className="amv-label-small" x="392" y="54">B · {q.toFixed(2)}</text><text className="amv-label-small" x="388" y="210">B · {q.toFixed(2)}</text>
      </svg> : <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}频率曲线，${sampleSize}次试验后频率${frequency.toFixed(3)}`}>
        <title>{topicTitle}的频率稳定图</title><desc>累计频率随试验次数随机波动，并围绕理论概率变化。</desc>
        <line className="g11mv-axis" x1="54" y1="276" x2="598" y2="276" /><line className="g11mv-axis" x1="62" y1="42" x2="62" y2="284" />
        <line className="amv-guide" x1="62" y1={276 - probability * 220} x2="582" y2={276 - probability * 220} />
        <polyline className="amv-primary" points={curve} />
        <circle className="amv-point" cx="582" cy={276 - frequency * 220} r="8" />
        <text x="570" y={262 - probability * 220} textAnchor="end">p={probability.toFixed(2)}</text>
        <text className="amv-label-small" x="580" y="310" textAnchor="end">试验次数 n</text>
      </svg>}
      <p className="amv-readout">{mode === 'tree' ? <><span>P(A∩B)</span><strong>{probability.toFixed(2)}×{q.toFixed(2)}={joint.toFixed(3)}</strong><span>P(A∪B)</span><strong>{union.toFixed(3)}</strong></> : <><span>理论概率</span><strong>{probability.toFixed(3)}</strong><span>累计频率</span><strong>{frequency.toFixed(3)}</strong><span>偏差</span><strong>{Math.abs(frequency - probability).toFixed(3)}</strong></>}</p>
    </MathVisualFrame>
  )
}

function StatisticsVisual({ topicTitle }: { topicTitle: string }) {
  const [outlier, setOutlier] = useState(18)
  const [shift, setShift] = useState(0)
  const values = useMemo(() => [6, 7, 8, 8, 9, 10, 10, 11, 12, outlier].map((value) => value + shift), [outlier, shift])
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const median = (sorted[4] + sorted[5]) / 2
  const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length)
  const min = Math.min(...values) - 1
  const max = Math.max(...values) + 1
  const mapX = (value: number) => 58 + (value - min) / (max - min) * 524
  const stacks = new Map<number, number>()

  return (
    <MathVisualFrame
      title={`${topicTitle}：位置、离散与异常值`}
      summary="同一组数据要同时看中心、离散和分布形状。拖动异常值可以比较均值、中位数和标准差受到的影响。"
      controls={<>
        <MathRange label="末个观测值" value={outlier} min={8} max={30} output={`${outlier}`} onChange={setOutlier} />
        <MathRange label="整体平移" value={shift} min={-3} max={3} output={`${shift >= 0 ? '+' : ''}${shift}`} onChange={setShift} />
      </>}
      takeaway={<>整体平移会同步改变均值和中位数，却不改变标准差；单个极端值会明显拉动均值和标准差，中位数通常更稳健。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}点图，均值${mean.toFixed(2)}，中位数${median.toFixed(2)}`}>
        <title>{topicTitle}的数据点图</title><desc>十个观测值排列在数轴上，均值和中位数由两条竖线标出。</desc>
        <line className="g11mv-axis" x1="48" y1="260" x2="594" y2="260" />
        {sorted.map((value, index) => {
          const level = stacks.get(value) ?? 0
          stacks.set(value, level + 1)
          return <circle key={`${value}-${index}`} className={index === sorted.length - 1 ? 'amv-point-secondary' : 'amv-point'} cx={mapX(value)} cy={238 - level * 26} r="8" />
        })}
        <line className="g11mv-mean-line" x1={mapX(mean)} y1="62" x2={mapX(mean)} y2="270" />
        <line className="g11mv-median-line" x1={mapX(median)} y1="86" x2={mapX(median)} y2="270" />
        <text x={mapX(mean)} y="48" textAnchor="middle">均值 {formatMath(mean)}</text>
        <text className="amv-label-small" x={mapX(median)} y="78" textAnchor="middle">中位数 {formatMath(median)}</text>
        {Array.from({ length: 6 }, (_, index) => min + (max - min) * index / 5).map((value) => <text key={value} className="amv-label-small" x={mapX(value)} y="294" textAnchor="middle">{formatMath(value, 1)}</text>)}
      </svg>
      <p className="amv-readout"><span>均值</span><strong>{formatMath(mean)}</strong><span>中位数</span><strong>{formatMath(median)}</strong><span>标准差</span><strong>{formatMath(deviation)}</strong></p>
    </MathVisualFrame>
  )
}

function LineVisual({ topicTitle }: { topicTitle: string }) {
  const [slope, setSlope] = useState(1)
  const [intercept, setIntercept] = useState(-1)
  const clipId = `${svgId(useId())}-line-clip`
  const mapX = (x: number) => 320 + x * 48
  const mapY = (y: number) => 170 - y * 42
  const point = { x: 2, y: 3 }
  const denominator = slope ** 2 + 1
  const signed = slope * point.x - point.y + intercept
  const foot = { x: point.x - slope * signed / denominator, y: point.y + signed / denominator }
  const distance = Math.abs(signed) / Math.sqrt(denominator)
  const angle = Math.atan(slope) * 180 / Math.PI

  if (/斜率不存在|竖直直线/.test(topicTitle)) {
    return (
      <MathVisualFrame
        title={`${topicTitle}：分母为零时改用 x=a`}
        summary="竖直直线上任意两点的横坐标相同，斜率公式中的横坐标差为零，因此斜率没有定义；它仍然有明确方向，并用方程 x=a 表示。"
        controls={<MathRange label="竖直直线的横坐标 a" value={intercept} min={-4} max={4} step={0.5} output={`a=${formatMath(intercept)}`} onChange={setIntercept} />}
        takeaway={<>“斜率不存在”不等于斜率为零：水平直线斜率为 <code>0</code>，竖直直线的斜率无定义，倾斜角为 <code>90°</code>。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}竖直直线x等于${intercept}`}>
          <title>{topicTitle}的竖直直线图</title><desc>竖直直线上的两点横坐标相同，横坐标差为零。</desc>
          <CoordinateAxes xOrigin={320} yOrigin={170} />
          <line className="amv-primary" x1={mapX(intercept)} y1="34" x2={mapX(intercept)} y2="290" />
          <circle className="amv-point" cx={mapX(intercept)} cy={mapY(2.3)} r="8" /><circle className="amv-point-secondary" cx={mapX(intercept)} cy={mapY(-1.8)} r="8" />
          <line className="amv-guide" x1={mapX(intercept)} y1={mapY(2.3)} x2={mapX(intercept)} y2={mapY(-1.8)} />
          <text x={mapX(intercept) + 14} y={mapY(2.3)}>A</text><text x={mapX(intercept) + 14} y={mapY(-1.8)}>B</text>
        </svg>
        <p className="amv-readout"><span>横坐标差</span><strong>Δx=0</strong><span>斜率</span><strong>不存在</strong><span>方程</span><strong>x={formatMath(intercept)}</strong></p>
      </MathVisualFrame>
    )
  }

  return (
    <MathVisualFrame
      title={`${topicTitle}：方向、方程与距离`}
      summary="斜率控制方向，截距控制平移；点到直线的距离是点与垂足之间的法向长度，而不是竖直方向差。"
      controls={<>
        <MathRange label="斜率 k" value={slope} min={-3} max={3} step={0.25} output={`k = ${formatMath(slope)}`} onChange={setSlope} />
        <MathRange label="纵截距 b" value={intercept} min={-4} max={4} step={0.5} output={`b = ${formatMath(intercept)}`} onChange={setIntercept} />
      </>}
      takeaway={<>点斜式强调已知点和方向，一般式强调法向量；距离公式分母 <code>√(A²+B²)</code> 负责把法向系数归一化。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}直线图，斜率${slope}，点到直线距离${distance.toFixed(2)}`}>
        <title>{topicTitle}的直线方程与距离</title><desc>直线随斜率和截距移动，并显示固定点到直线的垂线段。</desc>
        <defs><clipPath id={clipId}><rect x="42" y="28" width="554" height="264" /></clipPath></defs>
        <CoordinateAxes xOrigin={320} yOrigin={170} />
        <g clipPath={`url(#${clipId})`}><polyline className="amv-primary" points={plotPoints((x) => slope * x + intercept, -6, 6, mapX, mapY)} /></g>
        <line className="amv-secondary" x1={mapX(point.x)} y1={mapY(point.y)} x2={mapX(foot.x)} y2={mapY(foot.y)} />
        <circle className="amv-point-secondary" cx={mapX(point.x)} cy={mapY(point.y)} r="8" />
        <circle className="amv-point" cx={mapX(foot.x)} cy={mapY(foot.y)} r="7" />
        <text x={mapX(point.x) + 12} y={mapY(point.y) - 10}>P(2,3)</text>
        <text className="amv-label-small" x={mapX(foot.x) + 10} y={mapY(foot.y) + 24}>垂足 H</text>
      </svg>
      <p className="amv-readout"><span>直线</span><strong>y={formatMath(slope)}x{intercept >= 0 ? '+' : '−'}{formatMath(Math.abs(intercept))}</strong><span>倾斜角</span><strong>{formatMath(angle)}°</strong><span>PH</span><strong>{formatMath(distance)}</strong></p>
    </MathVisualFrame>
  )
}

type LineRelationMode = 'intersect' | 'parallel' | 'perpendicular'

function LineRelationVisual({ topicTitle }: { topicTitle: string }) {
  const initialMode: LineRelationMode = /平行|重合/.test(topicTitle) ? 'parallel' : /垂直/.test(topicTitle) ? 'perpendicular' : 'intersect'
  const [mode, setMode] = useState<LineRelationMode>(initialMode)
  const [slope, setSlope] = useState(1)
  const clipId = `${svgId(useId())}-line-pair-clip`
  const secondSlope = mode === 'parallel' ? slope : mode === 'perpendicular' ? -1 / slope : -0.65
  const firstIntercept = -1
  const secondIntercept = mode === 'parallel' ? 2 : 1.4
  const intersectionX = mode === 'parallel' ? null : (secondIntercept - firstIntercept) / (slope - secondSlope)
  const intersectionY = intersectionX === null ? null : slope * intersectionX + firstIntercept
  const mapX = (x: number) => 320 + x * 48
  const mapY = (y: number) => 170 - y * 42

  return (
    <MathVisualFrame
      title={`${topicTitle}：比较方向系数与交点`}
      summary="把两条直线写成斜截式后，斜率决定方向，截距决定位置。斜率相同要继续比较截距；斜率乘积为−1时两直线垂直。"
      controls={<>
        <MathChoices label="位置关系" value={mode} onChange={(value) => setMode(value as LineRelationMode)} choices={[{ value: 'intersect', label: '相交' }, { value: 'parallel', label: '平行' }, { value: 'perpendicular', label: '垂直' }]} />
        <MathRange label="直线 l₁ 的斜率" value={slope} min={0.5} max={3} step={0.25} output={`k₁=${formatMath(slope)}`} onChange={setSlope} />
      </>}
      takeaway={<>平行判定是 <code>k₁=k₂</code> 且截距不同；垂直判定是 <code>k₁k₂=−1</code>。求交点则联立两条方程。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}两直线${mode === 'intersect' ? '相交' : mode === 'parallel' ? '平行' : '垂直'}图`}>
        <title>{topicTitle}的两直线位置关系图</title><desc>两条直线随位置关系和斜率选择同步改变，交点在存在时标出。</desc>
        <defs><clipPath id={clipId}><rect x="42" y="28" width="554" height="264" /></clipPath></defs>
        <CoordinateAxes xOrigin={320} yOrigin={170} />
        <g clipPath={`url(#${clipId})`}>
          <polyline className="amv-primary" points={plotPoints((x) => slope * x + firstIntercept, -6, 6, mapX, mapY)} />
          <polyline className="amv-secondary" points={plotPoints((x) => secondSlope * x + secondIntercept, -6, 6, mapX, mapY)} />
        </g>
        {intersectionX !== null && intersectionY !== null && Math.abs(intersectionX) <= 6 && Math.abs(intersectionY) <= 4 && <circle className="amv-point" cx={mapX(intersectionX)} cy={mapY(intersectionY)} r="8" />}
        <text x="512" y="72">l₁</text><text x="516" y="254">l₂</text>
      </svg>
      <p className="amv-readout"><span>方向关系</span><strong>k₁={formatMath(slope)}，k₂={formatMath(secondSlope)}</strong><span>判定</span><strong>{mode === 'parallel' ? 'k₁=k₂，截距不同' : mode === 'perpendicular' ? 'k₁k₂=−1' : 'k₁≠k₂，有唯一交点'}</strong></p>
    </MathVisualFrame>
  )
}

function CurveEquationVisual({ topicTitle }: { topicTitle: string }) {
  const [angle, setAngle] = useState(50)
  const [radius, setRadius] = useState(3)
  const theta = radians(angle)
  const point = { x: radius * Math.cos(theta), y: radius * Math.sin(theta) }
  const mapX = (x: number) => 320 + x * 52
  const mapY = (y: number) => 170 - y * 44
  const curve = Array.from({ length: 181 }, (_, index) => `${mapX(radius * Math.cos(index * Math.PI / 90))},${mapY(radius * Math.sin(index * Math.PI / 90))}`).join(' ')

  return (
    <MathVisualFrame
      title={`${topicTitle}：同一轨迹的三种表示`}
      summary="动点满足的几何约束决定轨迹；直角坐标方程、参数方程和极坐标方程只是描述同一组点的不同语言。拖动参数可以看到参数消去后轨迹不变。"
      controls={<>
        <MathRange label="参数 t" value={angle} min={0} max={360} output={`${angle}°`} onChange={setAngle} />
        <MathRange label="轨迹半径 r" value={radius} min={1.5} max={4} step={0.5} output={`r=${radius.toFixed(1)}`} onChange={setRadius} />
      </>}
      takeaway={<>求轨迹方程后要检查取值范围，避免消参带来增解；极坐标中的点用“到极点的距离 + 方向角”定位。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}参数${angle}度的轨迹点图`}>
        <title>{topicTitle}的参数方程与极坐标图</title><desc>动点沿圆形轨迹移动，同时显示位置向量、直角坐标和极坐标参数。</desc>
        <CoordinateAxes xOrigin={320} yOrigin={170} />
        <polyline className="amv-primary" points={curve} />
        <line className="amv-secondary" x1="320" y1="170" x2={mapX(point.x)} y2={mapY(point.y)} />
        <line className="amv-guide" x1={mapX(point.x)} y1="170" x2={mapX(point.x)} y2={mapY(point.y)} />
        <circle className="amv-point" cx={mapX(point.x)} cy={mapY(point.y)} r="8" />
        <path className="g11mv-angle" d={`M 362 170 A 42 42 0 ${angle > 180 ? 1 : 0} 0 ${320 + 42 * Math.cos(theta)} ${170 - 42 * Math.sin(theta)}`} />
        <text x={mapX(point.x) + 12} y={mapY(point.y) - 10}>P(t)</text><text x="365" y="154">t</text>
      </svg>
      <p className="amv-readout"><span>参数方程</span><strong>x={radius.toFixed(1)}cos t，y={radius.toFixed(1)}sin t</strong><span>直角坐标方程</span><strong>x²+y²={formatMath(radius ** 2)}</strong><span>极坐标</span><strong>ρ={radius.toFixed(1)}</strong></p>
    </MathVisualFrame>
  )
}

type ConicKind = 'circle' | 'ellipse' | 'hyperbola' | 'parabola'

function ConicVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }) {
  const context = `${unitTitle} ${topicTitle}`
  const defaultKind: ConicKind = /双曲线/.test(context) ? 'hyperbola' : /抛物线/.test(context) ? 'parabola' : /椭圆/.test(context) ? 'ellipse' : 'circle'
  const [kind, setKind] = useState<ConicKind>(defaultKind)
  const [parameter, setParameter] = useState(2)
  const mapX = (x: number) => 320 + x * 50
  const mapY = (y: number) => 170 - y * 42
  const a = 3.6
  const ellipseE = Math.min(0.88, parameter / 4.5)
  const ellipseB = a * Math.sqrt(1 - ellipseE ** 2)
  const hyperbolaE = 1.05 + parameter / 5
  const hyperbolaB = 2 * Math.sqrt(hyperbolaE ** 2 - 1)
  const p = 0.6 + parameter * 0.55
  const path = kind === 'circle'
    ? Array.from({ length: 181 }, (_, index) => `${mapX(3 * Math.cos(index * Math.PI / 90))},${mapY(3 * Math.sin(index * Math.PI / 90))}`).join(' ')
    : kind === 'ellipse'
      ? Array.from({ length: 181 }, (_, index) => `${mapX(a * Math.cos(index * Math.PI / 90))},${mapY(ellipseB * Math.sin(index * Math.PI / 90))}`).join(' ')
      : kind === 'parabola'
        ? Array.from({ length: 121 }, (_, index) => -3.2 + index * 6.4 / 120).map((y) => `${mapX(y * y / (4 * p) - 2)},${mapY(y)}`).join(' ')
        : ''
  const hyperbolaBranches = [-1, 1].map((sign) => Array.from({ length: 121 }, (_, index) => -1.4 + index * 2.8 / 120).map((t) => `${mapX(sign * 2 * Math.cosh(t))},${mapY(hyperbolaB * Math.sinh(t))}`).join(' '))
  const showLine = /直线与|切线/.test(topicTitle)
  const tangentLine = /切线/.test(topicTitle)
  const lineY = (x: number) => tangentLine && kind === 'circle' ? 3 : 0.45 * x + 0.8
  const showCirclePair = kind === 'circle' && /圆与圆|圆系/.test(topicTitle)
  const secondCircle = Array.from({ length: 181 }, (_, index) => `${mapX(1.8 + 2.2 * Math.cos(index * Math.PI / 90))},${mapY(0.4 + 2.2 * Math.sin(index * Math.PI / 90))}`).join(' ')

  return (
    <MathVisualFrame
      title={`${topicTitle}：定义、参数与轨迹`}
      summary="圆锥曲线不是四个需要死记的方程；焦点、准线和距离条件先决定轨迹，再由参数控制开口、扁率和渐近方向。"
      controls={<>
        <MathChoices label="比较轨迹" value={kind} onChange={(value) => setKind(value as ConicKind)} choices={[{ value: 'circle', label: '圆' }, { value: 'ellipse', label: '椭圆' }, { value: 'hyperbola', label: '双曲线' }, { value: 'parabola', label: '抛物线' }]} />
        <MathRange label="形状参数" value={parameter} min={1} max={4} step={0.25} output={parameter.toFixed(2)} onChange={setParameter} />
      </>}
      takeaway={<>先写轨迹定义，再选坐标系；方程中的参数必须能回到焦点、准线、轴或离心率等几何量。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}${kind}轨迹图`}>
        <title>{topicTitle}的圆锥曲线轨迹</title><desc>参数改变时曲线和焦点或准线同步变化。</desc>
        <CoordinateAxes xOrigin={320} yOrigin={170} />
        {kind === 'hyperbola' ? hyperbolaBranches.map((points, index) => <polyline key={index} className="amv-primary" points={points} />) : <polyline className="amv-primary" points={path} />}
        {showLine && <line className="amv-secondary" x1={mapX(-5)} y1={mapY(lineY(-5))} x2={mapX(5)} y2={mapY(lineY(5))} />}
        {showCirclePair && <polyline className="amv-secondary" points={secondCircle} />}
        {kind === 'circle' && <circle className="amv-point" cx="320" cy="170" r="7" />}
        {kind === 'ellipse' && <>{[-1, 1].map((sign) => <circle key={sign} className="amv-point-secondary" cx={mapX(sign * a * ellipseE)} cy="170" r="7" />)}</>}
        {kind === 'hyperbola' && <>{[-1, 1].map((sign) => <circle key={sign} className="amv-point-secondary" cx={mapX(sign * 2 * hyperbolaE)} cy="170" r="7" />)}<line className="amv-guide" x1="100" y1={mapY(-220 / 50 * hyperbolaB / 2)} x2="540" y2={mapY(220 / 50 * hyperbolaB / 2)} /><line className="amv-guide" x1="100" y1={mapY(220 / 50 * hyperbolaB / 2)} x2="540" y2={mapY(-220 / 50 * hyperbolaB / 2)} /></>}
        {kind === 'parabola' && <><circle className="amv-point-secondary" cx={mapX(p - 2)} cy="170" r="7" /><line className="amv-guide" x1={mapX(-p - 2)} y1="38" x2={mapX(-p - 2)} y2="292" /><text className="amv-label-small" x={mapX(-p - 2) - 8} y="62" textAnchor="end">准线</text></>}
        <text className="amv-label-small" x="576" y="306" textAnchor="end">焦点与曲线同步</text>
      </svg>
      <p className="amv-readout"><span>当前轨迹</span><strong>{kind === 'circle' ? 'x²+y²=9' : kind === 'ellipse' ? `x²/${formatMath(a ** 2)}+y²/${formatMath(ellipseB ** 2)}=1` : kind === 'hyperbola' ? `x²/4−y²/${formatMath(hyperbolaB ** 2)}=1` : `(y)²=${formatMath(4 * p)}(x+2)`}</strong><span>关键参数</span><strong>{kind === 'ellipse' ? `e=${formatMath(ellipseE)}` : kind === 'hyperbola' ? `e=${formatMath(hyperbolaE)}` : kind === 'parabola' ? `p=${formatMath(p)}` : 'r=3'}</strong></p>
    </MathVisualFrame>
  )
}

function SpaceVectorVisual({ topicTitle, unitTitle }: { topicTitle: string; unitTitle: string }) {
  const context = `${unitTitle} ${topicTitle}`
  const basisTopic = /3\.2|基本定理|基底|分解|共面/.test(context)
  const [x, setX] = useState(2)
  const [z, setZ] = useState(/共面/.test(context) ? 0 : 3)
  const markerId = `${svgId(useId())}-space-arrow`
  const u = { x: 3, y: 1, z: 2 }
  const v = { x, y: 3, z }
  const dot = u.x * v.x + u.y * v.y + u.z * v.z
  const uLength = Math.hypot(u.x, u.y, u.z)
  const vLength = Math.hypot(v.x, v.y, v.z)
  const angle = Math.acos(Math.max(-1, Math.min(1, dot / (uLength * vLength)))) * 180 / Math.PI
  const project = (point: { x: number; y: number; z: number }) => ({ x: 230 + point.x * 62 - point.y * 34, y: 246 - point.z * 52 + point.y * 22 })
  const origin = project({ x: 0, y: 0, z: 0 })
  const uEnd = project(u)
  const vEnd = project(v)

  if (basisTopic) {
    const e1 = project({ x: 4, y: 0, z: 0 })
    const e2 = project({ x: 0, y: 4, z: 0 })
    const e3 = project({ x: 0, y: 0, z: 4 })
    return (
      <MathVisualFrame
        title={`${topicTitle}：用基底唯一分解空间向量`}
        summary="三个不共面的向量构成空间基底后，任意空间向量都能且只能写成它们的线性组合。把第三个系数调到零，可以直接观察向量落回前两个基向量张成的平面。"
        controls={<>
          <MathRange label="e₁ 的系数 x" value={x} min={-1} max={4} step={0.5} output={`x=${formatMath(x)}`} onChange={setX} />
          <MathRange label="e₃ 的系数 z" value={z} min={0} max={4} step={0.5} output={`z=${formatMath(z)}`} onChange={setZ} />
        </>}
        takeaway={<>空间向量基本定理要求三个基向量不共面；对于 <code>e₁、e₂</code> 所在平面，向量共面的充要条件是第三个分量 <code>z=0</code>。</>}
      >
        <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}基底分解图，系数${x}、3、${z}`}>
          <title>{topicTitle}的空间向量基底分解图</title><desc>三个不共面基向量和由系数x、3、z唯一确定的向量v绘制在同一透视坐标系中。</desc>
          <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path className="g11mv-arrow-head" d="M0,0 L10,5 L0,10 Z" /></marker></defs>
          <polygon className="g11mv-vector-plane" points={`${origin.x},${origin.y} ${e1.x},${e1.y} ${e1.x + e2.x - origin.x},${e1.y + e2.y - origin.y} ${e2.x},${e2.y}`} />
          <line className="g11mv-axis" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={e1.x} y2={e1.y} />
          <line className="g11mv-axis" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={e2.x} y2={e2.y} />
          <line className="g11mv-axis" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={e3.x} y2={e3.y} />
          <line className="amv-primary" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={vEnd.x} y2={vEnd.y} />
          <line className="amv-guide" x1={vEnd.x} y1={vEnd.y} x2={project({ x, y: 3, z: 0 }).x} y2={project({ x, y: 3, z: 0 }).y} />
          <text x={e1.x - 18} y={e1.y - 12}>e₁</text><text x={e2.x - 6} y={e2.y - 12}>e₂</text><text x={e3.x + 12} y={e3.y + 8}>e₃</text><text x={vEnd.x + 10} y={vEnd.y - 8}>v</text>
        </svg>
        <p className="amv-readout"><span>唯一分解</span><strong>v={formatMath(x)}e₁+3e₂+{formatMath(z)}e₃</strong><span>与 e₁、e₂ 共面</span><strong>{z === 0 ? '是（z=0）' : '否（z≠0）'}</strong></p>
      </MathVisualFrame>
    )
  }

  return (
    <MathVisualFrame
      title={`${topicTitle}：三维分量、数量积与投影`}
      summary="选定空间基底后，长度、夹角、垂直和平行都可以转为坐标计算；透视图只负责帮助理解，代数关系负责最终判断。"
      controls={<>
        <MathRange label="向量 v 的 x 分量" value={x} min={-3} max={4} step={0.5} output={`x=${formatMath(x)}`} onChange={setX} />
        <MathRange label="向量 v 的 z 分量" value={z} min={-2} max={5} step={0.5} output={`z=${formatMath(z)}`} onChange={setZ} />
      </>}
      takeaway={<>用 <code>u·v=|u||v|cosθ</code> 求夹角；垂直对应数量积为零，平面的法向量则把线面关系统一为向量关系。</>}
    >
      <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}空间向量图，夹角${angle.toFixed(1)}度`}>
        <title>{topicTitle}的空间向量坐标图</title><desc>两个三维向量投影到透视坐标系中，并同步计算数量积和夹角。</desc>
        <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path className="g11mv-arrow-head" d="M0,0 L10,5 L0,10 Z" /></marker></defs>
        <line className="g11mv-axis" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2="570" y2={origin.y} />
        <line className="g11mv-axis" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2="68" y2="306" />
        <line className="g11mv-axis" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={origin.x} y2="38" />
        <line className="amv-primary" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={uEnd.x} y2={uEnd.y} />
        <line className="amv-secondary" markerEnd={`url(#${markerId})`} x1={origin.x} y1={origin.y} x2={vEnd.x} y2={vEnd.y} />
        <polygon className="g11mv-vector-plane" points={`${origin.x},${origin.y} ${uEnd.x},${uEnd.y} ${uEnd.x + vEnd.x - origin.x},${uEnd.y + vEnd.y - origin.y} ${vEnd.x},${vEnd.y}`} />
        <text x={uEnd.x - 8} y={uEnd.y - 12}>u</text><text x={vEnd.x + 10} y={vEnd.y - 8}>v</text>
        <text className="amv-label-small" x="570" y={origin.y + 28}>x</text><text className="amv-label-small" x="76" y="326">y</text><text className="amv-label-small" x={origin.x + 14} y="44">z</text>
      </svg>
      <p className="amv-readout"><span>u·v</span><strong>{formatMath(dot)}</strong><span>|v|</span><strong>{formatMath(vLength)}</strong><span>夹角</span><strong>{formatMath(angle)}°</strong></p>
    </MathVisualFrame>
  )
}

type SequenceMode = 'arithmetic' | 'geometric' | 'iteration' | 'induction'

function SequenceVisual({ topicTitle }: { topicTitle: string }) {
  const defaultMode: SequenceMode = /归纳/.test(topicTitle) ? 'induction' : /迭代|√2|近似/.test(topicTitle) ? 'iteration' : /等比/.test(topicTitle) ? 'geometric' : 'arithmetic'
  const [mode, setMode] = useState<SequenceMode>(defaultMode)
  const [parameter, setParameter] = useState(mode === 'geometric' ? 1.35 : 1.5)
  const [count, setCount] = useState(8)
  const iteration = useMemo(() => {
    const values = [Math.max(0.25, parameter)]
    for (let index = 1; index < 12; index += 1) values.push((values[index - 1] + 2 / values[index - 1]) / 2)
    return values
  }, [parameter])
  const values = mode === 'iteration'
    ? iteration.slice(0, count)
    : mode === 'geometric'
      ? Array.from({ length: count }, (_, index) => 2 * parameter ** index)
      : Array.from({ length: count }, (_, index) => 2 + index * parameter)
  const maxAbs = Math.max(...values.map(Math.abs), 1)
  const mapX = (index: number) => 66 + index / Math.max(1, count - 1) * 510
  const mapY = (value: number) => 272 - value / maxAbs * 205
  const sum = values.reduce((total, value) => total + value, 0)

  return (
    <MathVisualFrame
      title={`${topicTitle}：离散变化与递推`}
      summary="数列是定义在正整数上的函数。通项直接定位第 n 项，递推式则说明怎样从已有项生成下一项。"
      controls={<>
        <MathChoices label="观察数列结构" value={mode} onChange={(value) => {
          const nextMode = value as SequenceMode
          setMode(nextMode)
          setParameter(nextMode === 'geometric' ? 1.35 : nextMode === 'iteration' ? 2.5 : 1.5)
        }} choices={[{ value: 'arithmetic', label: '等差' }, { value: 'geometric', label: '等比' }, { value: 'iteration', label: '√2 迭代' }, { value: 'induction', label: '归纳链' }]} />
        {mode !== 'induction' && <MathRange label={mode === 'geometric' ? '公比 q' : mode === 'iteration' ? '迭代初值' : '公差 d'} value={parameter} min={mode === 'geometric' ? 0.5 : mode === 'iteration' ? 0.5 : -2} max={mode === 'geometric' ? 1.8 : mode === 'iteration' ? 4 : 3} step={0.1} output={parameter.toFixed(1)} onChange={setParameter} />}
        <MathRange label="显示项数" value={count} min={4} max={12} output={`n=${count}`} onChange={setCount} />
      </>}
      takeaway={mode === 'induction' ? <>归纳法必须同时有起始命题和 <code>P(k)⇒P(k+1)</code>；只验证若干具体 n 不能代替递推证明。</> : <>等差看相邻差，等比看相邻比；迭代还要检查初值、误差和停止条件，不能只看到数值“好像稳定”。</>}
    >
      {mode === 'induction' ? <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}数学归纳链，展示到第${count}项`}>
        <title>{topicTitle}的归纳递推链</title><desc>从起始命题开始，每个命题通过递推箭头连接到下一个命题。</desc>
        {Array.from({ length: count }, (_, index) => {
          const columns = 4
          const row = Math.floor(index / columns)
          const column = index % columns
          const x = 92 + column * 150
          const y = 92 + row * 112
          return <g key={index}><circle className={index === 0 ? 'amv-point-secondary' : 'amv-soft-fill'} cx={x} cy={y} r="31" /><text x={x} y={y + 7} textAnchor="middle">P({index + 1})</text>{index < count - 1 && column < columns - 1 && <path className="g11mv-induction-arrow" d={`M ${x + 36} ${y} H ${x + 110}`} />}</g>
        })}
        <text className="amv-label-small" x="320" y="322" textAnchor="middle">奠基 + 递推 = 覆盖所有后续整数</text>
      </svg> : <svg viewBox="0 0 640 340" role="img" aria-label={`${topicTitle}数列图，显示${count}项`}>
        <title>{topicTitle}的离散数列图</title><desc>每个整数下标对应一个数列项，参数改变后所有项同步更新。</desc>
        <line className="g11mv-axis" x1="50" y1="272" x2="598" y2="272" />
        {mode === 'iteration' && <line className="amv-guide" x1="54" y1={mapY(Math.SQRT2)} x2="588" y2={mapY(Math.SQRT2)} />}
        <polyline className="amv-primary" points={values.map((value, index) => `${mapX(index)},${mapY(value)}`).join(' ')} />
        {values.map((value, index) => <g key={index}><line className="g11mv-stem" x1={mapX(index)} y1="272" x2={mapX(index)} y2={mapY(value)} /><circle className="amv-point" cx={mapX(index)} cy={mapY(value)} r="7" /><text className="amv-label-small" x={mapX(index)} y="304" textAnchor="middle">{index + 1}</text></g>)}
      </svg>}
      <p className="amv-readout"><span>第 {count} 项</span><strong>{mode === 'induction' ? `P(${count})` : formatMath(values.at(-1) ?? 0, 4)}</strong>{mode !== 'induction' && <><span>前 {count} 项和</span><strong>{formatMath(sum, 3)}</strong></>}</p>
    </MathVisualFrame>
  )
}

export function G11MathVisual({ topicTitle, unitTitle, chapter }: G11MathVisualProps): ReactNode {
  const context = `${chapter} ${unitTitle} ${topicTitle}`
  let visual: ReactNode

  if (/数学建模|活动案例|活动A|活动B/.test(chapter)) visual = <ModelingMathVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/复数/.test(context)) visual = <ComplexVisual topicTitle={topicTitle} />
  else if (/三角|正弦|余弦|单位圆|周期/.test(context)) visual = <TrigVisual topicTitle={topicTitle} />
  else if (/平面向量/.test(context)) visual = <PlaneVectorVisual topicTitle={topicTitle} />
  else if (/第10章 空间直线与平面/.test(chapter)) visual = <SpaceRelationVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/第11章 简单几何体/.test(chapter)) visual = <SolidGeometryVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/第12章 概率初步|排列|组合|概率/.test(context)) visual = <ProbabilityVisual topicTitle={topicTitle} />
  else if (/第13章 统计|统计|抽样|样本|总体|数据/.test(context)) visual = <StatisticsVisual topicTitle={topicTitle} />
  else if (/坐标平面上的直线/.test(chapter) && /1\.3|两条直线的位置关系/.test(unitTitle)) visual = <LineRelationVisual topicTitle={topicTitle} />
  else if (/坐标平面上的直线/.test(chapter)) visual = <LineVisual topicTitle={topicTitle} />
  else if (/圆锥曲线/.test(chapter) && /2\.5|曲线与方程/.test(unitTitle)) visual = <CurveEquationVisual topicTitle={topicTitle} />
  else if (/圆锥曲线|曲线与方程/.test(chapter)) visual = <ConicVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/空间向量/.test(chapter) && /点到平面的距离|两异面直线的距离|线面角|二面角/.test(context)) visual = <SpaceRelationVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/空间向量/.test(chapter)) visual = <SpaceVectorVisual topicTitle={topicTitle} unitTitle={unitTitle} />
  else if (/第4章 数列|数列|归纳|迭代/.test(context)) visual = <SequenceVisual topicTitle={topicTitle} />
  else visual = <LineVisual topicTitle={topicTitle} />

  return <div className="g11mv">{visual}</div>
}
