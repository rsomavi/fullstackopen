const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: { name: 'Superuser', username: 'root', password: 'salainen' },
    })

    await page.goto('/')
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'root', 'salainen')
      await expect(page.getByText('Superuser logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'root', 'wrong')

      await expect(page.getByText('wrong username or password')).toBeVisible()
      await expect(page.getByText('Superuser logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'root', 'salainen')
      await expect(page.getByText('Superuser logged in')).toBeVisible()
    })

    test('a blog can be created', async ({ page }) => {
      await createBlog(page, 'E2E with Playwright', 'Ann', 'http://example.com/e2e')

      await expect(page.getByRole('link', { name: 'E2E with Playwright' })).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Blog to like', 'Ann', 'http://example.com/like')

      await page.getByRole('link', { name: 'Blog to like' }).click()
      await page.getByRole('button', { name: 'like' }).click()

      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('a blog can be deleted', async ({ page }) => {
      page.on('dialog', (dialog) => dialog.accept())

      await createBlog(page, 'Blog to delete', 'Ann', 'http://example.com/del')

      await page.getByRole('link', { name: 'Blog to delete' }).click()
      await page.getByRole('button', { name: 'remove' }).click()

      await expect(page.getByRole('link', { name: 'Blog to delete' })).toHaveCount(0)
    })
  })
})