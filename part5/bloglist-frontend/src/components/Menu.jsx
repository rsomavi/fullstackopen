import { Link } from 'react-router-dom'

const Menu = ({ user, handleLogout }) => {
  const padding = { padding: 5 }

  return (
    <div>
      <Link style={padding} to="/">blogs</Link>
      {user && <Link style={padding} to="/create">create new</Link>}
      {user ? (
        <span>
          {user.name} logged in
          <button onClick={handleLogout}>logout</button>
        </span>
      ) : (
        <Link style={padding} to="/login">login</Link>
      )}
    </div>
  )
}

export default Menu