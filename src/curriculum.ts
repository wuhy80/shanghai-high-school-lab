import { semesterSeeds } from './curriculumSeeds'
import type { SubjectId } from './data'
import { buildLessonContent } from './lessonContent'
import type { LessonContent } from './lessonTypes'

export type SemesterId = 'g10-1' | 'g10-2' | 'g11-1' | 'g11-2' | 'g12-1' | 'g12-2'
export type TopicMode = 'demo' | 'explain'
export type VisualKind = 'model' | 'structure' | 'process' | 'timeline' | 'relation' | 'flow'
export type CourseBasis = 'catalog' | 'school' | 'review'

export type KnowledgeTopic = {
  id: string
  title: string
  focus: string
  question: string
  keyPoints: [string, string, string]
  pitfall: string
  lesson: LessonContent
  mode: TopicMode
  visual: VisualKind
  demoId?: string
}

export type CurriculumUnit = {
  id: string
  chapter?: string
  title: string
  focus: string
  topics: KnowledgeTopic[]
}

export type CoursePlan = {
  book: string
  publisher: string
  basis: CourseBasis
  note?: string
  units: CurriculumUnit[]
}

export type SemesterPlan = {
  id: SemesterId
  grade: '高一' | '高二' | '高三'
  term: '第一学期' | '第二学期'
  label: string
  shortLabel: string
  description: string
  sourceLabel: string
  sourceUrl: string
  courses: Record<SubjectId, CoursePlan>
}

export type UnitSeed = {
  chapter?: string
  title: string
  focus: string
  topics: string[]
}

export type CourseSeed = Omit<CoursePlan, 'units'> & { units: UnitSeed[] }
export type SemesterSeed = Omit<SemesterPlan, 'courses'> & { courses: Record<SubjectId, CourseSeed> }

export const demoIds = [
  'function', 'probability', 'unit-circle', 'projectile', 'wave', 'circuit', 'equilibrium', 'titration',
  'reaction-rate', 'genetics', 'enzyme', 'photosynthesis', 'argument', 'imagery', 'classical-syntax',
  'syntax', 'tense', 'conditional', 'timeline', 'revolution', 'causality', 'solar', 'circulation',
  'water-cycle', 'market', 'flow', 'rule-of-law',
] as const

const demoByTitle: Record<string, (typeof demoIds)[number]> = {
  '函数图像与参数变换': 'function',
  '随机试验与频率': 'probability',
  '随机模拟实验': 'probability',
  '单位圆与三角函数': 'unit-circle',
  '单位圆中的正弦与余弦坐标': 'unit-circle',
  '平抛与斜抛运动': 'projectile',
  '平抛运动的条件': 'projectile',
  '波的叠加与干涉': 'wave',
  '欧姆定律与伏安特性': 'circuit',
  '闭合电路欧姆定律': 'circuit',
  '化学平衡移动': 'equilibrium',
  '化学平衡移动与常数': 'equilibrium',
  '浓度压强对平衡的影响': 'equilibrium',
  '酸碱中和滴定': 'titration',
  '浓度温度与反应速率': 'reaction-rate',
  '温度影响': 'reaction-rate',
  '孟德尔遗传组合': 'genetics',
  '温度pH与酶活性': 'enzyme',
  '光照CO₂与光合速率': 'photosynthesis',
  '论点论据与论证链': 'argument',
  '诗词意象与情感': 'imagery',
  '特殊句式与语序还原': 'classical-syntax',
  '英语复杂句拆解': 'syntax',
  '时态与时间轴': 'tense',
  '真实与虚拟条件句': 'conditional',
  '虚拟语气与真实距离': 'conditional',
  '上海近现代史节点': 'timeline',
  '两次工业革命比较': 'revolution',
  '历史事件因果层次': 'causality',
  '正午太阳高度': 'solar',
  '海陆热力环流': 'circulation',
  '自然与城市水循环': 'water-cycle',
  '供给需求与均衡': 'market',
  '国民经济循环': 'flow',
  '立法程序与法治原则': 'rule-of-law',
}

const visualBySubject: Record<SubjectId, VisualKind> = {
  chinese: 'structure', math: 'model', english: 'structure', physics: 'model', chemistry: 'process',
  biology: 'process', politics: 'relation', history: 'timeline', geography: 'process', information: 'flow',
}

type ScienceEnhancement = {
  chapters: string[]
  extraTopics: string[][]
}

const SCIENCE_ENHANCEMENTS: Partial<Record<`${SemesterId}-${'physics' | 'chemistry'}`, ScienceEnhancement>> = {
  'g11-1-physics': {
    chapters: ['必修第三册 · 第1章 电场', '必修第三册 · 第1章 电场', '必修第三册 · 第2章 电路', '必修第三册 · 第3章 磁场', '必修第三册 · 第3章 磁场'],
    extraTopics: [
      ['点电荷电场的叠加', '电场强度的矢量方向', '匀强电场中的受力', '电场线疏密与强弱', '静电平衡与导体内部', '静电屏蔽的应用', '电场强度的实验测量'],
      ['电容器充放电曲线', '电容器串并联', '电容器储能与能量', '闭合电路功率分配', '路端电压与负载', '电源效率与最大功率', '复杂电路等效化简', '电表内阻对测量的影响'],
      ['安培定则与磁场叠加', '安培力的大小与方向', '通电线圈的转动', '洛伦兹力的速度方向', '带电粒子圆周半径', '速度选择器', '质谱仪的质量分析', '霍尔元件与传感器'],
      ['电流元在磁场中的受力', '磁矩与线圈力矩', '磁场中的能量转换', '磁聚焦与回旋加速器', '带电粒子轨迹的作图', '复合场临界速度', '电磁测量仪器原理'],
      ['电场磁场综合建模', '粒子在复合场中的分段运动', '轨迹半径与周期比较', '电荷量质量的实验反演', '装置安全与偏转边界', '物理量纲与结果检验'],
    ],
  },
  'g11-1-chemistry': {
    chapters: ['必修第二册 · 第1章 元素化学', '必修第二册 · 第2章 金属与材料', '必修第二册 · 第3章 化学反应原理', '必修第二册 · 第3章 化学反应原理', '必修第二册 · 第4章 有机化合物'],
    extraTopics: [
      ['卤素单质的氧化性递变', '硫及其化合物的价态网络', '氮循环与氮氧化物', '硅及无机非金属材料', '离子检验的干扰排除', '陌生元素转化流程', '工业尾气的吸收与净化'],
      ['铝的两性与转化', '铁的二价三价互变', '金属活动性与冶炼方法', '电解法制备活泼金属', '合金的微观结构', '金属腐蚀的电化学条件', '金属资源循环利用'],
      ['化学键变化与反应热', '原电池中的电子流向', '化学反应速率的图像', '催化剂与活化能', '可逆反应与动态平衡', '烷烃的取代反应', '乙烯的加成反应', '乙醇乙酸与酯化'],
      ['氧化还原反应的定量关系', '反应条件对产物的影响', '能源与环境评价', '有机官能团的识别', '糖类油脂蛋白质的结构', '高分子材料与聚合方式'],
      ['无机有机综合推断', '实验现象与微粒变化对应', '守恒法处理综合计算', '流程图中的物质分离', '安全边界与绿色化学'],
    ],
  },
  'g11-2-physics': {
    chapters: ['选择性必修第一册 · 第4章 动量', '选择性必修第一册 · 第4章 动量', '选择性必修第一册 · 第5章 机械振动', '选择性必修第一册 · 第6章 机械波', '选择性必修第一册 · 第7章 光的波动性'],
    extraTopics: [
      ['冲量的方向与图像面积', '动量定理的分量形式', '系统内力与外力', '动量守恒的适用条件', '爆炸与反冲模型', '一维弹性碰撞', '碰撞中的能量损失', '碰撞实验的数据处理'],
      ['简谐运动的位移表达', '回复力与加速度关系', '振动图像的相位', '简谐运动的能量交换', '单摆周期与实验测量', '受迫振动与共振', '阻尼振动的能量变化'],
      ['机械波的形成条件', '横波纵波与介质质点', '波速波长和频率', '波的图像与振动图像', '波的反射折射与衍射', '双缝干涉条件', '薄膜干涉与增透', '偏振与激光技术'],
      ['振动波综合图像', '多列波叠加的相位判断', '光程差与干涉条纹', '波动实验的控制变量', '相位差的测量方法', '模型假设的边界'],
      ['动量与振动综合', '波动与能量传递', '实验数据的线性化', '误差传播与有效数字', '开放探究方案评价'],
    ],
  },
  'g11-2-chemistry': {
    chapters: ['选择性必修第一册 · 第1章 化学反应与能量', '选择性必修第一册 · 第2章 反应速率与平衡', '选择性必修第一册 · 第3章 水溶液中的离子反应', '选择性必修第一册 · 第4章 电化学', '选择性必修第二册 · 第1章 物质结构'],
    extraTopics: [
      ['焓变与热化学方程式', '盖斯定律的路径替换', '燃烧热与能源比较', '反应能量图', '活化能与反应方向', '化学电源的能量效率'],
      ['有效碰撞与速率', '速率方程的定性使用', '平衡常数的表达', '浓度压强对平衡的影响', '温度对平衡的影响', '平衡移动的微粒解释', '工业合成条件选择'],
      ['弱电解质电离平衡', '水的离子积与pH', '盐类水解', '沉淀溶解平衡', '原电池电极判断', '电解池产物判断', '电化学定量计算', '金属腐蚀与防护'],
      ['原子轨道与电子排布', '元素周期律的结构解释', '共价键参数', '价层电子对互斥模型', '杂化轨道与分子构型', '分子极性与作用力', '晶体类型与物性'],
      ['反应原理综合图像', '多平衡体系的主次判断', '电子守恒与电荷守恒', '结构决定性质的证据链', '实验数据反推微观模型'],
    ],
  },
  'g12-1-physics': {
    chapters: ['选择性必修第二册 · 第7章 电磁感应', '选择性必修第二册 · 第8章 交变电流', '选择性必修第二册 · 第9章 传感器与电磁技术', '选择性必修第三册 · 第10章 分子动理论与气体', '选择性必修第三册 · 第11章 热力学定律', '选择性必修第三册 · 第12章 光学、原子与核物理'],
    extraTopics: [
      ['磁通量的定义与变化', '法拉第电磁感应定律', '楞次定律的能量解释', '导体棒切割磁感线', '感生电动势与动生电动势', '自感与互感', '涡流及其应用', '电磁感应实验设计'],
      ['正弦式交变电流', '峰值与有效值', '感抗与容抗', '变压器原理', '远距离输电损耗', '传感器的输入输出', '光敏热敏元件', '自动控制中的反馈'],
      ['分子热运动与扩散', '温度的微观意义', '气体压强的微观解释', '理想气体状态方程', '等温等压等容过程', '气体做功与内能', '热力学第一定律', '热力学第二定律与方向'],
      ['光电效应的实验规律', '光量子与逸出功', '氢原子能级与光谱', '波粒二象性', '原子核衰变规律', '质量亏损与结合能', '裂变聚变与核能', '辐射安全与应用'],
      ['电磁场能量传递', '热学图像综合', '近代物理证据链', '实验不确定度与拟合', '跨模块模型选择', '科学技术伦理边界'],
      ['综合实验方案设计', '多物理量同步测量', '图像斜率与截距取义', '控制变量与对照', '异常数据的诊断'],
    ],
  },
  'g12-1-chemistry': {
    chapters: ['选择性必修第二册 · 第1章 原子结构与元素性质', '选择性必修第二册 · 第2章 分子结构与性质', '选择性必修第二册 · 第3章 晶体结构与材料', '选择性必修第三册 · 第1章 有机物结构与研究方法', '选择性必修第三册 · 第2章 烃及卤代烃', '选择性必修第三册 · 第3章 含氧含氮有机物', '选择性必修第三册 · 第4章 有机合成与高分子'],
    extraTopics: [
      ['原子轨道能级', '核外电子排布规则', '元素周期律的量子解释', '电离能递变', '电子亲和能', '电负性与键极性', '原子光谱与能级跃迁'],
      ['共价键的本质', '键能与键长', '价层电子对互斥', '杂化轨道', '分子空间构型', '分子极性', '分子间作用力与氢键'],
      ['晶胞中的粒子计数', '金属晶体堆积', '离子晶体结构', '分子晶体与物性', '共价晶体网络', '晶体缺陷与材料性能', '晶体结构模型的建立'],
      ['有机物分类与命名', '同系物与同分异构', '有机物分离提纯', '质谱与红外信息', '烃的结构与反应', '卤代烃的取代消去', '醇酚醚的性质', '醛酮羧酸与酯'],
      ['有机反应类型的识别', '官能团相互转化', '合成路线的逆合成', '高分子加聚与缩聚', '有机实验安全与环保'],
      ['结构信息综合推断', '晶体参数与密度计算', '有机定量分析', '谱图证据与结构确认', '模型假设与证据边界'],
      ['跨模块综合实验', '物质结构与反应性质联动', '定性定量证据链', '流程图条件评价', '开放探究与方案改进'],
    ],
  },
  'g12-2-physics': {
    chapters: ['专题复习一 · 力学模型', '专题复习二 · 功能与动量', '专题复习三 · 电场与电路', '专题复习四 · 磁场与电磁感应', '专题复习五 · 振动波光学', '专题复习六 · 热学近代物理与实验'],
    extraTopics: [
      ['参考系与运动图像', '匀变速多阶段', '受力分析与牛顿定律', '圆周运动临界', '万有引力与轨道'],
      ['功与动能定理', '机械能守恒', '功能关系与摩擦生热', '动量定理', '动量守恒与碰撞', '能量动量综合'],
      ['电场强度与电势', '带电粒子偏转', '电容器动态分析', '闭合电路欧姆定律', '伏安法与电表改装', '电功率与能量'],
      ['带电粒子在磁场中运动', '复合场轨迹', '安培力与平衡', '法拉第定律', '楞次定律与能量', '变压器与输电'],
      ['简谐运动与机械波', '波的叠加干涉', '几何光学成像', '光的干涉衍射偏振', '光电效应与能级'],
      ['理想气体状态方程', '热力学定律', '核反应与质量亏损', '实验装置与安全', '图像拟合与误差传播', '结论的边界检验'],
    ],
  },
  'g12-2-chemistry': {
    chapters: ['专题复习一 · 基本概念与计量', '专题复习二 · 元素化学与无机转化', '专题复习三 · 反应原理', '专题复习四 · 电化学', '专题复习五 · 结构与有机化学', '专题复习六 · 化学实验与探究'],
    extraTopics: [
      ['物质分类与胶体', '离子反应与离子方程式', '氧化还原与电子守恒', '物质的量浓度', '气体与溶液计算', '多重守恒综合'],
      ['钠镁铝及其化合物', '铁铜及其化合物', '氯硫氮转化', '硅与无机材料', '陌生元素周期推断', '无机流程图'],
      ['反应热与盖斯定律', '反应速率与影响因素', '化学平衡与常数', '弱电解质与pH', '盐类水解', '沉淀溶解平衡', '综合平衡图像'],
      ['原电池电极判断', '电解池产物', '电化学定量', '金属腐蚀', '新型电池信息分析', '电极反应式配平'],
      ['原子结构与周期规律', '晶体类型与物性', '有机命名与异构', '官能团性质与检验', '有机合成路线', '高分子结构与性能'],
      ['气体制备净化收集', '分离提纯与检验', '酸碱滴定', '实验变量设计', '异常现象分析', '方案评价与绿色实验'],
    ],
  },
}

type ScienceTopicRoute = [pattern: RegExp, unitIndex: number]

const SCIENCE_TOPIC_ROUTES: Partial<Record<keyof typeof SCIENCE_ENHANCEMENTS, ScienceTopicRoute[]>> = {
  'g11-1-physics': [
    [/电容/, 1],
    [/闭合电路|路端电压|电源效率|复杂电路|电表内阻|电阻|负载|电功率/, 2],
    [/安培|电流元|磁矩|线圈力矩|通电线圈/, 3],
    [/洛伦兹|带电粒子|速度选择器|质谱|霍尔|磁聚焦|回旋|复合场|轨迹|电荷量质量|电场磁场综合|偏转边界/, 4],
    [/电场|静电|导体内部|静电屏蔽|电荷/, 0],
  ],
  'g11-1-chemistry': [
    [/铝|铁|金属|合金|冶炼|腐蚀/, 1],
    [/反应热|原电池|能源|氧化还原|电子流向/, 2],
    [/速率|催化|活化能|平衡|反应条件/, 3],
    [/有机|烷|乙烯|乙醇|乙酸|酯|官能团|糖类|油脂|蛋白质|高分子|聚合/, 4],
    [/卤素|硫|氮|硅|离子检验|陌生元素|尾气|无机/, 0],
  ],
  'g11-2-physics': [
    [/碰撞|爆炸|反冲|能量损失/, 1],
    [/动量|冲量|系统内力|系统外力/, 0],
    [/振动|单摆|回复力|共振|阻尼/, 2],
    [/光程|干涉|衍射|偏振|激光|薄膜|光学/, 4],
    [/机械波|横波|纵波|波速|波长|波的图像|多列波|相位差|波动/, 3],
  ],
  'g11-2-chemistry': [
    [/焓变|热化学|盖斯|燃烧热|能量图|化学反应与能量|活化能与反应方向/, 0],
    [/反应速率|有效碰撞|速率方程|平衡常数|平衡移动|工业合成|浓度压强|温度对平衡|多平衡/, 1],
    [/电离|离子积|pH|水解|沉淀|水溶液/, 2],
    [/原电池|电解池|电化学|腐蚀|电极|电子守恒|电荷守恒/, 3],
    [/原子轨道|电子排布|周期律|共价键|价层电子对|杂化|分子构型|分子极性|晶体|结构决定性质|微观模型/, 4],
  ],
  'g12-1-physics': [
    [/磁通量|法拉第|楞次|切割磁感线|感生电动势|动生电动势|自感|互感|涡流|电磁感应/, 0],
    [/交变电流|峰值|有效值|感抗|容抗|变压器|输电/, 1],
    [/传感器|光敏|热敏|自动控制|反馈/, 2],
    [/分子热运动|扩散|温度的微观|气体压强|理想气体|等温|等压|等容/, 3],
    [/气体做功|内能|热力学|热学图像/, 4],
    [/光电|光量子|原子能级|光谱|波粒二象|原子核|衰变|质量亏损|结合能|裂变|聚变|核能|辐射|近代物理/, 5],
  ],
  'g12-1-chemistry': [
    [/原子轨道|电子排布|周期律|电离能|电子亲和能|电负性|原子光谱|能级跃迁/, 0],
    [/共价键|键能|键长|价层电子对|杂化|分子空间构型|分子极性|分子间作用力|氢键/, 1],
    [/晶胞|晶体|堆积|晶格|晶体缺陷|晶体参数|密度计算/, 2],
    [/有机物分类|有机物命名|同系物|同分异构|分离提纯|质谱|红外|结构信息|谱图/, 3],
    [/烃|卤代烃|取代|消去/, 4],
    [/醇|酚|醚|醛|酮|羧酸|酯|含氧|含氮/, 5],
    [/有机反应类型|官能团相互转化|合成路线|逆合成|高分子|加聚|缩聚|有机实验|有机定量|跨模块/, 6],
  ],
}

function enhanceScienceCourse(semesterId: SemesterId, subjectId: SubjectId, course: CourseSeed): CourseSeed {
  if (subjectId !== 'physics' && subjectId !== 'chemistry') return course
  const enhancement = SCIENCE_ENHANCEMENTS[`${semesterId}-${subjectId}` as keyof typeof SCIENCE_ENHANCEMENTS]
  if (!enhancement || course.units.some((unit) => unit.chapter)) return course
  const originalTopics = new Set(course.units.flatMap((unit) => unit.topics))
  const appendedTopics = new Set<string>()
  const routedExtras = course.units.map(() => [] as string[])
  const routes = SCIENCE_TOPIC_ROUTES[`${semesterId}-${subjectId}` as keyof typeof SCIENCE_ENHANCEMENTS] ?? []
  enhancement.extraTopics.forEach((topics, sourceIndex) => {
    topics.forEach((topic) => {
      if (originalTopics.has(topic) || appendedTopics.has(topic)) return
      appendedTopics.add(topic)
      const routedUnit = routes.find(([pattern]) => pattern.test(topic))?.[1]
      const unitIndex = Math.min(routedUnit ?? sourceIndex, course.units.length - 1)
      routedExtras[unitIndex].push(topic)
    })
  })
  return {
    ...course,
    units: course.units.map((unit, index) => ({
      ...unit,
      chapter: enhancement.chapters[Math.min(index, enhancement.chapters.length - 1)],
      topics: [...unit.topics, ...routedExtras[index]],
    })),
  }
}

function buildSemester(seed: SemesterSeed): SemesterPlan {
  const courses = Object.fromEntries(Object.entries(seed.courses).map(([rawSubjectId, course]) => {
    const subjectId = rawSubjectId as SubjectId
    course = enhanceScienceCourse(seed.id, subjectId, course)
    let topicIndex = 0
    const units = course.units.map((unit, unitIndex) => ({
      id: `${seed.id}-${subjectId}-u${unitIndex + 1}`,
      chapter: unit.chapter,
      title: unit.title,
      focus: unit.focus,
      topics: unit.topics.map((title) => {
        topicIndex += 1
        const demoId = demoByTitle[title]
        const lesson = buildLessonContent(subjectId, {
          title,
          unitTitle: unit.title,
          unitFocus: unit.focus,
        })
        return {
          id: `${seed.id}-${subjectId}-t${topicIndex}`,
          title,
          focus: unit.focus,
          question: lesson.guidingQuestion,
          keyPoints: lesson.steps.map((step) => step.detail) as [string, string, string],
          pitfall: lesson.pitfall,
          lesson,
          mode: demoId ? 'demo' as const : 'explain' as const,
          visual: visualBySubject[subjectId],
          demoId,
        }
      }),
    }))
    return [subjectId, { ...course, units }]
  })) as Record<SubjectId, CoursePlan>
  return { ...seed, courses }
}

export const semesterPlans: SemesterPlan[] = semesterSeeds.map(buildSemester)

export const getSemester = (semesterId: SemesterId) =>
  semesterPlans.find((semester) => semester.id === semesterId) ?? semesterPlans[0]

export const flattenTopics = (semester: SemesterPlan) => Object.entries(semester.courses).flatMap(([subjectId, course]) =>
  course.units.flatMap((unit) => unit.topics.map((topic) => ({ subjectId: subjectId as SubjectId, course, unit, topic }))),
)

export const allTopics = semesterPlans.flatMap((semester) =>
  flattenTopics(semester).map((entry) => ({ semester, ...entry })),
)
