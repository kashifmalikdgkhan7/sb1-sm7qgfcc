export interface ChatHistory {
  id: string;
  userId: string;
  messages: Array<{
    id: string;
    content: string;
    sender: 'user' | 'talko';
    timestamp: Date;
  }>;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
  };
  subscription: 'free' | 'premium' | 'enterprise';
  createdAt: Date;
  lastActive: Date;
}

export class TalkoDatabase {
  private static readonly CHAT_HISTORY_KEY = 'talko-chat-history';
  private static readonly USER_PROFILES_KEY = 'talko-user-profiles';
  private static readonly ANALYTICS_KEY = 'talko-analytics';

  // Chat History Management
  static saveChatHistory(userId: string, chatHistory: ChatHistory): void {
    const allChats = this.getAllChatHistory();
    const userChats = allChats.filter(chat => chat.userId === userId);
    const otherChats = allChats.filter(chat => chat.userId !== userId);
    
    const existingChatIndex = userChats.findIndex(chat => chat.id === chatHistory.id);
    if (existingChatIndex !== -1) {
      userChats[existingChatIndex] = chatHistory;
    } else {
      userChats.push(chatHistory);
    }
    
    // Keep only last 50 chats per user
    const limitedUserChats = userChats.slice(-50);
    const updatedChats = [...otherChats, ...limitedUserChats];
    
    localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(updatedChats));
  }

  static getChatHistory(userId: string): ChatHistory[] {
    const allChats = this.getAllChatHistory();
    return allChats
      .filter(chat => chat.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static getAllChatHistory(): ChatHistory[] {
    const chats = localStorage.getItem(this.CHAT_HISTORY_KEY);
    return chats ? JSON.parse(chats) : [];
  }

  static deleteChatHistory(userId: string, chatId: string): void {
    const allChats = this.getAllChatHistory();
    const updatedChats = allChats.filter(chat => !(chat.userId === userId && chat.id === chatId));
    localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(updatedChats));
  }

  // User Profile Management
  static saveUserProfile(profile: UserProfile): void {
    const profiles = this.getAllUserProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex !== -1) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(this.USER_PROFILES_KEY, JSON.stringify(profiles));
  }

  static getUserProfile(userId: string): UserProfile | null {
    const profiles = this.getAllUserProfiles();
    return profiles.find(p => p.id === userId) || null;
  }

  static getAllUserProfiles(): UserProfile[] {
    const profiles = localStorage.getItem(this.USER_PROFILES_KEY);
    return profiles ? JSON.parse(profiles) : [];
  }

  // Analytics
  static trackInteraction(userId: string, action: string, metadata?: any): void {
    const analytics = this.getAnalytics();
    const interaction = {
      id: Date.now().toString() + Math.random().toString(36),
      userId,
      action,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    analytics.push(interaction);
    
    // Keep only last 1000 interactions
    const limitedAnalytics = analytics.slice(-1000);
    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(limitedAnalytics));
  }

  static getAnalytics(): any[] {
    const analytics = localStorage.getItem(this.ANALYTICS_KEY);
    return analytics ? JSON.parse(analytics) : [];
  }

  // Data Export
  static exportUserData(userId: string): any {
    return {
      profile: this.getUserProfile(userId),
      chatHistory: this.getChatHistory(userId),
      analytics: this.getAnalytics().filter(a => a.userId === userId),
      exportedAt: new Date().toISOString()
    };
  }

  // Data Cleanup
  static cleanupOldData(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Clean old analytics
    const analytics = this.getAnalytics();
    const recentAnalytics = analytics.filter(a => 
      new Date(a.timestamp) > thirtyDaysAgo
    );
    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(recentAnalytics));
  }
}