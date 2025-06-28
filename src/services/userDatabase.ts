export interface UserAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isUrdu?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserChatData {
  userId: string;
  sessions: ChatSession[];
  activeSessionId: string | null;
  lastActivity: Date;
}

export class UserDatabase {
  private static readonly USERS_KEY = 'talko_users';
  private static readonly CHAT_DATA_KEY = 'talko_chat_data';
  private static readonly SESSIONS_KEY = 'talko_sessions';

  // Secure password hashing with salt
  private static generateSalt(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private static hashPassword(password: string, salt: string): string {
    // Enhanced password hashing (in production, use bcrypt)
    let hash = 0;
    const combined = password + salt;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36) + combined.length.toString(36);
  }

  private static validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: '' };
  }

  private static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  // User Management
  static createUser(email: string, password: string, name: string): Promise<UserAccount> {
    return new Promise((resolve, reject) => {
      try {
        email = this.sanitizeInput(email).toLowerCase();
        name = this.sanitizeInput(name);

        // Validate inputs
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          reject(new Error('Invalid email format'));
          return;
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.valid) {
          reject(new Error(passwordValidation.message));
          return;
        }

        if (name.length < 2) {
          reject(new Error('Name must be at least 2 characters long'));
          return;
        }

        // Check if user already exists
        const users = this.getAllUsers();
        if (users.find(u => u.email === email)) {
          reject(new Error('User already exists with this email'));
          return;
        }

        // Create new user
        const salt = this.generateSalt();
        const passwordHash = this.hashPassword(password, salt);
        
        const newUser: UserAccount = {
          id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2),
          email,
          name,
          passwordHash,
          salt,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff&size=128`,
          createdAt: new Date(),
          isActive: true,
          preferences: {
            theme: 'auto',
            language: 'en',
            notifications: true
          }
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        
        resolve(newUser);
      } catch (error) {
        reject(error);
      }
    });
  }

  static authenticateUser(email: string, password: string): Promise<UserAccount> {
    return new Promise((resolve, reject) => {
      try {
        email = this.sanitizeInput(email).toLowerCase();
        
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.isActive);
        
        if (!user) {
          reject(new Error('Invalid email or password'));
          return;
        }

        const passwordHash = this.hashPassword(password, user.salt);
        if (passwordHash !== user.passwordHash) {
          reject(new Error('Invalid email or password'));
          return;
        }

        // Update last login
        user.lastLogin = new Date();
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = user;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  static updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        // Verify current password
        const currentHash = this.hashPassword(currentPassword, user.salt);
        if (currentHash !== user.passwordHash) {
          reject(new Error('Current password is incorrect'));
          return;
        }

        // Validate new password
        const passwordValidation = this.validatePassword(newPassword);
        if (!passwordValidation.valid) {
          reject(new Error(passwordValidation.message));
          return;
        }

        // Update password
        const newSalt = this.generateSalt();
        const newPasswordHash = this.hashPassword(newPassword, newSalt);
        
        user.salt = newSalt;
        user.passwordHash = newPasswordHash;

        const userIndex = users.findIndex(u => u.id === userId);
        users[userIndex] = user;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static getAllUsers(): UserAccount[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Session Management
  static createSession(userId: string): string {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    const sessions = this.getAllSessions();
    
    sessions[sessionId] = {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      isActive: true
    };
    
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    return sessionId;
  }

  static validateSession(sessionId: string): { valid: boolean; userId?: string } {
    const sessions = this.getAllSessions();
    const session = sessions[sessionId];
    
    if (!session || !session.isActive || Date.now() > session.expiresAt) {
      return { valid: false };
    }
    
    return { valid: true, userId: session.userId };
  }

  static destroySession(sessionId: string): void {
    const sessions = this.getAllSessions();
    if (sessions[sessionId]) {
      sessions[sessionId].isActive = false;
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  private static getAllSessions(): any {
    const sessions = localStorage.getItem(this.SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : {};
  }

  // Multi-Chat Session Management
  static createNewChatSession(userId: string, title?: string): ChatSession {
    const chatData = this.getUserChatData(userId);
    
    const newSession: ChatSession = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2),
      userId,
      title: title || `Chat ${chatData.sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    chatData.sessions.unshift(newSession); // Add to beginning
    chatData.activeSessionId = newSession.id;
    chatData.lastActivity = new Date();
    
    // Keep only last 50 chat sessions per user
    if (chatData.sessions.length > 50) {
      chatData.sessions = chatData.sessions.slice(0, 50);
    }
    
    this.saveUserChatData(userId, chatData);
    return newSession;
  }

  static getActiveSession(userId: string): ChatSession | null {
    const chatData = this.getUserChatData(userId);
    if (!chatData.activeSessionId) return null;
    
    return chatData.sessions.find(s => s.id === chatData.activeSessionId) || null;
  }

  static switchToSession(userId: string, sessionId: string): ChatSession | null {
    const chatData = this.getUserChatData(userId);
    const session = chatData.sessions.find(s => s.id === sessionId);
    
    if (session) {
      chatData.activeSessionId = sessionId;
      chatData.lastActivity = new Date();
      this.saveUserChatData(userId, chatData);
      return session;
    }
    
    return null;
  }

  static saveChatMessage(userId: string, message: ChatMessage, sessionId?: string): void {
    const chatData = this.getUserChatData(userId);
    
    // Use provided sessionId or active session
    const targetSessionId = sessionId || chatData.activeSessionId;
    
    if (!targetSessionId) {
      // Create new session if none exists
      const newSession = this.createNewChatSession(userId);
      newSession.messages.push(message);
      this.updateSessionTitle(userId, newSession.id, message.content);
      return;
    }
    
    const sessionIndex = chatData.sessions.findIndex(s => s.id === targetSessionId);
    if (sessionIndex !== -1) {
      chatData.sessions[sessionIndex].messages.push(message);
      chatData.sessions[sessionIndex].updatedAt = new Date();
      
      // Update title based on first user message
      if (chatData.sessions[sessionIndex].messages.length === 2 && message.sender === 'assistant') {
        const firstUserMessage = chatData.sessions[sessionIndex].messages.find(m => m.sender === 'user');
        if (firstUserMessage) {
          this.updateSessionTitle(userId, targetSessionId, firstUserMessage.content);
        }
      }
      
      // Keep only last 500 messages per session
      if (chatData.sessions[sessionIndex].messages.length > 500) {
        chatData.sessions[sessionIndex].messages = chatData.sessions[sessionIndex].messages.slice(-500);
      }
      
      chatData.lastActivity = new Date();
      this.saveUserChatData(userId, chatData);
    }
  }

  static updateSessionTitle(userId: string, sessionId: string, firstMessage: string): void {
    const chatData = this.getUserChatData(userId);
    const sessionIndex = chatData.sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      const words = firstMessage.split(' ').slice(0, 6).join(' ');
      const title = words.length > 50 ? words.substring(0, 47) + '...' : words;
      chatData.sessions[sessionIndex].title = title || `Chat ${sessionIndex + 1}`;
      this.saveUserChatData(userId, chatData);
    }
  }

  static deleteChatSession(userId: string, sessionId: string): void {
    const chatData = this.getUserChatData(userId);
    const sessionIndex = chatData.sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      chatData.sessions.splice(sessionIndex, 1);
      
      // If deleted session was active, switch to most recent session
      if (chatData.activeSessionId === sessionId) {
        chatData.activeSessionId = chatData.sessions.length > 0 ? chatData.sessions[0].id : null;
      }
      
      this.saveUserChatData(userId, chatData);
    }
  }

  static getUserChatData(userId: string): UserChatData {
    const allChatData = this.getAllChatData();
    const userKey = `user_${userId}`;
    
    let userChatData = allChatData[userKey];
    
    // If no data exists, create new structure
    if (!userChatData) {
      userChatData = {
        userId,
        sessions: [],
        activeSessionId: null,
        lastActivity: new Date()
      };
      allChatData[userKey] = userChatData;
      this.saveAllChatData(allChatData);
    } else {
      // Ensure sessions is always an array
      if (!Array.isArray(userChatData.sessions)) {
        userChatData.sessions = [];
        allChatData[userKey] = userChatData;
        this.saveAllChatData(allChatData);
      }
    }
    
    return userChatData;
  }

  private static saveUserChatData(userId: string, chatData: UserChatData): void {
    const allChatData = this.getAllChatData();
    const userKey = `user_${userId}`;
    allChatData[userKey] = chatData;
    this.saveAllChatData(allChatData);
  }

  private static saveAllChatData(allChatData: any): void {
    localStorage.setItem(this.CHAT_DATA_KEY, JSON.stringify(allChatData));
  }

  static clearAllUserChats(userId: string): void {
    const allChatData = this.getAllChatData();
    const userKey = `user_${userId}`;
    if (allChatData[userKey]) {
      allChatData[userKey].sessions = [];
      allChatData[userKey].activeSessionId = null;
      this.saveAllChatData(allChatData);
    }
  }

  private static getAllChatData(): any {
    const chatData = localStorage.getItem(this.CHAT_DATA_KEY);
    return chatData ? JSON.parse(chatData) : {};
  }

  // User Profile Management
  static updateUserProfile(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
    return new Promise((resolve, reject) => {
      try {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }

        // Sanitize updates
        if (updates.name) {
          updates.name = this.sanitizeInput(updates.name);
        }
        if (updates.email) {
          updates.email = this.sanitizeInput(updates.email).toLowerCase();
        }

        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        
        resolve(users[userIndex]);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Data Export (for user's own data only)
  static exportUserData(userId: string): any {
    const user = this.getAllUsers().find(u => u.id === userId);
    const chatData = this.getUserChatData(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        preferences: user.preferences
      },
      chatData: {
        sessions: chatData.sessions,
        lastActivity: chatData.lastActivity
      },
      exportedAt: new Date().toISOString()
    };
  }

  // Security: Data cleanup
  static cleanupExpiredSessions(): void {
    const sessions = this.getAllSessions();
    const now = Date.now();
    
    Object.keys(sessions).forEach(sessionId => {
      if (sessions[sessionId].expiresAt < now) {
        delete sessions[sessionId];
      }
    });
    
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }
}