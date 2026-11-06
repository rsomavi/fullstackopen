import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const blog = {
  title: 'Testing React',
  author: 'Ann',
  url: 'http://example.com',
  likes: 3,
  user: { username: 'root', name: 'Superuser' },
}

const user = { username: 'root', name: 'Superuser' }

describe('<Blog />', () => {
  // 5.13
  test('renders title and author but not url or likes by default', () => {
    render(<Blog blog={blog} user={user} />)

    screen.getByText(/Testing React/)
    screen.getByText(/Ann/)

    expect(screen.queryByText('http://example.com')).toBeNull()
    expect(screen.queryByText(/likes 3/)).toBeNull()
  })

  // 5.14
  test('shows url and likes after clicking the view button', async () => {
    render(<Blog blog={blog} user={user} />)

    const userEvt = userEvent.setup()
    await userEvt.click(screen.getByText('view'))

    screen.getByText('http://example.com')
    screen.getByText(/likes 3/)
  })

  // 5.15
  test('clicking like twice calls the event handler twice', async () => {
    const likeBlog = vi.fn()

    render(<Blog blog={blog} user={user} likeBlog={likeBlog} />)

    const userEvt = userEvent.setup()
    await userEvt.click(screen.getByText('view'))

    const likeButton = screen.getByText('like')
    await userEvt.click(likeButton)
    await userEvt.click(likeButton)

    expect(likeBlog.mock.calls).toHaveLength(2)
  })
})