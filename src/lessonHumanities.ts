import type { SubjectId } from './data'
import type { LessonContent, LessonContext, LessonExample } from './lessonTypes'

type LessonDraft = Omit<LessonContent, 'templateId'>

type LessonTemplate = {
  templateId: string
  keywords: string[]
  build: (context: LessonContext) => LessonDraft
}

type RegressionRoute = {
  baseTemplateId: string
  familyId: string
}

type ConceptFamily = {
  familyId: string
  keywords: string[]
  teaching: string
  operation: string
  example?: LessonExample
  pitfall?: string
}

const lesson = (templateId: string, draft: LessonDraft): LessonContent => ({ templateId, ...draft })

const matches = (context: LessonContext, keywords: string[]) => {
  const searchable = context.title.toLowerCase()
  return keywords.some((keyword) => searchable.includes(keyword.toLowerCase()))
}

const matchScore = (context: LessonContext, keywords: string[]) => {
  const searchable = context.title.toLowerCase()
  return keywords.reduce((score, keyword) => (
    searchable.includes(keyword.toLowerCase()) ? Math.max(score, keyword.length) : score
  ), 0)
}

const chineseTemplates: LessonTemplate[] = [
  {
    templateId: 'chinese-classical-language',
    keywords: ['文言', '实词', '虚词', '句式', '断句', '宾语前置', '省略句'],
    build: ({ title }) => ({
      guidingQuestion: `学习“${title}”时，怎样从词义、句法和语境三层还原文意，而不是逐字硬译？`,
      core: '文言翻译的核心是先确认句法骨架，再根据上下文确定词义，最后补出古汉语中省略而现代汉语必须明说的成分。',
      explanation: [
        '先找谓语动词以及它支配的主语、宾语，再辨认判断句、被动句、宾语前置、定语后置等结构。古今语序不同不等于可以任意调换：还原后的每个成分都要在原句中找到语法依据。',
        '实词应同时检查本义、词类活用和一词多义，虚词则要看它连接了什么成分。最终译文既要落实关键词，又要服从人物关系和事件因果；译得通顺却改变了施受关系，仍然是错误翻译。',
      ],
      steps: [
        { label: '定骨架', detail: '圈出谓语，追问“谁做什么、对谁做”，先恢复主谓宾或判断关系。' },
        { label: '辨现象', detail: '标记通假、活用、古今异义、倒装和省略，并用上下句验证。' },
        { label: '重表达', detail: '按现代汉语语序重组，补省略成分，逐项核对人名、否定和语气。' },
      ],
      example: {
        prompt: '翻译《劝学》“蚓无爪牙之利，筋骨之强，上食埃土，下饮黄泉，用心一也”。',
        reasoning: [
          '“爪牙之利、筋骨之强”是定语后置，应还原为“锋利的爪牙、强健的筋骨”；“上、下”是名词作状语，意为向上、向下。',
          '“用”在这里表示原因，“一”指专一；前半写条件普通，后半写行动结果，构成“条件不优却因专一而成功”的论证。',
        ],
        result: '蚯蚓没有锋利的爪牙和强健的筋骨，却能向上吃泥土、向下饮地下水，是因为心思专一。',
      },
      selfCheck: {
        question: '为什么看到“何以”时通常不能按“什么用来”顺译？',
        answer: '因为疑问代词“何”作介词“以”的宾语时前置，应还原为“以何”，再依语境译为“凭什么”或“为什么”。',
      },
      pitfall: '不要只背“宾语前置”等标签；必须指出前置的是哪个成分、正常语序是什么，以及还原后句意如何变化。',
    }),
  },
  {
    templateId: 'chinese-classical-argument',
    keywords: ['先秦诸子', '史传', '政论', '劝学', '仁政', '修身', '三纲八目', '老子', '寓言论辩', '古代散文', '陈情表', '项脊轩志', '归去来兮辞', '传记游记', '山水游记的情景关系'],
    build: ({ title }) => ({
      guidingQuestion: `怎样在“${title}”中同时读出思想主张、论证方式和说话对象？`,
      core: '古代论说文不是名句集合；它以特定对象和现实问题为起点，通过定义、类比、对比、举例或因果推演建立劝说力量。',
      explanation: [
        '阅读时先把作者的核心判断改写成“对于某问题，作者主张什么”，再区分作为前提的价值判断和作为证据的事实、故事。诸子文本常用寓言或类比压缩推理，史传中的人物言论则常受身份和局势约束。',
        '评价思想不能只贴“积极、局限”标签。要说明主张解决了当时什么矛盾、依靠什么假设，以及放到今天哪些原则仍可转化、哪些制度条件已经改变。',
      ],
      steps: [
        { label: '还原问题', detail: '确定言说者、对象和争论焦点，把文本放回政治或伦理情境。' },
        { label: '展开推理', detail: '用“前提—论据—中间结论—主张”标出论证链。' },
        { label: '限定评价', detail: '分别说明历史作用、成立条件和当代转化，避免脱离时代褒贬。' },
      ],
      example: {
        prompt: '分析孟子“恻隐之心，人皆有之”如何服务于仁政主张。',
        reasoning: [
          '孟子先以“见孺子将入于井会产生怵惕恻隐”为共同经验，证明恻隐并非外在强迫，而是人的道德萌芽。',
          '再把个体的“不忍人之心”推及政治，得出统治者若扩充此心，就应实施“不忍人之政”；这是由伦理心理到政治原则的类比推演。',
        ],
        result: '论证的关键不是“人天生完美”，而是人人具有可扩充的道德端绪，仁政因此既有心理基础，也需要后天扩充与制度落实。',
      },
      selfCheck: {
        question: '寓言能否直接证明一个普遍命题为真？',
        answer: '不能。寓言主要把抽象关系形象化并揭示推理方向；普遍命题仍需更广的事实或严密推理支持。',
      },
      pitfall: '不要把人物的一句话自动等同于全文主旨；先辨清它在论辩中回应谁、反驳什么、承担哪一步推理。',
    }),
  },
  {
    templateId: 'chinese-poetry',
    keywords: ['诗', '词', '意象', '意境', '用典', '典故', '格律', '炼字', '乐府', '离骚', '抒情', '同题异写'],
    build: ({ title }) => ({
      guidingQuestion: `赏析“${title}”时，如何从字词和意象组合推出情感，而不是先背一个情感标签？`,
      core: '诗歌情感由“写了什么景物、景物具有何种状态、这些景物如何排列转折、抒情主体处于何种时空”共同生成。',
      explanation: [
        '单个意象没有固定答案：“月”既可写团圆，也可写孤独或时间流逝。有效分析应抓修饰语、动词、声色冷暖和远近俯仰，再观察意象之间是并置、推进还是对照。',
        '炼字与用典必须落实到结构功能。一个动词可能改变画面动态和主体姿态；典故既压缩背景，也可能借旧事反说当下。最后要用“景物特征—主体处境—情感层次”的证据链落地。',
      ],
      steps: [
        { label: '描画面', detail: '圈出名词、动词和修饰语，用客观语言复原时令、空间和声色。' },
        { label: '找结构', detail: '标出视角移动、虚实转换、今昔对照及情绪转折位置。' },
        { label: '证情感', detail: '把具体字词与主体处境连接，区分表层情绪和深层价值。' },
      ],
      example: {
        prompt: '分析“枯藤老树昏鸦，小桥流水人家，古道西风瘦马”的意象组合。',
        reasoning: [
          '“枯、老、昏、西风、瘦”连续降低画面温度与生命感；名词密集并置，使景物像镜头逐一显现。',
          '温暖安定的“小桥流水人家”夹在衰飒景物之间，反衬漂泊者无法进入的日常归宿；“古道—瘦马”才把镜头落到行旅主体。',
        ],
        result: '意象组合不只渲染秋景，而是以冷暖对照和镜头推进，把“羁旅的疲惫”深化为“见归宿而不得归”的孤独。',
      },
      selfCheck: {
        question: '回答炼字题时，除了解释字义还必须写哪两层？',
        answer: '写该字怎样改变画面或动作状态，以及它怎样服务于人物处境、情感或篇章结构。',
      },
      pitfall: '不要写“借景抒情、表达思乡”就结束；至少引用两个带修饰或动作特征的词，并说明它们怎样共同生成情感。',
    }),
  },
  {
    templateId: 'chinese-narrative-drama',
    keywords: ['小说', '人物', '叙事', '视角', '伏笔', '章回', '戏剧', '潜台词', '红楼梦', '茶馆', '阿q', '边城', '报告文学', '通讯', '环境描写', '魔幻现实', '回忆性散文', '群像', '乡土散文', '散文线索', '潜台词与人物关系'],
    build: ({ title }) => ({
      guidingQuestion: `研究“${title}”时，怎样用行动、语言、视角和环境构成人物解释？`,
      core: '人物形象不是形容词清单，而是人物在压力情境中反复作出的选择；叙事视角决定读者知道什么，环境和他人反应则限定选择的意义。',
      explanation: [
        '先把情节转化为“欲望—阻力—选择—后果”。典型细节之所以有效，是因为它在关键处暴露人物价值排序；同一句话还需结合身份、对话对象和前后行动判断是否可靠。',
        '戏剧要特别关注舞台动作、停顿和潜台词，小说则要区分叙述者评价与人物意识。环境不是背景装饰：社会规范、空间布局或时代事件会提供机会、施加限制，并与人物命运形成因果联系。',
      ],
      steps: [
        { label: '列冲突', detail: '写清人物想要什么、谁或什么阻碍他，以及风险是什么。' },
        { label: '取证据', detail: '选择能改变关系或结果的语言、动作、心理、环境细节。' },
        { label: '作解释', detail: '从重复行为概括性格，再说明叙事视角和社会环境怎样修正这一判断。' },
      ],
      example: {
        prompt: '《红楼梦》中，王熙凤出场时“未见其人，先闻其声”怎样塑造人物？',
        reasoning: [
          '在贾府众人敛声屏气的礼法空间里，她隔院而来的笑声先打破秩序，显示她拥有超出普通女性的行动自由和管理权。',
          '随后众人的反应以及她对黛玉既热络又迅速安排事务的语言，使“爽利”与“察言观色、掌控局面”同时成立。',
        ],
        result: '这一出场不是简单写“性格泼辣”，而是用声音、空间秩序和他人反应，立刻建立王熙凤在贾府权力网络中的特殊位置。',
      },
      selfCheck: {
        question: '为什么“人物很善良，因为他帮助别人”通常得分不高？',
        answer: '它只复述行为，未说明帮助发生在何种压力和代价下，也没有用语言、动作或他人反应证明这种选择具有稳定性和典型性。',
      },
      pitfall: '不要把叙述者、作品作者和人物混为一谈；限知视角下的判断可能只代表人物当时所知，并非事实全貌。',
    }),
  },
  {
    templateId: 'chinese-argumentation',
    keywords: ['论点', '论据', '论证', '理论', '逻辑', '命题', '判断', '推理', '归纳类比', '谬误', '科学概念', '核心概念', '模型与证据', '事实与推论', '立论', '论述对象', '问题意识', '科学共同体', '事实与观点', '当代阐释', '演说的对象意识', '概念的内涵与外延', '科学文本概要与评论'],
    build: ({ title }) => ({
      guidingQuestion: `分析“${title}”时，如何把文章拆成可检验的主张、证据和推理桥梁？`,
      core: '论证成立不仅需要真实证据，还需要一条把证据连接到主张的理由；评价时要分别检查概念边界、证据相关性、推理有效性和结论强度。',
      explanation: [
        '先用完整判断句概括中心论点和分论点，避免用“谈论某问题”代替立场。事实、数据和例子只能回答“发生了什么”，它们为何能支持结论，取决于作者是否说清代表性、因果机制或类比条件。',
        '反驳可以质疑事实、解释或推理，但不能只表达相反态度。科学论述还要区分观察事实、模型解释与暂时结论；限定词“可能、在一定条件下”体现证据边界，并非含糊。',
      ],
      steps: [
        { label: '标主张', detail: '把中心论点、分论点和关键概念改写成边界清楚的判断句。' },
        { label: '接证据', detail: '为每项材料写出“它证明了什么”，补出被省略的推理桥梁。' },
        { label: '查强度', detail: '检查样本、因果、类比和反例，判断结论应当是必然、较可能还是仅供解释。' },
      ],
      example: {
        prompt: '有人说：“参加社团的学生平均成绩更高，所以参加社团一定能提高成绩。”评价该论证。',
        reasoning: [
          '平均成绩差异是相关证据，但学生原有成绩、自律程度、家庭支持都可能同时影响是否参加社团与成绩。',
          '“平均更高”也不能推出每个学生都提高；要证明因果，至少需控制起点差异并比较参加前后的变化。',
        ],
        result: '证据支持“社团参与与成绩存在相关”，不足以支持“参加社团必然导致个人成绩提高”的强因果结论。',
      },
      selfCheck: {
        question: '一个真实事例为什么仍可能是弱论据？',
        answer: '因为真实性不等于代表性或相关性；个案若缺乏与主张之间的因果桥梁，无法支撑普遍结论。',
      },
      pitfall: '不要只数“举例论证、对比论证”；要写清该方法证明了哪个分论点，以及若去掉它，推理链会缺失哪一步。',
    }),
  },
  {
    templateId: 'chinese-informational-media',
    keywords: ['说明', '科普', '媒介', '新闻', '调查', '访谈', '图表', '信息', '通讯', '数据表达', '多材料', '多文本', '差序格局', '礼治秩序', '跨文化比较', '新闻事实与通讯细节'],
    build: ({ title }) => ({
      guidingQuestion: `处理“${title}”时，怎样区分事实、解释和评价，并检验信息来源？`,
      core: '实用与信息类文本的可靠性取决于来源、采集方法、数据口径和推论边界；整合多材料时，应围绕同一问题比较而非逐篇摘要。',
      explanation: [
        '事实是可核验的事件或数据，观点是对事实意义的判断，解释则提出变量之间的关系。新闻标题、图表和正文可能采用不同时间范围或统计口径，阅读时必须核对样本、单位、基期和信息发布时间。',
        '多材料整合要先建立共同维度，例如“现状—原因—影响—对策”，再把不同来源放入维度中互证或冲突。来源相互独立且方法透明时，结论可信度才会上升。',
      ],
      steps: [
        { label: '验来源', detail: '记录发布者、日期、原始数据来源、调查对象和可能利益立场。' },
        { label: '统一口径', detail: '核对时间、单位、样本及百分比的分母，避免把不可比数据并列。' },
        { label: '结构整合', detail: '按共同问题归类一致证据、补充证据和矛盾证据，再形成有限结论。' },
      ],
      example: {
        prompt: '材料甲称“校园阅读量增长20%”，材料乙称“学生日均纸质阅读时间下降”，二者是否矛盾？',
        reasoning: [
          '“阅读量”可能统计借阅册数或电子阅读次数，“纸质阅读时间”只统计一种媒介；两个指标对象不同。',
          '还需核对增长的基期、样本是否同一群体，以及册数增加是否由短篇读物推动，不能直接用一个指标否定另一个。',
        ],
        result: '现有信息可得“总体阅读活动可能增长而纸质阅读时间下降”，但在口径未统一前不能断定阅读质量提高或下降。',
      },
      selfCheck: {
        question: '图表中比例从10%升到15%，应怎样准确表述增幅？',
        answer: '上升5个百分点；相对增幅为50%。二者分母不同，不能混称“上升5%”。',
      },
      pitfall: '不要因为材料带有数字就默认可靠；没有样本范围、采集时间和指标定义的数字无法被准确解释。',
    }),
  },
  {
    templateId: 'chinese-writing',
    keywords: ['写作', '作文', '立意', '分论点', '修改', '校订', '标题', '摘要', '引证', '小论文', '表达提升', '叙议结合', '反方观点', '限时任务', '宏大主题与个人经验'],
    build: ({ title }) => ({
      guidingQuestion: `完成“${title}”时，怎样把材料要求转成边界明确、可以论证的中心判断？`,
      core: '写作不是把主题写得宏大，而是回答材料规定的问题；中心论点应包含讨论对象、关系判断和成立条件，段落则各自承担推进任务。',
      explanation: [
        '审题先圈出任务、对象、情境和限制词，再辨析核心概念之间是因果、条件、对立还是互补。好的立意允许存在反方，并能由材料中的关键矛盾推出，而不是套用预先准备的口号。',
        '论证段需要“分论点—证据—分析—回扣”。事实论据之后要解释哪个细节对应分论点、通过何种机制产生结果；结尾应回应条件或反方，提升不是另起一个更大的话题。',
      ],
      steps: [
        { label: '限任务', detail: '把题目改写成一个具体问句，标出必须回应的对象、关系和情境。' },
        { label: '搭结构', detail: '让分论点呈递进、并列维度或正反转折，避免同义反复。' },
        { label: '补分析', detail: '每个事例后用因果机制解释“为什么能证明”，再检查反例和适用边界。' },
      ],
      example: {
        prompt: '材料要求讨论“面对算法推荐，青年应保持选择的主动性”。拟定中心论点与三层结构。',
        reasoning: [
          '“主动性”不是拒绝算法，而是理解推荐受既有行为和平台目标影响，仍能主动设置信息来源、核验内容并调整选择。',
          '结构可依次写“识别过滤机制—扩展异质信息—对重要判断承担核验责任”，由认知到行动再到责任递进。',
        ],
        result: '中心论点：青年可以利用算法提高效率，但应通过理解推荐机制、主动接触不同来源和核验关键事实，保持选择权而非把判断外包给平台。',
      },
      selfCheck: {
        question: '“科技是一把双刃剑”为什么通常不是合格中心论点？',
        answer: '它只给出空泛两面性，未回答何种科技、对谁、通过什么机制造成何种结果，也没有提出材料要求的判断。',
      },
      pitfall: '不要把人物事迹写成百字传记；只保留能证明分论点的选择与后果，并明确解释其与概念的对应关系。',
    }),
  },
  {
    templateId: 'chinese-whole-book-research',
    keywords: ['整本书', '专题研讨', '研究问题', '文献检索', '学术阅读', '材料编码', '操作化', '乡土中国', '人物关系', '《乡土中国》核心概念', '核心概念的操作化'],
    build: ({ title }) => ({
      guidingQuestion: `开展“${title}”时，怎样把宽泛兴趣变成有材料范围、可验证的研究问题？`,
      core: '专题研读要以问题组织章节和证据：先限定对象、文本范围与概念，再建立材料表，寻找重复模式、例外和变化。',
      explanation: [
        '“研究《红楼梦》女性形象”范围过大；“前二十回中王熙凤在公共与私人场景中的称谓变化如何体现权力位置”才可检验。研究问题应允许由文本证据回答，而不是只要求抒发感想。',
        '笔记应记录章节、原文、情境、初步解释和反例。引用二手资料时区分作者观点与自己的判断；若证据与预设冲突，应修改结论，而不是删去反例。',
      ],
      steps: [
        { label: '缩问题', detail: '限定文本范围、人物或概念、观察维度和预期关系。' },
        { label: '建证据表', detail: '按“出处—原文—情境—功能—反例”编码，保留可追溯页码或章节。' },
        { label: '形成结论', detail: '归纳模式并解释例外，用引文支撑有限判断，标明仍待验证之处。' },
      ],
      example: {
        prompt: '研究《乡土中国》“差序格局”能否解释班级中的人际互动，应怎样设计材料？',
        reasoning: [
          '先把差序格局操作化为“关系亲疏影响资源帮助或信息分享”，不能把所有熟人社会现象都算进去。',
          '可匿名记录不同任务中求助对象及关系强度，再访谈选择理由；同时寻找按公开规则而非亲疏行动的反例。',
        ],
        result: '研究结论只能说明特定班级、特定任务中关系亲疏与互动选择的关联，不能据小样本宣布现代学校完全由差序格局支配。',
      },
      selfCheck: {
        question: '专题研究中为什么要主动记录反例？',
        answer: '反例能检验概念边界和结论强度，帮助发现其他变量；忽略反例只会把研究变成验证预设。',
      },
      pitfall: '不要把搜索结果排名当作资料质量排序；优先核对作者、出版机构、引文出处和研究方法。',
    }),
  },
  {
    templateId: 'chinese-language-use',
    keywords: ['语病', '句群衔接', '语序安排', '概括压缩', '下定义', '修辞选择', '语体得体', '语言文字运用'],
    build: ({ title }) => ({
      guidingQuestion: `完成“${title}”时，怎样从句法骨架、逻辑关系和交际对象逐层校验语言？`,
      core: '语言文字运用不是凭语感改句子，而是先保留原意，再检查成分搭配、关系范围、信息顺序和语体是否服务于交际任务。',
      explanation: [
        '检查语病先压缩修饰语，找主干主谓宾，再把介词结构、关联词、否定和数量范围逐一放回。搭配错误属于结构问题，概念并列不当属于逻辑问题，两者需要不同理由。',
        '概括要保留对象、关键属性和关系，删除例子、重复与修饰；下定义通常写成“被定义概念是种差加属概念”。语体得体则取决于身份、场合、媒介和目的，不能把所有正式表达都改得冗长。',
      ],
      steps: [
        { label: '抽主干', detail: '隐藏长定语和状语，核对主语、谓语、宾语是否齐全且搭配。' },
        { label: '查逻辑信息', detail: '恢复修饰语，检查并列分类、关联关系、否定范围、指代和前后信息顺序。' },
        { label: '按任务重写', detail: '在不改变事实和语气的前提下修改，再核对字数、对象、格式与语体。' },
      ],
      example: {
        prompt: '修改：“通过建设口袋公园，使居民在步行十分钟内就能到达绿色空间。”',
        reasoning: [
          '介词“通过”遮蔽了动作主体，后半又用“使”引出兼语，整句缺少能够作谓语陈述对象的主语。',
          '若突出措施，可让“建设口袋公园”作主语；若突出城市，则补出“该区”并保留“通过”结构。',
        ],
        result: '可改为：“建设口袋公园，使居民在步行十分钟内就能到达绿色空间。”或“该区通过建设口袋公园，让居民能便捷到达绿色空间。”',
      },
      selfCheck: {
        question: '给“数字鸿沟”下定义时，为什么不能只写“数字技术带来的问题”？',
        answer: '“问题”这一属概念过宽，也未写种差；应指出它是不同群体在数字技术接入、使用能力和受益程度上的差距。',
      },
      pitfall: '不要见到“通过……使……”就机械删词；先判断是否另有明确主语，以及句子究竟缺主语还是搭配、逻辑范围有问题。',
    }),
  },
  {
    templateId: 'chinese-exam-response',
    keywords: ['题干对应', '主观题分点', '文本证据的准确性', '阅读答案', '复盘归因'],
    build: ({ title }) => ({
      guidingQuestion: `训练“${title}”时，怎样把题干任务转成覆盖完整、证据准确且层次清楚的答案？`,
      core: '主观题作答先拆任务维度，再让每一点形成“判断、证据、解释”的最小闭环；分点数量应服从文本层次，而非机械对应分值。',
      explanation: [
        '题干中的“概括、分析、赏析、作用、比较”要求不同：概括重信息归并，分析要补机制，赏析需说明形式与效果，作用题还要定位内容、结构和读者层面。先确认对象和范围能避免答非所问。',
        '引用证据不是抄整句，而是选能区分本答案与其他答案的关键词。复盘时把失分分为知识缺口、定位错误、证据不足、推理跳步和表达不清，下一次训练才有对应行动。',
      ],
      steps: [
        { label: '拆题干', detail: '圈出对象、范围、任务动词和限制条件，把复合问题拆成独立子任务。' },
        { label: '建闭环', detail: '每一点先给判断，再放短证据，最后解释证据如何支持判断。' },
        { label: '做覆盖检查', detail: '合并同义点，补缺失层次，核对人物、否定、因果和引用是否准确。' },
      ],
      example: {
        prompt: '题目问“末段写钟声有何作用”，文本此前写人物独自在空屋等待，末段为“远处钟声响了十二下，他仍没有开灯”。',
        reasoning: [
          '内容上“十二下”标出等待已经持续至深夜，“仍”突出状态未改变，深化孤独和失望。',
          '结构上钟声把模糊等待落到具体时间，并以外部声音反衬室内寂静，收束情节又留下人物是否继续等待的余味。',
        ],
        result: '答案应分别覆盖时间推进、人物情绪、声静对照和结尾收束，而不是只写“渲染悲伤气氛”。',
      },
      selfCheck: {
        question: '为什么同一答案拆成三句话不一定算三个得分点？',
        answer: '若三句话只是同义改写，仍只有一个信息维度；有效分点必须分别回答不同层次或使用不同证据。',
      },
      pitfall: '不要为追求分点而把一条因果链截成互不完整的短语；每一点都应能独立说明“是什么、凭什么、为什么”。',
    }),
  },
]

const englishTemplates: LessonTemplate[] = [
  {
    templateId: 'english-complex-grammar',
    keywords: ['clause', '从句', 'non-finite', '非谓语', '复杂句', '独立主格', 'inversion', '倒装', 'cleft', '强调', 'ellipsis', '省略', '名词化', '被动表达', '连接词', '主谓一致与指代'],
    build: ({ title }) => ({
      guidingQuestion: `How can you analyse “${title}” by structure and meaning instead of translating word by word?`,
      core: 'Find the finite verb in each clause first. Then identify how clauses are linked and what semantic job each dependent structure performs.',
      explanation: [
        'A long sentence is not simply a string of difficult words. Finite verbs reveal clause boundaries; conjunctions and relative words reveal whether a clause names something, modifies a noun, or gives time, cause, condition or concession.',
        'For a non-finite verb, locate its logical subject and compare its action with the main verb. Use doing for an active or simultaneous relation, done for a passive or completed relation, and to do commonly for purpose or a later, intended action, while checking lexical exceptions.',
      ],
      steps: [
        { label: 'Mark predicates', detail: 'Underline every finite verb and match it with a subject; this gives the clause skeleton.' },
        { label: 'Name relations', detail: 'Box linkers and state whether each unit modifies a noun, fills a noun slot or adds an adverbial relation.' },
        { label: 'Rebuild meaning', detail: 'Read the main clause first, attach dependent units, then explain focus, time and voice.' },
      ],
      example: {
        prompt: 'Analyse: “Built in 1933, the theatre, which had survived several renovations, reopened after engineers had confirmed its safety.”',
        reasoning: [
          'The main clause is “the theatre reopened”. “Built in 1933” passively modifies theatre, and the non-restrictive relative clause adds background rather than identifying which theatre.',
          '“After engineers had confirmed” places the safety check before the reopening; the past perfect makes the sequence explicit, while “its” refers to the theatre.',
        ],
        result: 'The sentence foregrounds the reopening and compresses three layers of background: original construction, later renovations, and a completed safety check.',
      },
      selfCheck: {
        question: 'In “Seeing from the roof, the river looks narrow”, what is wrong?',
        answer: 'The implied subject of “seeing” should be a person, but the main-clause subject is “the river”. Write “Seen from the roof, the river looks narrow” or supply a human subject.',
      },
      pitfall: 'Do not label every -ing form a present participle automatically; it may be a gerund, a progressive verb component or a participle, and its syntactic role changes the analysis.',
    }),
  },
  {
    templateId: 'english-time-modality',
    keywords: ['tense', '时态', 'aspect', '语态', 'conditional', '条件', '虚拟', 'modal', '情态', 'certainty', '语气'],
    build: ({ title }) => ({
      guidingQuestion: `In “${title}”, how do tense, aspect and modality locate an event and show the speaker's distance from it?`,
      core: 'Tense locates a reference point, aspect shows how an event unfolds relative to that point, and modal or conditional forms express likelihood, obligation or distance from reality.',
      explanation: [
        'Do not choose a tense from one time adverb alone. Build a timeline with the speaking time, the main reference time and each event. The perfect looks backward from a reference point; the progressive presents an event as ongoing or temporary.',
        'In conditionals, verb forms often signal the speaker’s assessment rather than literal past time. “If I knew” can describe present unreality, while “If I had known” looks back at an unreal past and normally pairs with “would have done”.',
      ],
      steps: [
        { label: 'Draw the timeline', detail: 'Mark now, the reference point and the beginning, duration or completion of each event.' },
        { label: 'Judge reality', detail: 'Decide whether the speaker treats the situation as open, unlikely, counterfactual, required or merely possible.' },
        { label: 'Choose the form', detail: 'Select tense, aspect and modal form, then verify that every clause shares a coherent viewpoint.' },
      ],
      example: {
        prompt: 'Explain: “If the city had installed the sensors earlier, it would be receiving real-time flood warnings now.”',
        reasoning: [
          '“Had installed” marks an unreal action in the past: the sensors were not installed earlier.',
          '“Would be receiving ... now” gives a present consequence of that past condition, so this is a mixed conditional rather than an inconsistent tense choice.',
        ],
        result: 'The sentence links a missed past action to a present unreal result and implies criticism of the earlier decision.',
      },
      selfCheck: {
        question: 'What is the difference between “must have left” and “had to leave”?',
        answer: '“Must have left” is a present deduction about a past event; “had to leave” reports a past necessity or obligation.',
      },
      pitfall: 'Do not equate past forms with past time in every conditional; first decide whether the form marks time, completion or distance from reality.',
    }),
  },
  {
    templateId: 'english-reading-structure',
    keywords: ['reading', '主旨', '段落', '篇章', 'main idea', 'details', '事实细节', '同义转述', '指代', 'cohesion', '衔接', '主线', '略读', '精读', '分类比较', '跨文本', '推理判断', '选句填空', 'biography timeline', '图表信息与文本互证', '篇章主线与段落推进'],
    build: ({ title }) => ({
      guidingQuestion: `When working on “${title}”, how can you trace the writer's line of thought and keep every answer within the evidence?`,
      core: 'A sound reading answer links a claim to a precise sentence and explains the paraphrase; topic, purpose and attitude are different questions.',
      explanation: [
        'Give each paragraph a functional label such as problem, example, explanation, counterargument or solution. Repeated key ideas may appear through synonyms and pronouns, so follow reference chains rather than searching only for identical words.',
        'For inference, combine stated facts with one necessary bridge, but stop before adding outside assumptions. The main idea must cover the whole passage without becoming so broad that it could fit many unrelated texts.',
      ],
      steps: [
        { label: 'Map paragraphs', detail: 'Write a short function beside each paragraph and connect contrast, cause and example markers.' },
        { label: 'Locate evidence', detail: 'Match question terms with paraphrases and record the exact sentence range that supports the answer.' },
        { label: 'Control scope', detail: 'Reject options that overstate frequency, causality, certainty, people or time beyond the text.' },
      ],
      example: {
        prompt: 'A passage says urban trees lower nearby surface temperatures, but their effect varies with species, shade and water. Which claim is justified?',
        reasoning: [
          'The stated effect is local surface cooling, not a guaranteed fall in the temperature of an entire city.',
          'The variation sentence makes species and site conditions moderators, so an absolute claim such as “all trees cool equally” exceeds the evidence.',
        ],
        result: 'A justified conclusion is: urban trees can reduce local surface heat, but the size of the effect depends on tree and site conditions.',
      },
      selfCheck: {
        question: 'Why is a true statement sometimes a wrong reading answer?',
        answer: 'It may be true in general but unsupported by this passage, or it may not answer the exact question about purpose, detail, inference or attitude.',
      },
      pitfall: 'Do not choose an option because it repeats more words from the passage; correct options often paraphrase the relation, while distractors copy words but change scope or logic.',
    }),
  },
  {
    templateId: 'english-critical-literacy',
    keywords: ['attitude', '语气', 'inference', '推断', 'critical', '可信度', 'source', 'advertising', '广告', 'claim', 'evidence', '反驳', 'bias', 'reliability', '事实与意见', 'benefits and risks', 'stereotypes', 'source credibility', '学术诚信', '事实观点与作者态度'],
    build: ({ title }) => ({
      guidingQuestion: `How does “${title}” require you to evaluate claims, evidence, tone and source credibility?`,
      core: 'Critical reading asks who makes a claim, for which audience and purpose, with what evidence, and how strongly the wording commits the writer.',
      explanation: [
        'Separate verifiable facts from interpretations and value judgements. Verbs such as “demonstrates” make a stronger commitment than “suggests”, while quotation marks, contrast and selective detail may create distance or irony.',
        'Source evaluation is not a simple “official equals true” rule. Check expertise, access to evidence, publication process, date, conflicts of interest and whether independent sources report compatible findings.',
      ],
      steps: [
        { label: 'Identify the claim', detail: 'Rewrite it with its population, time, condition and degree of certainty.' },
        { label: 'Audit the support', detail: 'Check source, sample, comparison, missing data and whether evidence establishes correlation or cause.' },
        { label: 'Read the stance', detail: 'Use evaluative vocabulary, modality, concession and selection of voices to infer tone without exaggeration.' },
      ],
      example: {
        prompt: 'An advertisement says, “Nine out of ten users felt more focused after trying FocusTea.” What must be checked?',
        reasoning: [
          '“Felt” is self-report, not an objective attention test; the sample size, recruitment and comparison group are missing.',
          'The company benefits from the claim, so the survey method and full results require independent verification, including the response of the tenth user.',
        ],
        result: 'The sentence can report satisfaction among surveyed users, but it cannot yet prove that the drink causes a measurable improvement in concentration.',
      },
      selfCheck: {
        question: 'Does the word “may” always show that the writer doubts the claim?',
        answer: 'No. It can accurately limit a claim to possibility because the evidence or conditions do not justify certainty; responsible hedging can strengthen credibility.',
      },
      pitfall: 'Do not infer a strongly “angry” or “supportive” tone from one word; combine repeated lexical choices, sentence structure, concessions and the treatment of opposing views.',
    }),
  },
  {
    templateId: 'english-vocabulary',
    keywords: ['vocabulary', '词义', '词根', '词缀', '词性', '搭配', '语块', '同义词', 'register', '语体', '词形', '一词多义', '语义网络'],
    build: ({ title }) => ({
      guidingQuestion: `How can “${title}” be learned as a network of meaning, grammar, collocation and register?`,
      core: 'Knowing a word means knowing its sense in context, grammatical pattern, frequent partners, register and contrasts with near-synonyms.',
      explanation: [
        'Use morphology to make a prediction, not a final decision: “invaluable” means extremely valuable, not without value. Confirm the sense through nearby examples, contrast markers and the semantic role required by the sentence.',
        'Record words in chunks such as “pose a threat to” or “be eligible for”. Near-synonyms differ in strength and register: “childish” criticises immaturity, whereas “childlike” often praises openness or innocence.',
      ],
      steps: [
        { label: 'Predict', detail: 'Use word family, sentence position and topic to predict part of speech and possible sense.' },
        { label: 'Test context', detail: 'Substitute the meaning and check collocation, tone, reference and logical relation.' },
        { label: 'Build the entry', detail: 'Store one authentic chunk, one contrast word and one new sentence with the same pattern.' },
      ],
      example: {
        prompt: 'Choose between “economic” and “economical”: “The new heat pump is ___ because it uses less electricity.”',
        reasoning: [
          '“Economic” normally relates to the economy, finance or production, as in “economic growth”.',
          '“Economical” means using money or resources efficiently; “uses less electricity” directly supplies that meaning.',
        ],
        result: 'Use “economical”: “The new heat pump is economical because it uses less electricity.”',
      },
      selfCheck: {
        question: 'Why is memorising “address = 地址” incomplete?',
        answer: 'Because “address” can be a verb meaning deal with an issue or speak to an audience, and each sense has different grammatical and collocational patterns.',
      },
      pitfall: 'Do not replace a word with a dictionary synonym without checking tone and pattern; “discuss the issue” is correct, but “discuss about the issue” is not.',
    }),
  },
  {
    templateId: 'english-writing-argument',
    keywords: ['writing', '写作', 'essay', 'proposal', '观点', 'argument', 'counterargument', 'rebuttal', '议论文', '修改', 'coherence', '段落推进', '观点段落的展开', '个人经历', '人物与地点描写', '图表描述', '摘要与改写', 'policy alternatives', 'problem solution', 'cause and effect', '图表作文', '衔接手段与同伴修改'],
    build: ({ title }) => ({
      guidingQuestion: `For “${title}”, how can you make each paragraph advance one defensible claim for a clear audience?`,
      core: 'An effective paragraph moves from a specific claim through relevant evidence and reasoning to a consequence; coherence comes from logical progression, not connectors alone.',
      explanation: [
        'Plan from purpose and reader. A proposal needs a feasible action, responsible actor, resources and expected effect; an argument needs a contestable thesis, reasons and a fair response to a plausible objection.',
        'Examples do not explain themselves. After evidence, state the mechanism linking it to the claim. During revision, inspect paragraph function, pronoun reference, repeated nouns, verb tense and sentence boundaries before replacing simple words with impressive ones.',
      ],
      steps: [
        { label: 'Define the task', detail: 'Write one sentence naming audience, purpose, required genre and the decision you want the reader to make.' },
        { label: 'Build paragraphs', detail: 'Give each paragraph one claim, evidence, reasoning and link to the overall purpose.' },
        { label: 'Revise in passes', detail: 'Check content and order first, then sentence logic, grammar, collocation, punctuation and format.' },
      ],
      example: {
        prompt: 'Write the reasoning after this evidence: “A school trial found that refill stations cut 8,000 disposable bottles in one term.”',
        reasoning: [
          'The reduction directly measures avoided single-use containers, so it supports the environmental effect more strongly than a survey of intentions.',
          'To justify expansion, add cost, maintenance and usage conditions; one school and one term cannot establish the same result everywhere.',
        ],
        result: '“The measured reduction shows that convenient refilling can change daily behaviour, although the school should confirm maintenance costs before installing stations on every floor.”',
      },
      selfCheck: {
        question: 'Why does adding “firstly, moreover, therefore” not automatically create coherence?',
        answer: 'Connectors only label relations. If two sentences do not share a clear topic or the second does not logically support the first, the paragraph remains incoherent.',
      },
      pitfall: 'Do not invent statistics or named experts to sound persuasive; use verifiable evidence, a transparent hypothetical example or explicit conditional reasoning.',
    }),
  },
  {
    templateId: 'english-practical-writing',
    keywords: ['email', '邮件', '通知', '申请', '推荐信', '活动方案', '应用文', '演讲稿', 'campaign', 'presentation', 'speech', '演讲开场', '演讲结尾'],
    build: ({ title }) => ({
      guidingQuestion: `How should “${title}” change with audience, purpose, register and required action?`,
      core: 'Practical writing succeeds when the reader can quickly identify why the message matters, what details are reliable, and what action is required by when.',
      explanation: [
        'Select content from the reader’s perspective. A notice foregrounds time, place, eligibility and action; an application links relevant experience to selection criteria; a speech uses signposting and concrete images because listeners cannot reread.',
        'Register is a pattern, not one polite phrase. Greeting, modal verbs, contractions, directness and closing should form a consistent relationship. Politeness can be concise: “Could you confirm the venue by Friday?” is clearer than an overlong apology.',
      ],
      steps: [
        { label: 'Profile the reader', detail: 'State what the reader already knows, needs to know and should do after reading.' },
        { label: 'Order information', detail: 'Lead with purpose, group essential details, then end with a clear action, deadline and contact route.' },
        { label: 'Tune register', detail: 'Check greeting, requests, contractions, vocabulary and closing for one consistent level of formality.' },
      ],
      example: {
        prompt: 'Improve: “Teacher, I want the lab. Tell me quickly if Friday is OK.”',
        reasoning: [
          'The message lacks purpose and duration, and the imperative “Tell me quickly” sounds abrupt in a request to a teacher.',
          'Add the project, exact time and a polite but actionable confirmation request.',
        ],
        result: '“Dear Ms Chen, Could our robotics group use the physics lab from 3:30 to 5:00 p.m. this Friday to test our sensor project? Please let me know by Wednesday if the room is available. Best regards, Li Ming”',
      },
      selfCheck: {
        question: 'What four details should normally appear in an event notice?',
        answer: 'The event or purpose, time and place, intended participants or requirements, and the action or registration deadline.',
      },
      pitfall: 'Do not copy letter formulas without matching the relationship; “Yours faithfully” is inappropriate in a message to a close classmate, while slang is unsuitable for a formal application.',
    }),
  },
  {
    templateId: 'english-listening-speaking',
    keywords: ['listening', '听力', 'speaking', '口语', 'discussion', '讨论', '访谈', 'interview', 'negotiat', '协商', 'mediation', '转述', '讲座笔记', '对话意图', '澄清', '确认信息', '个人陈述', '赞同反对', '礼貌策略', 'cultural comparison', 'implied meaning', 'mediating between', '跨文化语用', '讨论中的让步反驳与协商'],
    build: ({ title }) => ({
      guidingQuestion: `In “${title}”, how can you capture the speaker's purpose, organise evidence and respond productively?`,
      core: 'Listening is active prediction and revision: track speakers, purpose, signposts and corrections, then separate the final decision from options merely discussed.',
      explanation: [
        'Before listening, predict information types from the task. During listening, abbreviate content words and mark contrast or correction: “We planned Tuesday, but the venue is only free Thursday” makes Thursday the valid answer.',
        'A productive spoken response acknowledges the previous idea, adds a reason and opens the next move. Mediation means selecting and reformulating information for a new listener, not translating every sentence.',
      ],
      steps: [
        { label: 'Predict slots', detail: 'Identify whether each blank requires a person, number, reason, attitude, change or final decision.' },
        { label: 'Track revisions', detail: 'Mark however, actually, rather, I mean and conditional options; distinguish proposal from agreement.' },
        { label: 'Respond and verify', detail: 'Paraphrase the agreed point, add a reason or question, and confirm responsibilities and deadline.' },
      ],
      example: {
        prompt: 'In a planning talk, A says “We could print posters.” B says “That costs too much; how about the school account?” A replies “Good point. I’ll send the draft tonight.” What was decided?',
        reasoning: [
          'Printing posters was only an initial suggestion and was rejected because of cost.',
          '“Good point” accepts using the school account, and A’s promise to send a draft assigns the next action and time.',
        ],
        result: 'They decided to promote the event through the school account, with A sending a draft that night.',
      },
      selfCheck: {
        question: 'What is the difference between clarifying and confirming?',
        answer: 'Clarifying asks for missing or unclear meaning; confirming repeats an understood detail to check that it is correct.',
      },
      pitfall: 'Do not write every number you hear as an answer; speakers often mention an old price, rejected date or approximate figure before correcting it.',
    }),
  },
  {
    templateId: 'english-translation',
    keywords: ['translation', '翻译', '汉译英', '意群', '文化负载', '准确连贯与得体', '转述', 'paraphras', '无主句', '连接关系'],
    build: ({ title }) => ({
      guidingQuestion: `How can “${title}” preserve meaning and logic while producing natural target-language information flow?`,
      core: 'Translate sense groups and relations, not isolated words: identify the main assertion, logical links, agent, time and register before choosing target-language structure.',
      explanation: [
        'Chinese often leaves subjects implicit and places context before the main action. English usually requires an explicit grammatical subject and may prefer passive voice, an inanimate subject or a clause to preserve focus.',
        'Make causal and contrast relations explicit only when the source licenses them. For culture-specific terms, choose transliteration plus a short explanation, a functional equivalent or contextual paraphrase according to what the reader needs.',
      ],
      steps: [
        { label: 'Segment meaning', detail: 'Slash the source into topic, main event, cause, condition, contrast and result; find the information focus.' },
        { label: 'Choose structure', detail: 'Select subject, voice, clause hierarchy and connectors before translating individual phrases.' },
        { label: 'Back-check', detail: 'Compare people, quantities, negatives, modality and register, then read the target sentence for natural flow.' },
      ],
      example: {
        prompt: 'Translate: “随着社区图书馆延长开放时间，越来越多的上班族能够在下班后使用公共学习空间。”',
        reasoning: [
          'The “随着” phrase supplies a changing condition, while the main information is increased access for working people after work.',
          'Use “As” for parallel change, “extend opening hours” as the action, and “gain access to” to avoid the stiff word-for-word “can use”.',
        ],
        result: 'As community libraries extend their opening hours, more working people are gaining access to public study spaces after work.',
      },
      selfCheck: {
        question: 'Why should “令人遗憾的是” not always be translated as “It makes people regretful that”?',
        answer: 'English normally uses the stance frame “Unfortunately” or “It is regrettable that”; literal causative wording is unnatural and changes the discourse function.',
      },
      pitfall: 'Do not add a causal connector merely because two source clauses are adjacent; sequence, cause and contrast must be distinguished from context.',
    }),
  },
  {
    templateId: 'english-literature-research',
    keywords: ['literature', 'narrator', 'focalization', 'imagery', 'figurative', 'character', 'theme', 'research', 'academic', 'citation', 'data', 'charts', 'poster', '不可靠叙述', 'narrative perspective and reliability', 'literary response', '图表信息概括', '研究报告'],
    build: ({ title }) => ({
      guidingQuestion: `How does “${title}” turn textual or research evidence into an interpretation with clear limits?`,
      core: 'An interpretation is a claim about how a formal choice creates meaning; a research conclusion is a claim whose strength must match the source and method.',
      explanation: [
        'In literature, distinguish narrator from author and observation from interpretation. Quote a short, exact detail, name the technique, explain its immediate effect and connect that effect to character or theme.',
        'In research communication, state the question, method, result and limitation. Paraphrase by changing structure and wording after understanding the idea, while still citing the source; replacing a few synonyms is not independent writing.',
      ],
      steps: [
        { label: 'Frame the claim', detail: 'Write a specific interpretive or research question with text, population and variable boundaries.' },
        { label: 'Present evidence', detail: 'Quote or report accurately, identify method or technique, and preserve source attribution.' },
        { label: 'Explain and limit', detail: 'Show the reasoning bridge, consider an alternative, and state what the evidence cannot establish.' },
      ],
      example: {
        prompt: 'Interpret: “The empty chair kept its place at the table, gathering dust but never coats.”',
        reasoning: [
          'The chair is personified through “kept its place”, and the contrast between dust and coats shows that it remains unused over time.',
          'Because a table normally gathers people, the preserved empty place can signify absence remembered by the household rather than simple untidiness.',
        ],
        result: 'The concrete image turns prolonged absence into a visible family ritual: the person is gone, but the household has not reassigned the place.',
      },
      selfCheck: {
        question: 'What is missing from “The metaphor makes the sentence vivid”?',
        answer: 'It does not identify what two things are compared, which shared feature is activated, or how that comparison changes the reader’s understanding of character, mood or theme.',
      },
      pitfall: 'Do not use a quotation as a substitute for reasoning; after every quotation, explain the relevant wording and its function in this context.',
    }),
  },
  {
    templateId: 'english-information-reasoning',
    keywords: ['process description and sequencing', 'identifying stakeholders', 'rights duties and consequences'],
    build: ({ title }) => ({
      guidingQuestion: `How can “${title}” organise a real process or public issue into actors, stages, evidence and consequences?`,
      core: 'Information becomes useful when the reader can distinguish sequence from cause, identify who acts or is affected, and see which evidence supports each consequence.',
      explanation: [
        'A process description should name the input, agent or mechanism, ordered stages and output. “Then” marks sequence but does not prove that the earlier step causes the later one; causal language must identify what changes and why.',
        'For a social issue, map stakeholders by role rather than merely listing people. State each group’s rights, duties, likely benefits, costs and decision power, then compare options using the same criteria and acknowledge trade-offs.',
      ],
      steps: [
        { label: 'Define the system', detail: 'Set the start and end point, then list actors, resources, constraints and the decision to be made.' },
        { label: 'Trace relations', detail: 'Use precise verbs to separate sequence, cause, condition, responsibility and measured result.' },
        { label: 'Evaluate outcomes', detail: 'Compare effects on each stakeholder, cite evidence and state uncertainty or implementation conditions.' },
      ],
      example: {
        prompt: 'A school plans to replace a hot courtyard with trees and shaded seating. Identify the reasoning needed before approval.',
        reasoning: [
          'Students and staff gain cooler outdoor space, while maintenance workers need watering capacity and emergency routes must remain clear; these are distinct interests and duties.',
          'Temperature measurements and shade models can estimate benefit, but cost, tree survival and accessible paths must be compared with alternatives under the same time horizon.',
        ],
        result: 'A defensible proposal names affected groups, explains the cooling process, compares cost and access, and recommends a pilot with temperature and usage evaluation.',
      },
      selfCheck: {
        question: 'Why is “After the campaign began, waste fell, so the campaign caused the fall” incomplete?',
        answer: 'Temporal order alone does not exclude other causes such as seasonal change; use a comparison and explain the behavioural mechanism before claiming causation.',
      },
      pitfall: 'Do not treat the group with the loudest voice as the only stakeholder; include people who bear costs, have legal duties or lack direct access to the discussion.',
    }),
  },
]

const politicsTemplates: LessonTemplate[] = [
  {
    templateId: 'politics-economic-system',
    keywords: ['市场', '供给', '需求', '价格', '竞争', '宏观调控', '所有制', '国有经济', '非公有制', '企业经营', '分配', '收入', '社会保障', '共同富裕', '经济社会', '国民经济循环', '效率与公平'],
    build: ({ title }) => ({
      guidingQuestion: `分析“${title}”时，怎样从主体激励、资源配置和制度保障建立完整经济链条？`,
      core: '经济现象应区分市场信号、企业和居民行为、政府规则与宏观目标；价格变化既可能来自需求，也可能来自成本或供给能力变化。',
      explanation: [
        '市场通过价格、供求和竞争传递稀缺信息，引导分散主体决策，但外部性、公共物品、信息不对称和垄断会使个体最优偏离社会最优。政府作用不是替代全部市场选择，而是制定规则、提供公共服务并进行科学宏观调控。',
        '分析所有制和分配时要区分“地位、作用、实现形式”。初次分配主要发生在生产过程，再分配通过税收、社会保障和转移支付调节，第三次分配强调自愿公益；公平并非平均分配，效率也不能以牺牲基本权利为代价。',
      ],
      steps: [
        { label: '找主体', detail: '列出居民、企业、政府和市场平台分别拥有的信息、目标与约束。' },
        { label: '画机制', detail: '沿“条件变化—供求或成本—行为反应—价格产量—社会影响”展开。' },
        { label: '评制度', detail: '判断市场是否失灵、政策工具作用于哪一环，以及可能成本和配套措施。' },
      ],
      example: {
        prompt: '上海大型展会期间酒店价格上涨，随后部分酒店增加临时员工和房源。如何解释？',
        reasoning: [
          '展会使短期住宿需求右移，而房间数量短期较难增加，均衡价格上升；价格信号也显示该时段住宿服务更稀缺。',
          '酒店增加员工、盘活房源会扩大供给并缓解紧张，但若出现虚假标价、串通涨价，市场规则和监管需保护公平竞争与消费者权益。',
        ],
        result: '价格上涨首先反映短期供需变化，并激励供给响应；政府应维护透明定价和竞争秩序，而非把任何价格上涨都简单认定为市场失灵。',
      },
      selfCheck: {
        question: '发放消费券主要改变供给还是需求？为什么仍要观察供给能力？',
        answer: '它直接提高特定消费的支付能力，主要推动需求；若供给短期缺乏弹性，政策可能更多推高价格而非增加实际消费量。',
      },
      pitfall: '不要把“政府调控”写成万能结论；必须写清使用财政、货币、产业或监管中的哪类工具，作用对象和传导机制是什么。',
    }),
  },
  {
    templateId: 'politics-political-system',
    keywords: ['党的领导', '执政', '人民当家作主', '人民民主', '人民代表大会', '政党制度', '民族区域自治', '基层自治', '国家治理', '权力运行', '近代中国基本国情', '中国共产党的诞生', '党的先进性', '基本政治制度'],
    build: ({ title }) => ({
      guidingQuestion: `理解“${title}”时，如何区分领导主体、国家机关、制度渠道和公民参与方式？`,
      core: '我国政治制度分析要把党的领导、人民当家作主和依法治国统一起来，同时准确区分党、人大、政府、监察机关、审判机关和检察机关的职能。',
      explanation: [
        '人民通过人民代表大会行使国家权力；人大依法决定重大事项、制定法律或地方性法规并监督国家机关，政府负责行政管理。党的领导提供根本政治保证，但“党提出主张”不等于党组织代替国家机关履行法定职权。',
        '全过程人民民主既看选举，也看协商、决策、管理和监督等持续环节。评价参与是否有效，要检查信息是否公开、意见能否表达、程序是否衔接决策以及结果是否反馈。',
      ],
      steps: [
        { label: '定主体', detail: '先确认材料中的党组织、人大、政府、政协、社区组织或公民，不能互换称谓。' },
        { label: '对职权', detail: '把行为与领导、立法、决定、监督、行政、协商或自治等制度职能对应。' },
        { label: '连程序', detail: '说明意见怎样进入决策、权力怎样受监督、结果怎样回应人民利益。' },
      ],
      example: {
        prompt: '某区改造老旧街区：居委会收集居民意见，政府形成方案，区人大审查预算并监督执行。说明各主体作用。',
        reasoning: [
          '居委会作为基层群众性自治组织组织居民协商，不是区政府的下级行政机关；区政府承担方案制定和行政实施。',
          '区人大依法审查批准预算并监督政府工作，使公共资金使用进入国家权力机关的法定程序。',
        ],
        result: '案例体现基层民主参与、政府依法履职和人大监督相衔接，不能笼统概括为“人大负责施工”或“居委会行使行政权”。',
      },
      selfCheck: {
        question: '政协能否行使国家立法权？',
        answer: '不能。政协履行政治协商、民主监督和参政议政职能；国家立法权由全国人大及其常委会依法行使。',
      },
      pitfall: '不要把“人民直接行使国家权力”和“人民通过人大行使国家权力”混淆，也不要把基层自治组织写成基层政权机关。',
    }),
  },
  {
    templateId: 'politics-rule-of-law',
    keywords: ['法治', '立法', '执法', '司法', '守法', '行政权力', '程序正义', '权力监督', '责任追究', '法治参与'],
    build: ({ title }) => ({
      guidingQuestion: `讨论“${title}”时，怎样同时检查实体依据、法定权限和程序保障？`,
      core: '法治要求权力来源合法、行使有据、程序正当、责任可追；结果看似合理也不能替代法定程序。',
      explanation: [
        '科学立法要尊重社会规律、遵循法定程序并充分吸纳民意；严格执法要求规范、公正、文明；公正司法要求依法独立公正行使审判权和检察权，并保障当事人诉讼权利。',
        '材料分析应沿“谁依据什么规则，对谁作出什么行为，当事人有什么权利和救济”展开。程序公开、说明理由、听取陈述申辩和回避制度，不是形式负担，而是降低恣意和事实错误的机制。',
      ],
      steps: [
        { label: '审权限依据', detail: '确认行为主体是否有法定职权，适用的规范层级和条件是否正确。' },
        { label: '审事实程序', detail: '核对证据、告知、听证或申辩、决定和送达等必要环节。' },
        { label: '审救济责任', detail: '说明复议、诉讼、监督或赔偿渠道，并判断违法责任主体。' },
      ],
      example: {
        prompt: '城管因流动摊贩占道，未听取解释便当场没收全部经营工具且不开具文书。怎样评价？',
        reasoning: [
          '占道可能违反管理规定，但处罚或强制措施仍需有明确权限、种类和幅度依据，事实也需调查确认。',
          '拒绝陈述申辩、未出具文书使当事人难以知道理由并寻求救济，损害程序正当和权利保障。',
        ],
        result: '违法事实不能自动使任何处理方式合法；行政机关需依法确定措施、履行告知和文书程序，当事人可依法申请救济。',
      },
      selfCheck: {
        question: '“程序合法但结果不利于当事人”是否等于程序无意义？',
        answer: '不等于。程序保障知情、参与、事实查明和救济，不能保证任何一方必胜，但能降低权力恣意并提升决定可审查性。',
      },
      pitfall: '不要把公安机关、检察院和法院统称“司法机关”后混写职责；侦查、法律监督、起诉和审判的主体及程序不同。',
    }),
  },
  {
    templateId: 'politics-civil-law',
    keywords: ['民事', '人身权', '物权', '知识产权', '侵权', '合同', '婚姻', '家庭', '继承', '遗嘱', '劳动合同', '消费者', '创业', '经营', '纳税', '调解', '仲裁', '诉讼'],
    build: ({ title }) => ({
      guidingQuestion: `解决“${title}”情境时，如何确定法律关系、权利义务、责任要件和救济路径？`,
      core: '生活法律题要先定主体与法律关系，再审事实是否满足构成要件；价值上“觉得不公平”不能替代合同、侵权或程序规则。',
      explanation: [
        '民事法律关系由主体、客体和内容构成。合同题检查订立、效力、履行与违约；侵权题通常检查行为、损害、因果关系和过错，并留意无过错责任、免责或减责事由。',
        '维权需要证据和适当程序。协商、调解较灵活，仲裁通常以有效仲裁协议为前提且实行一裁终局，诉讼由法院依法审理；劳动争议等领域还存在先仲裁后诉讼的特殊安排。',
      ],
      steps: [
        { label: '定关系', detail: '列出主体、标的、权利义务及争议发生的时间线。' },
        { label: '套要件', detail: '逐项核对有效要件、履行情况、损害、因果与过错，不跳步定责。' },
        { label: '选救济', detail: '保全合同、聊天、付款和损害证据，再按协商、调解、仲裁或诉讼条件选择。' },
      ],
      example: {
        prompt: '学生把自己拍摄的校园照片上传网络，某商家未署名用于商品广告。可能涉及什么权利？',
        reasoning: [
          '照片具有独创表达时，拍摄者通常享有著作权；公开上传不等于放弃复制、信息网络传播和署名等权利。',
          '商家以营利广告复制使用且未获许可、未署名，需审查是否存在法定许可或合理使用；商业广告通常难以仅以“网上可见”免责。',
        ],
        result: '可从停止使用、署名、赔偿损失等著作权责任分析，并保留原始文件、发布时间和广告页面作为证据。',
      },
      selfCheck: {
        question: '合同一方违约后，对方能否任由损失扩大再要求全部赔偿？',
        answer: '不能。守约方负有采取合理措施防止损失扩大的义务；对可避免而未避免的扩大损失，一般不能要求赔偿。',
      },
      pitfall: '不要见到损害就直接判侵权成立；必须检查权利基础、行为、损害、因果、过错及特殊归责原则。',
    }),
  },
  {
    templateId: 'politics-philosophy-foundations',
    keywords: ['哲学的起源', '世界观与方法论', '哲学与具体科学', '哲学基本问题', '马克思主义哲学的历史使命'],
    build: ({ title }) => ({
      guidingQuestion: `理解“${title}”时，怎样区分零散生活观点、系统化世界观、方法论和具体科学知识？`,
      core: '哲学是关于世界观的学问，是系统化理论化的世界观，也是世界观与方法论的统一；它概括具体科学成果，又不能替代具体研究。',
      explanation: [
        '人人都有对世界和人生的看法，但未经反思的零散看法不等于哲学理论。世界观回答世界本原、人与世界关系等根本问题，方法论则是这种根本看法在认识和改造世界中的原则体现。',
        '具体科学揭示自然、社会和思维特定领域的规律，为哲学提供材料；哲学从中概括最一般的本质和规律，并给予方法论指导。哲学若脱离科学会空洞，科学研究也会自觉或不自觉受到世界观影响。',
      ],
      steps: [
        { label: '辨知识层次', detail: '判断材料是具体事实、领域规律、根本观点还是行动原则，避免层级混淆。' },
        { label: '找双向关系', detail: '说明具体科学怎样提供基础，哲学怎样进行概括并影响研究方法。' },
        { label: '回到实践', detail: '检验某世界观如何转化为选择和行动，以及行动结果是否支持这一方法。' },
      ],
      example: {
        prompt: '“气象学能预测台风，所以哲学对防灾没有作用。”这一说法错在哪里？',
        reasoning: [
          '气象学提供台风路径、强度等具体规律和数据，防灾不能用哲学判断替代这些专业结论。',
          '但是否尊重客观规律、如何理解风险与实践反馈、怎样统筹局部整体，包含世界观和方法论问题，哲学可提供一般指导。',
        ],
        result: '具体科学与哲学研究层次不同、相互联系，既不能用哲学代替气象模型，也不能据专业分工否认方法论作用。',
      },
      selfCheck: {
        question: '世界观与方法论是两个互不相关的观点集合吗？',
        answer: '不是。一般说来，世界观决定方法论，方法论体现世界观；对世界的根本看法会转化为认识和行动原则。',
      },
      pitfall: '不要把哲学说成“科学之科学”或包办一切的最高知识；哲学不能替代具体科学的实验、数据和专业模型。',
    }),
  },
  {
    templateId: 'politics-state-systems',
    keywords: ['国家的本质', '民主与专政', '政体与国体', '单一制', '复合制', '利益集团', '各具特色的国家'],
    build: ({ title }) => ({
      guidingQuestion: `比较“${title}”时，怎样从国家性质、政权组织形式和中央地方结构区分制度层次？`,
      core: '国体回答国家政权掌握在哪个阶级手中，政体回答国家政权如何组织；国家结构形式则回答整体与组成部分的权限关系，三者不能混为一谈。',
      explanation: [
        '民主具有鲜明阶级性，是服务于统治阶级的制度安排；民主与专政相互依存，不能把资本主义民主抽象成全民共享且无阶级界限的形式。政体受国体决定，也受历史传统、社会习惯和发展状况影响，因此相同性质国家可采用不同组织形式。',
        '单一制国家中地方权力由中央依法授予，国家只有一个中央政权和统一宪法法律体系；联邦制国家的组成单位在联邦宪法规定范围内拥有权力。比较时应看权力来源与宪法安排，而非简单看国土大小。',
      ],
      steps: [
        { label: '分三个问题', detail: '依次回答谁掌权、政权机关怎样组织、中央与地方权限怎样配置。' },
        { label: '找制度依据', detail: '根据宪法、政党制度和权力来源判断，不能只看机构名称。' },
        { label: '联系历史条件', detail: '解释国情、阶级力量和传统如何塑造具体形式，并评价运行效果。' },
      ],
      example: {
        prompt: '“面积大的国家一定采用联邦制，面积小的一定采用单一制。”为什么错误？',
        reasoning: [
          '国土面积可能影响治理成本，但国家结构形式的判准是中央与地方权力来源和宪法权限，不是面积。',
          '历史上的国家形成方式、民族构成和政治传统都会影响选择，现实中存在大型单一制国家和较小的联邦制国家。',
        ],
        result: '面积不是充分或必要条件；判断单一制与联邦制应检查组成单位权力是否由统一中央授予或受联邦宪法保障。',
      },
      selfCheck: {
        question: '国体相同是否意味着政体必须完全相同？',
        answer: '不意味着。国体决定政体性质，但历史条件、文化传统和具体国情会使政权组织形式呈现差异。',
      },
      pitfall: '不要把政党、利益集团与国家机关混写；它们影响公共决策的方式、法律地位和能否直接行使国家权力并不相同。',
    }),
  },
  {
    templateId: 'politics-material-consciousness',
    keywords: ['物质统一', '物质与运动', '规律的客观', '意识的本质', '主观能动', '物质意识', '世界的本质'],
    build: ({ title }) => ({
      guidingQuestion: `运用“${title}”时，怎样说明尊重客观规律与发挥主观能动性并不矛盾？`,
      core: '物质决定意识，规律具有客观性；意识能够能动地认识和改造世界，但能动作用必须通过实践并以客观条件和规律为基础。',
      explanation: [
        '“从实际出发”不是消极等待，而是调查对象的条件、联系和变化，形成符合实际的认识。规律不能被创造或消灭，人可以认识规律并改变规律发生作用的具体条件。',
        '材料中若政策成功，不能只答“发挥意识作用”，还需写清如何基于数据认识规律、制定目标、组织实践并根据反馈修正；若失败，则检查是否夸大主观愿望或忽视条件。',
      ],
      steps: [
        { label: '找客观条件', detail: '列出资源、环境、技术、制度和既有趋势，不把愿望当事实。' },
        { label: '找认识行动', detail: '说明调查、预测、规划、组织和调整怎样把意识转化为实践。' },
        { label: '判统一关系', detail: '评价行动是否遵循规律、利用条件并在反馈中修正认识。' },
      ],
      example: {
        prompt: '城市根据多年降雨和积水数据改造排水系统，并在极端天气后更新模型。说明哲学依据。',
        reasoning: [
          '降雨规律、地形和管网容量是客观条件，规划必须从数据出发，不能用主观愿望取消极端降雨风险。',
          '人可以认识水流和风险分布规律，通过工程与预警改变损失发生条件；灾后更新模型体现实践检验和发展认识。',
        ],
        result: '案例体现一切从实际出发、尊重规律与发挥主观能动性相统一，能动性通过调查、设计、建设和反馈修正落地。',
      },
      selfCheck: {
        question: '“人能利用规律”是否意味着人能改变规律本身？',
        answer: '不意味着。人改变的是规律发挥作用的具体条件，并依据规律趋利避害，规律本身具有客观性。',
      },
      pitfall: '不要把任何“努力”都归为正确发挥主观能动性；方向是否正确要看它是否以客观实际和规律为依据。',
    }),
  },
  {
    templateId: 'politics-dialectics',
    keywords: ['联系', '整体与部分', '发展', '量变', '质变', '矛盾', '辩证', '分析与综合', '辩证否定', '发散', '聚合', '逆向', '超前思维'],
    build: ({ title }) => ({
      guidingQuestion: `运用“${title}”分析材料时，怎样找到真实关系而不是堆砌辩证法术语？`,
      core: '辩证分析要指出具体要素之间怎样相互作用、变化如何积累并越过条件边界、主要矛盾和矛盾主要方面如何随情境改变。',
      explanation: [
        '联系具有普遍性但具体联系有条件，不能把时间上相邻当因果。整体统率部分，关键部分在一定条件下会影响整体功能；优化部分必须服务于整体目标，而非片面追求局部指标。',
        '量变达到一定程度引起质变，但并非任何数量增加都会自动产生进步。矛盾分析要求既承认共同规律，又研究对象特殊性，并抓住在该阶段支配其他问题的主要矛盾。',
      ],
      steps: [
        { label: '画关系', detail: '写出要素A通过何种机制影响B，并标明中介条件与反馈。' },
        { label: '看过程', detail: '确定积累指标、临界条件、发展阶段和新质形成后的结构变化。' },
        { label: '抓重点', detail: '依据任务目标识别主要矛盾，同时保留次要矛盾和负面效应。' },
      ],
      example: {
        prompt: '新能源汽车续航从300公里逐步提升到700公里，就必然产生汽车产业“质变”吗？',
        reasoning: [
          '续航增加是量的积累，但产业质变还取决于充电网络、成本、安全、供应链和使用场景，单一指标没有自动临界值。',
          '当电池、基础设施与商业模式协同改变，使使用方式和产业结构发生根本变化时，才可讨论由量变促成质变。',
        ],
        result: '应坚持量变是质变的必要准备，同时分析结构、条件和系统协同；不能把任意指标增长直接命名为质变。',
      },
      selfCheck: {
        question: '主要矛盾是否在任何时间、任何任务中都固定不变？',
        answer: '不是。主要矛盾由具体阶段和任务决定，条件变化后可能与次要矛盾转化，因此需要具体问题具体分析。',
      },
      pitfall: '不要写“事物都有两面性”代替矛盾分析；要指出双方是什么、怎样对立统一、在何种条件下转化。',
    }),
  },
  {
    templateId: 'politics-epistemology-values',
    keywords: ['实践是认识', '真理', '认识', '社会存在', '社会意识', '人民群众', '价值判断', '价值选择', '社会历史'],
    build: ({ title }) => ({
      guidingQuestion: `学习“${title}”时，如何从实践、认识修正和利益立场解释判断的形成？`,
      core: '实践是认识的来源、动力、目的和检验标准；真理有客观性，同时任何真理都在特定条件和范围内成立，认识在实践中反复深化。',
      explanation: [
        '新事实推翻旧结论并不等于“没有真理”，而可能说明原认识超出适用条件或证据不足。检验认识要回到实践效果，但短期有用、个别人赞同也不能自动成为真理标准。',
        '价值判断受社会历史条件和主体立场影响，但并非纯主观任意。正确价值选择应遵循社会发展客观规律，自觉站在最广大人民立场，协调个人、群体与社会长远利益。',
      ],
      steps: [
        { label: '追认识来源', detail: '说明问题从何种实践提出，证据如何获得，旧认识为何需要修正。' },
        { label: '限真理条件', detail: '写清结论适用于何种对象、时间和条件，以及新证据改变了哪项前提。' },
        { label: '评价值选择', detail: '比较受益与负担群体、短期与长期影响，并依据人民利益和规律判断。' },
      ],
      example: {
        prompt: '某药物早期小样本显示有效，扩大试验后发现只对特定患者有效。怎样理解认识变化？',
        reasoning: [
          '早期结论来自实践但样本有限，扩大试验提供更充分证据，揭示疗效受患者类型这一条件制约。',
          '修正为“对特定患者有效”不是否认真理，而是缩小适用范围，使认识更具体、更符合对象。',
        ],
        result: '认识在实践检验中发展；真理是具体的、有条件的，应随证据完善而校正结论边界。',
      },
      selfCheck: {
        question: '“不同人价值观不同”能否推出所有价值选择都同样正确？',
        answer: '不能。价值判断虽有主体差异，仍要接受社会实践、客观规律和最广大人民根本利益等标准的检验。',
      },
      pitfall: '不要把一次成功直接写成“实践证明理论永远正确”；实践检验的是特定条件下的认识，并会随范围扩大继续接受检验。',
    }),
  },
  {
    templateId: 'politics-culture',
    keywords: ['文化', '中华优秀传统', '革命文化', '先进文化', '文明互鉴', '文化传承', '文化创新', '文化强国', '文化发展的基本路径'],
    build: ({ title }) => ({
      guidingQuestion: `讨论“${title}”时，怎样说明文化内容、载体、社会功能和创新路径之间的联系？`,
      core: '文化通过特定载体影响人的认识与实践；传承不是原样复制，创新也不是割断传统，而是在社会实践中实现创造性转化和创新性发展。',
      explanation: [
        '文化具有引领风尚、教育人民、服务社会、推动发展的功能，但具体作品能否发挥积极作用取决于内容、传播方式和受众实践。评价传统文化要区分精华与糟粕，并解释其历史语境。',
        '文化交流应坚持相互尊重、求同存异，既吸收外来有益成果，也保持文化主体性。数字媒介拓宽传播但可能造成碎片化和商业化，因此创新还需真实性、公共价值和长期保护。',
      ],
      steps: [
        { label: '辨内容载体', detail: '说清被传承的思想、技艺或记忆是什么，通过何种制度、作品或活动呈现。' },
        { label: '连社会实践', detail: '说明内容回应何种现实需求，受众怎样参与并产生何种行为或认同。' },
        { label: '评创新边界', detail: '检查是否保留核心价值与真实信息，同时适应新语境并尊重文化主体。' },
      ],
      example: {
        prompt: '博物馆把古代纹样做成可在线组合的设计工具，这是否就是文化创新？',
        reasoning: [
          '数字工具改变传播和参与方式，能让公众理解纹样结构并用于当代设计，具有创造性转化的可能。',
          '仍需提供年代、用途和寓意等准确信息，并处理版权、商业利用和过度简化，否则只剩脱离历史的装饰消费。',
        ],
        result: '媒介新颖不是充分条件；当项目尊重文化内涵、回应当代需求并形成有意义的新表达时，才构成较完整的文化创新。',
      },
      selfCheck: {
        question: '文化交流中“面向世界、博采众长”为什么不等于照搬外来模式？',
        answer: '吸收应以本国实践需要为出发点，经过选择、消化和再创造，并保持自身文化主体性。',
      },
      pitfall: '不要把“传统”自动等同于优秀；应评价具体内容是否符合当代社会发展和人的全面发展要求。',
    }),
  },
  {
    templateId: 'politics-international',
    keywords: ['国际', '国家利益', '多极化', '和平与发展', '外交', '全球化', '跨国公司', '对外开放', '开放型经济', '联合国', '国际组织', '全球治理', '全球发展赤字', '安全', '共同责任', '人类命运共同体'],
    build: ({ title }) => ({
      guidingQuestion: `分析“${title}”时，怎样把国家利益、国际规则、行为主体和全球公共问题联系起来？`,
      core: '国际关系由国家利益和国家实力等多种因素影响；共同利益是合作基础，利益差别和对立可能引发冲突，国际组织则在成员授权和规则范围内发挥作用。',
      explanation: [
        '国家利益不是可以任意扩张的借口，维护本国正当利益应尊重他国合理关切和国际法。世界多极化是深入发展的趋势，不等于已经形成均衡格局，也不意味着国际冲突自动消失。',
        '经济全球化推动商品、资本、技术和人员跨境流动，同时使冲击沿供应链传递。全球治理需国家、国际组织、企业和社会多主体参与，并在主权、责任、能力和公共利益间形成规则。',
      ],
      steps: [
        { label: '列主体利益', detail: '区分国家、国际组织、跨国公司与社会群体的目标、能力和责任。' },
        { label: '找规则机制', detail: '说明贸易、协定、谈判、制裁、援助或组织决议如何影响行为。' },
        { label: '评合作边界', detail: '比较共同利益、分歧、成本分担和执行条件，不把倡议直接当结果。' },
      ],
      example: {
        prompt: '多国共同减排为什么既有合作基础又存在责任分配争议？',
        reasoning: [
          '气候风险跨越国界，任何国家都难以单独解决，减排和适应构成共同利益与合作基础。',
          '各国历史排放、发展阶段、技术能力和受灾程度不同，对资金、技术和减排速度的合理分担会有不同主张。',
        ],
        result: '有效治理需坚持共同但有区别的责任，通过规则、资金和技术合作把共同目标转化为可执行承诺。',
      },
      selfCheck: {
        question: '联合国大会决议是否都具有与国内法律相同的强制执行力？',
        answer: '不是。不同机构和事项的法律效力、表决规则与执行机制不同，不能把所有国际组织文件笼统视为同等强制命令。',
      },
      pitfall: '不要把国际关系简化为“只有合作”或“只有竞争”；同一国家间可在气候上合作、在贸易上存在分歧。',
    }),
  },
  {
    templateId: 'politics-formal-logic',
    keywords: ['概念的内涵', '外延', '定义', '划分', '分类', '判断', '同一律', '矛盾律', '排中律', '三段论', '联言', '选言', '假言', '归纳', '类比', '逻辑错误', '推理'],
    build: ({ title }) => ({
      guidingQuestion: `学习“${title}”时，怎样把自然语言转成结构清楚、可以逐项检验的逻辑形式？`,
      core: '形式逻辑先保证概念明确和推理结构有效，再检查前提是否真实；有效推理与真实结论是两个不同层次。',
      explanation: [
        '定义要揭示种差和属概念，不能循环、过宽或过窄；划分必须使用同一标准、子项互斥且外延穷尽。判断分析则要识别量项、联结词和否定范围。',
        '演绎推理若形式有效，前提真则结论必真；归纳和类比只能提供或然支持，强度取决于样本代表性、共同属性与结论属性的相关程度。',
      ],
      steps: [
        { label: '标准化', detail: '固定概念含义，把省略的量词、条件和否定补成完整判断。' },
        { label: '验结构', detail: '识别三段论、联言、选言或假言形式，检查是否存在换概念和无效式。' },
        { label: '验前提强度', detail: '核对前提真实性；对归纳类比再查样本、反例和相关属性。' },
      ],
      example: {
        prompt: '判断推理：“只有完成登记，才能进入实验室。小林完成了登记，所以小林能进入实验室。”',
        reasoning: [
          '“只有A才B”表示B→A：进入实验室是B，完成登记是必要条件A。',
          '由A不能推出B，因为还可能需要安全培训、预约等其他条件；该推理误把必要条件当充分条件。',
        ],
        result: '结论不必然成立。有效推理是“若小林进入实验室，则他完成了登记”；反向还需补充充分条件。',
      },
      selfCheck: {
        question: '“所有A都是B；有些B是C；所以有些A是C”一定有效吗？',
        answer: '无效。有些B属于C，并不保证这些B同时属于A；中项B没有把A与C必然连接。',
      },
      pitfall: '不要只看结论碰巧正确；逻辑题检验的是结论是否必然由给定前提推出。',
    }),
  },
  {
    templateId: 'politics-social-development',
    keywords: ['社会形态', '原始社会', '奴隶社会', '封建社会', '资本主义', '科学社会主义', '社会主义从理论到实践', '新民主主义', '社会主义制度', '改革开放', '中国特色社会主义', '中国梦'],
    build: ({ title }) => ({
      guidingQuestion: `理解“${title}”时，怎样用生产力与生产关系、经济基础与上层建筑的矛盾运动解释历史选择？`,
      core: '社会发展不是标签替换，而是生产力发展引起生产关系调整、阶级和社会矛盾变化，并通过具体历史主体与制度实践实现。',
      explanation: [
        '评价一种社会形态要考察它在特定阶段是否促进生产力、如何组织生产资料和劳动、剩余产品怎样分配，而不能脱离历史条件只作抽象道德比较。资本主义推动生产社会化，同时生产资料私人占有与社会化大生产之间的矛盾构成基本矛盾。',
        '中国道路要结合近代半殖民地半封建社会国情、革命任务和实践结果理解。改革是社会主义制度的自我完善和发展，通过调整不适应生产力的体制机制释放活力，并坚持制度方向。',
      ],
      steps: [
        { label: '定历史条件', detail: '说明生产力水平、所有制结构、主要矛盾和现实任务。' },
        { label: '析矛盾运动', detail: '解释旧关系如何阻碍发展，新力量与制度方案如何回应问题。' },
        { label: '看实践结果', detail: '用制度建立、生产发展和人民生活变化评价道路，同时说明阶段性。' },
      ],
      example: {
        prompt: '机器大工业发展为何一方面提高生产力，另一方面加深资本主义基本矛盾？',
        reasoning: [
          '机器和分工使生产由个人活动变成大规模社会协作，显著提高产量并扩大世界市场。',
          '生产成果和生产资料仍主要由资本私人占有，社会化生产与私人占有之间张力可表现为贫富分化、周期性危机等。',
        ],
        result: '生产力进步说明资本主义的历史作用，基本矛盾的展开又揭示其制度局限；两方面需统一评价。',
      },
      selfCheck: {
        question: '生产关系是否越先进越能促进任何时期的生产力？',
        answer: '不是。生产关系必须与具体生产力状况相适应；超越或落后于生产力条件都可能阻碍发展。',
      },
      pitfall: '不要把社会形态演进写成自动发生的直线过程；要说明矛盾、主体实践和各国具体历史条件。',
    }),
  },
  {
    templateId: 'politics-material-analysis',
    keywords: ['材料主体与设问范围定位', '教材概念与材料信息匹配', '因果链和措施链构造', '时政情境的证据化表达'],
    build: ({ title }) => ({
      guidingQuestion: `训练“${title}”时，怎样让每个教材概念都与材料细节和推理动词准确对应？`,
      core: '材料分析不是从记忆中倾倒术语，而是按设问确定主体与知识范围，再把事实编码为概念，用机制连接条件、行动和结果。',
      explanation: [
        '先识别设问类型：“体现”从材料行为映射概念，“原因”追溯必要性与可行性，“意义”从行动推到积极结果，“措施”则从问题成因和主体职能反推可执行行为。主体变化时答案依据也会变化。',
        '概念和材料必须双向出现。只抄材料没有理论概括，只列原理没有说明适用性。高质量得分点通常写成“主体依据某制度或条件采取某行动，通过某机制影响某对象，从而产生某结果”。',
      ],
      steps: [
        { label: '框定设问', detail: '圈出主体、对象、知识模块、任务词和材料限定，排除相邻但不属于本题的知识。' },
        { label: '给材料编码', detail: '为政策、数据和人物行为标注教材概念，确认概念的主体与适用条件一致。' },
        { label: '写机制闭环', detail: '用“有利于”之后的具体因果动词连接行为与结果，并检查措施是否可由该主体实施。' },
      ],
      example: {
        prompt: '材料写政府公开河道监测数据、企业更新排污设备、居民参与巡河。怎样组织“治理有效原因”的答案？',
        reasoning: [
          '政府公开数据为监督和科学决策提供信息，企业履行环保责任从源头减少污染，居民参与补充日常发现和社会监督。',
          '三个主体并非同一作用：制度公开降低信息不对称，技术改造改变排放过程，公众参与提高违规发现和治理反馈能力。',
        ],
        result: '答案应按政府、企业、公民分点，并分别写清制度、技术和监督机制如何协同改善水环境。',
      },
      selfCheck: {
        question: '为什么“坚持党的领导、政府履职、公民参与”仍可能得分不完整？',
        answer: '若未引用材料行为，也未说明各主体通过什么制度机制解决何种问题，术语与情境之间仍缺少推理桥梁。',
      },
      pitfall: '不要看到时政材料就补写材料没有呈现的政策效果；结论强度应受材料证据约束，建议也要对应已识别的问题。',
    }),
  },
]

const historyTemplates: LessonTemplate[] = [
  {
    templateId: 'history-source-evidence',
    keywords: ['史料', '一手', '二手', '作者立场', '地图图表', '统计数据', '实证', '开放性论证'],
    build: ({ title }) => ({
      guidingQuestion: `研究“${title}”时，怎样判断史料能证明什么、不能证明什么？`,
      core: '史料价值取决于研究问题；一手史料接近事件但也带有作者位置和目的，二手研究距离较远却可能综合更多材料与方法。',
      explanation: [
        '先做外部考证：作者、形成时间、载体、保存链和真伪；再做内部考证：受众、目的、用词、可接触信息和沉默之处。所谓“立场”不是一句“有主观性”就否定材料，而是判断它在哪些问题上更可信。',
        '互证不是找两句话相同，而是使用来源相互独立、类型不同的材料检验同一命题。官方统计、私人日记、报刊与实物各自记录不同侧面，冲突本身也可能揭示制度口径与生活经验的差异。',
      ],
      steps: [
        { label: '提出命题', detail: '把研究问题写成可由史料支持或反驳的具体判断。' },
        { label: '评来源', detail: '检查作者与事件距离、身份利益、受众目的、信息渠道和保存状况。' },
        { label: '作互证', detail: '比较独立材料的一致、补充和冲突，限定结论的时间、地区与群体。' },
      ],
      example: {
        prompt: '一份19世纪上海工部局报告称租界卫生“显著改善”，能否证明所有居民健康改善？',
        reasoning: [
          '报告可反映管理机构的措施、统计口径和自我评价，但机构有展示治理成效的动机，且统计范围可能主要覆盖租界。',
          '需与医院死亡记录、不同区域地图、居民日记或报刊互证，并区分道路清洁、传染病率与不同阶层的受益程度。',
        ],
        result: '该报告能证明官方关注并宣称卫生改善，不能单独推出全上海、所有群体的健康都同步改善。',
      },
      selfCheck: {
        question: '当事人日记为什么既珍贵又不能自动视为“最真实”？',
        answer: '它接近个人经验，能记录官方材料忽略的细节；但作者所见有限，也受记忆、情绪、自我呈现和身份立场影响。',
      },
      pitfall: '不要用“一手史料一定比二手史料可靠”排序；可靠性必须针对具体问题、来源条件和互证情况判断。',
    }),
  },
  {
    templateId: 'history-causality-comparison',
    keywords: ['原因', '因果', '比较', '异同', '变迁', '演变', '趋势', '阶段', '主线', '转型'],
    build: ({ title }) => ({
      guidingQuestion: `解释“${title}”时，怎样区分背景、结构原因、直接原因、触发因素和历史影响？`,
      core: '历史因果是分层且相互作用的：长期结构创造可能性，具体矛盾形成压力，触发事件改变行动时机，人物选择影响过程而不脱离条件。',
      explanation: [
        '“原因很多”不等于解释充分。每个原因都要补上机制：它怎样改变资源、利益、观念或权力关系，并最终增加事件发生的可能。重要性应依据解释范围和不可替代性比较。',
        '比较必须设定同一维度和时空尺度，如权力来源、选官方式、财政基础和社会参与；先分别概括，再写同异及其原因，不能把两个对象各写一段后宣布“有相同也有不同”。',
      ],
      steps: [
        { label: '建时间层次', detail: '区分长期结构、中期矛盾、直接原因、触发事件与主体决策。' },
        { label: '补作用机制', detail: '为每个因素写“通过什么变化影响谁的选择”，排除仅时间相邻的伪因果。' },
        { label: '评相对权重', detail: '用反事实追问和跨案例比较判断必要条件、促进因素与偶然因素。' },
      ],
      example: {
        prompt: '为什么不能只用“萨拉热窝事件”解释第一次世界大战爆发？',
        reasoning: [
          '刺杀是直接触发因素，但军备竞赛、帝国主义争夺和两大军事集团使局部危机具备升级为大陆战争的结构条件。',
          '奥匈、德国、俄国等政府在最后通牒、动员和联盟承诺上的决策，解释了危机如何沿机制扩散。',
        ],
        result: '战争爆发应解释为长期竞争与联盟结构、巴尔干危机和具体决策共同作用，刺杀决定了时机但不能单独解释规模。',
      },
      selfCheck: {
        question: '某因素若不是事件发生的必要条件，是否就完全不重要？',
        answer: '不是。它可能提高发生概率、加快进程或改变结果形态；历史解释需区分必要、充分、促进和触发作用。',
      },
      pitfall: '不要从后来结果倒推当时“必然如此”；应保留当时行动者可见的选择、信息限制和未实现可能。',
    }),
  },
  {
    templateId: 'history-state-institutions',
    keywords: ['国家形态', '分封', '宗法', '中央集权', '统一国家', '地方行政', '选官', '监察', '制度', '官员', '文官', '国体', '政体', '基层治理', '边疆治理', '民族关系', '法律', '教化', '文景之治', '汉武帝', '多民族政权', '国家治理', '封建社会', '拜占庭', '民族国家', '当代中国法治建设'],
    build: ({ title }) => ({
      guidingQuestion: `理解“${title}”时，怎样从权力来源、组织层级、官员产生和财政军事基础解释制度运作？`,
      core: '制度不是名称列表；要说明谁有权决定、命令如何下达、地方和社会如何响应、监督与资源从何而来。',
      explanation: [
        '同名机构在不同时代权力可能不同，比较制度应看实际运行而非只背设置时间。中央集权强化常通过官僚任免、财政控制、法令统一和军事调度实现，也会产生行政成本和信息失真问题。',
        '制度变化通常回应前期治理难题，并受经济、交通、技术和社会结构制约。评价“加强中央集权”既要说明统一和动员能力，也要分析地方自主、监督机制与边疆差异治理。',
      ],
      steps: [
        { label: '画权力结构', detail: '标出最高权力、中央机构、地方层级及相互任免、财政和监督关系。' },
        { label: '放入情境', detail: '说明制度针对何种分裂、腐败、人才或边疆问题，并需要哪些物质条件。' },
        { label: '评运行效果', detail: '从统一、效率、代表性、监督和长期适应性分析作用与限制。' },
      ],
      example: {
        prompt: '比较西周分封制与秦朝郡县制在地方权力来源上的差异。',
        reasoning: [
          '分封制下诸侯权力与宗法血缘、封土世袭相连，对周王承担朝贡和军事义务，地方统治具有较强世袭性。',
          '郡县长官由中央任免并受考核，行政区不作为世袭封国，使地方权力更直接来自中央官僚体系。',
        ],
        result: '差异不只在名称：权力来源从封建宗法关系转向中央任命的行政关系，增强统一调度，同时提高对官僚监督和信息传递的要求。',
      },
      selfCheck: {
        question: '设置监察机构为什么不必然消除腐败？',
        answer: '效果还取决于监察者独立性、信息渠道、问责执行和对监察者自身的制约；机构存在不等于制度有效运行。',
      },
      pitfall: '不要用现代国家概念直接套古代制度；“民主、民族、国家”等词需放回当时政治共同体和权力结构理解。',
    }),
  },
  {
    templateId: 'history-economy-industry-trade',
    keywords: ['经济', '农业', '土地', '手工业', '商业', '城市', '货币', '赋税', '贸易', '生产', '工业革命', '工业文明', '世界市场', '金融', '劳作', '工具', '农业与土地制度'],
    build: ({ title }) => ({
      guidingQuestion: `分析“${title}”时，怎样连接技术、劳动组织、市场、制度和社会生活？`,
      core: '经济史变化不能只用“技术进步”解释；新技术能否扩散取决于资本、能源、劳动力、市场、产权与交通等互补条件。',
      explanation: [
        '产量增长可能来自工具、作物、土地扩张或劳动投入，需分辨机制。商业和货币发展会扩大交换、专业分工和国家财政，也可能加剧区域依赖与社会分化。',
        '工业革命的关键不仅是机器发明，更是动力、工厂制、交通与市场共同改变生产组织。影响应分短长期和群体：总产出增加可以与早期工人处境恶化同时存在。',
      ],
      steps: [
        { label: '定生产要素', detail: '列技术、能源、资本、劳动、原料和土地怎样组合。' },
        { label: '追流通制度', detail: '说明交通、货币、市场范围、税制与产权如何促进或限制扩散。' },
        { label: '分群体影响', detail: '比较国家、商人、工人、农民、城市与殖民地的收益和成本。' },
      ],
      example: {
        prompt: '为什么蒸汽机的改良能推动第一次工业革命，却不能单独解释工业化？',
        reasoning: [
          '蒸汽动力减少工厂对水力地点的依赖，并提高纺织、采矿和运输能力，但机器需要煤铁、资本和技术工人。',
          '英国的市场需求、殖民贸易、交通和工厂组织使动力创新能够规模化应用，反过来又扩大煤炭与机器需求。',
        ],
        result: '蒸汽机是关键动力技术，工业化则是技术与资源、市场、资本和组织制度形成互相强化的系统变化。',
      },
      selfCheck: {
        question: '城市人口增长能否单独证明城市居民生活水平提高？',
        answer: '不能。人口增长可来自就业吸引或农村压力；还需工资、物价、住房、寿命、卫生等分群体指标。',
      },
      pitfall: '不要把国内生产增长直接等同于所有阶层同步受益；必须观察分配、劳动条件和地区差异。',
    }),
  },
  {
    templateId: 'history-modern-china',
    keywords: ['鸦片战争', '列强侵华', '太平天国', '洋务', '维新', '辛亥', '新文化', '五四', '共产党', '建党', '国民革命', '民主革命', '抗日', '解放战争', '新民主主义', '近代化', '国家出路', '民族危机', '中华人民共和国', '改革开放', '社会主义建设', '社会主义基本制度建立', '中国特色社会主义新时代', '浦东', '上海近现代史节点'],
    build: ({ title }) => ({
      guidingQuestion: `学习“${title}”时，怎样沿民族独立、人民解放、国家建设和现代化探索理解历史进程？`,
      core: '中国近现代史需同时追踪外部冲击、社会结构变化、不同政治力量的方案和人民实践，不能写成单线“冲击—反应”。',
      explanation: [
        '列强侵略改变主权、贸易和社会经济，但国内制度矛盾与新阶级、新思想的发展也塑造回应。比较洋务、维新和革命，应统一考察目标、领导力量、社会基础、制度触及程度与结果。',
        '中国共产党领导的新民主主义革命把反帝反封建任务与群众动员结合；新中国成立后，制度建设、探索、改革开放又在不同阶段回应发展问题。连续性与阶段转折都要有具体政策和社会结果支持。',
      ],
      steps: [
        { label: '定时代任务', detail: '说明主权危机、社会性质、主要矛盾和现代化需求。' },
        { label: '比较方案力量', detail: '分析不同群体目标、组织方式、社会基础、制度主张与实践范围。' },
        { label: '评历史进程', detail: '区分直接成败与长期影响，连接制度变化、群众动员和现代化条件。' },
      ],
      example: {
        prompt: '比较洋务运动和戊戌维新对“救亡图存”的不同回应。',
        reasoning: [
          '洋务派以维护清朝统治为前提，重点引进军事和民用技术、创办新式学堂，触及器物和部分经济教育层面。',
          '维新派认识到仅学技术不足，主张变法并改革政治教育制度，但缺乏广泛社会动员且受保守力量压制。',
        ],
        result: '两者都回应民族危机并推动近代化，区别在改革层次和政治主张；失败原因需结合制度阻力、力量基础与国际环境分析。',
      },
      selfCheck: {
        question: '一次政治运动失败，是否意味着它没有历史影响？',
        answer: '不是。应区分直接目标是否实现与它对思想传播、组织经验、制度变化和后续行动的长期影响。',
      },
      pitfall: '不要用“地主阶级、资产阶级都具有局限性”代替分析；要具体说明其利益、组织和社会基础怎样限制方案。',
    }),
  },
  {
    templateId: 'history-world-war-order',
    keywords: ['世界大战', '一战', '二战', '十月革命', '苏联', '冷战', '国际格局', '多极化', '全球化与当代世界', '体系', '帝国', '殖民扩张', '资产阶级革命', '启蒙', '文艺复兴', '宗教改革'],
    build: ({ title }) => ({
      guidingQuestion: `理解“${title}”时，怎样说明观念、国家竞争、战争动员和国际制度之间的变化？`,
      core: '世界近现代政治变化需区分思想提供的正当性语言、社会力量的实际诉求、国家能力与国际体系约束。',
      explanation: [
        '启蒙思想不能自动导致革命，它通过公共舆论、政治纲领和权利话语影响行动，而财政危机、阶级结构和国家冲突决定具体爆发条件。战争结果也取决于工业、财政、联盟和社会动员。',
        '国际体系是大国力量对比、条约规则与国际组织的结合。凡尔赛—华盛顿体系、雅尔塔体系和冷战格局各有形成条件；“格局瓦解”不意味着所有制度和冲突同时消失。',
      ],
      steps: [
        { label: '分分析层次', detail: '区分国内社会、国家能力、国家间竞争和国际制度四个层次。' },
        { label: '追互动机制', detail: '解释思想、资源、联盟、技术或危机怎样改变行动者选择。' },
        { label: '判秩序变化', detail: '比较力量中心、规则、组织和冲突方式，避免只背会议名称。' },
      ],
      example: {
        prompt: '为什么二战后形成美苏两极格局不能只归因于“意识形态不同”？',
        reasoning: [
          '资本主义与社会主义的制度和安全观差异加深不信任，但意识形态差异在战时共同敌人存在时未阻止合作。',
          '欧洲力量衰落、美苏军事实力与势力范围扩大、核武器和德国等安全问题，使双方竞争具备结构条件。',
        ],
        result: '两极格局由实力对比、战后安全安排和意识形态冲突共同形成，任何单因解释都会遗漏格局建立的机制。',
      },
      selfCheck: {
        question: '冷战是否意味着美苏之间完全没有合作和直接交流？',
        answer: '不是。冷战以长期全面对抗为主要特征，但双方仍有外交谈判、军控合作和危机沟通，也避免了全面直接战争。',
      },
      pitfall: '不要把“国际会议召开”本身当作格局形成原因；会议是力量对比和利益协商的制度化结果，也反过来塑造秩序。',
    }),
  },
  {
    templateId: 'history-civilization-culture',
    keywords: ['文明', '文化', '儒', '佛教', '文学艺术', '科技', '西亚', '埃及', '印度', '希腊', '罗马', '伊斯兰', '美洲', '中华文化', '多元一体', '旧石器', '新石器', '春秋战国', '江南开发', '中古时期的世界', '古代世界帝国'],
    build: ({ title }) => ({
      guidingQuestion: `比较“${title}”时，怎样从环境、生产、政治组织和交流解释文化特征，又避免地理决定论？`,
      core: '文明成果形成于特定物质条件和社会组织，但人群选择、制度和跨区域交流会产生多种路径，环境只提供条件而非唯一答案。',
      explanation: [
        '早期农业剩余、人口集中、文字记账和公共工程常与国家形成相关，但时间和组合并不完全相同。比较不同文明要使用共同维度，同时尊重其自身概念，避免用单一“先进—落后”尺度。',
        '文化传承不是封闭纯粹的。宗教、文字、科技和艺术在迁移与翻译中会被本地社会重新解释；“本土化”意味着外来因素与既有传统互动产生新形态。',
      ],
      steps: [
        { label: '定共同维度', detail: '比较生计、城市、政治、宗教、文字和社会结构，不随意换标准。' },
        { label: '找形成条件', detail: '解释环境、生产和制度提供什么可能，再加入主体选择与偶然事件。' },
        { label: '追交流转化', detail: '说明传播路线、媒介、接受群体及内容如何被筛选和重释。' },
      ],
      example: {
        prompt: '佛教传入中国后为何不能简单说“中国文化被印度文化取代”？',
        reasoning: [
          '佛教经丝路和海路传入，翻译带来新概念、寺院和艺术形式，确实改变思想与社会生活。',
          '传播中佛教与儒道传统、政治制度和祖先观念互动，形成不同宗派和本土表达，原有文化也继续发展。',
        ],
        result: '这一过程更适合解释为选择、融合与本土化：外来文化产生深刻影响，却不是单向覆盖既有传统。',
      },
      selfCheck: {
        question: '两河与埃及都有大河，为什么不能据此推出它们政治文化必然相同？',
        answer: '河流只是共同环境条件；洪水规律、地理开放程度、族群互动、制度选择和历史事件不同，会形成不同发展路径。',
      },
      pitfall: '不要把现代民族国家边界投射到古代文明，也不要把“交流”自动写成和平、平等的过程。',
    }),
  },
  {
    templateId: 'history-exchange-migration',
    keywords: ['丝绸之路', '中外交流', '中外文化交流', '交流方式', '新航路', '全球航路', '人口迁移', '物种交换', '移民', '华工', '游牧民族迁徙', '商路', '文化传播', '传教士', '知识传播', '学校与人才培养', '近代大学制度', '数字媒介', '印刷', '书籍', '近代殖民扩张与人口迁移'],
    build: ({ title }) => ({
      guidingQuestion: `分析“${title}”时，怎样追踪人、物种、商品、技术和观念在网络中的双向流动？`,
      core: '交流史要说明流动的动力、路线、媒介者、权力关系和接收社会的再创造；抵达不等于被原样接受。',
      explanation: [
        '商人、移民、军队、僧侣、翻译者和国家各自推动不同内容传播。交通技术和帝国秩序降低部分流动成本，但战争、殖民和强迫劳动也会使交流伴随暴力与不平等。',
        '传播影响具有双向和差异性：新作物改变土地利用和人口，技术需配合当地制度才能扩散，移民群体既保持原文化网络，也与当地社会形成混合认同。',
      ],
      steps: [
        { label: '画流动网络', detail: '标出起点、路线、节点、媒介者、运输条件和双向流动物。' },
        { label: '析动力权力', detail: '区分贸易、信仰、求生、征服或强迫迁移，并识别谁控制路线和规则。' },
        { label: '评落地变化', detail: '说明接收社会怎样选择、改造或抵制，以及不同群体的收益和损失。' },
      ],
      example: {
        prompt: '哥伦布大交换为何既促进全球联系，也造成严重人口灾难？',
        reasoning: [
          '美洲作物传播到欧亚非，马匹等物种进入美洲，改变饮食、农业和运输，跨洋商品网络扩大。',
          '旧大陆病原体在缺乏免疫的美洲人口中传播，加上征服、强迫劳动和土地剥夺，造成大规模死亡与社会瓦解。',
        ],
        result: '全球联系的增强与殖民暴力并存；评价不能只列“物种交流促进世界市场”，还需呈现权力不平等和群体代价。',
      },
      selfCheck: {
        question: '一种技术传入某地，是否等于当地马上普遍采用？',
        answer: '不等于。采用还取决于成本、原料、技能、制度利益、使用需求和既有技术网络。',
      },
      pitfall: '不要只画单向箭头；传播者和接收者都会改变内容，且商品流动常伴随人口、疾病、制度和生态变化。',
    }),
  },
  {
    templateId: 'history-social-life-city',
    keywords: ['城市功能', '城市化', '交通', '医疗', '卫生', '生活方式', '社会保障', '救济', '户籍', '上海开埠', '城市空间', '工人运动', '地方史', '科技革命与社会生活'],
    build: ({ title }) => ({
      guidingQuestion: `研究“${title}”时，怎样把基础设施、国家治理、社会群体与日常经验连接起来？`,
      core: '社会生活变化既由技术和经济推动，也受公共政策、阶层、性别、城乡位置影响；平均趋势不能替代群体差异。',
      explanation: [
        '铁路、供水、医院和学校会重组时间、空间与机会，但基础设施覆盖范围、价格和使用规则决定谁先受益。城市化带来就业与公共文化，也可能出现拥挤、污染、住房和传染病问题。',
        '地方史应把城市空间当作历史证据：道路、厂区、住宅和公共建筑的位置反映产业、权力和人口流动。地名或遗址需与档案、地图和口述材料互证，避免只讲轶闻。',
      ],
      steps: [
        { label: '选生活指标', detail: '区分收入、物价、住房、通勤、教育、卫生和寿命，不用单项代表全部生活。' },
        { label: '分群体空间', detail: '比较阶层、职业、性别、城乡和不同街区的机会与成本。' },
        { label: '连制度技术', detail: '说明基础设施和政策通过何种机制改变日常行为，并检验覆盖边界。' },
      ],
      example: {
        prompt: '近代上海有轨电车开通可以怎样改变城市生活？',
        reasoning: [
          '固定线路和班次压缩通勤时间，连接商业区、住宅与工厂，扩大部分居民的就业和消费空间。',
          '票价、线路覆盖和租界边界使受益不均，交通沿线地价与商业变化还可能推动新的空间分化。',
        ],
        result: '电车不仅是交通技术，它通过可达性、时间纪律和土地价值重组城市，但影响需按地区和群体区分。',
      },
      selfCheck: {
        question: '某时期平均预期寿命提高，能否说明所有阶层卫生条件相同？',
        answer: '不能。平均值可能掩盖婴儿死亡率、阶层、性别和地区差异，需要分组数据与公共卫生覆盖资料。',
      },
      pitfall: '不要用今天的街景直接证明过去功能；建筑可能改建、地名可能迁移，需使用同时代地图和档案定位。',
    }),
  },
  {
    templateId: 'history-heritage',
    keywords: ['遗产', '真实性', '非物质', '文物返还', '历史建筑保护', '博物馆', '图书馆', '公共文化', '世界文化遗产制度'],
    build: ({ title }) => ({
      guidingQuestion: `讨论“${title}”时，怎样在真实性、活态传承、公共使用和利益相关者之间作历史判断？`,
      core: '遗产价值不是只有“年代久远”，还包括历史信息、艺术、社会记忆和活态实践；保护对象与使用方式应由证据和多方协商确定。',
      explanation: [
        '物质遗产的真实性涉及材料、结构、位置、工艺和历史层累，复原得“像旧的”不一定真实。非物质遗产依靠传承人和社区实践，若只把表演定格成统一版本，可能失去活态变化。',
        '保护与城市生活不必绝对对立，但商业开发可能挤出原社区或歪曲历史。应识别居民、传承人、研究者、政府、游客和产权人的不同权利与成本。',
      ],
      steps: [
        { label: '识别价值证据', detail: '列出遗产承载的历史事件、结构工艺、社区记忆及其资料依据。' },
        { label: '识别相关者', detail: '比较产权、文化权益、公共利益、生活需求和维护责任。' },
        { label: '评方案', detail: '检查最小干预、可逆性、信息公开、社区参与和长期维护资金。' },
      ],
      example: {
        prompt: '旧里弄改造成商业街，只保留仿旧外立面，是否等于完成历史建筑保护？',
        reasoning: [
          '外观复制可能保留视觉印象，但拆除原材料、空间肌理和生活功能会损失真实历史信息。',
          '若原居民迁出、历史叙述只剩消费符号，社区记忆和社会价值也可能被削弱，需比较修缮利用的替代方案。',
        ],
        result: '保护应基于价值评估保留关键材料、空间和历史层次，并让更新用途与社区参与、可持续维护相协调，仿古外观不是充分标准。',
      },
      selfCheck: {
        question: '非物质文化遗产保护为什么不能只录像存档？',
        answer: '录像能保存一次呈现，却不能替代传承人的教学、社区使用和在实践中的持续变化。',
      },
      pitfall: '不要把“开发利用”必然等同于保护；必须评估客流、商业改造和产权变化是否损害遗产价值与社区权益。',
    }),
  },
]

// Ambiguous words such as “语气”“叙事”“经营” must not decide the lesson genre.
// Keep these routes exported so regression tests can assert the intended knowledge domain.
export const humanitiesRegressionTemplateByTitle: Readonly<Record<string, RegressionRoute>> = {
  'chinese:人物通讯的现场感': { baseTemplateId: 'chinese-informational-media', familyId: 'chinese-journalism-profile' },
  'chinese:山水游记的情景关系': { baseTemplateId: 'chinese-narrative-drama', familyId: 'chinese-classical-landscape' },
  'chinese:史传叙事的剪裁': { baseTemplateId: 'chinese-narrative-drama', familyId: 'chinese-classical-biography' },
  'chinese:媒介信息真伪判断': { baseTemplateId: 'chinese-informational-media', familyId: 'chinese-media-verification' },
  'chinese:概念的内涵与外延': { baseTemplateId: 'chinese-argumentation', familyId: 'chinese-logic-concept' },
  'chinese:命题与判断真值': { baseTemplateId: 'chinese-argumentation', familyId: 'chinese-logic-proposition' },
  'chinese:演绎推理的有效性': { baseTemplateId: 'chinese-argumentation', familyId: 'chinese-logic-deduction' },
  'chinese:归纳类比与或然结论': { baseTemplateId: 'chinese-argumentation', familyId: 'chinese-logic-induction' },
  'chinese:常见逻辑谬误辨析': { baseTemplateId: 'chinese-argumentation', familyId: 'chinese-logic-fallacy' },
  'chinese:《氓》的叙事结构与人物声音': { baseTemplateId: 'chinese-poetry', familyId: 'chinese-poem-mang' },
  'chinese:《兰亭集序》的叙事转折与生死之思': { baseTemplateId: 'chinese-classical-argument', familyId: 'chinese-prose-lanting' },
  'chinese:《项脊轩志》的日常细节与情感': { baseTemplateId: 'chinese-narrative-drama', familyId: 'chinese-prose-xiangjixuan' },
  'chinese:《归去来兮辞》的辞赋节奏与人格选择': { baseTemplateId: 'chinese-poetry', familyId: 'chinese-prose-guiqulai' },
  'chinese:比较阅读的异同论证': { baseTemplateId: 'chinese-poetry', familyId: 'chinese-poetry-comparison' },

  'english:作者态度与语气': { baseTemplateId: 'english-critical-literacy', familyId: 'english-reading-tone' },
  'english:隐喻反讽与语气判断': { baseTemplateId: 'english-critical-literacy', familyId: 'english-reading-irony' },
  'english:个人经历叙述': { baseTemplateId: 'english-writing-argument', familyId: 'english-writing-narrative' },
  'english:人物与地点描写': { baseTemplateId: 'english-writing-argument', familyId: 'english-writing-description' },
  'english:概要写作': { baseTemplateId: 'english-writing-argument', familyId: 'english-writing-summary' },
  'english:图表描述': { baseTemplateId: 'english-writing-argument', familyId: 'english-writing-chart' },
  'english:摘要与改写': { baseTemplateId: 'english-translation', familyId: 'english-writing-paraphrase' },
  'english:Interpreting charts and research data': { baseTemplateId: 'english-critical-literacy', familyId: 'english-research-data' },
  'english:Source integration and citation': { baseTemplateId: 'english-critical-literacy', familyId: 'english-research-citation' },
  'english:Framing a research question': { baseTemplateId: 'english-critical-literacy', familyId: 'english-research-question' },
  'english:Reporting data and limitations': { baseTemplateId: 'english-critical-literacy', familyId: 'english-research-limitations' },
  'english:Academic poster and oral defense': { baseTemplateId: 'english-practical-writing', familyId: 'english-research-poster' },
  'english:图表信息概括与趋势解释': { baseTemplateId: 'english-writing-argument', familyId: 'english-writing-chart-analysis' },
  'english:研究报告的摘要与引用': { baseTemplateId: 'english-critical-literacy', familyId: 'english-research-report' },
  'english:语法词汇衔接的修改清单': { baseTemplateId: 'english-writing-argument', familyId: 'english-writing-language-revision' },

  'politics:企业创办与市场主体登记': { baseTemplateId: 'politics-civil-law', familyId: 'politics-business-registration' },
  'politics:依法经营与公平竞争': { baseTemplateId: 'politics-civil-law', familyId: 'politics-competition-law' },
  'politics:纳税义务与诚信经营': { baseTemplateId: 'politics-civil-law', familyId: 'politics-tax-compliance' },
  'politics:调解仲裁与诉讼选择': { baseTemplateId: 'politics-civil-law', familyId: 'politics-dispute-resolution' },

  'history:早期殖民扩张': { baseTemplateId: 'history-exchange-migration', familyId: 'history-early-colonialism' },
  'history:文艺复兴与宗教改革': { baseTemplateId: 'history-civilization-culture', familyId: 'history-renaissance-reformation' },
  'history:启蒙运动': { baseTemplateId: 'history-civilization-culture', familyId: 'history-enlightenment' },
  'history:英美法资产阶级革命': { baseTemplateId: 'history-state-institutions', familyId: 'history-bourgeois-revolutions' },
  'history:古代学校与人才培养': { baseTemplateId: 'history-state-institutions', familyId: 'history-ancient-education' },
  'history:近代大学制度': { baseTemplateId: 'history-state-institutions', familyId: 'history-modern-university' },
  'history:印刷术与书籍传播': { baseTemplateId: 'history-exchange-migration', familyId: 'history-print-culture' },
  'history:数字媒介与知识共享': { baseTemplateId: 'history-exchange-migration', familyId: 'history-digital-knowledge' },
  'history:图书馆博物馆的公共文化功能': { baseTemplateId: 'history-social-life-city', familyId: 'history-public-culture-institutions' },
}

const chineseConceptFamilies: ConceptFamily[] = [
  {
    familyId: 'chinese-logic-concept', keywords: ['概念的内涵与外延', '核心概念的界定', '下定义'],
    teaching: '概念的内涵是对象必须具有的本质属性，外延是符合这些属性的对象范围；增加内涵通常会缩小外延，定义项与被定义项必须全同。',
    operation: '先列本质属性，再检验对象范围，最后排查定义过宽、过窄、循环和比喻定义。',
    example: { prompt: '“文学作品就是有文学性的作品”是不是合格定义？', reasoning: ['定义项仍使用待解释的“文学”概念，没有给出可检验属性。', '定义项与被定义项互相依赖，属于循环定义，不能确定外延。'], result: '应改用文体、虚构性、审美语言等可说明的属性，并承认不同理论的边界差异。' },
    pitfall: '不要把举例当定义；列出小说、诗歌只能展示部分外延，不能说明共同本质属性。',
  },
  {
    familyId: 'chinese-logic-proposition', keywords: ['命题与判断真值', '判断真假'],
    teaching: '命题必须能够判定真或假；疑问句、祈使句通常不表达命题，复合命题的真值由连接词和各支命题共同决定。',
    operation: '把句子改写为明确陈述，标出否定、联言、选言或条件关系，再按真值条件检验。',
    example: { prompt: '判断“如果下雨，那么操场湿；操场湿，所以一定下雨”的有效性。', reasoning: ['前件“下雨”是操场湿的充分条件，不是必要条件。', '洒水等其他原因也会使操场湿，由后件肯定前件属于无效推理。'], result: '结论不必然成立；只能由“下雨”推出“操场湿”，不能反推。' },
  },
  {
    familyId: 'chinese-logic-deduction', keywords: ['演绎推理', '三段论'],
    teaching: '演绎有效性只问：若前提都真，结论能否仍为假；它与前提在现实中是否真实是两个层次。',
    operation: '形式化前提，检查量项和中项周延，尝试构造“前提真而结论假”的反例。',
    example: { prompt: '所有金属都导电；石墨导电；所以石墨是金属。推理有效吗？', reasoning: ['“导电”在两个前提中都作为后件，不能把具有同一性质的对象归成同一类。', '石墨提供现实反例：前提可真而结论为假。'], result: '推理无效，错误形式是肯定后件。' },
  },
  {
    familyId: 'chinese-logic-induction', keywords: ['归纳类比', '样本代表性', '类比推理'],
    teaching: '归纳与类比给出或然结论，强度取决于样本代表性、相关相似点、反例以及是否存在替代解释。',
    operation: '核查总体与样本、相似点是否关联结论，并主动寻找反例或第三变量。',
    example: { prompt: '调查本班五名早到学生都爱阅读，能否推出全校学生都爱阅读？', reasoning: ['五人样本过小，且“早到”可能与自律、阅读习惯相关，抽样有偏。', '从一个班推到全校还跨越了年级和班级差异。'], result: '最多形成待检验假设，不能得到全校普遍结论。' },
  },
  {
    familyId: 'chinese-logic-fallacy', keywords: ['逻辑谬误', '谬误辨析'],
    teaching: '谬误要按推理结构识别：偷换概念改变词义，稻草人歪曲对方主张，虚假两难遗漏选项，以偏概全越过样本边界。',
    operation: '先准确复原原主张，再写出隐藏前提，最后指出哪一步不能保证结论。',
    example: { prompt: '“你不同意取消所有作业，说明你反对减负。”错在哪里？', reasoning: ['对方只反对“取消所有作业”，并未反对合理减负。', '论者把有限主张夸张成相反立场后攻击，构成稻草人。'], result: '应分别讨论作业总量、类型和反馈方式，不能把选择压成两个极端。' },
  },
  {
    familyId: 'chinese-classical-syntax', keywords: ['特殊句式', '宾语前置', '省略句', '文言断句'],
    teaching: '文言句式判断以谓语支配关系为依据：先还原主谓宾，再识别判断、被动、倒装和省略，语序调整不能改变施受关系。',
    operation: '圈谓语、补主宾、还原正常语序，再用上下文核对否定与语气。',
  },
  {
    familyId: 'chinese-classical-lexicon', keywords: ['文言实词', '文言虚词', '一词多义', '语境义'],
    teaching: '词义必须由句法位置、搭配对象和上下文事件共同限定；词典义只是候选，词类活用与古今异义还会改变解释。',
    operation: '判断词性和句法成分，列候选义，逐项代入并用人物关系、因果和语气排除。',
  },
  {
    familyId: 'chinese-poetry-imagery', keywords: ['意象', '意境', '香草美人', '城市空间'],
    teaching: '意象意义由修饰语、动作、组合顺序和抒情主体处境生成，不能把“月、柳、雁”等机械对应固定情感。',
    operation: '先还原画面，再找冷暖、动静、远近和转折，最后用字词证据连接处境与情感。',
  },
  {
    familyId: 'chinese-poetry-form', keywords: ['格律', '节奏', '章法', '炼字', '炼句', '铺陈与照应'],
    teaching: '诗歌形式不是外壳：节拍、押韵、对仗、反复和句法停顿会控制语势，炼字则改变动作状态、视角与情绪强度。',
    operation: '朗读划分节拍，比较替换前后声韵和语义，再说明形式怎样推动情感或结构。',
  },
  {
    familyId: 'chinese-poetry-allusion', keywords: ['用典', '典故'],
    teaching: '用典同时调动旧事和当前语境；必须说明典故原义、文本改写以及借古人古事表达的当下立场。',
    operation: '查清出处和原始关系，比较本诗的删改，再判断是正用、反用还是借典自况。',
  },
  {
    familyId: 'chinese-narrative-character', keywords: ['人物', '动机', '典型细节', '人物声音', '精神胜利法'],
    teaching: '人物判断来自压力情境中的选择、语言和后果；动机需用前后行为与他人反应互证，不能只贴性格标签。',
    operation: '列目标与阻力，选择改变关系的细节，再解释反复行为体现的价值排序。',
  },
  {
    familyId: 'chinese-narrative-viewpoint', keywords: ['叙事视角', '全知视角', '限知视角', '不可靠叙述', '时间结构'],
    teaching: '叙事视角决定信息权限和评价距离；限知不等于第一人称，全知也不等于作者本人发言。',
    operation: '标出谁在看、知道多少、何处越界，再比较若换视角会隐藏或突出什么。',
  },
  {
    familyId: 'chinese-drama', keywords: ['戏剧', '潜台词', '舞台冲突', '对白'],
    teaching: '戏剧意义由台词、停顿、动作和舞台关系共同完成；潜台词是人物在处境中不能或不愿直说的目的。',
    operation: '还原人物目标，标出台词字面义与行动目的，再看对手回应如何升级冲突。',
  },
  {
    familyId: 'chinese-media', keywords: ['新闻', '通讯', '媒介', '调查', '访谈', '图表', '多材料', '信息筛选'],
    teaching: '信息判断要分开事实、解释与评价，并核对来源、时间、样本、统计口径和发布者利益。',
    operation: '记录来源和口径，建立共同比较维度，再区分互证、补充和冲突证据。',
  },
  {
    familyId: 'chinese-writing-argument', keywords: ['立意', '分论点', '论点', '事实论据', '反方观点', '议论写作'],
    teaching: '论点必须包含对象、关系判断和成立条件；论据之后要补出从事实到主张的因果或类比桥梁。',
    operation: '限定任务，排列分论点，逐例补“为何能证明”，再用反例检验边界。',
  },
  {
    familyId: 'chinese-writing-research', keywords: ['研究问题', '文献检索', '引注', '引用', '材料编码', '专题研讨', '小论文'],
    teaching: '研究性写作要把宽泛兴趣限定为可由材料回答的问题，并让每条引文可追溯、每项结论受证据范围约束。',
    operation: '限定对象与变量，建立来源表和编码表，归纳模式并保留反例。',
  },
  {
    familyId: 'chinese-writing-revision', keywords: ['修改', '校订', '摘要', '复盘', '分点', '题干对应'],
    teaching: '修改要分内容、结构、句法和字词四轮进行；摘要保留对象、关系与结论，删除例证和修饰但不能改变原文强度。',
    operation: '先核对任务与信息点，再检查段落关系，最后处理句法、搭配和标点。',
  },
]

const englishConceptFamilies: ConceptFamily[] = [
  {
    familyId: 'english-grammar-nonfinite', keywords: ['non-finite', '非谓语', 'participle', '分词', '独立主格'],
    teaching: 'A non-finite clause has no independent tense. Its understood subject must be identified, and doing, done and to do normally contrast active/simultaneous, passive/completed and intended/later relations.',
    operation: 'Find the main finite verb, supply the non-finite clause’s logical subject, then test time and voice against the main event.',
    example: { prompt: 'Correct: “Seeing from the hill, the river looks like a ribbon.”', reasoning: ['The understood subject of seeing would be “the river”, but the river cannot perform the act of seeing.', 'The intended relation is passive: observers see the river from the hill.'], result: 'Write “Seen from the hill, the river looks like a ribbon” or “Seeing the river from the hill, we found that it looked like a ribbon.”' },
    pitfall: 'Do not choose -ing only because two actions happen together; logical subject and voice come first.',
  },
  {
    familyId: 'english-grammar-relative', keywords: ['relative clause', '定语从句', '先行词', '关系从句'],
    teaching: 'A relative clause modifies an antecedent. The relative word must both connect the clause and fill a subject, object, possessive or adverbial role inside it.',
    operation: 'Locate the antecedent, place it back into the relative clause, then choose who, which, that, whose, when or where from its syntactic role.',
    example: { prompt: 'Choose: “The laboratory ___ we tested the water has reopened.”', reasoning: ['The clause already has subject “we” and object “the water”; the missing element is a place adverbial.', 'The antecedent “laboratory” therefore corresponds to “in the laboratory”.'], result: 'Use “where” or “in which”: “The laboratory where we tested the water has reopened.”' },
  },
  {
    familyId: 'english-grammar-noun-clause', keywords: ['noun clause', '名词性从句', '主语从句', '宾语从句'],
    teaching: 'A noun clause fills a noun position such as subject, object, complement or apposition; its linker depends on whether the clause is complete and whether it expresses a fact, choice or missing participant.',
    operation: 'Name the clause’s role, check whether an element is missing inside it, then select that, whether/if or a wh-word.',
    example: { prompt: 'Choose: “The question is ___ the new rule will reduce waste.”', reasoning: ['The clause “the new rule will reduce waste” is structurally complete, so it does not need what or which.', 'The sentence presents an unresolved yes-or-no issue after “is”.'], result: 'Use “whether”: “The question is whether the new rule will reduce waste.”' },
  },
  {
    familyId: 'english-grammar-agreement-reference', keywords: ['主谓一致', 'agreement', '指代'],
    teaching: 'Subject–verb agreement follows the grammatical head, not the nearest noun; pronouns must have one clear antecedent compatible in number and meaning.',
    operation: 'Remove modifiers to expose the head subject, choose the verb number, then trace every pronoun to a single antecedent.',
    example: { prompt: 'Correct: “The number of shared bicycles have fallen, and this shows they is used less.”', reasoning: ['The head of “the number of ...” is singular “number”, so the verb is “has”.', '“They” can refer to bicycles, but “this” should refer clearly to the reported fall; “they is” also violates agreement.'], result: 'Write: “The number of shared bicycles has fallen, which suggests that they are being used less.”' },
  },
  {
    familyId: 'english-grammar-inversion-focus', keywords: ['倒装', 'inversion', '强调', 'cleft', 'information focus', '信息焦点'],
    teaching: 'Inversion changes normal auxiliary–subject order under licensed triggers; a cleft uses “It is/was ... that/who ...” to mark contrastive focus without changing the basic proposition.',
    operation: 'Identify the trigger or focused constituent, preserve tense and auxiliary form, then compare what alternative is being contrasted.',
    example: { prompt: 'Rewrite with inversion: “We had never seen such rapid change.”', reasoning: ['The negative-frequency phrase “never” moves to the front.', 'Past perfect already has auxiliary “had”, which must precede the subject.'], result: '“Never had we seen such rapid change.” The fronted negative adds strong emphasis.' },
  },
  {
    familyId: 'english-grammar-tense-aspect', keywords: ['时态', 'tense', 'aspect', '完成体', '进行体', '时间轴'],
    teaching: 'Tense locates a reference time; aspect presents an event as complete, ongoing, repeated or connected to another reference point. A time adverb alone does not choose the form.',
    operation: 'Mark speech time, reference time and event time, then decide whether duration, completion or current relevance matters.',
    example: { prompt: 'Compare “I lived in Shanghai for six years” and “I have lived in Shanghai for six years.”', reasoning: ['Simple past normally presents the six-year period as completed before now.', 'Present perfect connects the period to now and usually implies the speaker still lives there.'], result: 'The same duration has a different present boundary; choose from the intended timeline, not the phrase “for six years” alone.' },
  },
  {
    familyId: 'english-grammar-modality-condition', keywords: ['情态', 'modal', '虚拟', 'conditional', '条件句', 'certainty', '真实距离'],
    teaching: 'Modal verbs encode possibility, obligation, permission or deduction; conditional past forms may mark distance from reality rather than past time.',
    operation: 'Separate time from reality status, identify whether the condition is open or counterfactual, then align condition and result clauses.',
    example: { prompt: 'Explain: “If I had checked the map, I would not be lost now.”', reasoning: ['“Had checked” marks an unreal past condition: the check did not happen.', '“Would not be ... now” is its unreal present result, so the sentence is a mixed conditional.'], result: 'A missed past action is linked to a present consequence; the forms are coherent rather than a tense mismatch.' },
  },
  {
    familyId: 'english-grammar-voice', keywords: ['语态', '被动表达', 'passive', '无主句'],
    teaching: 'Voice changes information focus: the active foregrounds the agent, while the passive foregrounds the affected entity and may omit an unknown, obvious or irrelevant agent.',
    operation: 'Identify agent and affected entity, decide which belongs in topic position, then keep tense in be and participle form in the lexical verb.',
    example: { prompt: 'Translate “据报道，这座桥将在六月重新开放”。', reasoning: ['Chinese omits the reporting source; English can use an impersonal passive reporting frame.', 'The future reopening remains inside the that-clause.'], result: '“It is reported that the bridge will reopen in June” or “The bridge is reported to reopen in June.”' },
  },
  {
    familyId: 'english-reading-tone', keywords: ['作者态度', 'attitude', 'tone', '语气判断'],
    teaching: 'Writer attitude is inferred from repeated evaluation, modality, concession, quotation and treatment of alternatives; one emotional word cannot justify an extreme tone label.',
    operation: 'Collect at least two stance signals, distinguish attitude to the issue from attitude to a quoted view, then choose the least exaggerated label.',
    example: { prompt: 'A writer calls a plan “ambitious” but adds that its funding “remains unclear”. Is the tone simply supportive?', reasoning: ['“Ambitious” acknowledges the plan’s scale or value, while “remains unclear” withholds full endorsement.', 'The concession combines approval of the goal with concern about feasibility.'], result: 'The tone is cautiously positive or qualified, not unreservedly supportive.' },
  },
  {
    familyId: 'english-reading-irony', keywords: ['隐喻反讽', 'irony', 'metaphor', 'figurative'],
    teaching: 'A metaphor maps selected features between domains; irony creates distance between literal wording and contextual meaning, often through contradiction, echo or disproportion.',
    operation: 'State the literal meaning, identify the contextual contradiction or mapping, then explain the implied evaluation without assuming every joke is irony.',
    example: { prompt: 'After a system crashes for the third time, an engineer says, “Another triumph of flawless design.” What creates irony?', reasoning: ['The literal praise conflicts with the repeated failure known to speaker and audience.', 'The exaggerated positive wording echoes and rejects the claim that the design is flawless.'], result: 'The sentence criticises the design through a deliberate gap between literal praise and contextual judgement.' },
  },
  {
    familyId: 'english-writing-narrative', keywords: ['个人经历', 'Reflective writing', '叙事写作'],
    teaching: 'A narrative selects a change-bearing event, orders scene and reflection, and uses concrete action rather than a list of feelings; reflection should arise from what changed.',
    operation: 'Set the initial expectation, show a turning-point action with sensory detail, then connect the consequence to a specific insight.',
    example: { prompt: 'Develop “I became more confident after the presentation” into a narrative moment.', reasoning: ['Show the initial obstacle and one observable choice, such as continuing after losing a note card.', 'End with what the speaker learned from the audience response rather than merely repeating “I was confident”.'], result: 'A focused scene can demonstrate growth: difficulty, decision, consequence and reflection form the narrative arc.' },
  },
  {
    familyId: 'english-writing-description', keywords: ['人物与地点描写', 'description', '人物描写', '地点描写'],
    teaching: 'Effective description selects details from a viewpoint and purpose; spatial order, precise verbs and one controlling impression are more useful than stacked adjectives.',
    operation: 'Choose a viewing position, move through space or action in a stable order, and make each detail support the intended impression.',
    example: { prompt: 'Replace “The library was beautiful and quiet” with evidence.', reasoning: ['“Beautiful” and “quiet” state judgements but offer no observable basis.', 'Light on worn desks, muted footsteps and pages turning can build the impression through sight and sound.'], result: '“Afternoon light rested on the worn wooden desks; only the soft turn of pages interrupted the stillness.”' },
  },
  {
    familyId: 'english-writing-summary', keywords: ['概要写作', 'summary', '概要'],
    teaching: 'A summary preserves the source’s controlling idea, major relations and conclusion while removing examples and repetition; it must not add evaluation or strengthen certainty.',
    operation: 'Label each paragraph’s function, combine repeated ideas in new structure, and compare scope and modality with the source.',
    example: { prompt: 'A passage gives three city gardens as examples of community cooling. What belongs in the summary?', reasoning: ['Retain the general claim that well-designed green spaces can reduce local heat and support community use.', 'Omit garden names and minor measurements unless one is necessary to qualify the result.'], result: 'The summary should state the shared finding and its conditions, not retell all three cases.' },
  },
  {
    familyId: 'english-writing-chart', keywords: ['图表描述', 'chart description', '图表作文', '趋势解释', 'trend graphs'],
    teaching: 'Chart writing separates description from explanation: first state measure, period, overall trend and key comparisons; only infer causes when the source supplies evidence.',
    operation: 'Read axes and units, select overall pattern and exceptions, compare with precise quantities, then mark any explanation as evidence-based or tentative.',
    example: { prompt: 'A chart rises from 40% to 60% between 2020 and 2025. How should the change be stated?', reasoning: ['The absolute increase is 20 percentage points.', 'Relative to the 2020 value, the increase is 50%; the two expressions have different denominators.'], result: 'Write “The share rose by 20 percentage points, a 50% relative increase,” and name the measured population.' },
  },
  {
    familyId: 'english-writing-paraphrase', keywords: ['摘要与改写', 'paraphras', '转述', '改写'],
    teaching: 'A paraphrase preserves proposition, scope and stance while changing both wording and sentence structure; source acknowledgement remains necessary.',
    operation: 'Understand and close the source, restate relations from memory, compare accuracy, then cite rather than replacing isolated synonyms.',
    example: { prompt: 'Paraphrase: “Limited shade makes the square unsafe during extreme heat.”', reasoning: ['The causal relation is lack of shade leading to heat risk, and “extreme” limits the condition.', 'Changing “limited” to “little” alone is not a structural paraphrase.'], result: '“During severe heat, people may face unsafe conditions in the square because it offers too little shade.”' },
  },
  {
    familyId: 'english-research-data', keywords: ['research data', 'Reporting data', '研究数据', 'limitations'],
    teaching: 'Research reporting names population, measure, comparison and uncertainty; a chart describes a sample and does not by itself establish a causal mechanism.',
    operation: 'Check axes, sample and method, report the numerical pattern, then separate supported result, possible explanation and limitation.',
    example: { prompt: 'A survey of 60 volunteers finds that 70% prefer digital notes. What can be concluded?', reasoning: ['The result describes these volunteers; recruitment may make them unrepresentative of all students.', 'Preference is self-report and does not show that digital notes improve learning.'], result: 'Report the sample preference and method, but do not generalise to all students or claim a learning benefit.' },
  },
  {
    familyId: 'english-research-citation', keywords: ['citation', '引用', 'Source integration', '研究报告'],
    teaching: 'Source integration distinguishes the writer’s claim from the source’s finding, uses quotation or paraphrase for a stated purpose, and records enough information for retrieval.',
    operation: 'Introduce source and claim, quote or paraphrase accurately, explain its role, and use one consistent citation system.',
    example: { prompt: 'Why is “Experts say green space is good” weak source integration?', reasoning: ['“Experts” is not retrievable and “good” hides the measured outcome and population.', 'The sentence gives no link between the evidence and the writer’s present claim.'], result: 'Name the study or author, report the exact finding and limitation, cite it, then explain why it matters here.' },
  },
  {
    familyId: 'english-research-question', keywords: ['research question', '研究问题'],
    teaching: 'A research question identifies a population or text, variable or feature, comparison and feasible evidence; “study social media” is a topic, not yet a question.',
    operation: 'Narrow object, time and measure, state the relation to test, then verify available evidence and ethical limits.',
  },
  {
    familyId: 'english-writing-language-revision', keywords: ['修改清单', 'Editing for coherence', '多轮修改', '同伴修改'],
    teaching: 'Revision works in passes: task fulfilment and paragraph order first, reference and sentence boundaries next, then agreement, tense, collocation, spelling and punctuation.',
    operation: 'Read once per level, mark one error category at a time, and recheck whether each correction preserves intended meaning.',
  },
  {
    familyId: 'english-reading-structure', keywords: ['主旨', '段落', '篇章', 'details', '事实细节', '同义转述', '推理判断', '选句填空', '完形填空', '主线'],
    teaching: 'Reading answers must match question type and evidence scope: main idea covers the whole text, detail is paraphrased locally, and inference adds only a necessary bridge.',
    operation: 'Map paragraph functions, locate exact evidence, restate the relation, and reject options that change population, certainty, cause or time.',
  },
  {
    familyId: 'english-vocabulary-use', keywords: ['词根', '词缀', '一词多义', '搭配', '语块', '同义词', '语体', '词义辨析', '词形变化'],
    teaching: 'Knowing a word includes contextual sense, word class, grammatical pattern, collocation and register; morphology predicts but context confirms.',
    operation: 'Predict form and sense, substitute in context, check partners and tone, then store the word in an authentic chunk.',
  },
  {
    familyId: 'english-listening-interaction', keywords: ['听力', '对话', '讨论', '协商', '访谈', '讲座笔记', '口语', '澄清', '确认信息'],
    teaching: 'Listening follows decision structure, not every word: separate proposed, rejected and final options, track correction markers, and record numbers with their labels.',
    operation: 'Predict needed information, note speaker stance and corrections, then reconstruct who will do what, when and why.',
  },
]

const politicsConceptFamilies: ConceptFamily[] = [
  {
    familyId: 'politics-ownership', keywords: ['生产资料所有制', '所有制结构', '国有经济', '非公有制', '多种所有制'],
    teaching: '生产资料所有制决定经济制度性质和生产关系基础；我国坚持公有制为主体、多种所有制经济共同发展，主体地位不能等同于每个行业国有资产数量最多。',
    operation: '区分制度地位、控制力与具体企业效率，结合行业功能和材料数据判断。',
    example: { prompt: '国有企业数量少于民营企业，能否推出公有制不再占主体？', reasoning: ['主体地位要看公有资产在社会总资产中的优势及国有经济对重要行业、关键领域的控制力。', '企业数量没有反映资产规模、行业位置和控制力。'], result: '不能只按企业家数判断所有制主体地位，应使用资产结构和关键领域控制力等指标。' },
  },
  {
    familyId: 'politics-enterprise-labour', keywords: ['企业经营', '劳动者', '企业创办', '市场主体登记', '诚信经营'],
    teaching: '企业经营要在登记许可、劳动用工、质量安全、纳税和竞争规则内组织生产；利润来自有效满足需求，不免除对劳动者、消费者和公共利益的责任。',
    operation: '先确认主体资格和法定义务，再分析产品、成本、创新与劳动关系如何影响经营结果。',
  },
  {
    familyId: 'politics-market-mechanism', keywords: ['供给需求', '价格机制', '竞争机制', '市场调节', '市场体系', '市场规则'],
    teaching: '价格通过供求变化传递稀缺信息并激励资源流动；外部性、公共物品、垄断和信息不对称会使市场结果偏离社会最优。',
    operation: '先画供求变化方向，区分沿曲线移动与曲线移动，再判断是否存在市场失灵及相应工具。',
    example: { prompt: '持续高温使空调需求增加，短期价格和销量通常怎样变化？', reasoning: ['高温改变消费者需求，在原价格下愿意购买的数量增加，需求曲线右移。', '短期供给调整有限，均衡价格和数量通常上升；长期企业扩产会改变供给。'], result: '先由需求增加推高价格与销量，再区分长期供给响应，不能把价格上涨一概认定为哄抬。' },
  },
  {
    familyId: 'politics-macro-policy', keywords: ['宏观调控', '政府经济职能', '开放型经济新体制'],
    teaching: '宏观调控围绕总量平衡、结构优化和风险稳定使用财政、货币等工具；工具通过收入、利率、信贷和预期传导，并存在时滞与副作用。',
    operation: '判断经济问题属于需求、供给还是结构风险，选择工具，写清传导对象、方向和边界。',
  },
  {
    familyId: 'politics-distribution-security', keywords: ['按劳分配', '收入分配', '效率与公平', '社会保障', '共同富裕', '分配社会保障'],
    teaching: '初次分配、再分配和第三次分配作用主体与机制不同；社会保障通过风险共担守住基本生活底线，共同富裕不是平均主义。',
    operation: '定位分配环节和主体，说明税收、转移支付、工资或公益如何影响收入机会与风险。',
    example: { prompt: '提高低收入群体基本养老补助属于哪一分配环节，怎样影响公平？', reasoning: ['政府通过财政转移支付进行再分配，不是企业内部按劳分配。', '补助提高基本保障、缩小风险承受差距，但还需稳定财源和精准覆盖。'], result: '该措施通过再分配改善底线公平，同时要兼顾可持续性和激励。' },
  },
  {
    familyId: 'politics-social-forms', keywords: ['原始社会', '奴隶社会', '封建社会', '资本主义', '社会形态演进'],
    teaching: '社会形态分析要把生产力、生产资料所有制、阶级关系和国家形态联系起来；演进由矛盾和主体实践推动，不是自动直线升级。',
    operation: '比较生产工具、剩余产品占有、阶级关系和政治组织，再解释矛盾如何改变制度。',
  },
  {
    familyId: 'politics-scientific-socialism', keywords: ['科学社会主义', '社会主义从理论到实践'],
    teaching: '科学社会主义以唯物史观和剩余价值学说揭示资本主义运行矛盾，并把无产阶级和人民实践作为社会变革力量。',
    operation: '区分思想来源、理论突破和实践条件，避免把理论产生写成单一人物灵感。',
  },
  {
    familyId: 'politics-china-road', keywords: ['新民主主义', '社会主义制度确立', '改革开放', '中国特色社会主义新时代', '中国梦', '中国特色社会主义道路理论制度文化'],
    teaching: '中国特色社会主义道路形成于革命、建设和改革的具体实践；分析每一阶段要对应主要任务、制度选择、实践成效和新问题。',
    operation: '定位历史阶段和主要矛盾，连接党的领导、人民实践、制度变化与发展结果。',
  },
  {
    familyId: 'politics-party-leadership', keywords: ['中国共产党', '党的领导', '党的先进性', '执政方式', '建立新中国与执政'],
    teaching: '党的领导是中国特色社会主义最本质特征；科学、民主、依法执政分别强调规律依据、人民参与和法治轨道，三者统一于治理实践。',
    operation: '区分党提出方向、国家机关依法履职和人民参与监督，不能用党组织替代国家机关法定程序。',
  },
  {
    familyId: 'politics-people-democracy', keywords: ['人民民主专政', '全过程人民民主', '人民当家作主'],
    teaching: '全过程人民民主贯通选举、协商、决策、管理和监督；民主不仅看是否表达意见，还看意见能否进入制度程序并形成反馈。',
    operation: '识别参与主体、渠道、程序和反馈结果，并说明民主与依法治理如何统一。',
  },
  {
    familyId: 'politics-political-institutions', keywords: ['人民代表大会制度', '政党制度', '民族区域自治', '基层自治', '基本政治制度'],
    teaching: '政治制度分析要准确区分人大、政府、政协、政党和基层自治组织的法律地位、产生方式与职权，不能只写“共同管理国家”。',
    operation: '先确认主体性质和法定职权，再写其与人民、其他机关及具体事项的程序关系。',
  },
  {
    familyId: 'politics-legislation-enforcement', keywords: ['科学立法', '严格执法', '行政权力', '立法程序', '法治政府'],
    teaching: '立法要权限合法、程序公开并反映实际；行政执法须有法定依据、遵守正当程序，并保持措施与违法程度相称。',
    operation: '依次核查主体权限、事实依据、程序、裁量比例和救济渠道。',
  },
  {
    familyId: 'politics-judicial-rule-law', keywords: ['司法公正', '程序正义', '公正司法', '全民守法', '法治国家', '全面依法治国'],
    teaching: '司法公正包括事实认定、法律适用和程序保障；法院独立行使审判权，检察院依法行使检察权，公安机关承担行政管理和刑事侦查等职责。',
    operation: '区分侦查、起诉、审判与法律监督主体，检查证据、程序权利和救济。',
  },
  {
    familyId: 'politics-philosophy-basic', keywords: ['哲学的起源', '世界观与方法论', '哲学与具体科学', '哲学基本问题', '马克思主义哲学'],
    teaching: '哲学研究世界观和方法论层面的普遍问题，具体科学研究特定领域规律；二者相互促进但不能互相替代。',
    operation: '先判断命题讨论对象和层次，再区分世界观前提、具体证据与方法论作用。',
  },
  {
    familyId: 'politics-material-consciousness', keywords: ['物质', '运动', '规律', '意识', '主观能动'],
    teaching: '物质决定意识，意识具有能动作用；发挥主观能动性必须以客观条件和规律为依据，并通过实践把目的转化为结果。',
    operation: '分开客观条件、认识方案、实践行动和反馈修正，检查能动性是否尊重规律。',
  },
  {
    familyId: 'politics-dialectics-relation-development', keywords: ['联系', '整体与部分', '发展', '量变', '质变', '辩证否定'],
    teaching: '联系具有客观性和条件性，发展通过量变积累和质变突破展开；质变取决于度和结构条件，不是任意数量增加。',
    operation: '明确联系双方和条件，确定量变指标、度与结构，再判断变化性质。',
  },
  {
    familyId: 'politics-dialectics-contradiction', keywords: ['矛盾', '分析与综合', '发散', '聚合', '逆向', '超前思维'],
    teaching: '矛盾分析要求说明具体对立双方、统一条件、主要方面和转化条件；创新思维仍需以问题目标、事实和可行性评价为约束。',
    operation: '定位具体矛盾和主次，生成多方案，再用共同标准评估条件、风险和后果。',
  },
  {
    familyId: 'politics-epistemology', keywords: ['实践是认识', '真理', '实践认识'],
    teaching: '实践是认识来源、动力、目的和检验标准；真理具有客观性，又总在特定条件和范围内成立。',
    operation: '写清认识来自何种实践、接受何种检验、证据如何改变结论边界。',
  },
  {
    familyId: 'politics-social-values', keywords: ['社会存在', '社会意识', '人民群众', '价值判断', '社会历史'],
    teaching: '社会存在制约社会意识，社会意识又具有相对独立性；价值判断受社会条件和主体立场影响，正确选择应自觉站在最广大人民立场。',
    operation: '区分物质生活条件、观念反作用和主体利益，说明评价标准与人民实践。',
  },
  {
    familyId: 'politics-international-relations', keywords: ['国际关系', '国家利益', '多极化', '和平与发展', '外交政策', '国际格局'],
    teaching: '国家利益和国家实力是影响国际关系的重要因素；共同利益提供合作基础，利益差异与力量变化又会带来竞争。',
    operation: '识别行为主体、核心利益、实力条件和具体议题，避免用永久友敌解释变化。',
    example: { prompt: '两国在气候议题合作、在贸易议题争议，是否矛盾？', reasoning: ['不同议题上的利益重合程度不同，合作和竞争可以同时存在。', '国家会按具体利益、规则和实力选择政策，不由单一关系标签决定。'], result: '应分议题分析共同利益和分歧，而非把国际关系简化为纯合作或纯对抗。' },
  },
  {
    familyId: 'politics-global-economy', keywords: ['经济全球化', '跨国公司', '全球生产', '对外开放', '开放型经济'],
    teaching: '经济全球化表现为商品、服务、资本、技术和生产环节跨国配置；它提高分工效率，也会传导风险并造成收益分配差异。',
    operation: '画出生产和价值链，识别规则制定、利润分配、风险节点与提升开放质量的措施。',
    example: { prompt: '一部手机在多国完成设计、芯片制造、组装和销售，这说明什么？', reasoning: ['生产环节按技术、成本、市场和基础设施在全球配置，体现生产全球化。', '品牌、核心技术、制造与销售环节获得的附加值不同，说明参与全球化不等于收益相同。'], result: '应沿价值链分析分工效率、利润分配和供应链风险，而非只说“各国联系加强”。' },
  },
  {
    familyId: 'politics-international-organizations', keywords: ['国际组织', '联合国', '区域性国际组织'],
    teaching: '国际组织由成员、宗旨、机构和议事规则构成，其作用受授权范围、成员共识、资源和大国关系约束。',
    operation: '核对组织类型、成员资格、决策规则和职权，再判断能做什么及不能做什么。',
    example: { prompt: '联合国大会通过决议，是否等于联合国可直接命令所有会员国执行？', reasoning: ['要先区分大会与安理会等机构的职权及决议法律性质，不能把“联合国”当作单一机关。', '执行还受会员国义务、授权范围、资源和政治共识影响。'], result: '评价国际组织作用必须落到具体机构、程序和权限，决议通过不等于自动执行。' },
  },
  {
    familyId: 'politics-global-governance', keywords: ['全球治理', '安全', '全球发展赤字', '共同责任', '人类命运共同体'],
    teaching: '全球治理针对跨境问题协调国家、国际组织和其他主体；共同目标需转化为责任分配、资金技术和监督规则。',
    operation: '识别公共问题的跨境机制、责任差异、合作工具与执行约束。',
  },
  {
    familyId: 'politics-civil-rights', keywords: ['人身权', '物权', '所有权边界', '知识产权'],
    teaching: '民事权利分析先确认权利客体和权能，再检查他人行为是否有许可、法定限制或合理使用依据；物权、人身权和知识产权的保护方式不同。',
    operation: '依次确认权利主体与客体、行为、合法依据、损害及救济。',
  },
  {
    familyId: 'politics-contract-tort', keywords: ['合同订立', '合同履行', '违约责任', '侵权责任', '消费者权益'],
    teaching: '合同责任以有效合同和违约为基础，侵权责任通常检查行为、损害、因果与过错；二者请求权基础和举证事项不能混写。',
    operation: '先判断合同关系和效力，再区分违约或侵权，列构成要件、抗辩与责任方式。',
    example: { prompt: '网店收款后逾期不发货，消费者首先依据什么主张权利？', reasoning: ['买卖合同成立后，按约发货是经营者的合同义务。', '逾期构成违约，消费者可要求继续履行、解除并退款或依法主张损失；若另有欺诈再分析消费者特别保护。'], result: '先以合同请求权组织答案，再按事实判断是否叠加消费者保护或侵权责任。' },
  },
  {
    familyId: 'politics-family-inheritance-labour', keywords: ['婚姻家庭', '继承', '遗嘱', '劳动合同', '劳动争议', '家庭就业创业'],
    teaching: '家庭、继承和劳动关系分别受身份、遗嘱形式与劳动保护规则约束；不能简单套用一般合同中的“双方自愿即有效”。',
    operation: '确认关系性质和主体资格，核对强制性规则、形式要件、权利义务与争议程序。',
  },
  {
    familyId: 'politics-business-registration', keywords: ['企业创办与市场主体登记'],
    teaching: '创办企业要选择主体形式并依法登记；不同主体在出资、法人资格、责任承担和治理结构上不同，登记不是经营所有业务的无限许可。',
    operation: '比较主体类型、出资责任、登记事项和行业许可，再判断责任由谁承担。',
    example: { prompt: '个人独资企业能否因已登记就让投资人对债务只承担出资额责任？', reasoning: ['登记确认市场主体资格，但责任形式由组织法律规则决定。', '个人独资企业投资人通常以个人财产对企业债务承担无限责任。'], result: '主体登记不等于获得有限责任，创办前必须比较组织形式及责任边界。' },
  },
  {
    familyId: 'politics-competition-law', keywords: ['依法经营与公平竞争'],
    teaching: '公平竞争要求经营者遵守反不正当竞争、反垄断、广告和消费者保护规则；低价、合作或市场优势本身不当然违法，要检查行为方式和排除限制效果。',
    operation: '界定相关行为和市场，识别混淆、虚假宣传、商业贿赂或排除竞争效果，再核对抗辩。',
  },
  {
    familyId: 'politics-tax-compliance', keywords: ['纳税义务与诚信经营'],
    teaching: '纳税义务具有法定性，应按纳税主体、税目税率、计税依据、申报期限和凭证核算；税收法律关系不是普通民事自愿交易。',
    operation: '确认纳税人和应税行为，核对计税与申报，再区分合法筹划、欠税、逃税等行为。',
    example: { prompt: '商家隐瞒现金收入以少申报营业收入，能否称为“合理节税”？', reasoning: ['应税收入和申报义务由税法规定，隐瞒真实收入使计税依据失真。', '合法税收筹划利用公开规则安排交易，不以伪造、隐瞒事实为手段。'], result: '该行为不是一般民事选择，而可能构成违反税收征管义务，应补缴情形并依法承担责任。' },
  },
  {
    familyId: 'politics-dispute-resolution', keywords: ['调解仲裁与诉讼选择'],
    teaching: '调解依自愿协商，仲裁通常以有效仲裁协议为前提并实行一裁终局，诉讼由法院依法审判；劳动仲裁等特殊程序另有前置规则。',
    operation: '先辨争议性质，再检查协议和管辖、时效、成本、公开性与执行力。',
    example: { prompt: '合同没有仲裁条款，一方争议发生后单独申请商事仲裁，仲裁机构能否当然受理？', reasoning: ['商事仲裁以双方有效仲裁协议为基础，单方申请不能替代共同意思表示。', '双方可事后达成仲裁协议，否则通常应协商、调解或依法诉讼。'], result: '先检查仲裁协议；没有有效协议时不能把仲裁当作单方可直接选择的程序。' },
  },
  {
    familyId: 'politics-logic-concept', keywords: ['概念的内涵', '外延', '定义划分', '分类'],
    teaching: '概念内涵与外延反向变化；定义必须全同、清楚且避免循环，划分必须按同一标准、子项互斥且穷尽母项。',
    operation: '分别检查定义规则和划分规则，不能把性质说明、举例与逻辑定义混为一谈。',
    example: { prompt: '把“学校活动”分为“体育活动、校内活动、艺术活动”是否规范？', reasoning: ['“体育、艺术”按内容划分，“校内”按地点划分，标准不统一。', '校内体育活动会同时落入两个子项，子项不互斥。'], result: '应选一个标准，例如按内容分为体育、艺术、科技等，并检查是否穷尽。' },
  },
  {
    familyId: 'politics-logic-judgment', keywords: ['简单判断', '复合判断', '同一律', '矛盾律', '排中律', '判断真假'],
    teaching: '复合判断由联言、选言、假言等连接结构决定真值；思维规律要求同一语境中概念保持同一、不能同时肯定矛盾命题。',
    operation: '形式化支命题和连接词，列真值条件，再检查论述是否偷换语境或概念。',
    example: { prompt: '“小李既参加合唱团又参加篮球队”在什么条件下为真？', reasoning: ['这是联言判断，由“参加合唱团”和“参加篮球队”两个支判断组成。', '联言判断只有两个支判断都真时才真，任一为假则整体为假。'], result: '不能因其中一项成立就肯定整个联言判断。' },
  },
  {
    familyId: 'politics-logic-deduction', keywords: ['三段论', '联言', '选言', '假言推理', '演绎'],
    teaching: '演绎推理要求结论必然随前提而来；三段论检查中项周延，假言推理要防止肯定后件和否定前件。',
    operation: '写出逻辑形式，应用有效式，尝试构造前提真而结论假的反例。',
    example: { prompt: '“只有登记才能入场；小林登记了；所以小林能入场”是否有效？', reasoning: ['“只有登记才能入场”等价于入场推出登记，登记是必要条件。', '必要条件满足不保证其他条件也满足，因此不能反向推出入场。'], result: '该推理是肯定后件式错误；还需“登记即可入场”等充分条件。' },
  },
  {
    familyId: 'politics-logic-induction', keywords: ['归纳推理', '样本代表性', '类比推理', '论证结构', '逻辑错误'],
    teaching: '归纳与类比的结论是或然的，可靠性取决于样本、相关相似性、反例和替代原因；真实个案也未必能支撑普遍结论。',
    operation: '核查样本来源与共同属性，比较结论强度，并寻找反例和混杂变量。',
    example: { prompt: '三名接受访谈的游客都喜欢新展览，能否推出全部游客满意？', reasoning: ['样本量小，且愿意接受访谈者可能本来就更有兴趣，存在自选偏差。', '“喜欢”还需统一测量标准，不能从三个个案推出总体比例。'], result: '材料只能提供初步线索，需扩大随机样本并报告不确定性。' },
  },
]

const historyConceptFamilies: ConceptFamily[] = [
  {
    familyId: 'history-prehistory-state', keywords: ['旧石器', '新石器', '文明起源', '早期国家', '夏商西周国家形态'],
    teaching: '从旧石器到新石器的关键变化包括生产性经济、定居和社会分化；早期国家还需用城址、墓葬等级、公共工程、文字或权力中心等证据判断。',
    operation: '建立年代与遗址空间，区分生产变化、聚落分化和国家形成证据，避免用单件文物下结论。',
    example: { prompt: '大型城址和等级墓葬能为早期国家研究提供什么证据？', reasoning: ['大型工程需要持续组织劳动力，墓葬差异反映资源和身份分化。', '但城址与墓葬不能单独说明具体王朝名称，还需文字、年代和多遗址互证。'], result: '它们支持社会分化和权力组织增强的判断，具体政权归属仍需更多证据。' },
  },
  {
    familyId: 'history-ancient-china-institutions', keywords: ['分封制', '宗法制', '中央集权', '秦朝统一', '汉武帝', '文景之治', '隋朝统一', '唐朝政治', '地方行政制度', '选官制度', '监察制度'],
    teaching: '中国古代制度变化要比较权力来源、中央地方关系、官员产生、财政军事和监督机制；制度名称相同不代表实际权力相同。',
    operation: '画中央与地方权力结构，说明制度回应的问题，再用任免、财政、法律和执行资料评价效果。',
    example: { prompt: '比较西周分封制与秦朝郡县制时，最关键的制度差别是什么？', reasoning: ['分封诸侯权力与封土、宗法和世袭关系相连，对周王承担义务。', '郡县长官由中央任免考核，地方行政权更直接来自中央官僚体系。'], result: '应从地方权力来源和官员产生解释中央地方关系变化，不能只比较名称。' },
  },
  {
    familyId: 'history-ancient-china-change', keywords: ['春秋战国社会变革', '三国两晋南北朝变迁', '民族交融与江南开发', '魏晋隋唐民族交融', '宋元经济社会', '明清统一国家'],
    teaching: '社会变迁需把政治分合、人口迁移、土地与生产、民族互动和制度调整放在同一时间链中，不能以朝代更替替代机制解释。',
    operation: '比较变化前后的人口、制度与经济空间，区分长期条件、直接事件和地区差异。',
  },
  {
    familyId: 'history-ancient-china-economy', keywords: ['农业与土地制度', '手工业与技术', '商业城市与货币', '隋唐经济文化', '宋元经济与城市', '明清经济文化', '赋税制度'],
    teaching: '古代经济史要区分生产技术、土地与赋税制度、劳动组织、市场和城市功能；商业繁荣不自动等于自然经济消失。',
    operation: '选定产量、税制、货币、市场范围等指标，比较前后并分析国家与不同社会群体。',
  },
  {
    familyId: 'history-modern-china-invasion-reform', keywords: ['鸦片战争', '列强侵华', '民族危机', '太平天国', '洋务', '维新', '辛亥', '近代化探索', '国家出路探索'],
    teaching: '近代中国转型要同时分析列强侵略造成的主权危机、国内社会结构变化，以及不同政治力量在器物、制度和社会动员层面的方案。',
    operation: '定位时代任务，比较目标、领导力量、社会基础、制度触及和直接长期结果。',
    example: { prompt: '洋务运动与戊戌维新对民族危机的回应有何层次差异？', reasoning: ['洋务派以维护清朝统治为前提，引进技术、创办企业和新式学堂，重点在器物和部分经济教育层面。', '维新派进一步主张政治教育制度变革，但缺乏广泛社会动员并受保守力量压制。'], result: '比较要落到改革目标、制度触及、力量基础和结果，不能只用“都失败”抹平差异。' },
  },
  {
    familyId: 'history-modern-china-revolution', keywords: ['新文化', '五四', '共产党', '建党', '国民革命', '新民主主义革命', '抗日战争', '人民解放战争', '民主革命道路'],
    teaching: '新民主主义革命史要连接民族危机、阶级与群众基础、组织路线、统一战线和武装斗争，按阶段解释道路选择。',
    operation: '明确阶段任务和主要力量，追踪组织动员与政治主张，再区分直接胜负和长期影响。',
    example: { prompt: '五四运动为什么不能只理解为一次学生爱国示威？', reasoning: ['学生抗议是开端，工人、商人等群体随后参与，使运动具有更广社会基础。', '运动把反帝爱国、社会动员和新思想传播相连，并推动马克思主义进一步传播。'], result: '应同时说明事件过程、参与群体和思想政治影响，而非只记起止日期。' },
  },
  {
    familyId: 'history-prc-development', keywords: ['中华人民共和国成立', '社会主义基本制度', '社会主义建设', '改革开放', '浦东开发', '中国特色社会主义新时代'],
    teaching: '新中国发展应分成立与政权巩固、制度建立、建设探索、改革开放和新时代等阶段，比较任务、政策、成效与新矛盾。',
    operation: '建立阶段节点，选制度、经济和生活指标，解释政策怎样改变资源配置与社会关系。',
    example: { prompt: '为什么改革开放既是政策调整，也是体制机制变革？', reasoning: ['对内改革逐步改变高度集中的资源配置方式，扩大企业、地方和市场机制作用。', '对外开放引入贸易、投资和技术联系，并要求相应制度建设。'], result: '评价改革开放要连接政策、资源配置机制和社会经济结果，而不只列事件。' },
  },
  {
    familyId: 'history-ancient-civilizations', keywords: ['文明产生', '古代西亚', '埃及', '印度', '希腊', '古代世界帝国', '中古非洲美洲和亚洲', '古代文明的多元发展'],
    teaching: '比较古代文明要统一使用生计、城市、政治、宗教、文字和社会结构等维度，同时说明环境只提供条件，不决定唯一道路。',
    operation: '定位时空和证据类型，按共同维度比较，再解释交流、制度选择与偶然事件。',
    example: { prompt: '两河与埃及都有大河，为什么政治文化仍不相同？', reasoning: ['河流支持灌溉农业和人口集中，但洪水规律、地理开放性与交通条件不同。', '族群互动、政治组织、宗教观念和具体历史事件也会改变发展路径。'], result: '环境是重要条件而非唯一原因，比较文明需加入制度和主体选择。' },
  },
  {
    familyId: 'history-medieval-world', keywords: ['西欧封建社会', '拜占庭与俄罗斯', '阿拉伯帝国', '中古西欧城市与王权', '中古时期的世界区域'],
    teaching: '中古世界不是单一“黑暗时代”；应比较封君封臣、庄园与城市、宗教权威、帝国传统和区域贸易的不同组合。',
    operation: '分地区建立政治、经济与宗教结构，说明城市、王权和交流怎样改变原有秩序。',
  },
  {
    familyId: 'history-navigation-exchange', keywords: ['丝绸之路', '中外交流', '新航路', '全球航路', '人口迁移', '物种交换', '商路', '华工', '国际移民', '游牧民族迁徙'],
    teaching: '交流史要追踪动力、路线、媒介者和接收社会的再创造；流动可由贸易、迁徙、征服或强迫劳动推动，收益与代价并不均等。',
    operation: '画双向网络，标出人、物、技术和疾病，分析权力关系与落地后的选择、改造和抵制。',
  },
  {
    familyId: 'history-early-colonialism', keywords: ['早期殖民扩张', '近代殖民扩张'],
    teaching: '早期殖民扩张建立在航海、军事和商业资本结合之上，通过据点、垄断贸易、种植园和强迫劳动重组大西洋及全球联系。',
    operation: '区分殖民主体和区域模式，追踪商品、资本与强迫人口流动，并比较宗主国、殖民者和当地社会后果。',
    example: { prompt: '为什么不能只用“发现新大陆”概括早期殖民扩张？', reasoning: ['美洲已有社会，“发现”采用欧洲中心视角，掩盖征服和土地剥夺。', '殖民扩张还包括垄断贸易、奴隶贸易、资源掠夺和殖民统治。'], result: '应从相遇、征服和不平等网络形成解释，而非把过程写成单向地理发现。' },
  },
  {
    familyId: 'history-renaissance-reformation', keywords: ['文艺复兴与宗教改革'],
    teaching: '文艺复兴借古典文化资源发展人文主义表达，宗教改革挑战罗马教廷权威并重组信仰与政治关系；两者路径不同，不能合并为简单“反封建”。',
    operation: '分别定位城市文化、印刷传播、教会问题与政治支持，比较思想内容、传播媒介和制度影响。',
    example: { prompt: '为什么“文艺复兴就是复古、宗教改革就是不要宗教”都不准确？', reasoning: ['人文主义者借古典资源讨论人的价值和现世生活，产生了新创造而非原样恢复古代。', '宗教改革反对特定教会权威和教义实践，却建立新的基督教派和信仰秩序。'], result: '两场运动都改变欧洲思想文化，但目标、载体和制度结果不同。' },
  },
  {
    familyId: 'history-enlightenment', keywords: ['启蒙运动'],
    teaching: '启蒙思想以理性批判专制与特权，提出自然权利、社会契约、权力制衡等不同方案；思想影响革命需要传播网络、社会力量和政治危机。',
    operation: '区分思想家的核心命题和制度主张，再追踪文本、社团与政治纲领如何转化思想。',
  },
  {
    familyId: 'history-bourgeois-revolutions', keywords: ['资产阶级革命', '英美法'],
    teaching: '英、美、法革命的旧制度条件、领导联盟和政治结果不同；比较应围绕主权来源、权利文件、代议制度和社会动员，而非套一个阶段表。',
    operation: '统一比较革命前结构、直接危机、参与群体、制度文件和长期影响。',
  },
  {
    familyId: 'history-industrialization', keywords: ['工业革命', '工业文明', '世界市场', '生产工具与劳作', '现代金融与贸易', '商业革命'],
    teaching: '工业化由动力技术、机器、工厂制、资本、能源、交通和市场共同推动；产出增长与早期劳动恶化、殖民扩张可以并存。',
    operation: '连接技术和组织条件，比较产业与国家，再按阶层、地区和短长期评价影响。',
    example: { prompt: '蒸汽机为何重要，却不能单独解释第一次工业革命？', reasoning: ['蒸汽动力减少生产对水力地点的依赖，并提高采矿、纺织和运输能力。', '规模应用还需要煤铁、资本、市场、工厂组织和技术劳动者等互补条件。'], result: '蒸汽机是关键动力技术，工业化是技术与制度、市场相互强化的系统变化。' },
  },
  {
    familyId: 'history-world-wars', keywords: ['第一次世界大战', '第二次世界大战', '两次世界大战'],
    teaching: '世界大战要从国际竞争与联盟、直接危机、国家决策、工业化总体战和战后秩序解释，触发事件不能代替长期原因。',
    operation: '分长期结构、直接原因和决策链，追踪战争动员，再比较战后条约、组织和力量格局。',
  },
  {
    familyId: 'history-russian-soviet', keywords: ['俄国十月革命', '俄国革命', '苏联发展'],
    teaching: '俄国革命要放在战争危机、土地与工人问题、政权更替和政党组织中理解；苏联发展需分时期比较制度动员、工业化成效与代价。',
    operation: '建立二月到十月的权力变化，再按政策目标、资源动员和社会后果评价苏联建设。',
  },
  {
    familyId: 'history-international-order', keywords: ['凡尔赛', '华盛顿体系', '雅尔塔体系', '冷战', '国际格局', '多极化', '资本主义世界体系', '全球化与当代世界'],
    teaching: '国际秩序由力量对比、条约规则、国际组织和实际控制共同构成；秩序建立与瓦解都不是一次会议或一个日期单独完成。',
    operation: '比较力量中心、规则、组织与冲突方式，区分形成标志、运行矛盾和转型过程。',
  },
  {
    familyId: 'history-state-law-governance', keywords: ['政治制度', '官员选拔', '文官制度', '法律与教化', '法律制度', '法治建设', '民族关系', '基层治理', '户籍'],
    teaching: '制度史应说明权力来源、官员产生、法律执行、基层组织和财政资源怎样共同运作，成文制度与实际执行必须分开。',
    operation: '画组织和权力关系，定位制度回应的问题，再用执行记录与群体经验检验效果。',
  },
  {
    familyId: 'history-social-life', keywords: ['社会救济', '社会保障', '城市功能', '城市化', '交通', '医疗', '公共卫生', '生活方式', '上海开埠', '城市空间', '工人运动', '社会生活'],
    teaching: '社会生活变化由技术、基础设施和政策推动，但阶层、性别、城乡与街区差异决定谁先受益、谁承担成本。',
    operation: '选工资、物价、住房、交通、卫生等指标，分群体和空间比较，再连接制度与技术机制。',
  },
  {
    familyId: 'history-knowledge-institutions', keywords: ['学校与人才培养', '大学制度', '图书馆', '博物馆', '印刷术', '书籍传播', '数字媒介', '知识共享'],
    teaching: '知识传播取决于教育机构、媒介成本、读写群体、审查与资助制度；媒介扩大可达性，也会形成新的筛选权力和数字鸿沟。',
    operation: '比较生产者、载体、受众、成本和规则，说明知识如何被保存、认证、传播与再解释。',
  },
  {
    familyId: 'history-ancient-education', keywords: ['古代学校与人才培养'],
    teaching: '古代学校兼有经典传承、官员培养和身份塑造功能；官学、私学与选官制度的关系随国家治理需求而变化。',
    operation: '比较办学主体、学习内容、入学群体和人才去向，并与政治制度相连。',
  },
  {
    familyId: 'history-modern-university', keywords: ['近代大学制度'],
    teaching: '近代大学制度逐步形成教学、研究、学科专业与学位认证的组织体系，并与国家建设、工业需求和学术自治发生张力。',
    operation: '比较课程、组织、招生、研究与国家社会关系，避免只按创校年份排列。',
  },
  {
    familyId: 'history-print-culture', keywords: ['印刷术与书籍传播'],
    teaching: '印刷降低复制成本并扩大文本标准化与读者市场，但传播范围仍受纸张、识字率、出版网络和审查制度限制。',
    operation: '追踪技术、成本、出版者、读者和管制，区分“可大量复制”与“人人可读”。',
  },
  {
    familyId: 'history-digital-knowledge', keywords: ['数字媒介与知识共享'],
    teaching: '数字媒介降低复制和检索成本，却把排序、可见性与保存部分交给平台和算法；开放共享还受版权、基础设施和数字素养约束。',
    operation: '比较生产、检索、传播、验证和保存环节，识别开放机会与平台集中风险。',
  },
  {
    familyId: 'history-public-culture-institutions', keywords: ['图书馆博物馆的公共文化功能'],
    teaching: '图书馆和博物馆通过收藏、编目、研究、展示与公共教育塑造可见的历史；藏品来源、分类和策展叙事也需要接受检验。',
    operation: '分析收藏与展示对象、进入规则、叙事选择和公众使用，比较保存、研究与教育功能。',
  },
  {
    familyId: 'history-heritage', keywords: ['文化遗产', '真实性', '非物质', '文物返还', '历史建筑保护'],
    teaching: '遗产价值包括材料与结构、历史信息、社会记忆和活态实践；保护需兼顾真实性、社区权利、最小干预和长期维护。',
    operation: '列价值证据和利益相关者，比较干预可逆性、社区参与、使用方式与维护资金。',
  },
  {
    familyId: 'history-source-method', keywords: ['一手史料', '二手史料', '作者立场', '地图图表', '统计数据', '史料互证', '开放性论证'],
    teaching: '史料价值取决于问题：先问谁在何时为何留下材料，再区分它直接证明的事实、体现的立场和未被记录的声音。',
    operation: '记录来源与形成情境，限定可证命题，用不同类型材料互证并解释冲突。',
  },
  {
    familyId: 'history-causal-comparison', keywords: ['因果层次', '演变', '变迁', '比较', '主线', '转型'],
    teaching: '历史因果要区分长期结构、促进条件、直接原因、触发事件与主体选择；比较必须使用共同维度并解释差异机制。',
    operation: '画时间线，给因素标注作用类型和证据，再检查反事实与结果倒推。',
  },
]

const chineseSupplementalFamilies: ConceptFamily[] = [
  { familyId: 'chinese-classical-persuasion', keywords: ['劝学类文本', '政论文', '古文论说'], teaching: '古代论说要还原说话对象和现实问题，再区分价值前提、事实或寓言证据以及从证据到主张的推理。', operation: '确定言说者与对象，标出论点和论据，补出类比、对比或因果桥梁。' },
  { familyId: 'chinese-classical-narrative', keywords: ['史传文', '史传叙事', '传记游记'], teaching: '史传和游记的剪裁体现作者判断：事件顺序、人物言行、景物和评论的取舍共同塑造形象与观点。', operation: '对照事件全貌与文本篇幅，找详略、插叙和评论位置，再解释选择标准。' },
  { familyId: 'chinese-poetry-time-comparison', keywords: ['诗歌中的时空结构', '同题诗词比较', '同题异写', '古典诗歌比较'], teaching: '诗歌比较应使用共同维度，如抒情主体、时空、意象、章法和语气；同题不等于同情感，差异须由具体字词证明。', operation: '先分别完成文本内部证据链，再在共同维度上比较相同、不同及形成原因。' },
  { familyId: 'chinese-poetry-emotion', keywords: ['借景抒情', '题材与情感类型'], teaching: '题材只提供阅读预期，真实情感由景物状态、主体处境、结构转折和语气生成，不能看到“羁旅”就自动写思乡。', operation: '先还原主体时空和画面，再抓转折、动作与修饰语限定情感层次。' },
  { familyId: 'chinese-expository-concepts', keywords: ['说明对象与说明顺序', '科普文中的概念解释', '图文转换'], teaching: '说明文先界定对象和属性，再按时间、空间、因果或系统层级组织；概念解释要给属概念、区别特征和适用边界。', operation: '确定对象与读者，选择与对象结构一致的顺序，并核对图文口径和术语定义。' },
  { familyId: 'chinese-theory-reading', keywords: ['理论命题', '历史语境与问题意识', '理论阐释', '理论文章', '政治文献', '经典文本的当代阐释'], teaching: '理论阅读要把概念放回问题语境，区分作者定义、事实判断和价值主张，再说明当代转化的条件而非直接套口号。', operation: '还原原问题，界定核心概念，展开论证链，再分别评价历史作用与当代边界。' },
  { familyId: 'chinese-science-argument', keywords: ['自然选择论证', '天文学争论', '科学概念', '科学共同体', '科学文本'], teaching: '科学文本区分观察事实、模型解释和暂时结论；模型要说明解释范围，质疑要针对证据、方法或推理。', operation: '标出数据与观察、假设和预测，检查证据能排除哪些替代解释及结论强度。' },
  { familyId: 'chinese-prose-structure', keywords: ['回忆性散文', '乡土散文', '散文线索', '环境描写', '群像塑造', '叙事伦理', '报告文学'], teaching: '散文与非虚构叙事用线索组织记忆和现场材料；情感节制、叙事位置和事实来源共同决定可信度与表达强度。', operation: '标出时间、空间或物象线索，区分亲历、转述与评价，再解释关键细节怎样连接结构。' },
  { familyId: 'chinese-language-correction', keywords: ['语病类型', '句群衔接', '修辞选择', '语体得体'], teaching: '语言运用要同时检查句法完整、搭配、逻辑关系、指代和语体；“读着不顺”必须落实为可说明的结构冲突。', operation: '提取句子主干，恢复关联关系和指代，比较修改前后意义，再核对对象与场合。' },
  { familyId: 'chinese-writing-task', keywords: ['材料作文的任务', '青春主题写作', '宏大主题与个人经验', '叙议结合'], teaching: '任务写作先限定对象、情境和关系判断；个人经验要通过具体选择服务于论点，宏大主题不能替代材料问题。', operation: '改写任务为问题句，选能呈现矛盾的经验，安排叙述与分析比例并回扣判断。' },
]

const englishSupplementalFamilies: ConceptFamily[] = [
  { familyId: 'english-grammar-clause-linking', keywords: ['英语复杂句拆解', '从句层级与连接词', 'Concession and contrast clauses'], teaching: 'Clause analysis begins with finite verbs and subjects; linkers then show whether a clause fills a noun slot, modifies a noun, or adds time, cause, concession or condition.', operation: 'Mark every finite predicate, identify clause boundaries, name the linker relation, then rebuild the main clause before dependants.' },
  { familyId: 'english-grammar-nominalization', keywords: ['名词化结构与信息密度'], teaching: 'Nominalization packages an action or quality as a noun, enabling dense academic reference but often hiding the agent and causal sequence.', operation: 'Turn the noun back into a clause to recover who did what, then decide whether density or explicit agency better serves the reader.' },
  { familyId: 'english-grammar-substitution', keywords: ['Substitution ellipsis and cohesion'], teaching: 'Substitution uses forms such as one, do and so to replace recoverable material; ellipsis omits it. Both require an unambiguous antecedent and parallel structure.', operation: 'Locate the recoverable expression, name what is substituted or omitted, and test number, tense and structural parallelism.' },
  { familyId: 'english-critical-evidence', keywords: ['隐含意义与推断', '事实与意见', '广告说服', '信息来源可信度', 'source credibility', 'benefits and risks', 'Claim evidence', '主张证据与反驳'], teaching: 'Critical reading separates fact, interpretation and value judgement, checks source access and incentives, and limits inference to what evidence can support.', operation: 'Rewrite the claim with scope and certainty, audit source and comparison, then test alternative explanations and tone.' },
  { familyId: 'english-writing-argument-specific', keywords: ['观点段落', 'Counterargument', 'policy alternatives', 'proposal', 'Problem solution', 'cause and effect', '议论写作', '中心论点与段落'], teaching: 'An argument paragraph needs a contestable claim, relevant evidence, a reasoning bridge and a consequence; proposals also name actor, resources and feasibility.', operation: 'Define audience and decision, compare alternatives by one set of criteria, then answer a plausible objection.' },
  { familyId: 'english-practical-genre', keywords: ['演讲', 'speech', '邮件', 'email', '通知', '活动方案', '申请信', '推荐信', 'campaign', '应用文'], teaching: 'Practical genres are shaped by audience and action: notices foreground logistics, applications match evidence to criteria, and speeches use audible signposting and memorable examples.', operation: 'Profile the reader, lead with purpose, group essential details, end with action and deadline, then tune register.' },
  { familyId: 'english-literary-analysis', keywords: ['Character traits', 'Narrative perspective', 'Narrator', 'focalization', 'Character motivation', 'Theme supported', 'Literary response', '叙事视角与不可靠叙述'], teaching: 'Literary interpretation connects an exact wording or formal choice to character, viewpoint or theme; narrator and author must remain distinct.', operation: 'Quote a short detail, name its technique or narrative position, explain immediate effect, then test an alternative reading.' },
  { familyId: 'english-translation-relations', keywords: ['长句意群', '汉译英意群', '连接关系', '文化负载词', '翻译的准确', '译文准确'], teaching: 'Translation preserves proposition, participant relations, time, logic and register; restructuring is necessary when source and target languages package information differently.', operation: 'Segment by predicate and logic, secure the main clause, choose explicit or implicit links, then revise accuracy, coherence and register.' },
  { familyId: 'english-speaking-pragmatics', keywords: ['个人陈述', '赞同反对', '礼貌策略', 'Cultural comparison', 'implied meaning', 'Mediating', 'Negotiating'], teaching: 'Spoken interaction encodes stance through turn-taking, modality, repair and concession; successful mediation represents each view fairly before proposing shared ground.', operation: 'Track speaker goal and response, distinguish proposal from decision, then choose a register and repair strategy suited to the relationship.' },
  { familyId: 'english-public-reasoning', keywords: ['Identifying stakeholders', 'Rights duties and consequences'], teaching: 'Public-issue reasoning maps actors by rights, duties, decision power, benefits and costs, then compares options with common evidence-based criteria.', operation: 'Define the decision, list affected groups including less visible ones, trace consequences and state implementation conditions.' },
]

const politicsSupplementalFamilies: ConceptFamily[] = [
  { familyId: 'politics-national-economy-cycle', keywords: ['国民经济循环'], teaching: '国民经济循环连接生产、分配、交换和消费；居民、企业、政府与金融体系通过收入、支出和要素流动相互作用。', operation: '画主体与实物、资金双向流，说明一个环节变化怎样经收入和需求传导。' },
  { familyId: 'politics-state-form', keywords: ['国家的本质', '民主与专政', '政体与国体', '单一制与复合制', '政党和利益集团'], teaching: '国家内容与管理形式要分开：国体回答国家权力归属，政体回答权力如何组织；国家结构形式回答中央与组成单位权限关系。', operation: '按国体、政体、结构形式和政治力量分别判断，不能由国土大小或机构名称直接推出制度性质。' },
  { familyId: 'politics-culture-development', keywords: ['文化的功能', '中华优秀传统文化', '革命文化', '先进文化', '文明互鉴', '文化传承', '文化强国'], teaching: '文化通过环境、活动和产品影响人的认识与实践；传承创新要取其精华、回应当代实践，并在交流互鉴中保持主体性。', operation: '说明具体文化内容、载体、受众和作用机制，再评价当代价值与需要改造之处。' },
  { familyId: 'politics-civil-basic', keywords: ['民事法律关系与民法原则'], teaching: '民事法律关系由主体、客体和权利义务内容构成；平等、自愿、公平、诚信、守法公序良俗和绿色原则共同约束民事活动。', operation: '确认主体民事能力和法律事实，列权利义务，再检查意思表示与强制性规则。' },
  { familyId: 'politics-rule-law-history-participation', keywords: ['法治建设历程', '公民权利与法治参与', '权力监督与责任追究', '近代中国基本国情', '科学民主依法执政'], teaching: '法治与政治发展必须放在具体历史条件和制度程序中；公民依法参与、信息公开、权力监督和责任追究共同约束公共权力。', operation: '定位历史或制度背景，区分参与、决策与监督主体，再写程序和责任机制。' },
]

const historySupplementalFamilies: ConceptFamily[] = [
  { familyId: 'history-zhou-feudal-lineage', keywords: ['分封制与宗法制'], teaching: '西周分封把土地与人口授予诸侯并规定政治义务，宗法以嫡长子继承等规则维系贵族内部秩序；二者共同巩固等级政治网络。', operation: '画周王、诸侯、卿大夫层级，区分政治分封与血缘继承，再分析义务和长期离心风险。', example: { prompt: '分封制和宗法制为什么不能当作同一个制度？', reasoning: ['分封制主要安排地方政治权力、封土和朝贡军事义务。', '宗法制主要按血缘和嫡庶组织贵族继承与身份，二者互相支撑但功能不同。'], result: '应分别说明政治层级与血缘继承，再解释它们怎样结合。' } },
  { familyId: 'history-qin-han-unification', keywords: ['秦朝统一与中央集权', '西汉建立与文景之治', '汉武帝巩固统一'], teaching: '秦汉统一国家通过皇帝制度、中央官僚、郡县、法律财政和思想政策加强整合；秦与汉前后政策又体现治理成本和调整。', operation: '比较秦汉中央地方制度与政策力度，用财政、战争和社会恢复解释阶段变化。', example: { prompt: '汉初为何在继承秦朝统一制度的同时实行休养生息？', reasoning: ['长期战争造成经济凋敝和人口损失，恢复生产成为现实需要。', '汉朝保留统一国家基本框架，同时降低赋役以修复统治基础。'], result: '制度连续与政策调整可以并存，需从国家能力和社会条件解释。' } },
  { familyId: 'history-sui-tang-institutions', keywords: ['隋朝统一与制度建设', '唐朝政治与民族关系'], teaching: '隋唐在重新统一基础上发展中央官制、科举和地方治理，并通过战争、册封、和亲、羁縻等多种方式处理民族关系。', operation: '区分中央制度、选官和边疆互动，比较制度目标、执行范围与实际效果。', example: { prompt: '科举制为何能加强国家治理，却不能等同于现代平等考试？', reasoning: ['考试选官方式扩大了按才学进入官僚体系的渠道，并有利于中央吸纳人才。', '教育资源、身份条件和考试内容仍受当时社会结构限制。'], result: '评价应同时说明制度创新及其时代边界。' } },
  { familyId: 'history-chinese-culture', keywords: ['中华文明多元起源', '秦汉文化成就', '儒学发展', '中华文化的起源', '儒道思想', '佛教传入', '传统科技', '中华文化的连续性'], teaching: '中华文化发展要同时追踪多区域起源、制度整合、思想争鸣和中外交流；连续性通过选择、重释和制度载体维持，不等于内容从未变化。', operation: '定位时代与载体，比较思想或技术的原始语境、后世重释和社会影响。' },
  { familyId: 'history-frontier-ethnicity', keywords: ['多民族政权', '边疆治理', '民族国家形成', '民族关系'], teaching: '民族与边疆史要区分古代族群、政权和现代民族国家概念，分析战争、盟约、迁徙、行政与贸易等多种互动。', operation: '标出政权和区域，比较治理制度与实际联系，再从不同群体材料评价整合和冲突。' },
  { familyId: 'history-money-trade', keywords: ['货币使用与世界货币体系', '商业贸易的起源发展'], teaching: '货币降低交换成本并支持税收、信用和远距离贸易；世界货币地位还依赖经济实力、金融网络、制度信用和国际秩序。', operation: '追踪货币职能、流通范围与制度基础，区分贸易增长、货币化和金融化。' },
  { familyId: 'history-cultural-exchange', keywords: ['中外文化交流', '文明交流的主要方式', '传教士与中西知识交流', '战争征服与文化重组', '全球化时代的文化互动', '移民社会的文化认同'], teaching: '文化交流由商人、移民、战争、宗教和翻译等媒介推动，接收社会会选择、改写或抵制，传播不是原样复制。', operation: '画传播路线与媒介者，比较进入前后的内容变化，并呈现权力不平等和群体差异。' },
]

const exactHumanitiesConceptByTitle: Readonly<Record<string, ConceptFamily>> = {
  'chinese:《乡土中国》核心概念': {
    familyId: 'chinese-book-rural-china', keywords: [],
    teaching: '《乡土中国》用“乡土本色、差序格局、礼治秩序”等概念解释传统基层社会，概念之间互相限定，不能把“乡土”简单理解为落后。',
    operation: '从原文章节提取概念定义、机制和例证，再用当代材料检验适用范围而非直接套用。',
    example: { prompt: '怎样用“差序格局”分析一次人情往来而不把它等同于自私？', reasoning: ['差序格局描述以自己为中心、按关系亲疏推出不同责任的社会关系结构。', '分析要看资源和义务是否随关系圈层变化，还要寻找按公开规则行动的反例。'], result: '结论应限定为特定情境中关系亲疏影响责任安排，不能宣布现代社会所有行动都由私人关系支配。' },
  },
  'chinese:《红楼梦》人物关系': {
    familyId: 'chinese-book-red-chamber', keywords: [],
    teaching: '《红楼梦》人物关系同时受宗法辈分、婚姻利益、家族经济和私人情感制约；称谓、座次、馈赠和转述都是权力关系证据。',
    operation: '建立人物关系图，给每条关系附章回与场景证据，再追踪关键事件前后的变化。',
    example: { prompt: '王熙凤“未见其人，先闻其声”怎样显示她在贾府关系网中的位置？', reasoning: ['众人敛声屏气的礼法空间被她的笑声打破，显示特殊行动自由。', '贾母态度与她随即安排事务的语言进一步证明其管理权和察言观色能力。'], result: '声音、空间秩序和他人反应共同建立她在贾府中的权力位置，而非只说明“泼辣”。' },
  },
  'chinese:《论语》十二章的修身思想': {
    familyId: 'chinese-classics-analects', keywords: [],
    teaching: '《论语》十二章把“学、思、行、省”组织为持续修身过程；章句多为语录，需比较说话对象和概念在不同语境中的侧重。',
    operation: '疏通章句，归类学习、仁德与君子修养，再用相互补充或张力解释思想结构。',
    example: { prompt: '“学而不思则罔，思而不学则殆”怎样说明学习与思考的关系？', reasoning: ['“罔”指出只接受材料而不能形成理解，“殆”指出脱离学习依据的空想风险。', '句式对称并非简单折中，而是说明两种活动互为条件。'], result: '修身中的学习既需外在积累，也需主动反思；二者缺一都会使认识失去可靠性。' },
  },
  'chinese:《大学之道》的三纲八目': {
    familyId: 'chinese-classics-great-learning', keywords: [],
    teaching: '《大学之道》以明明德、亲民、止于至善为纲，以格物至平天下展开由个人修养到公共秩序的递进，但每一环关系都需按文本论证。',
    operation: '标出目标层与实践层，梳理修身作为连接个人和家国的枢纽，再评价递进的成立前提。',
    example: { prompt: '为什么“自天子以至于庶人，壹是皆以修身为本”是结构枢纽？', reasoning: ['它把不同身份共同置于修身要求之下，确立“本”。', '后文齐家、治国、平天下由此获得从个人德行向公共秩序推进的逻辑起点。'], result: '该句连接“三纲”的价值目标与“八目”的实践次序，不能只背成一句修身口号。' },
  },
  'chinese:孟子的恻隐之心与仁政': {
    familyId: 'chinese-classics-mencius', keywords: [],
    teaching: '孟子以“孺子将入于井”的共同心理经验说明恻隐是道德端绪，再由“不忍人之心”推到“不忍人之政”。',
    operation: '区分经验例证、性善前提和政治推论，检查由个人德性到制度实践的桥梁。',
    example: { prompt: '“恻隐之心，人皆有之”是否等于说人人行为都善？', reasoning: ['“端”是可扩充的萌芽，不是已经完成的德行。', '孟子强调保存、扩充并落实到行动和政治，说明现实中仍可能放失本心。'], result: '文本论证人人有道德可能性，而非断言人人所有行为天然正确。' },
  },
  'chinese:《老子》四章的辩证思维': {
    familyId: 'chinese-classics-laozi', keywords: [],
    teaching: '《老子》四章常以有无、难易、长短等相反概念揭示相互依存与转化，并以“无为”反思强制性作为。',
    operation: '找成对概念和转化条件，区分“不妄为”与“不行动”，再联系章句语境解释。',
    example: { prompt: '“有无相生，难易相成”是否意味着所有对立都会自动互换？', reasoning: ['“相生、相成”强调概念在关系中成立，例如没有“难”就难以界定“易”。', '文本没有取消具体条件，不能推成任意事物无条件转化。'], result: '辩证意义在于从关系和条件看对立，不是把“相反相成”当万能口号。' },
  },
  'chinese:《五石之瓠》的寓言论辩': {
    familyId: 'chinese-classics-zhuangzi', keywords: [],
    teaching: '《五石之瓠》借惠子“大而无用”的判断与庄子“何不虑以为大樽”的回应，讨论用途受眼界和使用情境限制。',
    operation: '还原惠子评价标准，分析庄子怎样转换用途和空间，再区分寓言启示与普遍证明。',
    example: { prompt: '庄子为何不直接否认大瓠“不能盛水”的事实？', reasoning: ['他承认按普通容器标准，大瓠因易裂而不好用。', '论辩转向“浮于江湖”的新用途，改变的是评价框架而非事实。'], result: '文本以用途重构反驳单一功利标准，说明“无用”常是情境化判断。' },
  },
  'chinese:《氓》的叙事结构与人物声音': {
    familyId: 'chinese-poem-mang', keywords: [],
    teaching: '《氓》以恋爱、婚变和决绝的时间推进，让女主人公由回忆叙述转向反思判断；“于嗟女兮”等议论使个体遭遇获得社会意义。',
    operation: '按事件阶段标出称谓、语气和叙述时点变化，再分析比兴与人物声音怎样互相支持。',
    example: { prompt: '“淇水汤汤，渐车帷裳”在叙事中有什么作用？', reasoning: ['淇水既是婚嫁行动的空间标志，也承接前后人生阶段。', '“汤汤”与“渐”形成可感场景，使回忆中的选择和后来遭遇具有时间距离。'], result: '这一景物不是固定悲情意象，而是叙事节点和人物回望婚姻的证据。' },
  },
  'chinese:《离骚》的香草美人传统': {
    familyId: 'chinese-poem-lisao', keywords: [],
    teaching: '《离骚》中的香草、美人通过佩饰、芳洁和求女等意象表达品格追求、政治理想与君臣关系，须结合上下文判断具体指向。',
    operation: '追踪意象出现位置、动作和对立物，区分自我品格、理想对象与政治寄托。',
    example: { prompt: '为什么不能把《离骚》中的“香草”只解释为自然景物？', reasoning: ['诗中对香草的栽培、佩戴与保持芳洁反复同主人公自我修养相连。', '香草又与恶草、众芳芜秽形成价值对照，承担政治伦理象征。'], result: '解释要同时保留具体物象和由文本反复关系建立的品格、政治寓意。' },
  },
  'chinese:阿Q的精神胜利法与叙事讽刺': {
    familyId: 'chinese-fiction-ahq', keywords: [],
    teaching: '阿Q的“精神胜利法”通过改写失败、转移屈辱和自我安慰维持心理优越；叙述者的冷静措辞与人物自我理解形成讽刺距离。',
    operation: '对照阿Q遭遇、内心改写和实际后果，区分人物语言与叙述者评价。',
    example: { prompt: '阿Q挨打后以“儿子打老子”自解，讽刺怎样形成？', reasoning: ['他在现实关系中受辱，却在想象辈分中把对手降为“儿子”。', '心理胜利没有改变受压迫事实，反而暴露其逃避现实和不能反抗。'], result: '讽刺来自自我叙述与客观处境的裂缝，不只是人物“可笑”。' },
  },
  'chinese:《边城》的风俗世界与人物命运': {
    familyId: 'chinese-fiction-border-town', keywords: [],
    teaching: '《边城》的渡口、端午竞渡、婚俗和人情网络既构成温厚风俗世界，也以含蓄规则和信息错位影响翠翠等人的选择与命运。',
    operation: '把风俗细节分为环境、关系规则和情节机制，分析诗意叙述下的限制与遗憾。',
    example: { prompt: '渡船为什么不只是故事背景？', reasoning: ['渡船连接两岸和往来人物，是翠翠日常生活与社会接触的空间。', '它也象征守候、往返和边界，使人物既连接外界又受固定生活位置约束。'], result: '渡口空间把地方生活、人物关系和等待命运组织在一起。' },
  },
  'chinese:《茶馆》的舞台冲突与时代缩影': {
    familyId: 'chinese-drama-teahouse', keywords: [],
    teaching: '《茶馆》以茶馆公共空间聚合不同阶层人物，通过人物更替、重复台词和经营困境压缩晚清到民国的时代变化。',
    operation: '结合幕次和人物身份，分析台词、出入场与空间秩序怎样把个人冲突连接到社会结构。',
    example: { prompt: '“莫谈国事”的纸条为何具有戏剧性？', reasoning: ['它表面是茶馆规避风险的经营规则，说明公开言说受到压制。', '社会危机不断进入茶馆，使禁令反复失效，形成现实与愿望的冲突。'], result: '道具把人物自保、公共空间和政治压迫连接起来，是时代环境的可见证据。' },
  },
  'chinese:《陈情表》的事理情交融': {
    familyId: 'chinese-prose-chenqing', keywords: [],
    teaching: '《陈情表》面对朝廷征召，以祖母病笃和自己孤弱的事实为“情”，以忠孝次序、期限和可验证处境为“理”，建立拒召的正当性。',
    operation: '还原陈情对象和风险，区分事实、情感与推理，再看措辞如何维护君臣礼法。',
    example: { prompt: '“臣无祖母，无以至今日；祖母无臣，无以终余年”怎样加强说服？', reasoning: ['对称句先写祖母过去养育之恩，再写当下祖母依赖，形成双向责任。', '它把私人情感转为不可替代的现实照料义务，为“先尽孝后尽忠”提供依据。'], result: '情感由具体关系和现实后果支撑，因而不仅是哭诉。' },
  },
  'chinese:《项脊轩志》的日常细节与情感': {
    familyId: 'chinese-prose-xiangjixuan', keywords: [],
    teaching: '《项脊轩志》以书斋兴废串联家族变迁，用“东犬西吠”、门墙变动、祖母与妻子的日常细节承载物是人非之感。',
    operation: '按轩的空间变化组织时间，辨认细节所指人物关系，再解释克制叙述怎样积累情感。',
    example: { prompt: '结尾“庭有枇杷树，吾妻死之年所手植也，今已亭亭如盖矣”为何动人？', reasoning: ['树的生长把妻子去世后的漫长时间变成可见尺度。', '句子不直接呼喊悲痛，而以“手植”和“亭亭如盖”让生命成长反衬人的缺席。'], result: '日常物象、时间跨度和节制语气共同形成深沉悼念。' },
  },
  'chinese:《兰亭集序》的叙事转折与生死之思': {
    familyId: 'chinese-prose-lanting', keywords: [],
    teaching: '《兰亭集序》先叙暮春修禊与游目骋怀之乐，再由“俯仰之间”转向盛事难永和生死感慨，并以批评“一死生”确立态度。',
    operation: '划分宴集、感慨和作序目的，抓时间词与判断句，解释转折如何由个体体验走向后人共感。',
    example: { prompt: '“固知一死生为虚诞，齐彭殇为妄作”表明怎样的生死态度？', reasoning: ['作者明确否定把生死、寿夭完全等同的玄谈。', '这种否定承接对昔人感慨的共鸣，使珍惜现实生命和记录当下成为作序理由。'], result: '文章承认生命有限带来的悲感，却不以抽象齐物取消真实的生死差别。' },
  },
  'chinese:《归去来兮辞》的辞赋节奏与人格选择': {
    familyId: 'chinese-prose-guiqulai', keywords: [],
    teaching: '《归去来兮辞》以“归去来兮”的反复、语气词和铺陈形成行进节奏，把弃官归田写成对生活方式和人格自主的主动选择。',
    operation: '追踪归途、归家、田园和未来四层空间，分析语气、动作与自我问答怎样推进选择。',
    example: { prompt: '“悟已往之不谏，知来者之可追”怎样表现转变？', reasoning: ['“已往”承认过去出仕选择不能挽回，“来者”把注意转向仍可决定的未来。', '“悟、知”呈现认识变化，为后文实际归行动作提供心理起点。'], result: '文本不是消极逃避的单句宣言，而是由反省到行动的选择过程。' },
  },
  'chinese:人物通讯的现场感': {
    familyId: 'chinese-journalism-profile', keywords: [], teaching: '人物通讯的现场感来自可核验的时间地点、观察所得动作语言、采访引语和背景材料；文学化表达不能虚构事实。', operation: '区分记者目击、采访转述和资料背景，给关键细节标来源，再解释其人物意义。',
    example: { prompt: '“工人很辛苦”怎样改成有来源的现场证据？', reasoning: ['记录工作时间、环境和连续动作，如“凌晨四点，他第三次检查阀门读数”。', '再用本人或同事引语补充原因，并注明采访情境，避免替人物编造心理。'], result: '现场细节必须既具体又可追溯，才能同时建立真实感和人物解释。' },
  },
  'chinese:山水游记的情景关系': {
    familyId: 'chinese-classical-landscape', keywords: [], teaching: '山水游记以行踪和视角组织景物，景物的明暗、动静与可达性又映照游者处境；“景”和“情”要通过具体观察与转折相连。', operation: '画游踪，标视角和景物状态，找议论抒情转折，再说明景物怎样触发或修正感受。',
    example: { prompt: '分析游记不能只写“借景抒情”，还应补什么？', reasoning: ['先指出游者从何处到何处、看见怎样的水石林泉以及景物的动作和色调。', '再找感受出现的位置，解释空间变化或景物特征怎样引出情绪与观点。'], result: '情景关系是游踪、观察和感受的因果链，不是可套用标签。' },
  },
  'chinese:史传叙事的剪裁': {
    familyId: 'chinese-classical-biography', keywords: [], teaching: '史传叙事通过详略、对话、互见和评论选择人物关键行动；剪裁标准服务于人物评价和历史因果，而非完整记录一生。', operation: '列事件时间线，对照文本详略和省略，判断哪些选择承担性格、局势或评价功能。',
    example: { prompt: '史传为何常详写危急时的一段对话，却略写多年日常？', reasoning: ['危急对话迫使人物公开立场并作出有后果的选择，证据密度高。', '日常经历若不改变关系和结果，可由概述承担，避免冲淡评价焦点。'], result: '详略体现史家的解释重点，但仍要结合史料来源判断叙述可靠性。' },
  },
  'chinese:媒介信息真伪判断': {
    familyId: 'chinese-media-verification', keywords: [], teaching: '媒介核验先追溯原始发布者、时间、完整上下文和数据口径，再用相互独立来源互证；转发量和画面冲击力都不是真实性证据。', operation: '反向搜源，核对日期地点和剪辑，查原始数据与方法，最后给出有限可信度结论。',
    example: { prompt: '一段“今日上海暴雨”的短视频怎样核验？', reasoning: ['检查最早上传时间、地标和天气记录，排除旧视频或异地画面。', '寻找气象部门、现场多角度影像等独立来源，并检查字幕是否截断原语境。'], result: '只有来源、时空和内容相互吻合，才能把视频作为当前事件证据。' },
  },
  'chinese:比较阅读的异同论证': {
    familyId: 'chinese-poetry-comparison', keywords: [], teaching: '诗歌比较先分别建立“字词—画面—处境—情感”证据链，再在题材、意象、章法和语言风格的共同维度上解释异同。', operation: '分别细读，确定共同维度，引用双方证据，最后解释差异来自何种时空、身份或表达选择。',
    example: { prompt: '两首诗都写月亮，能否直接概括为“都表达思乡”？', reasoning: ['要检查月的修饰、动作、观看者和同现意象，一首可能写团聚，一首可能写时间流逝。', '即使情感相近，也需比较月在转折、视角和章法中的不同功能。'], result: '共同物象只是比较起点，结论必须由两首诗各自的语境证据支持。' },
  },
  'english:Academic poster and oral defense': {
    familyId: 'english-research-poster', keywords: [], teaching: 'An academic poster makes question, method, result and limitation visible at a glance; an oral defense explains choices and answers challenges with evidence rather than reading every line.', operation: 'Prioritise one claim per visual block, label axes and sources, rehearse a short evidence chain, and prepare answers on method and limitation.',
    example: { prompt: 'What should a poster show beside a graph of survey results?', reasoning: ['Readers need the sample, measure, units and key result to interpret the visual.', 'A limitation such as self-selection should appear near the conclusion, not be hidden in speech.'], result: 'The graph, caption and spoken explanation should form one traceable claim–evidence–limitation chain.' },
  },
}

const conceptFamiliesBySubject: Partial<Record<SubjectId, ConceptFamily[]>> = {
  chinese: [...chineseConceptFamilies, ...chineseSupplementalFamilies],
  english: [...englishConceptFamilies, ...englishSupplementalFamilies],
  politics: [...politicsConceptFamilies, ...politicsSupplementalFamilies],
  history: [...historyConceptFamilies, ...historySupplementalFamilies],
}

const templatesBySubject: Partial<Record<SubjectId, LessonTemplate[]>> = {
  chinese: chineseTemplates,
  english: englishTemplates,
  politics: politicsTemplates,
  history: historyTemplates,
}

const fallbackBySubject: Partial<Record<SubjectId, (context: LessonContext) => LessonContent>> = {
  chinese: ({ title, unitTitle, unitFocus }) => lesson('chinese-evidence-fallback', {
    guidingQuestion: `“${title}”在“${unitTitle}”中承担什么作用，哪些具体语言证据能够支持判断？`,
    core: '语文分析必须从可定位的字词、句段或结构现象出发，解释表达选择如何影响内容、关系和读者感受。',
    explanation: [
      `本单元关注“${unitFocus}”。先把“${title}”转化为一个需要文本回答的问题，再选择两处功能不同的证据：一处建立主要判断，一处提供转折、照应或反例。`,
      '完整答案应包含“证据是什么—语言或结构特征是什么—它怎样产生意义—结论边界是什么”。如果换一篇文章仍能原样套用，说明分析还没有落到文本。',
    ],
    steps: [
      { label: '提出判断', detail: '用一个包含对象、特征和作用的完整句作答，不先堆术语。' },
      { label: '选择双证据', detail: '引用短而准确的字词或概括关键段落，标明位置与上下文。' },
      { label: '解释并限定', detail: '逐词解释作用，补充另一种可能理解，再依据全文取舍。' },
    ],
    example: {
      prompt: '句子“他把信折好，又展开；走到门口，却把它压在杯底”如何表现人物心理？',
      reasoning: [
        '“折好—展开”形成反复动作，显示寄信决定尚未稳定；“走到门口”表明他已接近行动。',
        '“却”使动作逆转，“压在杯底”不是普通收纳，而是主动延迟或压下表达，强化犹疑与克制。',
      ],
      result: '连续动作和转折词把看不见的心理冲突外化：人物想传达信息，却在行动临界点选择暂时压抑。',
    },
    selfCheck: {
      question: '怎样判断一个细节是“典型细节”而非普通信息？',
      answer: '它应在关键情境中揭示人物稳定倾向、推动关系或情节，并与前后细节形成重复、对照或转折。',
    },
    pitfall: '不要使用“生动形象、表达感情、突出主题”作为终点；必须回答生动在哪里、何种感情、主题的哪层关系。',
  }),
  english: ({ title, unitTitle, unitFocus }) => lesson('english-form-meaning-fallback', {
    guidingQuestion: `How does “${title}” contribute to meaning and communication in the unit “${unitTitle}”?`,
    core: 'Language choices must be explained through form, contextual meaning, discourse function and audience effect rather than an isolated rule.',
    explanation: [
      `This unit focuses on “${unitFocus}”. Start by identifying the communicative task and the exact evidence, then explain what relation the wording encodes: time, cause, contrast, stance, reference or information focus.`,
      'A transferable answer compares at least one alternative. If both forms are grammatical, state how they change certainty, politeness, emphasis or register; if one is wrong, name the structural conflict rather than saying it “sounds strange”.',
    ],
    steps: [
      { label: 'Set the context', detail: 'Identify speaker or writer, audience, purpose, genre and the information already shared.' },
      { label: 'Analyse the choice', detail: 'Name the grammatical, lexical or discourse pattern and show what relation it expresses.' },
      { label: 'Test an alternative', detail: 'Replace or reorder the form, then explain the precise change in meaning or acceptability.' },
    ],
    example: {
      prompt: 'Compare “Could you close the window?” with “Close the window.” in a classroom.',
      reasoning: [
        'Both aim at the same physical action, but the interrogative modal form presents it as a request and leaves conventional room for a response.',
        'The imperative foregrounds authority or urgency; it may be suitable during an emergency but unnecessarily abrupt in an ordinary peer interaction.',
      ],
      result: 'Grammar encodes social meaning: correctness depends not only on the intended action but also on relationship, urgency and register.',
    },
    selfCheck: {
      question: 'What four questions make a useful language note?',
      answer: 'What form is used, what it means here, what discourse job it performs, and how an alternative would change meaning or register.',
    },
    pitfall: 'Do not justify a choice only with “native speakers say so”; give a structural, semantic, collocational or pragmatic reason that can be tested in another sentence.',
  }),
  politics: ({ title, unitTitle, unitFocus }) => lesson('politics-subject-mechanism-fallback', {
    guidingQuestion: `怎样用主体、制度条件和因果机制解释“${title}”，而不是复述材料口号？`,
    core: '政治材料题应把教材概念转化为分析工具：先确定主体和设问范围，再从条件、行为、机制、结果与边界形成闭合推理。',
    explanation: [
      `“${unitTitle}”的单元重点是“${unitFocus}”。答题时先区分题目要求原因、意义、措施还是辨析观点；同一材料在不同设问下需要不同的推理方向。`,
      '每个得分点应同时包含材料事实和教材概念，并用动词说明机制，例如“公开预算使监督主体获得信息，从而降低权力运行的不透明”，而非只列“民主、法治、公平”。',
    ],
    steps: [
      { label: '定位设问主体', detail: '圈出知识范围、行为主体、对象和“为什么/怎么办/如何体现”等任务词。' },
      { label: '匹配概念证据', detail: '为每个材料细节选择边界准确的教材概念，不越级扩大。' },
      { label: '构造机制链', detail: '写成“依据或条件—主体行为—作用机制—结果”，并补充适用边界。' },
    ],
    example: {
      prompt: '社区公开停车费收支、邀请居民议事并对方案表决，这些措施为何能改善治理？',
      reasoning: [
        '公开收支降低信息不对称，使居民能依据数据监督公共资金；议事让不同需求进入协商。',
        '表决把意见转为共同决定，但仍需符合上位规则并保障少数群体合理权利，不能简单多数压倒一切。',
      ],
      result: '措施通过信息公开、民主协商和规范决策提升基层治理的透明度与认同，同时受法治和权利保障约束。',
    },
    selfCheck: {
      question: '为什么“有利于促进社会发展”通常不是完整意义题答案？',
      answer: '它没有指出促进哪方面、通过什么机制、影响哪个主体，也无法与材料细节形成对应。',
    },
    pitfall: '不要把同一主体的“权利、权力、职能、义务”混用；公民享有权利，国家机关依法行使权力并履行职能。',
  }),
  history: ({ title, unitTitle, unitFocus }) => lesson('history-context-evidence-fallback', {
    guidingQuestion: `怎样把“${title}”放回“${unitTitle}”的具体时空，并用证据解释变化？`,
    core: '历史解释必须同时交代时空、行动主体、结构条件、事件过程和证据来源，并区分当时人的选择与后人的评价。',
    explanation: [
      `本单元强调“${unitFocus}”。先建立事件前后的时间节点和空间范围，再确认不同群体拥有的资源、目标与信息，避免用结果反推当时必然发生。`,
      '材料只能支持有限命题。把制度文件与实际执行、宏观数据与个人经验、短期结果与长期影响分开，再通过互证说明结论为何成立以及在哪些地区或群体中不完全成立。',
    ],
    steps: [
      { label: '定位时空主体', detail: '写明年代、地区、阶段及主要行动者的目标和约束。' },
      { label: '建立变化链', detail: '比较前后制度或社会指标，用机制连接原因、过程与影响。' },
      { label: '核对史料边界', detail: '说明证据来源、可证明内容、沉默之处和可互证材料。' },
    ],
    example: {
      prompt: '某地县志称新政“民皆称便”，能否据此认定所有居民都支持？',
      reasoning: [
        '县志反映地方官府如何记述政策及其希望呈现的治理效果，但“民皆”是高度概括，缺少调查范围。',
        '应与税册、诉讼记录、士绅书信和普通居民生活资料互证，并区分受益群体与承担成本者。',
      ],
      result: '材料可证明官方将政策描述为受欢迎，不能单独证明所有居民真实态度一致。',
    },
    selfCheck: {
      question: '历史影响为什么要区分短期和长期？',
      answer: '同一事件可能短期未达目标，却改变思想、组织或制度条件；也可能短期有效而长期产生新矛盾。',
    },
    pitfall: '不要用“促进了历史发展”概括所有影响；需明确改变了何种制度、经济关系、群体处境或国际联系。',
  }),
}

const findConceptFamily = (
  subjectId: SubjectId,
  context: LessonContext,
  route?: RegressionRoute,
) => {
  const exact = exactHumanitiesConceptByTitle[`${subjectId}:${context.title}`]
  if (exact) return exact

  const families = conceptFamiliesBySubject[subjectId] ?? []
  const routed = route ? families.find((family) => family.familyId === route.familyId) : undefined
  if (routed) return routed

  return families
    .filter((family) => matches(context, family.keywords))
    .sort((left, right) => matchScore(context, right.keywords) - matchScore(context, left.keywords))[0]
}

const topicTemplateSuffix = (subjectId: SubjectId, title: string) => {
  let hash = 2166136261
  for (const character of `${subjectId}:${title}`) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

const buildConceptApplicationExample = (
  subjectId: SubjectId,
  context: LessonContext,
  concept: ConceptFamily,
): LessonExample => {
  if (subjectId === 'english') {
    return {
      prompt: `A learner writes, “${context.title} is important and makes the text better.” How can this be turned into a testable answer?`,
      reasoning: [
        `First apply the actual rule or relation: ${concept.teaching}`,
        `Then follow a visible procedure instead of adding praise: ${concept.operation}`,
      ],
      result: `A complete answer about “${context.title}” must name the form or evidence, explain the relation it encodes, and limit the conclusion to the audience, text or data given.`,
    }
  }

  return {
    prompt: `某答案只写“${context.title}很重要，产生了深远影响”。怎样把它改成有概念、有证据的回答？`,
    reasoning: [
      `先落实本题的专门概念或规则：${concept.teaching}`,
      `再执行可检查的分析步骤：${concept.operation}`,
    ],
    result: `改写后的答案必须明确“${context.title}”涉及的对象、关系、证据和成立条件，不能以“重要、促进、体现”代替机制。`,
  }
}

const specializeLesson = (
  subjectId: SubjectId,
  context: LessonContext,
  base: LessonContent,
  route?: RegressionRoute,
): LessonContent => {
  const concept = findConceptFamily(subjectId, context, route)
  const familyId = route?.familyId ?? concept?.familyId ?? base.templateId
  const teaching = concept?.teaching ?? base.core
  const operation = concept?.operation ?? base.steps[0].detail

  return {
    ...base,
    templateId: `${familyId}--${topicTemplateSuffix(subjectId, context.title)}`,
    core: `“${context.title}”的核心概念是：${teaching}`,
    explanation: [
      `本题位于“${context.unitTitle}”，单元要求是“${context.unitFocus}”。具体学习“${context.title}”时，不能只复述标题，而要落实下面的概念关系：${teaching}`,
      base.explanation[1],
    ],
    steps: [
      { label: base.steps[0].label, detail: operation },
      base.steps[1],
      base.steps[2],
    ],
    example: concept?.example ?? (concept ? buildConceptApplicationExample(subjectId, context, concept) : base.example),
    pitfall: concept?.pitfall ?? base.pitfall,
  }
}

export function buildHumanitiesLesson(
  subjectId: SubjectId,
  context: LessonContext,
): LessonContent | undefined {
  const templates = templatesBySubject[subjectId]
  if (!templates) return undefined

  const route = humanitiesRegressionTemplateByTitle[`${subjectId}:${context.title}`]
  const routedTemplate = route
    ? templates.find((template) => template.templateId === route.baseTemplateId)
    : undefined
  const matched = routedTemplate ?? templates
    .filter((template) => matches(context, template.keywords))
    .sort((left, right) => matchScore(context, right.keywords) - matchScore(context, left.keywords))[0]

  const built = matched
    ? lesson(matched.templateId, matched.build(context))
    : fallbackBySubject[subjectId]?.(context)
  return built ? specializeLesson(subjectId, context, built, route) : undefined
}
