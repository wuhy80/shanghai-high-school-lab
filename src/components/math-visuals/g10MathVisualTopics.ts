export const SET_LOGIC_INEQUALITY_TOPICS = [
  '集合的表示与元素关系', '子集与集合相等', '交集并集与补集', '命题及其否定', '充分条件与必要条件',
  '一元二次方程根的结构', '一元二次不等式', '分式不等式', '基本不等式及等号条件', '绝对值不等式',
] as const

export const POWER_LOG_TOPICS = [
  '幂与分数指数幂', '指数幂的运算', '对数概念与换底', '对数运算与定义域', '指数增长与衰减',
] as const

export const FUNCTION_MODEL_TOPICS = [
  '函数定义域与值域', '函数的单调性', '函数的奇偶性', '函数的零点', '函数图像与参数变换',
  '分段函数与实际计费', '幂函数模型', '指数函数模型', '对数函数模型', '函数模型的比较与检验',
] as const

export const G10_MATH_VISUAL_TOPICS = [
  ...SET_LOGIC_INEQUALITY_TOPICS,
  ...POWER_LOG_TOPICS,
  ...FUNCTION_MODEL_TOPICS,
] as const

export function isG10MathVisualTopicId(topicId: string) {
  return topicId.startsWith('g10-1-math-')
}
