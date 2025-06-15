'use client'
import { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, Clock, User, Bot } from 'lucide-react';

export default function StockMarketChat() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      content: "Welcome to StockChat! Ask me about market trends, stock prices, or trading advice.", 
      sender: "bot", 
      timestamp: "09:30 AM"
    },
    {
      id: 2,
      content: "How is AAPL performing today?",
      sender: "user",
      timestamp: "09:31 AM"
    },
    {
      id: 3,
      content: "AAPL is up 2.3% today, trading at $178.45. Volume is 25% above average.",
      sender: "bot",
      timestamp: "09:31 AM"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom:any = () => {
    messagesEndRef.current?.scrollerIntoView({behaviour: "smooth"})
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      content: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage("");
    
    
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        content: `This is a simulated response to "${newMessage}". In your actual implementation, you would connect this to your stock market data API.`,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-indigo-800 text-white p-4 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center space-x-2">
          <TrendingUp className="text-green-400" />
          <h1 className="text-xl font-bold">StockChat</h1>
        </div>
        <div className="text-sm text-indigo-200 flex items-center">
          <Clock size={14} className="mr-1" />
          <span>Market Hours: 9:30 AM - 4:00 PM ET</span>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender === 'user' ? (
                    <User size={16} className="text-indigo-200" />
                  ) : (
                    <Bot size={16} className="text-indigo-600" />
                  )}
                  <span className="text-xs opacity-75">{message.timestamp}</span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask about stocks, market trends, or trading advice..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
          />
          <button 
            onClick={handleSubmit}
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}