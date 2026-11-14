import { render, screen } from '@testing-library/react'
import BlogView from './BlogView'

const blog = {
  title: 'Testing React',
  author: 'Ann',
  url: 'http://example.com',
  likes: 3,
  user: { username: 'root', name: 'Superuser' },
}

describe('<BlogView />', () => {
  test('unauthenticated users see the info but no buttons', () => {
    render(<BlogView blog={blog} user={null} />)

    screen.getByText(/Testing React/)
    screen.getByText('http://example.com')
    screen.getByText(/likes 3/)

    expect(screen.queryByRole('button', { name: 'like' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()
  })

  test('a logged in user who is not the creator only sees the like button', () => {
    const other = { username: 'other', name: 'Other User' }
    render(<BlogView blog={blog} user={other} />)

    screen.getByRole('button', { name: 'like' })
    expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()
  })

  test('the creator sees the remove button too', () => {
    const creator = { username: 'root', name: 'Superuser' }
    render(<BlogView blog={blog} user={creator} />)

    screen.getByRole('button', { name: 'like' })
    screen.getByRole('button', { name: 'remove' })
  })
})