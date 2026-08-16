export type SubjectId =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'chinese'
  | 'english'
  | 'history'
  | 'geography'
  | 'politics'

export type Topic = {
  id: string
  title: string
  chapter: string
  description: string
  grades: Grade[]
}

export type Grade = '高一' | '高二' | '高三'

export type Subject = {
  id: SubjectId
  name: string
  label: string
  topics: Topic[]
}

export const subjects: Subject[] = [
  {
    id: 'math',
    name: '数学',
    label: 'MATHEMATICS',
    topics: [
      { id: 'function', title: '函数变换', chapter: '函数与分析', description: '参数如何改变二次函数的形状与位置', grades: ['高一'] },
      { id: 'probability', title: '概率模拟', chapter: '概率与统计', description: '从随机试验观察频率的稳定趋势', grades: ['高二', '高三'] },
    ],
  },
  {
    id: 'physics',
    name: '物理',
    label: 'PHYSICS',
    topics: [
      { id: 'projectile', title: '抛体运动', chapter: '机械运动', description: '初速度与角度共同决定运动轨迹', grades: ['高一', '高二'] },
      { id: 'wave', title: '波的叠加', chapter: '机械振动与波', description: '观察相位差引起的加强与减弱', grades: ['高二', '高三'] },
    ],
  },
  {
    id: 'chemistry',
    name: '化学',
    label: 'CHEMISTRY',
    topics: [
      { id: 'equilibrium', title: '化学平衡', chapter: '化学反应原理', description: '外界条件改变时平衡如何移动', grades: ['高一', '高二'] },
      { id: 'titration', title: '酸碱滴定', chapter: '水溶液中的反应', description: '滴定过程中 pH 的非线性变化', grades: ['高二', '高三'] },
    ],
  },
  {
    id: 'biology',
    name: '生物',
    label: 'BIOLOGY',
    topics: [
      { id: 'genetics', title: '遗传组合', chapter: '遗传与进化', description: '用棋盘格追踪等位基因的组合', grades: ['高二', '高三'] },
      { id: 'enzyme', title: '酶的活性', chapter: '细胞代谢', description: '温度和 pH 对酶促反应的影响', grades: ['高一', '高二'] },
    ],
  },
  {
    id: 'chinese',
    name: '语文',
    label: 'CHINESE',
    topics: [
      { id: 'argument', title: '论证结构', chapter: '思辨性阅读与表达', description: '辨认论点、理由、证据与结论', grades: ['高二', '高三'] },
      { id: 'imagery', title: '诗词意象', chapter: '文学阅读与鉴赏', description: '从典型意象进入情境与情感', grades: ['高一', '高二'] },
    ],
  },
  {
    id: 'english',
    name: '英语',
    label: 'ENGLISH',
    topics: [
      { id: 'syntax', title: '句法拆解', chapter: '语言知识运用', description: '将复杂句拆成主干与修饰成分', grades: ['高二', '高三'] },
      { id: 'tense', title: '时态轴', chapter: '语法体系', description: '用时间关系理解常用英语时态', grades: ['高一', '高二'] },
    ],
  },
  {
    id: 'history',
    name: '历史',
    label: 'HISTORY',
    topics: [
      { id: 'timeline', title: '近代时间轴', chapter: '中国近现代史', description: '把上海节点放回全国历史进程', grades: ['高二', '高三'] },
      { id: 'revolution', title: '工业革命', chapter: '世界近代史', description: '比较两次工业革命的动力与影响', grades: ['高一', '高二'] },
    ],
  },
  {
    id: 'geography',
    name: '地理',
    label: 'GEOGRAPHY',
    topics: [
      { id: 'solar', title: '正午太阳高度', chapter: '地球运动', description: '纬度与日期如何改变太阳高度', grades: ['高一', '高二'] },
      { id: 'circulation', title: '热力环流', chapter: '大气运动', description: '地表冷热不均如何驱动空气运动', grades: ['高一', '高三'] },
    ],
  },
  {
    id: 'politics',
    name: '思想政治',
    label: 'POLITICS',
    topics: [
      { id: 'market', title: '供给与需求', chapter: '经济与社会', description: '曲线移动如何改变均衡价格与数量', grades: ['高一', '高三'] },
      { id: 'flow', title: '国民经济循环', chapter: '经济与社会', description: '追踪居民、企业与政府间的流动', grades: ['高二', '高三'] },
    ],
  },
]

export const findTopic = (topicId: string) => {
  for (const subject of subjects) {
    const topic = subject.topics.find((item) => item.id === topicId)
    if (topic) return { subject, topic }
  }
  return undefined
}
