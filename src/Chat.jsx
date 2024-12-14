import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './main.css'

function Chat({ username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let typingTimer;
    
    const sendTypingStatus = async (isTyping) => {
      try {
        await fetch('http://localhost:3000/typing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, isTyping }),
        });
      } catch (error) {
        console.error('Error sending typing status:', error);
      }
    };

    if (newMessage) {
      sendTypingStatus(true);
    }

    typingTimer = setTimeout(() => {
      sendTypingStatus(false);
    }, 1000);

    return () => {
      clearTimeout(typingTimer);
      sendTypingStatus(false);
    };
  }, [newMessage, username]);

  useEffect(() => {
    const checkTypingStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/typing-users');
        if (!response.ok) throw new Error('Failed to fetch typing users');
        
        const typingData = await response.json();
        console.log('Typing data received:', typingData);
        
        const otherTypingUsers = new Set(
          typingData
            .filter(user => user.username !== username && user.isTyping)
            .map(user => user.username)
        );
        
        console.log('Other typing users:', Array.from(otherTypingUsers));
        setTypingUsers(otherTypingUsers);
      } catch (error) {
        console.error('Error fetching typing status:', error);
      }
    };

    checkTypingStatus();

    const typingInterval = setInterval(checkTypingStatus, 1000);
    return () => clearInterval(typingInterval);
  }, [username]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3000/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    // Fetch messages initially
    fetchMessages();

    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          message: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        const data = await response.json();
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex items-center pb-4 border-b border-gray-100 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {username[0].toUpperCase()}
          </div>
          <h2 className="ml-3 font-semibold text-gray-800">{username}</h2>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.username === username 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium">{msg.username}</span>
                </div>
                <p className="text-sm">{msg.message}</p>
                <span className={`text-xs ${
                  msg.username === username ? 'text-indigo-100' : 'text-gray-500'
                } mt-1 inline-block`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {typingUsers.size > 0 && (
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Chat.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Chat;