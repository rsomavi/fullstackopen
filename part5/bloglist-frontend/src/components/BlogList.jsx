import { Link } from 'react-router-dom'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'

const BlogList = ({ blogs }) => {
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <Typography variant="h4" component="h2" sx={{ mt: 3, mb: 2 }}>
        blogs
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>title</TableCell>
              <TableCell>author</TableCell>
              <TableCell>likes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBlogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell>
                  <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
                </TableCell>
                <TableCell>{blog.author}</TableCell>
                <TableCell>{blog.likes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default BlogList