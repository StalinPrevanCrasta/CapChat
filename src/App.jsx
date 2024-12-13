import { useState } from 'react'
import './App.css'
import Chat from './Chat'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Error connecting to server');
      console.error('Error registering user:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Error connecting to server');
      console.error('Error logging in:', error);
    }
  };

  if (isLoggedIn) {
    return <Chat username={username} />;
  }

  return (
    <div className="app-container">
      <h1>Welcome to ChatApp</h1>
      <div className="form-container">
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}

export default App