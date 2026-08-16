import { expect, test } from '@playwright/test'

const catalog = [
  ['数学', ['函数变换', '概率模拟']],
  ['物理', ['抛体运动', '波的叠加']],
  ['化学', ['化学平衡', '酸碱滴定']],
  ['生物', ['遗传组合', '酶的活性']],
  ['语文', ['论证结构', '诗词意象']],
  ['英语', ['句法拆解', '时态轴']],
  ['历史', ['近代时间轴', '工业革命']],
  ['地理', ['正午太阳高度', '热力环流']],
  ['思想政治', ['供给与需求', '国民经济循环']],
] as const

test('all subject labs render without browser errors', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Desktop sidebar traversal')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')

  for (const [subject, topics] of catalog) {
    await page.locator('.subject-sidebar nav button').filter({ hasText: subject }).click()
    for (const topic of topics) {
      await page.getByRole('tab', { name: new RegExp(topic) }).click()
      await expect(page.locator('.lab-frame')).toBeVisible()
      await expect(page.locator('.visual-panel').locator(':scope > svg, :scope > .equilibrium-vessel, :scope > .punnett-wrap, :scope > .argument-map, :scope > .syntax-tree, :scope > .revolution-network, :scope > .economy-flow').first()).toBeVisible()
    }
  }

  expect(errors).toEqual([])
})

test('grade and subject filters update the available topics', async ({ page }) => {
  await page.goto('/')
  await page.locator('.grade-filter button', { hasText: '高三' }).click()
  await expect(page.getByRole('tab', { name: /概率模拟/ })).toBeVisible()
  await expect(page.getByRole('tab', { name: /函数变换/ })).toHaveCount(0)

  await page.locator('.grade-filter button', { hasText: '高一' }).click()
  await expect(page.getByRole('tab', { name: /函数变换/ })).toBeVisible()
  await expect(page.getByRole('tab', { name: /概率模拟/ })).toHaveCount(0)

  await page.getByPlaceholder('搜索学科或知识点').fill('太阳')
  await page.getByRole('option', { name: /正午太阳高度/ }).click()
  await expect(page.getByRole('heading', { name: '地理实验台' })).toBeVisible()
})

test('mobile layout has no document-level horizontal overflow', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile viewport only')
  await page.goto('/')
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1)
  await expect(page.locator('.mobile-subjects')).toBeVisible()
  await expect(page.locator('.subject-sidebar')).toBeHidden()
})
