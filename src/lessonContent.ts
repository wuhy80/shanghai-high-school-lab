import type { SubjectId } from './data'
import { buildAppliedLesson } from './lessonApplied'
import { buildChemistryLesson } from './lessonChemistry'
import { buildHumanitiesLesson } from './lessonHumanities'
import { buildMathLesson } from './lessonMath'
import { buildPhysicsLesson } from './lessonPhysics'
import { buildScienceLesson } from './lessonScience'
import type { LessonContent, LessonContext } from './lessonTypes'

const subjectMethods: Record<SubjectId, {
  lens: string
  evidence: string
  action: string
  pitfall: string
}> = {
  chinese: {
    lens: '语言形式、篇章结构与写作语境共同决定文本意义。',
    evidence: '有效判断必须落到关键词句、结构位置、叙述方式或修辞效果，不能只复述情节。',
    action: '先定位原文证据，再解释表达方式，最后回答它怎样服务人物、情感或观点。',
    pitfall: '术语不是答案；指出手法后必须说明文本中的具体表现和表达效果。',
  },
  math: {
    lens: '数学结论由定义、条件、推理和表示方式共同组成。',
    evidence: '代数式、图像、表格和几何关系可以相互验证，但任何变形都必须保持等价。',
    action: '先写定义域与已知条件，再选择表示和定理，运算后用边界值或反例检查。',
    pitfall: '不要忽略定义域、等号条件、特殊值和分类讨论，否则形式正确也可能结论错误。',
  },
  english: {
    lens: '英语形式的选择服务于时间关系、信息焦点、语篇衔接和交际目的。',
    evidence: '判断词义或语法时，应同时查看句内结构、上下文指代和文体语气。',
    action: '先找句子主干和连接关系，再确定形式表达的意义，最后放回整段检查是否连贯。',
    pitfall: '不要逐词翻译或只凭一个标志词套规则；同一形式在不同语境中可能承担不同功能。',
  },
  physics: {
    lens: '物理问题需要把真实情境抽象为对象、过程、相互作用和守恒关系。',
    evidence: '受力图、运动图像、状态量和单位共同约束计算结果。',
    action: '确定研究对象与过程，画图并规定方向，列基本规律后检查单位、方向和极限情形。',
    pitfall: '公式有适用条件；没有说明对象、方向和过程边界时，直接代数值通常会混淆不同物理量。',
  },
  chemistry: {
    lens: '化学解释要在宏观现象、微观粒子和符号表达三个层次之间往返。',
    evidence: '反应条件、实际粒子、电子或质子转移以及质量电荷守恒共同决定结论。',
    action: '先判断体系与条件，再写粒子或结构变化，最后用守恒关系和实验现象核对。',
    pitfall: '配平化学式不等于解释反应；条件、限量关系、可逆性和实际存在的粒子都不能省略。',
  },
  biology: {
    lens: '生命现象通常由结构基础、物质能量过程、信息调节和环境条件共同产生。',
    evidence: '实验结论要说明自变量、因变量、对照和可排除的其他解释。',
    action: '确定生命系统层次，沿结构到功能追踪过程，再用对照实验或反馈关系检验。',
    pitfall: '相关不等于因果，个体结论也不能不加条件地外推到种群、群落或所有生物。',
  },
  politics: {
    lens: '政治学科用明确概念解释现实材料中的主体、权利义务、制度和利益关系。',
    evidence: '结论应能对应材料事实、教材概念和主体行为，价值判断不能替代推理。',
    action: '识别材料主体和问题类型，调用对应制度或原理，沿原因、措施、影响组织答案。',
    pitfall: '不要混淆国家机关、市场主体和公民的职责，也不要用口号代替材料中的因果分析。',
  },
  history: {
    lens: '历史解释必须把事件放回具体时空，并区分背景、原因、过程、影响与后世评价。',
    evidence: '史料的作者、年代、目的和类型决定它能证明什么，孤立材料不能自动代表全部事实。',
    action: '先建立时空坐标，再提取史料信息并相互印证，最后形成有层次而非单因的解释。',
    pitfall: '不要用后来的结果倒推当时必然如此，也不要用一个人物或事件解释长期结构变化。',
  },
  geography: {
    lens: '地理现象由位置、尺度、时间变化和自然人文要素联系共同塑造。',
    evidence: '地图、统计图和过程示意图中的方向、单位、季节与区域范围都是结论条件。',
    action: '先定位时空尺度，再列出关键要素，沿因果过程解释形成、变化和区域差异。',
    pitfall: '一般规律不能无条件套到所有地区；尺度、季节、下垫面和人类活动变化都可能改变结果。',
  },
  information: {
    lens: '信息技术问题要同时考虑数据表示、算法过程、系统资源、用户需求与安全边界。',
    evidence: '正确性需要通过正常、边界和异常测试验证，效率还要看时间、空间和扩展规模。',
    action: '明确输入输出与约束，选择数据结构和算法，跟踪执行过程后用测试用例验证。',
    pitfall: '程序能运行不等于结果可靠；数据质量、边界输入、权限和隐私风险都必须单独检查。',
  },
}

export function buildLessonContent(subjectId: SubjectId, context: LessonContext): LessonContent {
  const specificLesson = (subjectId === 'math' ? buildMathLesson(context) : undefined)
    ?? buildHumanitiesLesson(subjectId, context)
    ?? (subjectId === 'physics' ? buildPhysicsLesson(context) : undefined)
    ?? (subjectId === 'chemistry' ? buildChemistryLesson(context) : undefined)
    ?? buildScienceLesson(subjectId, context)
    ?? buildAppliedLesson(subjectId, context)
  if (specificLesson) return specificLesson

  const method = subjectMethods[subjectId]
  return {
    templateId: `${subjectId}-unit-method`,
    guidingQuestion: `“${context.title}”的核心关系是什么，怎样用证据或过程把结论推出来？`,
    core: `${context.title}不是孤立名词，它属于“${context.unitTitle}”中的关键问题。理解它要同时说清对象、条件、变化过程和结论。`,
    explanation: [context.unitFocus, `${method.lens}${method.evidence}`],
    steps: [
      { label: '界定对象', detail: `写出“${context.title}”讨论的对象、条件和需要解释的量或现象。` },
      { label: '建立关系', detail: method.action },
      { label: '检查结论', detail: '回到题目条件，检查证据是否充分、边界是否遗漏，以及结论能否解释原情境。' },
    ],
    example: {
      prompt: `面对一道以“${context.title}”为核心、但材料和教材例题不同的问题，应怎样开始？`,
      reasoning: [
        `先把材料信息分别归入“${context.unitTitle}”涉及的对象、条件和过程，不急于套结论。`,
        `再按“${method.action}”组织证据，并用题目中的限制条件排除不成立的解释。`,
      ],
      result: '最终答案应同时包含依据、推理过程和适用边界，而不是只写一个术语或公式。',
    },
    selfCheck: {
      question: `如果题目改变“${context.title}”中的一个关键条件，原结论是否仍成立？`,
      answer: `先找出原结论依赖的条件，再判断改变是否破坏核心关系；只有不影响关键关系时才能保持原结论。`,
    },
    pitfall: method.pitfall,
  }
}
