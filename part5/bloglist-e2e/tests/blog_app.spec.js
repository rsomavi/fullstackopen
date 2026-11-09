const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, likeBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: { name: 'Superuser', username: 'root', password: 'salainen' },
    })

    await page.goto('/')
  })

  // 5.17
  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  // 5.18
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

    // 5.19
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'E2E testing with Playwright', 'Ann', 'http://example.com/e2e')

      await expect(
        page.locator('.blog').filter({ hasText: 'E2E testing with Playwright' })
      ).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'Blog to interact with', 'Ann', 'http://example.com/one')
      })

      // 5.20
      test('a blog can be liked', async ({ page }) => {
        await likeBlog(page, 'Blog to interact with', 1)

        const blog = page.locator('.blog').filter({ hasText: 'Blog to interact with' })
        await expect(blog).toContainText('likes 1')
      })

      // 5.21
      test('the creator can delete the blog', async ({ page }) => {
        page.on('dialog', (dialog) => dialog.accept())

        const blog = page.locator('.blog').filter({ hasText: 'Blog to interact with' })
        await blog.getByRole('button', { name: 'view' }).click()
        await blog.getByRole('button', { name: 'remove' }).click()

        await expect(
          page.locator('.blog').filter({ hasText: 'Blog to interact with' })
        ).toHaveCount(0)
      })

      // 5.22
      test('only the creator sees the delete button', async ({ page, request }) => {
        const blog = page.locator('.blog').filter({ hasText: 'Blog to interact with' })
        await blog.getByRole('button', { name: 'view' }).click()
        await expect(blog.getByRole('button', { name: 'remove' })).toBeVisible()

        await request.post('/api/users', {
          data: { name: 'Other User', username: 'other', password: 'salainen' },
        })

        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, 'other', 'salainen')
        await expect(page.getByText('Other User logged in')).toBeVisible()

        const sameBlog = page.locator('.blog').filter({ hasText: 'Blog to interact with' })
        await sameBlog.getByRole('button', { name: 'view' }).click()

        await expect(sameBlog.getByText('http://example.com/one')).toBeVisible()
        await expect(sameBlog.getByRole('button', { name: 'remove' })).toHaveCount(0)
      })
    })

    // 5.23
    test('blogs are ordered by likes, most liked first', async ({ page }) => {
      await createBlog(page, 'Blog A', 'Ann', 'http://example.com/a')
      await createBlog(page, 'Blog B', 'Bob', 'http://example.com/b')
      await createBlog(page, 'Blog C', 'Cat', 'http://example.com/c')

      await likeBlog(page, 'Blog B', 3)
      await likeBlog(page, 'Blog C', 1)
      await likeBlog(page, 'Blog A', 2)

      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('Blog B')
      await expect(blogs.nth(1)).toContainText('Blog A')
      await expect(blogs.nth(2)).toContainText('Blog C')
    })
  })
})
