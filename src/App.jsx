import { useState } from 'react'
import Chat from './Chat'
import './main.css'
// Import icons if you want to use them
import { FiLock, FiUser, FiShield } from 'react-icons/fi'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    if (!username || !password) {
      setError('Both username and password are required');
      return;
    }
    
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Both username and password are required');
      return;
    }

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return <Chat username={username} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <FiLock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Chat</h1>
          <p className="text-gray-400">Privacy-First Communication Platform</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm flex items-center">
              <FiShield className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Login Securely'}
            </button>
            <button 
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-transparent text-indigo-400 py-3 rounded-lg border border-indigo-600/50 hover:bg-indigo-600/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Create Secure Account'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p>By continuing, you agree to our</p>
            <div className="space-x-2 mt-1">
              <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
              <span>&middot;</span>
              <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App