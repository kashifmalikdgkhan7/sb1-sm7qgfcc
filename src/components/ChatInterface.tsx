import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, LogOut, Phone, MessageSquare, Settings, Trash2, Download, Shield, Zap, Star, Plus, History, Menu, X, Copy, ThumbsUp, ThumbsDown, RotateCcw, Lock, Key, Clock, MessageCircle, Edit3, Check, MoreHorizontal } from 'lucide-react';
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
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputMessage]);

  const loadUserChatData = () => {
    if (!user) return;
    
    const chatData = UserDatabase.getUserChatData(user.id);
    setChatSessions(chatData.sessions);
    
    // Load active session or create new one
    let activeSession = UserDatabase.getActiveSession(user.id);
    
    if (!activeSession && chatData.sessions.length === 0) {
      // Create first session with welcome message
      activeSession = UserDatabase.createNewChatSession(user.id, 'Welcome to Talko AI');
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
    
    const newSession = UserDatabase.createNewChatSession(user.id, 'New Chat');
    
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

  const startEditingTitle = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const saveTitle = () => {
    if (!user || !editingSessionId) return;
    
    UserDatabase.updateSessionTitle(user.id, editingSessionId, editingTitle);
    loadUserChatData();
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditingTitle('');
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar - ChatGPT Style */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Talko AI</h2>
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
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => switchToChat(session)}
                >
                  <MessageCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mr-3" />
                  
                  {editingSessionId === session.id ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-gray-100"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveTitle}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-gray-500 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {session.title}
                        </p>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                        <button
                          onClick={(e) => startEditingTitle(session, e)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded"
                          title="Edit title"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => deleteChat(session.id, e)}
                          className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {chatSessions.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCall}
                className="flex-1 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors text-center"
                title="Call Support"
              >
                <Phone className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex-1 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-center"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={exportChat}
                className="flex-1 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-center"
                title="Export Chat"
              >
                <Download className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area - ChatGPT Style */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {currentSession?.title || 'Talko AI'}
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={createNewChat}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages Area - ChatGPT Style */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {currentSession?.messages.map((message, index) => (
              <div
                key={message.id}
                className={`group mb-6 ${
                  message.sender === 'assistant' ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                }`}
              >
                <div className={`${message.sender === 'assistant' ? 'px-4 py-6' : 'px-4 py-4'}`}>
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-green-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {message.sender === 'user' ? user?.name || 'You' : 'Talko AI'}
                          </span>
                          {message.isUrdu && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                              اردو
                            </span>
                          )}
                        </div>
                        
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Message Actions */}
                        <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy message"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {message.sender === 'assistant' && (
                            <>
                              <button
                                onClick={() => regenerateResponse(index)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Regenerate response"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Good response"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Bad response"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="group mb-6 bg-gray-50 dark:bg-gray-800/50">
                <div className="px-4 py-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Talko AI</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                          <span className="text-gray-500 dark:text-gray-400">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - ChatGPT Style */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Talko AI..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[52px] max-h-[200px]"
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="absolute right-2 bottom-2 p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
            
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Talko AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
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