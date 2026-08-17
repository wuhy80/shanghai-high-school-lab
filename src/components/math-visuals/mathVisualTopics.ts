export function isMathVisualTopicId(topicId: string) {
  return /^g1[0-2]-[12]-math-t\d+$/.test(topicId)
}
