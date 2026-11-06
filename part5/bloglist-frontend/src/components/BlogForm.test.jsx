import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('<BlogForm /> calls createBlog with the right details', async () => {
  const createBlog = vi.fn()
  const userEvt = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  await userEvt.type(screen.getByLabelText('title'), 'Testing forms')
  await userEvt.type(screen.getByLabelText('author'), 'Bob')
  await userEvt.type(screen.getByLabelText('url'), 'http://example.org')
  await userEvt.click(screen.getByText('create'))

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'Testing forms',
    author: 'Bob',
    url: 'http://example.org',
  })
})
