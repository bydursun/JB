import React, { useRef, useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your JobPortal assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messageIdRef = useRef(2);

  const predefinedResponses: { [key: string]: string } = {
    hi: "Hello! How can I assist you with your job search today?",
    hello: "Hi there! I'm here to help. What would you like to know?",
    help: "I can help you with:\n- Finding jobs\n- Creating your profile\n- Application tips\n- Employer information\nWhat would you like to know?",
    jobs: "You can browse all available jobs by clicking on the 'Jobs' tab. You can also filter by location, job type, and experience level!",
    apply: "To apply for a job:\n1. Browse jobs and select one you like\n2. Click 'Apply Now'\n3. Submit your application with a cover letter\n4. Track your application status in your dashboard",
    profile: "You can update your profile by going to the Profile page. Add your skills, experience, and resume to increase your chances!",
    employer: "Are you an employer? You can post jobs, view applications, and manage candidates from your dashboard!",
    contact: "You can reach us at support@jobportal.com or call us at 1-800-JOB-FIND. We're here 24/7!",
    salary: "Salary information is displayed on each job posting. You can also filter jobs by salary range!",
    default: "I'm here to help! Try asking about jobs, applications, your profile, or say 'help' for more options."
  };

  const getBotResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();

    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (key === 'default') continue;
      const matcher = new RegExp(`\\b${key}\\b`, 'i');
      if (matcher.test(lowercaseMessage)) {
        return response;
      }
    }

    return predefinedResponses['default'];
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: messageIdRef.current++,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: messageIdRef.current++,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
        }`}
        aria-label="Toggle chat"
      >
        <div className="relative">
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          )}
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white animate-bounce" />
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 z-50 w-auto sm:w-[380px] lg:w-[420px] h-[70vh] sm:h-[600px] max-h-[70vh] sm:max-h-[620px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Bot className="h-7 w-7 text-blue-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">JobPortal Assistant</h3>
              <p className="text-sm text-blue-100">Always here to help!</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-end space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div
                    className={`px-5 py-3 rounded-2xl shadow-md ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Jobs', 'Apply', 'Help', 'Profile'].map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    setInputMessage(action);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm border border-gray-200 whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ''}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
