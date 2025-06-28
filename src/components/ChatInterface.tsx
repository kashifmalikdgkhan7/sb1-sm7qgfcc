import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, LogOut, Phone, MessageSquare, Settings, Trash2, Download, Shield, Zap, Star, Plus, History, Menu, X, Copy, ThumbsUp, ThumbsDown, RotateCcw, Lock, Key, Clock, MessageCircle } from 'lucide-react';
import { ChatMessage, ChatSession, UserDatabase } from '../services/userDatabase';
import { GeminiService } from '../services/geminiApi';
import { TalkoAI } from '../services/talkoAI';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import PasswordUpdateModal from './PasswordUpdateModal';

const ChatInterface: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { actualTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    if (user) {
      loadUserChatData();
    }
  }, [user]);

  const loadUserChatData = () => {
    if (!user) return;
    
    const chatData = UserDatabase.getUserChatData(user.id);
    setChatSessions(chatData.sessions);
    
    // Load active session or create new one
    let activeSession = UserDatabase.getActiveSession(user.id);
    
    if (!activeSession && chatData.sessions.length === 0) {
      // Create first session with welcome message
      activeSession = UserDatabase.createNewChatSession(user.id, 'Welcome Chat');
      const welcomeMessage: ChatMessage = {
        id: 'welcome_' + Date.now(),
        content: TalkoAI.getIntroductionMessage(),
        sender: 'assistant',
        timestamp: new Date()
      };
      UserDatabase.saveChatMessage(user.id, welcomeMessage, activeSession.id);
      activeSession.messages = [welcomeMessage];
      setChatSessions([activeSession]);
    } else if (!activeSession && chatData.sessions.length > 0) {
      // Switch to most recent session
      activeSession = UserDatabase.switchToSession(user.id, chatData.sessions[0].id);
    }
    
    setCurrentSession(activeSession);
  };

  const handleCall = () => {
    window.open('tel:+923436148715', '_self');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/923436148715', '_blank');
  };

  const createNewChat = () => {
    if (!user) return;
    
    const newSession = UserDatabase.createNewChatSession(user.id);
    const welcomeMessage: ChatMessage = {
      id: 'welcome_' + Date.now(),
      content: TalkoAI.getIntroductionMessage(),
      sender: 'assistant',
      timestamp: new Date()
    };
    
    UserDatabase.saveChatMessage(user.id, welcomeMessage, newSession.id);
    newSession.messages = [welcomeMessage];
    
    setCurrentSession(newSession);
    loadUserChatData(); // Refresh the sessions list
    setSidebarOpen(false);
  };

  const switchToChat = (session: ChatSession) => {
    if (!user) return;
    
    const switchedSession = UserDatabase.switchToSession(user.id, session.id);
    if (switchedSession) {
      setCurrentSession(switchedSession);
      setSidebarOpen(false);
    }
  };

  const deleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    UserDatabase.deleteChatSession(user.id, sessionId);
    loadUserChatData();
    
    // If deleted session was current, switch to another or create new
    if (currentSession?.id === sessionId) {
      const chatData = UserDatabase.getUserChatData(user.id);
      if (chatData.sessions.length > 0) {
        const newActiveSession = UserDatabase.switchToSession(user.id, chatData.sessions[0].id);
        setCurrentSession(newActiveSession);
      } else {
        createNewChat();
      }
    }
  };

  const clearAllChats = () => {
    if (!user) return;
    
    UserDatabase.clearAllUserChats(user.id);
    setChatSessions([]);
    createNewChat();
  };

  const exportChat = () => {
    if (user && currentSession) {
      const exportData = {
        chatSession: currentSession,
        exportedAt: new Date().toISOString(),
        exportedBy: user.name
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `talko-ai-${currentSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (!user || !currentSession) return;
    
    if (messageIndex > 0 && currentSession.messages[messageIndex - 1]?.sender === 'user') {
      const userMessage = currentSession.messages[messageIndex - 1].content;
      const messagesBeforeRegenerate = currentSession.messages.slice(0, messageIndex);
      
      // Update current session with truncated messages
      const updatedSession = { ...currentSession, messages: messagesBeforeRegenerate };
      setCurrentSession(updatedSession);
      setIsLoading(true);

      try {
        const aiResponse = await GeminiService.generateResponse(userMessage);
        const aiMessage: ChatMessage = {
          id: 'msg_' + Date.now(),
          content: aiResponse,
          sender: 'assistant',
          timestamp: new Date(),
          isUrdu: TalkoAI.containsUrdu(userMessage)
        };
        
        const finalMessages = [...messagesBeforeRegenerate, aiMessage];
        const finalSession = { ...currentSession, messages: finalMessages };
        setCurrentSession(finalSession);
        
        UserDatabase.saveChatMessage(user.id, aiMessage, currentSession.id);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: 'error_' + Date.now(),
          content: 'I apologize, but I encountered an issue regenerating the response. Please try again or contact SkillUp support at +92 343 614 8715.',
          sender: 'assistant',
          timestamp: new Date()
        };
        
        const finalMessages = [...messagesBeforeRegenerate, errorMessage];
        const finalSession = { ...currentSession, messages: finalMessages };
        setCurrentSession(finalSession);
        
        UserDatabase.saveChatMessage(user.id, errorMessage, currentSession.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !user || !currentSession) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      isUrdu: TalkoAI.containsUrdu(inputMessage)
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    const updatedSession = { ...currentSession, messages: updatedMessages };
    setCurrentSession(updatedSession);
    
    UserDatabase.saveChatMessage(user.id, userMessage, currentSession.id);
    
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await GeminiService.generateResponse(inputMessage);
      const aiMessage: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date(),
        isUrdu: userMessage.isUrdu
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      const finalSession = { ...currentSession, messages: finalMessages };
      setCurrentSession(finalSession);
      
      UserDatabase.saveChatMessage(user.id, aiMessage, currentSession.id);
      loadUserChatData(); // Refresh sessions to update titles and order
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: 'error_' + Date.now(),
        content: 'I apologize, but I encountered an issue processing your request. Please try again or contact SkillUp support at +92 343 614 8715 for assistance.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      const finalSession = { ...currentSession, messages: finalMessages };
      setCurrentSession(finalSession);
      
      UserDatabase.saveChatMessage(user.id, errorMessage, currentSession.id);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 chat-sidebar transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-800 dark:text-gray-200">Talko AI</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Powered by SkillUp</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={createNewChat}
              className="w-full mt-4 btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Chat History</h3>
              {chatSessions.length > 0 && (
                <button
                  onClick={clearAllChats}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                  title="Clear all chats"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                  }`}
                  onClick={() => switchToChat(session)}
                >
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{session.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {session.messages.length} messages
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getRelativeTime(session.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteChat(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200"
                      title="Delete chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {chatSessions.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No chat history yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new conversation!</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              {user?.avatar && (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Secure Account</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-center space-x-2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                <Key className="w-4 h-4" />
                <span>Password</span>
              </button>
              <button
                onClick={exportChat}
                className="flex items-center justify-center space-x-2 p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex space-x-2 mb-3">
              <button
                onClick={handleCall}
                className="flex-1 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                title="Call Support"
              >
                <Phone className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex-1 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={logout}
                className="flex-1 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield className="w-3 h-3" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="navbar shadow-lg">
          <div className="container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse-glow">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-gradient">
                      {currentSession?.title || 'Talko AI'}
                    </h1>
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Powered by SkillUp</p>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button
                  onClick={exportChat}
                  className="p-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Export Current Chat"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={createNewChat}
                  className="p-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="New Chat"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50 dark:bg-gray-900">
          <div className="container max-w-4xl space-y-6">
            {currentSession?.messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div
                  className={`flex max-w-[85%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } items-start space-x-3`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-lg border ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white ml-3 border-white/20'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 mr-3'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.sender === 'user' ? user?.name || 'You' : 'Talko AI'}
                      </span>
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                    
                    {message.sender === 'assistant' && (
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Talko AI</span>
                          {message.isUrdu && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
                              اردو
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Message Actions */}
                    <div className={`flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.sender === 'user' ? 'justify-start' : 'justify-end'
                    }`}>
                      <button
                        onClick={() => copyMessage(message.content)}
                        className={`p-1 rounded transition-colors ${
                          message.sender === 'user' 
                            ? 'text-blue-200 hover:text-white hover:bg-white/20' 
                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {message.sender === 'assistant' && (
                        <button
                          onClick={() => regenerateResponse(index)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Talko AI is thinking...</p>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce typing-indicator"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce typing-indicator"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce typing-indicator"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-6 shadow-lg">
          <form onSubmit={handleSendMessage} className="container max-w-4xl">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message Talko AI..."
                  className="form-control pr-16 text-base py-4"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                🤖 Talko AI by SkillUp • Need help? Call +92 343 614 8715
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Fast Response</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Secure</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <PasswordUpdateModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;