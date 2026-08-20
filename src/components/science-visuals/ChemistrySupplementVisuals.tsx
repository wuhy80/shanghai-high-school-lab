import { useState } from 'react'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'
import './ScienceConceptVisual.css'

type ArrowProps = {
  x1: number
  y1: number
  x2: number
  y2: number
  className?: string
}

function DirectionArrow({ x1, y1, x2, y2, className = 'science-transition' }: ArrowProps) {
  const length = Math.hypot(x2 - x1, y2 - y1) || 1
  const ux = (x2 - x1) / length
  const uy = (y2 - y1) / length
  const baseX = x2 - ux * 13
  const baseY = y2 - uy * 13
  const px = -uy * 7
  const py = ux * 7
  return <g aria-hidden="true">
    <line className={className} x1={x1} y1={y1} x2={baseX} y2={baseY} />
    <polygon className="science-arrow-head" points={`${x2},${y2} ${baseX + px},${baseY + py} ${baseX - px},${baseY - py}`} />
  </g>
}

type ElectrochemistryMode = 'galvanic' | 'electrolysis' | 'corrosion'

const electrochemistryModes = [
  { value: 'galvanic', label: '原电池' },
  { value: 'electrolysis', label: '电解池' },
  { value: 'corrosion', label: '吸氧腐蚀' },
] as const

export function ElectrolysisCorrosionVisual({ topicTitle = '电化学装置' }: { topicTitle?: string }) {
  const [mode, setMode] = useState<ElectrochemistryMode>('galvanic')
  const [progress, setProgress] = useState(45)
  const electronX = 164 + progress / 100 * 312

  const summaries: Record<ElectrochemistryMode, string> = {
    galvanic: 'Zn—Cu 原电池中，锌负极氧化，铜正极还原；电子经外电路由负极流向正极，盐桥离子维持电中性。',
    electrolysis: '教材近似下用惰性电极电解较浓 CuCl₂ 溶液：阳极接电源正极并氧化 Cl⁻，阴极接电源负极并还原 Cu²⁺。',
    corrosion: '中性含氧水膜下形成微小原电池：铁的阳极区溶解，电子流向富氧阴极区，Fe²⁺与 OH⁻进一步形成锈蚀产物。',
  }
  const takeaways: Record<ElectrochemistryMode, string> = {
    galvanic: '原电池中阳极是负极、阴极是正极；阴离子移向阳极区，阳离子移向阴极区。',
    electrolysis: '电解池中阳极接正极、阴极接负极；“阳极氧化、阴极还原”不随装置类型改变。',
    corrosion: '防腐要么隔绝水和氧，要么让更活泼金属作牺牲阳极；电子在金属内流动，离子在水膜中迁移。',
  }

  return <MathVisualFrame
    title={`${topicTitle}：电极、电子与离子同步判断`}
    summary={summaries[mode]}
    controls={<>
      <MathChoices label="装置模式" value={mode} choices={electrochemistryModes} onChange={(value) => setMode(value as ElectrochemistryMode)} />
      <MathRange label="反应进程" value={progress} min={0} max={100} step={5} output={`${progress}%`} onChange={setProgress} />
    </>}
    takeaway={takeaways[mode]}
  >
    {mode === 'galvanic' && <svg viewBox="0 0 640 330" role="img" data-electrochemistry-mode="galvanic" aria-label={`锌铜原电池，反应进程${progress}%`}>
      <title>锌铜原电池电子与盐桥离子方向</title>
      <desc>左侧锌负极发生氧化，电子沿外电路流向右侧铜正极；盐桥阴离子向左、阳离子向右迁移。</desc>
      <path className="science-wire" d="M 138 104 V 54 H 502 V 104" />
      <DirectionArrow x1={178} y1={54} x2={462} y2={54} />
      <circle className="science-electron" cx={electronX} cy="54" r="7" />
      <text className="science-label" x="286" y="38">e⁻：Zn → Cu</text>
      <rect className="science-beaker" x="58" y="112" width="208" height="142" rx="7" />
      <rect className="science-beaker" x="374" y="112" width="208" height="142" rx="7" />
      <rect className="science-saltbridge" x="250" y="118" width="140" height="26" rx="13" />
      <rect className="science-electrode science-electrode-negative" x="126" y="92" width="24" height="140" rx="4" />
      <rect className="science-electrode science-electrode-positive" x="490" y="92" width="24" height="140" rx="4" />
      <text className="science-label" x="82" y="280">负极/阳极</text><text className="science-label" x="418" y="280">正极/阴极</text>
      <text className="science-label" x="70" y="306">Zn → Zn²⁺ + 2e⁻</text><text className="science-label" x="362" y="306">Cu²⁺ + 2e⁻ → Cu</text>
      <DirectionArrow x1={316} y1={160} x2={272} y2={160} /><text className="science-label" x="252" y="186">阴离子</text>
      <DirectionArrow x1={324} y1={208} x2={368} y2={208} /><text className="science-label" x="336" y="234">阳离子</text>
    </svg>}

    {mode === 'electrolysis' && <svg viewBox="0 0 640 330" role="img" data-electrochemistry-mode="electrolysis" aria-label={`氯化铜电解池，反应进程${progress}%`}>
      <title>较浓氯化铜溶液电解池的电子与离子方向</title>
      <desc>教材近似下，左侧阳极连接电源正极，氯离子移向阳极并失电子；右侧阴极连接负极，铜离子移向阴极并得电子。</desc>
      <rect className="science-battery" x="256" y="24" width="128" height="52" rx="7" />
      <text className="science-label" x="278" y="58">＋</text><text className="science-label" x="350" y="58">－</text>
      <path className="science-wire" d="M 276 76 V 110 H 142 V 128 M 364 76 V 110 H 498 V 128" />
      <DirectionArrow x1={142} y1={108} x2={264} y2={108} />
      <DirectionArrow x1={376} y1={108} x2={498} y2={108} />
      <circle className="science-electron" cx={154 + progress / 100 * 104} cy="108" r="7" />
      <circle className="science-electron" cx={386 + progress / 100 * 104} cy="108" r="7" />
      <rect className="science-beaker" x="72" y="126" width="496" height="132" rx="7" />
      <rect className="science-electrode science-electrode-positive" x="130" y="116" width="24" height="118" rx="4" />
      <rect className="science-electrode science-electrode-negative" x="486" y="116" width="24" height="118" rx="4" />
      <DirectionArrow x1={294} y1={174} x2={166} y2={174} /><text className="science-label" x="220" y="160">Cl⁻</text>
      <DirectionArrow x1={346} y1={214} x2={474} y2={214} /><text className="science-label" x="388" y="200">Cu²⁺</text>
      <text className="science-label" x="62" y="284">阳极(+)：2Cl⁻ → Cl₂ + 2e⁻</text>
      <text className="science-label" x="342" y="310">阴极(-)：Cu²⁺ + 2e⁻ → Cu</text>
    </svg>}

    {mode === 'corrosion' && <svg viewBox="0 0 640 330" role="img" data-electrochemistry-mode="corrosion" aria-label={`铁的吸氧腐蚀，反应进程${progress}%`}>
      <title>铁在中性含氧水膜中的吸氧腐蚀</title>
      <desc>缺氧处铁失电子形成亚铁离子，电子沿铁流向富氧区，氧气在阴极区还原为氢氧根。</desc>
      <path className="science-container" d="M 52 86 Q 320 34 588 86 V 248 H 52 Z" />
      <rect className="science-electrode science-electrode-negative" x="72" y="224" width="496" height="34" rx="5" />
      <DirectionArrow x1={176} y1={240} x2={462} y2={240} />
      <circle className="science-electron" cx={184 + progress / 100 * 270} cy="240" r="7" />
      <text className="science-label" x="286" y="220">e⁻</text>
      <DirectionArrow x1={150} y1={206} x2={150} y2={128} /><text className="science-label" x="70" y="112">Fe²⁺进入水膜</text>
      <DirectionArrow x1={492} y1={88} x2={492} y2={156} /><text className="science-label" x="456" y="76">O₂</text>
      <DirectionArrow x1={438} y1={166} x2={340} y2={166} /><text className="science-label" x="362" y="150">OH⁻</text>
      <text className="science-label" x="58" y="282">阳极：Fe → Fe²⁺ + 2e⁻</text>
      <text className="science-label" x="626" y="316" textAnchor="end">阴极：O₂ + 2H₂O + 4e⁻ → 4OH⁻</text>
    </svg>}
  </MathVisualFrame>
}

type IndicatorId = 'methyl-orange' | 'bromothymol-blue' | 'phenolphthalein'

const indicators: Record<IndicatorId, { label: string; low: number; high: number }> = {
  'methyl-orange': { label: '甲基橙 3.1–4.4', low: 3.1, high: 4.4 },
  'bromothymol-blue': { label: '溴麝香草酚蓝 6.0–7.6', low: 6, high: 7.6 },
  phenolphthalein: { label: '酚酞 8.2–10.0', low: 8.2, high: 10 },
}

const indicatorChoices = Object.entries(indicators).map(([value, indicator]) => ({ value, label: indicator.label }))

function strongAcidIntoBasePh(acidVolumeMl: number) {
  const baseAmountMmol = 2.5
  const acidAmountMmol = 0.1 * acidVolumeMl
  const totalVolumeMl = 25 + acidVolumeMl
  const difference = acidAmountMmol - baseAmountMmol
  if (Math.abs(difference) < 1e-10) return 7
  if (difference < 0) return 14 + Math.log10((-difference) / totalVolumeMl)
  return -Math.log10(difference / totalVolumeMl)
}

const titrationCurve = Array.from({ length: 101 }, (_, index) => {
  const volume = index * 0.5
  return { volume, ph: strongAcidIntoBasePh(volume) }
})

const titrationX = (volume: number) => 76 + volume / 50 * 492
const titrationY = (ph: number) => 250 - ph / 14 * 184

export function TitrationVisual({ topicTitle = '强酸滴定强碱' }: { topicTitle?: string }) {
  const [acidVolume, setAcidVolume] = useState(18)
  const [indicatorId, setIndicatorId] = useState<IndicatorId>('bromothymol-blue')
  const ph = strongAcidIntoBasePh(acidVolume)
  const indicator = indicators[indicatorId]
  const beforeEquivalent = acidVolume < 25
  const curvePath = titrationCurve.map((point, index) => `${index ? 'L' : 'M'} ${titrationX(point.volume).toFixed(1)} ${titrationY(point.ph).toFixed(1)}`).join(' ')
  const region = Math.abs(acidVolume - 25) < 1e-10 ? '当量点' : beforeEquivalent ? 'OH⁻过量' : 'H⁺过量'

  return <MathVisualFrame
    title={`${topicTitle}：滴加体积、pH 与终点范围`}
    summary="用 0.100 mol/L HCl 滴定 25.00 mL 0.100 mol/L NaOH。当量点在 25.00 mL；每个位置都先判断 H⁺、OH⁻谁过量，再用混合后的总体积求浓度。"
    controls={<>
      <MathRange label="已加 HCl 体积" value={acidVolume} min={0} max={50} step={0.5} output={`${acidVolume.toFixed(1)} mL`} onChange={setAcidVolume} />
      <MathChoices label="指示剂范围" value={indicatorId} choices={indicatorChoices} onChange={(value) => setIndicatorId(value as IndicatorId)} />
    </>}
    takeaway={<>当前 pH={ph.toFixed(2)}，处于{region}。强酸强碱滴定突跃很陡，多种指示剂可用，但终点仍不等于理论当量点。</>}
  >
    <svg viewBox="0 0 640 330" role="img" data-titrant-volume={acidVolume.toFixed(1)} data-titration-ph={ph.toFixed(3)} aria-label={`强酸滴定强碱曲线，加入盐酸${acidVolume.toFixed(1)}毫升，pH${ph.toFixed(2)}`}>
      <title>强酸滴定强碱的pH曲线</title>
      <desc>横轴为加入盐酸体积，纵轴为pH；标出25毫升当量点、所选指示剂范围和当前滴定位置。</desc>
      <line className="science-axis" x1="76" y1="250" x2="576" y2="250" />
      <line className="science-axis" x1="76" y1="58" x2="76" y2="250" />
      {[0, 7, 14].map((tick) => <g key={tick}><line className="science-tick" x1="68" y1={titrationY(tick)} x2="76" y2={titrationY(tick)} /><text className="science-label" x="58" y={titrationY(tick) + 6} textAnchor="end">{tick}</text></g>)}
      {[0, 25, 50].map((tick) => <g key={tick}><line className="science-tick" x1={titrationX(tick)} y1="250" x2={titrationX(tick)} y2="258" /><text className="science-label" x={titrationX(tick)} y="282" textAnchor="middle">{tick}</text></g>)}
      <text className="science-label" x="22" y="72">pH</text><text className="science-label" x="432" y="310">V(HCl) / mL</text>
      <rect className="science-meter" x="80" y={titrationY(indicator.high)} width="484" height={Math.max(4, titrationY(indicator.low) - titrationY(indicator.high))} opacity="0.42" />
      <text className="science-meter-label" x="92" y={titrationY(indicator.high) - 8}>{indicator.label}</text>
      <line className="science-guide" x1={titrationX(25)} y1="62" x2={titrationX(25)} y2="250" />
      <text className="science-label" x={titrationX(25) + 10} y="82">当量点</text>
      <path className="science-reaction-curve" d={curvePath} />
      <line className="science-ph-marker" x1={titrationX(acidVolume)} y1={titrationY(ph)} x2={titrationX(acidVolume)} y2="250" />
      <circle className="science-dot" cx={titrationX(acidVolume)} cy={titrationY(ph)} r="8" />
      <text className="science-meter-value" x="412" y="44">pH = {ph.toFixed(2)}</text>
    </svg>
  </MathVisualFrame>
}

type GasId = 'carbon-dioxide' | 'hydrogen' | 'ammonia' | 'chlorine'

type ApparatusStage = { title: string; detail: string }

const gasRoutes: Record<GasId, {
  label: string
  summary: string
  stages: [ApparatusStage, ApparatusStage, ApparatusStage, ApparatusStage]
  takeaway: string
}> = {
  'carbon-dioxide': {
    label: 'CO₂',
    summary: 'CaCO₃与稀盐酸常温反应；除HCl、除水后，利用CO₂密度大于空气且能溶于水，收集干燥气体时用向上排空气法。',
    stages: [
      { title: '制备', detail: 'CaCO₃+稀HCl' },
      { title: '净化', detail: '饱和NaHCO₃' },
      { title: '干燥', detail: '浓H₂SO₄' },
      { title: '收集', detail: '向上排空气' },
    ],
    takeaway: '先用NaHCO₃除HCl，再用浓硫酸除水；顺序颠倒会重新带入水蒸气。',
  },
  hydrogen: {
    label: 'H₂',
    summary: 'Zn与稀硫酸常温反应。H₂难溶于水，追求纯净时优先排水；若必须收集干燥H₂，可干燥后用向下排空气法。',
    stages: [
      { title: '制备', detail: 'Zn+稀H₂SO₄' },
      { title: '净化', detail: '水洗除酸雾' },
      { title: '干燥', detail: '无水CaCl₂' },
      { title: '收集', detail: '向下排空气' },
    ],
    takeaway: '点燃前必须排尽空气并验纯；排水法纯度高，但不能得到干燥H₂。',
  },
  ammonia: {
    label: 'NH₃',
    summary: 'NH₄Cl与Ca(OH)₂加热制NH₃。NH₃极易溶于水且密度小于空气，不能排水收集，应干燥后向下排空气。',
    stages: [
      { title: '制备', detail: '铵盐+碱，加热' },
      { title: '净化', detail: '空瓶截留液滴' },
      { title: '干燥', detail: '碱石灰' },
      { title: '收集', detail: '向下排空气' },
    ],
    takeaway: '不能用浓硫酸干燥NH₃；尾气用水吸收时要防倒吸。',
  },
  chlorine: {
    label: 'Cl₂',
    summary: 'MnO₂与浓盐酸加热制Cl₂。依次除HCl和水，Cl₂密度大且会与水反应，采用向上排空气并用NaOH吸收尾气。',
    stages: [
      { title: '制备', detail: 'MnO₂+浓HCl' },
      { title: '净化', detail: '饱和食盐水' },
      { title: '干燥', detail: '浓H₂SO₄' },
      { title: '收集', detail: '向上排空气' },
    ],
    takeaway: 'Cl₂有毒，装置必须密闭并以NaOH处理尾气；不能用碱石灰干燥。',
  },
}

const gasChoices = Object.entries(gasRoutes).map(([value, gas]) => ({ value, label: gas.label }))

export function ChemistryApparatusVisual({ topicTitle = '气体制备与收集' }: { topicTitle?: string }) {
  const [gasId, setGasId] = useState<GasId>('carbon-dioxide')
  const [stage, setStage] = useState(0)
  const route = gasRoutes[gasId]

  return <MathVisualFrame
    title={`${topicTitle}：性质决定装置路线`}
    summary={route.summary}
    controls={<>
      <MathChoices label="目标气体" value={gasId} choices={gasChoices} onChange={(value) => { setGasId(value as GasId); setStage(0) }} />
      <MathRange label="查看步骤" value={stage} min={0} max={3} step={1} output={`${stage + 1} / 4`} onChange={setStage} />
    </>}
    takeaway={route.takeaway}
  >
    <svg viewBox="0 0 640 330" role="img" data-gas-route={gasId} data-apparatus-stage={stage} aria-label={`${route.label}制备净化干燥收集路线，当前${route.stages[stage].title}`}>
      <title>{route.label}实验装置路线</title>
      <desc>从制备、净化、干燥到收集依次展示四个装置阶段，当前阶段高亮。</desc>
      {route.stages.map((item, index) => {
        const x = 28 + index * 154
        return <g key={item.title}>
          <rect className={index === stage ? 'science-stage science-stage-active' : 'science-stage'} x={x} y="88" width="124" height="116" rx="7" />
          <text className="science-label" x={x + 62} y="124" textAnchor="middle">{item.title}</text>
          <text className="science-meter-label" x={x + 62} y="158" textAnchor="middle">{item.detail}</text>
          <text className="science-chart-value" x={x + 62} y="186" textAnchor="middle">{index + 1}</text>
          {index < route.stages.length - 1 && <DirectionArrow x1={x + 126} y1={146} x2={x + 150} y2={146} className="science-process-arrow" />}
        </g>
      })}
      <path className="science-wire" d="M 76 242 H 558" />
      <circle className="science-particle" cx={92 + stage * 154} cy="242" r="10" />
      <text className="science-label" x="42" y="286">气流方向：</text>
      <DirectionArrow x1={150} y1={280} x2={550} y2={280} />
      <text className="science-meter-value" x="246" y="316">{route.label}：{route.stages[stage].detail}</text>
    </svg>
  </MathVisualFrame>
}

type OrganicReactionId = 'addition' | 'substitution' | 'esterification' | 'hydrolysis'

const organicReactions: Record<OrganicReactionId, {
  label: string
  reactants: string
  product: string
  condition: string
  functionalChange: string
  summary: string
  boundary: string
}> = {
  addition: {
    label: '加成',
    reactants: 'CH₂=CH₂ + Br₂',
    product: 'BrCH₂—CH₂Br',
    condition: '溴水，常温',
    functionalChange: 'C=C 的 π 键断开，两个碳各形成一个 C—Br 键',
    summary: '乙烯与溴发生加成，碳骨架不变，双键转成单键并在相邻碳上各增加一个取代基。',
    boundary: '溴水褪色不是碳碳双键的唯一证据，还要排除还原性物质和萃取。',
  },
  substitution: {
    label: '取代',
    reactants: 'CH₄ + Cl₂',
    product: 'CH₃Cl + HCl',
    condition: '光照',
    functionalChange: '一个 C—H 键被 C—Cl 键替代',
    summary: '甲烷与氯气在光照下发生自由基取代，一个氢被氯替换，同时生成HCl。',
    boundary: '取代可继续发生，实际常得到多种氯代产物，不能把CH₃Cl视为唯一产物。',
  },
  esterification: {
    label: '酯化',
    reactants: 'CH₃COOH + C₂H₅OH',
    product: 'CH₃COOC₂H₅ + H₂O',
    condition: '浓H₂SO₄，加热',
    functionalChange: '羧基 + 羟基 ⇌ 酯基 + 水',
    summary: '乙酸与乙醇发生可逆酯化，浓硫酸催化并吸水；移去水或增加一种反应物可提高平衡产率。',
    boundary: '浓硫酸不改变平衡常数；它的催化作用加快正逆反应，吸水作用才会推动组成向右。',
  },
  hydrolysis: {
    label: '水解',
    reactants: 'CH₃COOC₂H₅ + NaOH',
    product: 'CH₃COONa + C₂H₅OH',
    condition: 'NaOH水溶液，加热',
    functionalChange: '酯基断开，形成羧酸盐和羟基',
    summary: '乙酸乙酯在碱性条件下水解，生成的羧酸立即转成羧酸盐，因此反应可趋于完全。',
    boundary: '酸性水解是可逆平衡；碱性水解因生成羧酸盐而具有不同的反应限度。',
  },
}

const organicReactionChoices = Object.entries(organicReactions).map(([value, reaction]) => ({ value, label: reaction.label }))

export function OrganicReactionVisual({ topicTitle = '有机反应类型' }: { topicTitle?: string }) {
  const [reactionId, setReactionId] = useState<OrganicReactionId>('addition')
  const [step, setStep] = useState(1)
  const reaction = organicReactions[reactionId]
  const reactantLines = reaction.reactants.split(' + ')
  const productLines = reaction.product.split(' + ')
  const stageLabels = ['反应物', '官能团变化', '产物']

  return <MathVisualFrame
    title={`${topicTitle}：碳骨架、官能团与条件`}
    summary={reaction.summary}
    controls={<>
      <MathChoices label="反应类型" value={reactionId} choices={organicReactionChoices} onChange={(value) => { setReactionId(value as OrganicReactionId); setStep(1) }} />
      <MathRange label="推理步骤" value={step} min={0} max={2} step={1} output={stageLabels[step]} onChange={setStep} />
    </>}
    takeaway={reaction.boundary}
  >
    <svg viewBox="0 0 640 330" role="img" data-organic-reaction={reactionId} data-reaction-step={step} aria-label={`${reaction.label}反应，当前查看${stageLabels[step]}`}>
      <title>{reaction.label}反应的官能团变化</title>
      <desc>左侧显示反应物，中间显示反应条件和官能团变化，右侧显示产物；当前推理步骤高亮。</desc>
      <rect className={step === 0 ? 'science-stage science-stage-active' : 'science-stage'} x="32" y="86" width="188" height="116" rx="7" />
      <text className="science-label" x="126" y="120" textAnchor="middle">反应物</text>
      <text className="science-meter-value" x="126" y={reactantLines.length > 1 ? 154 : 170} textAnchor="middle">{reactantLines.map((line, index) => <tspan key={line} x="126" dy={index ? 30 : 0}>{index ? `+ ${line}` : line}</tspan>)}</text>
      <rect className={step === 1 ? 'science-stage science-stage-active' : 'science-stage'} x="242" y="54" width="156" height="180" rx="7" />
      <text className="science-label" x="320" y="88" textAnchor="middle">{reaction.condition}</text>
      <DirectionArrow x1={260} y1={130} x2={380} y2={130} />
      <text className="science-meter-label" x="320" y="166" textAnchor="middle">{reaction.label}</text>
      <text className="science-chart-value" x="320" y="202" textAnchor="middle">官能团改变</text>
      <rect className={step === 2 ? 'science-stage science-stage-active' : 'science-stage'} x="420" y="86" width="188" height="116" rx="7" />
      <text className="science-label" x="514" y="120" textAnchor="middle">产物</text>
      <text className="science-meter-value" x="514" y={productLines.length > 1 ? 154 : 170} textAnchor="middle">{productLines.map((line, index) => <tspan key={line} x="514" dy={index ? 30 : 0}>{index ? `+ ${line}` : line}</tspan>)}</text>
      <DirectionArrow x1={220} y1={144} x2={240} y2={144} className="science-process-arrow" />
      <DirectionArrow x1={400} y1={144} x2={420} y2={144} className="science-process-arrow" />
      <rect className="science-network-node science-network-node-active" x="70" y="258" width="500" height="48" rx="7" />
      <text className="science-label" x="320" y="289" textAnchor="middle">{reaction.functionalChange}</text>
    </svg>
  </MathVisualFrame>
}
