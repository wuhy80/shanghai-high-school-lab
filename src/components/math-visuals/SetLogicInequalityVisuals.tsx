import { useState, type ReactNode } from 'react'
import './SetLogicInequalityVisuals.css'

type VisualFrameProps = {
  title: string
  lead: string
  children: ReactNode
  takeaway: ReactNode
}

function VisualFrame({ title, lead, children, takeaway }: VisualFrameProps) {
  return (
    <section className="slv-frame" aria-labelledby={`slv-${title}`}>
      <header className="slv-heading">
        <p>动态示意</p>
        <h3 id={`slv-${title}`}>{title}</h3>
        <span>{lead}</span>
      </header>
      {children}
      <p className="slv-takeaway"><strong>看懂这一点</strong><span>{takeaway}</span></p>
    </section>
  )
}

function RangeControl({ id, label, value, min, max, step = 1, onChange }: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="slv-range" htmlFor={id}>
      <span>{label}<output htmlFor={id}>{value}</output></span>
      <input id={id} type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function Toggle<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="slv-toggle" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}

function SetRepresentationVisual() {
  const [candidate, setCandidate] = useState(2)
  const members = [1, 3, 4]
  const belongs = members.includes(candidate)

  return (
    <VisualFrame
      title="集合的表示与元素关系"
      lead="集合是一个整体；元素与集合之间只问“属于”或“不属于”。"
      takeaway={<><b className="slv-a">A</b> 用列举法写作 <code>{'{1, 3, 4}'}</code>。现在 <code>{candidate} {belongs ? '∈' : '∉'} A</code>，符号开口朝向集合。</>}
    >
      <div className="slv-controls">
        <RangeControl id="set-candidate" label="检验元素 x" value={candidate} min={0} max={5} onChange={setCandidate} />
      </div>
      <div className="slv-canvas slv-set-membership">
        <svg viewBox="0 0 680 270" role="img" aria-label={`集合 A 包含 1、3、4，当前 ${candidate} ${belongs ? '属于' : '不属于'}集合 A`}>
          <title>元素是否属于集合 A</title>
          <desc>集合边界内有元素 1、3、4。改变 x 后，关系符号会在属于和不属于之间变化。</desc>
          <ellipse className="slv-set-a-fill" cx="430" cy="135" rx="205" ry="96" />
          <text className="slv-set-label slv-a-fill" x="265" y="78">集合 A</text>
          {members.map((member, index) => (
            <g key={member} className={candidate === member ? 'slv-member is-current' : 'slv-member'}>
              <circle cx={350 + index * 82} cy={142 + (index % 2) * 24} r="25" />
              <text x={350 + index * 82} y={148 + (index % 2) * 24} textAnchor="middle">{member}</text>
            </g>
          ))}
          <g className={`slv-candidate ${belongs ? 'is-in' : 'is-out'}`} transform="translate(82 135)">
            <circle r="31" />
            <text y="6" textAnchor="middle">x={candidate}</text>
          </g>
          <path className="slv-relation-arrow" d="M125 135 H188" />
          <text className={belongs ? 'slv-a-fill slv-symbol' : 'slv-b-fill slv-symbol'} x="155" y="119" textAnchor="middle">{belongs ? '∈' : '∉'}</text>
        </svg>
        <div className="slv-equation" aria-live="polite"><code>{candidate} {belongs ? '∈' : '∉'} A</code><span>{belongs ? `${candidate} 正好出现在集合 A 的元素清单中` : `${candidate} 没有出现在集合 A 的元素清单中`}</span></div>
      </div>
    </VisualFrame>
  )
}

type SubsetCase = 'proper' | 'equal' | 'false'

function SubsetEqualityVisual() {
  const [mode, setMode] = useState<SubsetCase>('proper')
  const data = {
    proper: { a: '{1, 2}', b: '{1, 2, 3}', relation: 'A ⊂ B', note: 'A 的每个元素都在 B 中，但 B 还多一个 3。' },
    equal: { a: '{1, 2, 3}', b: '{1, 2, 3}', relation: 'A = B', note: 'A ⊆ B 且 B ⊆ A，两个方向同时成立。' },
    false: { a: '{1, 4}', b: '{1, 2, 3}', relation: 'A ⊄ B', note: '只要找到反例元素 4∈A 且 4∉B，就能否定 A⊆B。' },
  }[mode]

  return (
    <VisualFrame title="子集与集合相等" lead="判断子集要逐个检查元素；判断相等要检查两个包含方向。" takeaway={data.note}>
      <div className="slv-controls">
        <Toggle label="切换集合关系" value={mode} options={[
          { value: 'proper', label: '真子集' },
          { value: 'equal', label: '集合相等' },
          { value: 'false', label: '反例否定' },
        ]} onChange={setMode} />
      </div>
      <div className="slv-canvas">
        <svg className={`slv-subset ${mode === 'equal' ? 'is-equal' : ''}`} viewBox="0 0 680 300" role="img" aria-label={`${data.relation}，A=${data.a}，B=${data.b}`}>
          <title>子集与相等的包含方向</title>
          <desc>外层区域表示 B，内层区域表示 A。相等时两个边界重合，不是子集时元素 4 落在 B 外。</desc>
          <ellipse className="slv-set-b-fill" cx={mode === 'false' ? 410 : 365} cy="150" rx={mode === 'equal' ? 165 : mode === 'false' ? 205 : 245} ry={mode === 'equal' ? 105 : 120} />
          <ellipse className="slv-set-a-fill" cx={mode === 'false' ? 200 : 365} cy="150" rx={mode === 'false' ? 150 : 165} ry="105" />
          <text className="slv-set-label slv-b-fill" x={mode === 'equal' ? 420 : mode === 'false' ? 520 : 558} y={mode === 'equal' ? 91 : 78}>B {data.b}</text>
          <text className="slv-set-label slv-a-fill" x={mode === 'equal' ? 250 : mode === 'false' ? 112 : 320} y={mode === 'equal' ? 91 : 125}>A {data.a}</text>
          {mode === 'false' ? (
            <g className="slv-subset-elements">
              <circle className="slv-a-mark" cx="285" cy="175" r="17" /><text x="285" y="181" textAnchor="middle">1</text>
              <circle className="slv-b-mark" cx="405" cy="175" r="17" /><text x="405" y="181" textAnchor="middle">2</text>
              <circle className="slv-b-mark" cx="465" cy="175" r="17" /><text x="465" y="181" textAnchor="middle">3</text>
              <circle className="slv-counter-mark" cx="118" cy="175" r="22" /><text x="118" y="181" textAnchor="middle">4</text><text className="slv-b-fill" x="118" y="219" textAnchor="middle">反例：4∉B</text>
            </g>
          ) : (
            <g className="slv-subset-elements">
              <circle className="slv-a-mark" cx="326" cy="175" r="17" /><text x="326" y="181" textAnchor="middle">1</text>
              <circle className="slv-a-mark" cx="382" cy="175" r="17" /><text x="382" y="181" textAnchor="middle">2</text>
              {mode === 'equal' && <><circle className="slv-a-mark" cx="438" cy="175" r="17" /><text x="438" y="181" textAnchor="middle">3</text></>}
              {mode === 'proper' && <><circle className="slv-b-mark" cx="560" cy="175" r="17" /><text x="560" y="181" textAnchor="middle">3</text></>}
            </g>
          )}
          {mode === 'equal' && <text className="slv-mutual-inclusion" x="365" y="239" textAnchor="middle">A ⊆ B　且　B ⊆ A</text>}
          <text className="slv-relation-text" x="365" y="276" textAnchor="middle">{data.relation}</text>
        </svg>
      </div>
    </VisualFrame>
  )
}

type SetOperation = 'intersection' | 'union' | 'complement'

function SetOperationsVisual() {
  const [operation, setOperation] = useState<SetOperation>('intersection')
  const points = [
    { value: 1, area: 'a', x: 230, y: 145 },
    { value: 2, area: 'both', x: 340, y: 116 },
    { value: 3, area: 'both', x: 340, y: 184 },
    { value: 4, area: 'b', x: 450, y: 145 },
    { value: 5, area: 'outside', x: 586, y: 72 },
  ]
  const active = (area: string) => operation === 'intersection' ? area === 'both' : operation === 'union' ? area !== 'outside' : area !== 'a' && area !== 'both'
  const result = operation === 'intersection' ? 'A∩B = {2, 3}' : operation === 'union' ? 'A∪B = {1, 2, 3, 4}' : 'CᵤA = {4, 5}'

  return (
    <VisualFrame title="交集并集与补集" lead="先看元素所在区域，再按运算规则取区域；三种运算不是符号记忆题。" takeaway={operation === 'intersection' ? '交集只保留“同时在 A 和 B 中”的重叠区域。' : operation === 'union' ? '并集收下“至少在一个集合中”的全部区域，重叠元素只写一次。' : '补集必须先给定全集 U，再取“在 U 中但不在 A 中”的部分。'}>
      <div className="slv-controls">
        <Toggle label="选择集合运算" value={operation} options={[
          { value: 'intersection', label: '交集 A∩B' },
          { value: 'union', label: '并集 A∪B' },
          { value: 'complement', label: 'A 的补集' },
        ]} onChange={setOperation} />
      </div>
      <div className="slv-canvas">
        <svg className="slv-venn" viewBox="0 0 680 285" role="img" aria-label={`全集 U 中 A 与 B 的韦恩图，当前结果 ${result}`}>
          <title>用区域理解集合运算</title>
          <desc>A 含 1、2、3，B 含 2、3、4，全集还含 5。被强调的点属于当前运算结果。</desc>
          <rect className="slv-universe" x="38" y="28" width="604" height="218" rx="8" />
          <text className="slv-set-label" x="54" y="54">全集 U</text>
          <circle className="slv-set-a-fill" cx="285" cy="150" r="115" />
          <circle className="slv-set-b-fill" cx="395" cy="150" r="115" />
          <text className="slv-set-label slv-a-fill" x="205" y="82">A</text>
          <text className="slv-set-label slv-b-fill" x="475" y="82">B</text>
          {points.map((point) => <g key={point.value} className={`slv-venn-point ${active(point.area) ? 'is-active' : ''}`}><circle cx={point.x} cy={point.y} r="20" /><text x={point.x} y={point.y + 6} textAnchor="middle">{point.value}</text></g>)}
          <text className="slv-relation-text" x="340" y="274" textAnchor="middle">{result}</text>
        </svg>
      </div>
    </VisualFrame>
  )
}

type PropositionKind = 'number' | 'universal' | 'existential'

function PropositionNegationVisual() {
  const [kind, setKind] = useState<PropositionKind>('number')
  const [x, setX] = useState(1)
  const truth = x > 2
  const copy = {
    number: { original: `p：${x} > 2`, negation: `¬p：${x} ≤ 2`, result: truth ? 'p 真，¬p 假' : 'p 假，¬p 真' },
    universal: { original: 'p：所有实数 x 都有 x²≥0', negation: '¬p：存在实数 x，使 x²<0', result: '否定“所有”要改成“存在一个不满足”' },
    existential: { original: 'p：存在实数 x，使 x²=2', negation: '¬p：所有实数 x 都有 x²≠2', result: '否定“存在”要改成“所有都不满足”' },
  }[kind]

  return (
    <VisualFrame title="命题及其否定" lead="否定命题要覆盖原命题的全部反面，不能只在句首添加“不是”。" takeaway={copy.result}>
      <div className="slv-controls slv-controls-wrap">
        <Toggle label="选择命题类型" value={kind} options={[
          { value: 'number', label: '数值命题' },
          { value: 'universal', label: '全称命题' },
          { value: 'existential', label: '存在命题' },
        ]} onChange={setKind} />
        {kind === 'number' && <RangeControl id="proposition-x" label="改变 x" value={x} min={-1} max={5} onChange={setX} />}
      </div>
      <div className="slv-canvas slv-proposition">
        <div className="slv-negation-pair">
          <div className={kind === 'number' && truth ? 'is-true' : ''}><small>原命题 p</small><strong>{copy.original}</strong>{kind === 'number' && <span>{truth ? '真' : '假'}</span>}</div>
          <div className="slv-not-symbol" aria-hidden="true">恰有一真</div>
          <div className={kind === 'number' && !truth ? 'is-true' : ''}><small>否定 ¬p</small><strong>{copy.negation}</strong>{kind === 'number' && <span>{!truth ? '真' : '假'}</span>}</div>
        </div>
        <div className="slv-quantifier-rule"><code>∀（所有） ↔ ∃（存在）</code><span>同时把判断关系取反：<code>&gt; ↔ ≤</code>，<code>= ↔ ≠</code></span></div>
      </div>
    </VisualFrame>
  )
}

type ConditionCase = 'square' | 'divisible' | 'equal'

function SufficientNecessaryVisual() {
  const [mode, setMode] = useState<ConditionCase>('square')
  const data = {
    square: { p: 'p：x = 2', q: 'q：x² = 4', relation: 'p ⇒ q', left: 'p 是 q 的充分条件', right: 'q 是 p 的必要条件', counter: '但 x = −2 也使 x²=4，所以 q ⇏ p。' },
    divisible: { p: 'p：整数 n 是 4 的倍数', q: 'q：整数 n 是偶数', relation: 'p ⇒ q', left: '是 4 的倍数足以保证是偶数', right: '是偶数是成为 4 的倍数所必需的', counter: '反例 n=6 是偶数，却不是 4 的倍数。' },
    equal: { p: 'p：四边形是正方形', q: 'q：四边形四边相等且四角为直角', relation: 'p ⇔ q', left: 'p 足以推出 q', right: 'q 也足以推出 p', counter: '两个方向都成立，因此互为充要条件。' },
  }[mode]

  return (
    <VisualFrame title="充分条件与必要条件" lead="先写出可靠的推理箭头，再站在箭头两端给条件命名。" takeaway={data.counter}>
      <div className="slv-controls">
        <Toggle label="选择条件例子" value={mode} options={[
          { value: 'square', label: '方程例子' },
          { value: 'divisible', label: '整除例子' },
          { value: 'equal', label: '充要条件' },
        ]} onChange={setMode} />
      </div>
      <div className="slv-canvas slv-condition">
        <div className="slv-condition-flow">
          <div><small>条件 p</small><strong>{data.p.replace('p：', '')}</strong><span>{data.left}</span></div>
          <div className="slv-logic-arrow"><b>{data.relation}</b><span>{mode === 'equal' ? '两个方向均成立' : '只保证从左到右'}</span></div>
          <div><small>结论 q</small><strong>{data.q.replace('q：', '')}</strong><span>{data.right}</span></div>
        </div>
        <p className="slv-counterexample"><strong>{mode === 'equal' ? '双向检查' : '反向检查'}</strong>{data.counter}</p>
      </div>
    </VisualFrame>
  )
}

function signedTerm(value: number, variable = '') {
  if (value === 0) return ''
  const sign = value > 0 ? '+' : '−'
  const magnitude = Math.abs(value)
  return `${sign} ${magnitude === 1 && variable ? '' : magnitude}${variable}`
}

function RootStructureVisual() {
  const [rootOne, setRootOne] = useState(-2)
  const [rootTwo, setRootTwo] = useState(3)
  const sum = rootOne + rootTwo
  const product = rootOne * rootTwo
  const b = -sum
  const equation = `x² ${signedTerm(b, 'x')} ${signedTerm(product)} = 0`.replace(/\s+/g, ' ')
  const xPosition = (root: number) => 340 + root * 55

  return (
    <VisualFrame title="一元二次方程根的结构" lead="把根当作结构参数：先放两个根，因式、系数和图像会一起变化。" takeaway={<>若方程首项系数为 1，则 <code>x₁+x₂=−b={sum}</code>，<code>x₁x₂=c={product}</code>。这就是韦达定理。</>}>
      <div className="slv-controls slv-two-controls">
        <RangeControl id="root-one" label="根 x₁" value={rootOne} min={-4} max={4} onChange={setRootOne} />
        <RangeControl id="root-two" label="根 x₂" value={rootTwo} min={-4} max={4} onChange={setRootTwo} />
      </div>
      <div className="slv-canvas slv-root-structure">
        <div className="slv-factor-chain">
          <code>(x {rootOne >= 0 ? '−' : '+'} {Math.abs(rootOne)})(x {rootTwo >= 0 ? '−' : '+'} {Math.abs(rootTwo)}) = 0</code>
          <span aria-hidden="true">展开</span>
          <code>{equation}</code>
        </div>
        <svg viewBox="0 0 680 175" role="img" aria-label={`数轴上的两个根为 ${rootOne} 和 ${rootTwo}，和为 ${sum}，积为 ${product}`}>
          <title>根与系数同步变化</title>
          <line className="slv-axis" x1="58" y1="88" x2="622" y2="88" />
          {[-4, -2, 0, 2, 4].map((value) => <g key={value}><line className="slv-tick" x1={xPosition(value)} y1="80" x2={xPosition(value)} y2="96" /><text x={xPosition(value)} y="120" textAnchor="middle">{value}</text></g>)}
          <g className="slv-root-one"><circle cx={xPosition(rootOne)} cy="88" r="10" /><text x={xPosition(rootOne)} y="56" textAnchor="middle">x₁={rootOne}</text></g>
          <g className="slv-root-two"><circle cx={xPosition(rootTwo)} cy="88" r="10" /><text x={xPosition(rootTwo)} y={rootOne === rootTwo ? 151 : 56} textAnchor="middle">x₂={rootTwo}</text></g>
        </svg>
        <div className="slv-coefficient-map"><span><small>两根之和</small><b>{sum}</b><em>取相反数 → x 项系数 {b}</em></span><span><small>两根之积</small><b>{product}</b><em>直接成为常数项 {product}</em></span></div>
      </div>
    </VisualFrame>
  )
}

type SignChoice = 'positive' | 'negative'

function QuadraticInequalityVisual() {
  const [leading, setLeading] = useState<'up' | 'down'>('up')
  const [choice, setChoice] = useState<SignChoice>('positive')
  const [x, setX] = useState(0)
  const a = leading === 'up' ? 1 : -1
  const value = a * (x + 2) * (x - 3)
  const holds = choice === 'positive' ? value > 0 : value < 0
  const signAt = (sample: number) => a * (sample + 2) * (sample - 3) > 0 ? '+' : '−'
  const activeIntervals = [-3, 0, 4].map((sample) => choice === 'positive' ? signAt(sample) === '+' : signAt(sample) === '−')
  const xPosition = (number: number) => 340 + number * 50
  const isBoundary = x === -2 || x === 3

  return (
    <VisualFrame title="一元二次不等式" lead="先找零点切开数轴，再判断每段的符号；答案是满足目标符号的区间。" takeaway={<>当前 <code>f({x})={value}</code>，所以 <code>x={x}</code>{holds ? '满足' : '不满足'} <code>{a === 1 ? '' : '−'}(x+2)(x−3){choice === 'positive' ? '>0' : '<0'}</code>。</>}>
      <div className="slv-controls slv-controls-wrap">
        <Toggle label="选择开口方向" value={leading} options={[{ value: 'up', label: 'a > 0 开口向上' }, { value: 'down', label: 'a < 0 开口向下' }]} onChange={setLeading} />
        <Toggle label="选择目标符号" value={choice} options={[{ value: 'positive', label: '求 f(x)>0' }, { value: 'negative', label: '求 f(x)<0' }]} onChange={setChoice} />
        <RangeControl id="quadratic-test-x" label="拿 x 检验" value={x} min={-5} max={5} step={0.5} onChange={setX} />
      </div>
      <div className="slv-canvas slv-sign-diagram">
        <div className="slv-sign-table" role="table" aria-label="二次式符号表">
          <div role="row"><b role="columnheader">x</b><span>−∞ 到 −2</span><i>−2</i><span>−2 到 3</span><i>3</i><span>3 到 +∞</span></div>
          <div role="row"><b role="rowheader">f(x)</b><span>{signAt(-3)}</span><i>0</i><span>{signAt(0)}</span><i>0</i><span>{signAt(4)}</span></div>
        </div>
        <svg viewBox="0 0 680 150" role="img" aria-label={`零点是负 2 和 3，当前满足条件的区间在数轴上加粗，检验点 x 等于 ${x}`}>
          <title>二次不等式的区间选取</title>
          <line className="slv-axis" x1="55" y1="72" x2="625" y2="72" />
          <line className={activeIntervals[0] ? 'slv-answer-band is-active' : 'slv-answer-band'} x1="55" y1="72" x2={xPosition(-2)} y2="72" />
          <line className={activeIntervals[1] ? 'slv-answer-band is-active' : 'slv-answer-band'} x1={xPosition(-2)} y1="72" x2={xPosition(3)} y2="72" />
          <line className={activeIntervals[2] ? 'slv-answer-band is-active' : 'slv-answer-band'} x1={xPosition(3)} y1="72" x2="625" y2="72" />
          {[-2, 3].map((value) => <g key={value}><circle className="slv-open-end" cx={xPosition(value)} cy="72" r="8" /><text x={xPosition(value)} y="108" textAnchor="middle">{value}</text></g>)}
          {isBoundary ? (
            <g className="slv-boundary-test"><path d={`M ${xPosition(x)} 62 L ${xPosition(x) - 7} 50 H ${xPosition(x) + 7} Z`} /><text x={xPosition(x)} y="38" textAnchor="middle">检验 x={x}</text></g>
          ) : (
            <g className={holds ? 'slv-test-point is-valid' : 'slv-test-point'}><circle cx={xPosition(x)} cy="72" r="6" /><text x={xPosition(x)} y="38" textAnchor="middle">x={x}</text></g>
          )}
        </svg>
      </div>
    </VisualFrame>
  )
}

function RationalInequalityVisual() {
  const [choice, setChoice] = useState<'strict' | 'inclusive'>('strict')
  const [x, setX] = useState(0)
  const numerator = x - 1
  const denominator = x + 2
  const undefinedValue = denominator === 0
  const quotient = undefinedValue ? null : numerator / denominator
  const holds = quotient !== null && (choice === 'strict' ? quotient > 0 : quotient <= 0)
  const xPosition = (number: number) => 330 + number * 52
  const result = choice === 'strict' ? 'x<−2 或 x>1' : '−2<x≤1'
  const isBoundary = x === -2 || x === 1

  return (
    <VisualFrame title="分式不等式" lead="分子为零可以取到，分母为零永远不能取；两类临界点必须区别标记。" takeaway={undefinedValue ? <><code>x=−2</code> 使分母为 0，分式没有意义，所以任何不等号都不能收下它。</> : <>当前分子符号为 <code>{numerator > 0 ? '+' : numerator < 0 ? '−' : '0'}</code>，分母符号为 <code>{denominator > 0 ? '+' : '−'}</code>，同号得正、异号得负。</>}>
      <div className="slv-controls slv-controls-wrap">
        <Toggle label="选择分式不等式" value={choice} options={[{ value: 'strict', label: '(x−1)/(x+2) > 0' }, { value: 'inclusive', label: '(x−1)/(x+2) ≤ 0' }]} onChange={setChoice} />
        <RangeControl id="rational-test-x" label="拿 x 检验" value={x} min={-5} max={5} step={0.5} onChange={setX} />
      </div>
      <div className="slv-canvas slv-rational">
        <div className="slv-fraction-status" aria-live="polite">
          <span><small>分子 x−1</small><b>{numerator}</b></span><strong aria-hidden="true">÷</strong><span><small>分母 x+2</small><b>{denominator}</b></span><strong aria-hidden="true">=</strong><span><small>分式值</small><b>{quotient === null ? '无意义' : Number.isInteger(quotient) ? quotient : quotient.toFixed(2)}</b></span>
        </div>
        <svg viewBox="0 0 680 175" role="img" aria-label={`临界点是负 2 和 1，解集是 ${result}，当前 x 等于 ${x}${undefinedValue ? '使分式无意义' : holds ? '满足不等式' : '不满足不等式'}`}>
          <title>分式不等式的符号区间</title>
          <line className="slv-axis" x1="55" y1="82" x2="625" y2="82" />
          <line className={`slv-answer-band ${choice === 'strict' ? 'is-active' : ''}`} x1="55" y1="82" x2={xPosition(-2)} y2="82" />
          <line className={`slv-answer-band ${choice === 'inclusive' ? 'is-active' : ''}`} x1={xPosition(-2)} y1="82" x2={xPosition(1)} y2="82" />
          <line className={`slv-answer-band ${choice === 'strict' ? 'is-active' : ''}`} x1={xPosition(1)} y1="82" x2="625" y2="82" />
          <g><circle className="slv-forbidden-end" cx={xPosition(-2)} cy="82" r="9" /><text x={xPosition(-2)} y="122" textAnchor="middle">−2 分母零</text></g>
          <g><circle className={choice === 'inclusive' ? 'slv-closed-end' : 'slv-open-end'} cx={xPosition(1)} cy="82" r="9" /><text x={xPosition(1)} y="122" textAnchor="middle">1 分子零</text></g>
          {isBoundary ? (
            <g className={`slv-boundary-test ${undefinedValue ? 'is-undefined' : holds ? 'is-valid' : ''}`}><path d={`M ${xPosition(x)} 70 L ${xPosition(x) - 7} 58 H ${xPosition(x) + 7} Z`} /><text x={xPosition(x)} y="45" textAnchor="middle">检验 x={x}</text></g>
          ) : (
            <g className={undefinedValue ? 'slv-test-point is-undefined' : holds ? 'slv-test-point is-valid' : 'slv-test-point'}><circle cx={xPosition(x)} cy="82" r="6" /><text x={xPosition(x)} y="42" textAnchor="middle">x={x}</text></g>
          )}
          <text className="slv-relation-text" x="340" y="160" textAnchor="middle">解集：{result}</text>
        </svg>
      </div>
    </VisualFrame>
  )
}

function BasicInequalityVisual() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(8)
  const arithmeticMean = (a + b) / 2
  const geometricMean = Math.sqrt(a * b)
  const gap = arithmeticMean - geometricMean
  const barY = (value: number) => 245 - value * 19

  return (
    <VisualFrame title="基本不等式及等号条件" lead="对正数 a、b，算术平均数不小于几何平均数；两数越不均衡，差距越明显。" takeaway={gap < 0.001 ? '现在 a=b，两个平均数重合，等号成立。' : <>差值 <code>{gap.toFixed(2)}</code> 等于 <code>(√a−√b)²/2</code>，平方不会为负，所以左边一定不小于右边。</>}>
      <div className="slv-controls slv-two-controls">
        <RangeControl id="amgm-a" label="正数 a" value={a} min={1} max={9} step={0.5} onChange={setA} />
        <RangeControl id="amgm-b" label="正数 b" value={b} min={1} max={9} step={0.5} onChange={setB} />
      </div>
      <div className="slv-canvas slv-amgm">
        <div className="slv-formula-line"><code>(a+b)/2 = {arithmeticMean.toFixed(2)}</code><strong>≥</strong><code>√(ab) = {geometricMean.toFixed(2)}</code></div>
        <svg viewBox="0 0 680 285" role="img" aria-label={`a 等于 ${a}，b 等于 ${b}，算术平均数 ${arithmeticMean.toFixed(2)}，几何平均数 ${geometricMean.toFixed(2)}`}>
          <title>算术平均数与几何平均数比较</title>
          <desc>两根柱分别表示算术平均数和几何平均数。a 与 b 相等时两根柱等高。</desc>
          {[2, 4, 6, 8, 10].map((value) => <g key={value}><line className="slv-grid-line" x1="105" y1={barY(value)} x2="575" y2={barY(value)} /><text x="91" y={barY(value) + 5} textAnchor="end">{value}</text></g>)}
          <rect className="slv-am-bar" x="185" y={barY(arithmeticMean)} width="120" height={245 - barY(arithmeticMean)} />
          <rect className="slv-gm-bar" x="375" y={barY(geometricMean)} width="120" height={245 - barY(geometricMean)} />
          <text className="slv-a-fill" x="245" y={barY(arithmeticMean) - 10} textAnchor="middle">{arithmeticMean.toFixed(2)}</text>
          <text className="slv-b-fill" x="435" y={barY(geometricMean) - 10} textAnchor="middle">{geometricMean.toFixed(2)}</text>
          <text x="245" y="272" textAnchor="middle">算术平均 (a+b)/2</text>
          <text x="435" y="272" textAnchor="middle">几何平均 √ab</text>
          {gap > 0.001 && <line className="slv-gap-line" x1="530" y1={barY(arithmeticMean)} x2="530" y2={barY(geometricMean)} />}
        </svg>
        <div className={`slv-equality ${gap < 0.001 ? 'is-equal' : ''}`}><strong>等号条件</strong><code>a = b</code><span>当前 {a === b ? '成立' : `不成立（${a} ≠ ${b}）`}</span></div>
      </div>
    </VisualFrame>
  )
}

function AbsoluteInequalityVisual() {
  const [mode, setMode] = useState<'inside' | 'outside'>('inside')
  const [center, setCenter] = useState(1)
  const [radius, setRadius] = useState(3)
  const [x, setX] = useState(0)
  const distance = Math.abs(x - center)
  const holds = mode === 'inside' ? distance < radius : distance > radius
  const left = center - radius
  const right = center + radius
  const xPosition = (number: number) => 340 + number * 39
  const result = mode === 'inside' ? `${left}<x<${right}` : `x<${left} 或 x>${right}`
  const distanceExpression = center >= 0 ? `|x−${center}|` : `|x+${Math.abs(center)}|`
  const isBoundary = x === left || x === right

  return (
    <VisualFrame title="绝对值不等式" lead="把 |x−a| 读成 x 到中心 a 的距离；小于半径取内部，大于半径取外部。" takeaway={<>当前距离 <code>|{x}−({center})|={distance}</code>，与半径 <code>{radius}</code> 比较后，<code>x={x}</code>{holds ? '在解集内' : '不在解集内'}。</>}>
      <div className="slv-controls slv-controls-wrap">
        <Toggle label="选择距离条件" value={mode} options={[{ value: 'inside', label: '|x−a| < r' }, { value: 'outside', label: '|x−a| > r' }]} onChange={setMode} />
        <div className="slv-three-controls">
          <RangeControl id="absolute-center" label="中心 a" value={center} min={-3} max={3} onChange={setCenter} />
          <RangeControl id="absolute-radius" label="半径 r" value={radius} min={1} max={4} onChange={setRadius} />
          <RangeControl id="absolute-x" label="检验 x" value={x} min={-7} max={7} onChange={setX} />
        </div>
      </div>
      <div className="slv-canvas slv-absolute">
        <div className="slv-distance-readout"><span>左边界 <b>{left}</b></span><span>中心 <b>{center}</b></span><span>右边界 <b>{right}</b></span></div>
        <svg viewBox="0 0 680 205" role="img" aria-label={`中心为 ${center}，半径为 ${radius}，边界是 ${left} 和 ${right}，解集 ${result}`}>
          <title>绝对值不等式表示数轴上的距离</title>
          <line className="slv-axis" x1="55" y1="106" x2="625" y2="106" />
          <line className={`slv-answer-band ${mode === 'outside' ? 'is-active' : ''}`} x1="55" y1="106" x2={xPosition(left)} y2="106" />
          <line className={`slv-answer-band ${mode === 'inside' ? 'is-active' : ''}`} x1={xPosition(left)} y1="106" x2={xPosition(right)} y2="106" />
          <line className={`slv-answer-band ${mode === 'outside' ? 'is-active' : ''}`} x1={xPosition(right)} y1="106" x2="625" y2="106" />
          <line className="slv-radius-brace" x1={xPosition(center)} y1="66" x2={xPosition(right)} y2="66" />
          <text className="slv-a-fill" x={(xPosition(center) + xPosition(right)) / 2} y="51" textAnchor="middle">距离 r={radius}</text>
          {[left, right].map((value) => <g key={value}><circle className="slv-open-end" cx={xPosition(value)} cy="106" r="9" /><text x={xPosition(value)} y="145" textAnchor="middle">{value}</text></g>)}
          <g className="slv-center-point"><circle cx={xPosition(center)} cy="106" r="7" /><text x={xPosition(center)} y="180" textAnchor="middle">中心 a={center}</text></g>
          {isBoundary ? (
            <g className="slv-boundary-test"><path d={`M ${xPosition(x)} 94 L ${xPosition(x) - 7} 82 H ${xPosition(x) + 7} Z`} /><text x={xPosition(x)} y="70" textAnchor="middle">检验 x={x}</text></g>
          ) : (
            <g className={holds ? 'slv-test-point is-valid' : 'slv-test-point'}><circle cx={xPosition(x)} cy="106" r="6" /><text x={xPosition(x)} y="83" textAnchor="middle">x={x}</text></g>
          )}
        </svg>
        <p className="slv-solution"><code>{distanceExpression}{mode === 'inside' ? '<' : '>'}{radius}</code><span>⇔</span><code>{result}</code></p>
      </div>
    </VisualFrame>
  )
}

type EqualityPropertyMode = 'equation' | 'add' | 'positive' | 'negative' | 'mistake'
type EquationStep = 'original' | 'subtract' | 'divide'
type ScaleOperation = 'multiply' | 'divide'
type MistakeCase = 'one-side' | 'no-reverse' | 'zero'

const formatPropertyNumber = (value: number) => Number(value.toFixed(2)).toString()

function EqualityInequalityPropertiesVisual() {
  const [mode, setMode] = useState<EqualityPropertyMode>('equation')
  const [equationStep, setEquationStep] = useState<EquationStep>('original')
  const [offset, setOffset] = useState(3)
  const [factor, setFactor] = useState(2)
  const [scaleOperation, setScaleOperation] = useState<ScaleOperation>('multiply')
  const [mistake, setMistake] = useState<MistakeCase>('one-side')
  const left = -2
  const right = 4
  const signedFactor = mode === 'negative' ? -factor : factor
  const transformedLeft = mode === 'add'
    ? left + offset
    : scaleOperation === 'multiply' ? left * signedFactor : left / signedFactor
  const transformedRight = mode === 'add'
    ? right + offset
    : scaleOperation === 'multiply' ? right * signedFactor : right / signedFactor
  const transformedRelation = mode === 'negative' ? '>' : '<'
  const xPosition = (value: number) => 340 + value * 17
  const equation = {
    original: { left: '2x + 3', right: '9', operation: '先观察原等式', note: '解集为 {3}' },
    subtract: { left: '2x', right: '6', operation: '两边同时减 3', note: '解集仍为 {3}' },
    divide: { left: 'x', right: '3', operation: '再把两边同时除以 2', note: '解集仍为 {3}' },
  }[equationStep]
  const mistakes = {
    'one-side': {
      original: '2 < 5',
      wrong: '只给左边加 3：5 < 5',
      correction: '应在两边同时加 3：5 < 8。只改变一边，无法保证新命题与原命题同真假。',
    },
    'no-reverse': {
      original: '−2 < 4',
      wrong: '两边乘 −2 仍写 <：4 < −8',
      correction: '乘负数后两点关于 0 反射并交换左右，正确结果是 4 > −8。',
    },
    zero: {
      original: 'x = 2',
      wrong: '两边乘 0 得 0 = 0，所以仍同解',
      correction: '0=0 对每个实数 x 都成立，解集从 {2} 扩大为全体实数；等式两边乘除同一个数时，这个数必须非零才保证同解。',
    },
  }[mistake]
  const operationSymbol = scaleOperation === 'multiply' ? '×' : '÷'
  const operationText = mode === 'add'
    ? `同时${offset >= 0 ? '加' : '减'} ${Math.abs(offset)}`
    : `同时${scaleOperation === 'multiply' ? '乘' : '除以'} ${signedFactor}`

  const takeaway = mode === 'equation'
    ? <>等式两边做<strong>相同且可逆</strong>的变形，解集不变。加减任意同数都可逆；乘除同数时必须保证这个数不为 0。</>
    : mode === 'add'
      ? <>同加减一个数只是让两个点一起平移，间距仍为 <code>{right - left}</code>，所以左右次序和不等号方向不变。</>
      : mode === 'positive'
        ? <>乘除正数相当于按正比例伸缩数轴，左边仍在左、右边仍在右，所以 <code>&lt;</code> 方向不变。</>
        : mode === 'negative'
          ? <>乘除负数包含一次关于 0 的反射，两点交换左右位置；为了继续表示正确大小关系，<code>&lt;</code> 必须变为 <code>&gt;</code>。</>
          : <>判断变形是否合法，要同时检查：<strong>两边是否做同一操作</strong>、乘除数是否非零、负数乘除后是否反向。</>

  return (
    <VisualFrame title="等式与不等式的性质" lead="把代数变形看成天平与数轴上的同步操作，就能理解规则，而不是只背“变号”。" takeaway={takeaway}>
      <div className="slv-controls">
        <Toggle label="选择要观察的性质" value={mode} options={[
          { value: 'equation', label: '等式同解变形' },
          { value: 'add', label: '同加减方向不变' },
          { value: 'positive', label: '乘除正数方向不变' },
          { value: 'negative', label: '乘除负数方向反向' },
          { value: 'mistake', label: '错误诊断' },
        ]} onChange={setMode} />
        {mode === 'equation' && <Toggle label="选择等式变形步骤" value={equationStep} options={[
          { value: 'original', label: '原式' },
          { value: 'subtract', label: '两边同时减 3' },
          { value: 'divide', label: '再同时除以 2' },
        ]} onChange={setEquationStep} />}
        {mode === 'add' && <RangeControl id="property-offset" label="两边同加的数 c" value={offset} min={-4} max={4} onChange={setOffset} />}
        {(mode === 'positive' || mode === 'negative') && <div className="slv-property-scale-controls">
          <Toggle label="选择乘法或除法" value={scaleOperation} options={[{ value: 'multiply', label: '乘同一个数' }, { value: 'divide', label: '除以同一个数' }]} onChange={setScaleOperation} />
          <RangeControl id="property-factor" label={`${mode === 'positive' ? '正' : '负'}数的绝对值`} value={factor} min={1} max={4} onChange={setFactor} />
        </div>}
        {mode === 'mistake' && <Toggle label="选择错误示例" value={mistake} options={[
          { value: 'one-side', label: '只改变一边' },
          { value: 'no-reverse', label: '乘负数不反向' },
          { value: 'zero', label: '等式两边乘 0' },
        ]} onChange={setMistake} />}
      </div>

      {mode === 'equation' ? (
        <div className="slv-canvas slv-equation-property">
          <div className="slv-equation-history" role="group" aria-label="等式同解变形的三个步骤">
            {[
              { key: 'original', label: '原等式', formula: '2x + 3 = 9' },
              { key: 'subtract', label: '两边同时 −3', formula: '2x = 6' },
              { key: 'divide', label: '两边同时 ÷2', formula: 'x = 3' },
            ].map((item) => <button key={item.key} type="button" aria-pressed={equationStep === item.key} onClick={() => setEquationStep(item.key as EquationStep)}><small>{item.label}</small><strong>{item.formula}</strong><span>解集 {'{3}'}</span></button>)}
          </div>
          <div className="slv-balance-operation"><span>左边</span><strong>{equation.operation}</strong><span>右边</span></div>
          <div className="slv-balance" aria-live="polite" aria-label={`${equation.left} 等于 ${equation.right}，${equation.note}`}>
            <span className="slv-balance-pan">{equation.left}</span><b>=</b><span className="slv-balance-pan">{equation.right}</span>
          </div>
          <p className="slv-property-result"><code>{equation.left} = {equation.right}</code><span>{equation.note}</span></p>
        </div>
      ) : mode === 'mistake' ? (
        <div className="slv-canvas slv-mistake-property">
          <div className="slv-mistake-flow">
            <div><small>原关系</small><strong>{mistakes.original}</strong></div>
            <span aria-hidden="true">→</span>
            <div className="is-wrong"><small>错误变形</small><strong>{mistakes.wrong}</strong></div>
          </div>
          <p><strong>错在哪里</strong><span>{mistakes.correction}</span></p>
        </div>
      ) : (
        <div className="slv-canvas slv-inequality-property">
          <div className="slv-property-formulas" aria-live="polite">
            <code>{left} &lt; {right}</code>
            <span>{operationText}</span>
            <code>
              {mode === 'add'
                ? `${left} ${offset >= 0 ? '+' : '−'} ${Math.abs(offset)} ${transformedRelation} ${right} ${offset >= 0 ? '+' : '−'} ${Math.abs(offset)}`
                : `(${left}) ${operationSymbol} (${signedFactor}) ${transformedRelation} ${right} ${operationSymbol} (${signedFactor})`}
            </code>
            <strong>{formatPropertyNumber(transformedLeft)} {transformedRelation} {formatPropertyNumber(transformedRight)}</strong>
          </div>
          <svg viewBox="0 0 680 275" role="img" aria-label={`原来负 2 小于 4，${operationText}以后，${formatPropertyNumber(transformedLeft)} ${transformedRelation === '<' ? '小于' : '大于'} ${formatPropertyNumber(transformedRight)}`}>
            <title>相同运算如何改变数轴上的大小关系</title>
            <desc>青色点始终表示原不等式左边的数，红色方块始终表示右边的数。连接线显示它们经过相同运算后的移动。</desc>
            <text className="slv-row-title" x="52" y="55">变形前</text>
            <line className="slv-axis" x1="68" y1="88" x2="612" y2="88" />
            <text className="slv-row-title" x="52" y="160">变形后</text>
            <line className="slv-axis" x1="68" y1="193" x2="612" y2="193" />
            {[-16, 0, 16].map((value) => <g key={value}><line className="slv-tick" x1={xPosition(value)} y1="185" x2={xPosition(value)} y2="201" /><text x={xPosition(value)} y="226" textAnchor="middle">{value}</text></g>)}
            <line className="slv-left-movement" x1={xPosition(left)} y1="88" x2={xPosition(transformedLeft)} y2="193" />
            <line className="slv-right-movement" x1={xPosition(right)} y1="88" x2={xPosition(transformedRight)} y2="193" />
            <g className="slv-left-number"><circle cx={xPosition(left)} cy="88" r="9" /><text x={xPosition(left)} y="64" textAnchor="middle">左边 {left}</text><circle cx={xPosition(transformedLeft)} cy="193" r="9" /><text x={xPosition(transformedLeft)} y="238" textAnchor="middle">左边 {formatPropertyNumber(transformedLeft)}</text></g>
            <g className="slv-right-number"><rect x={xPosition(right) - 9} y="79" width="18" height="18" /><text x={xPosition(right)} y="64" textAnchor="middle">右边 {right}</text><rect x={xPosition(transformedRight) - 9} y="184" width="18" height="18" /><text x={xPosition(transformedRight)} y="264" textAnchor="middle">右边 {formatPropertyNumber(transformedRight)}</text></g>
            <text className={mode === 'negative' ? 'slv-direction is-reversed' : 'slv-direction'} x="340" y="147" textAnchor="middle">{mode === 'negative' ? '< 反向为 >' : '< 方向保持'}</text>
          </svg>
        </div>
      )}
    </VisualFrame>
  )
}

const visualByTopic: Record<string, () => ReactNode> = {
  集合的表示与元素关系: SetRepresentationVisual,
  子集与集合相等: SubsetEqualityVisual,
  交集并集与补集: SetOperationsVisual,
  命题及其否定: PropositionNegationVisual,
  充分条件与必要条件: SufficientNecessaryVisual,
  一元二次方程根的结构: RootStructureVisual,
  一元二次不等式: QuadraticInequalityVisual,
  分式不等式: RationalInequalityVisual,
  基本不等式及等号条件: BasicInequalityVisual,
  绝对值不等式: AbsoluteInequalityVisual,
  等式与不等式的性质: EqualityInequalityPropertiesVisual,
}

export function SetLogicInequalityVisual({ topicTitle }: { topicTitle: string }): ReactNode {
  const Visual = visualByTopic[topicTitle]
  return Visual ? <Visual /> : null
}
