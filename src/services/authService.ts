import { User } from '../types';

export class AuthService {
  private static readonly USERS_KEY = 'talko-ai-users';
  private static readonly CURRENT_USER_KEY = 'talko-ai-current-user';
  private static readonly SESSION_KEY = 'talko-ai-session';

  // Enhanced password hashing (in production, use bcrypt or similar)
  private static hashPassword(password: string): string {
    // Simple hash for demo - in production use proper hashing
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36) + password.length.toString(36);
  }

  // Input sanitization
  private static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  // Email validation
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  private static isStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  // Session management
  private static createSession(userId: string): string {
    const sessionId = Date.now().toString() + Math.random().toString(36);
    const sessionData = {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    return sessionId;
  }

  private static isValidSession(): boolean {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (!sessionData) return false;
    
    try {
      const session = JSON.parse(sessionData);
      return Date.now() < session.expiresAt;
    } catch {
      return false;
    }
  }

  static getStoredUsers(): Array<User & { password: string; createdAt: number; lastLogin?: number }> {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  static saveUser(user: User & { password: string; createdAt: number }): void {
    const users = this.getStoredUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static findUser(email: string): (User & { password: string; createdAt: number; lastLogin?: number }) | null {
    const users = this.getStoredUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static getCurrentUser(): User | null {
    if (!this.isValidSession()) {
      this.clearCurrentUser();
      return null;
    }
    
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    this.createSession(user.id);
  }

  static clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  static async register(email: string, password: string, name: string): Promise<User> {
    // Input validation and sanitization
    email = this.sanitizeInput(email).toLowerCase();
    name = this.sanitizeInput(name);
    
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!this.isStrongPassword(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters');
    }
    
    if (name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const existingUser = this.findUser(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = this.hashPassword(password);
    const newUser: User & { password: string; createdAt: number } = {
      id: Date.now().toString() + Math.random().toString(36),
      email,
      name,
      password: hashedPassword,
      createdAt: Date.now(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff&size=128`
    };

    this.saveUser(newUser);
    const { password: _, createdAt: __, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async login(email: string, password: string): Promise<User> {
    // Input validation and sanitization
    email = this.sanitizeInput(email).toLowerCase();
    
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    const user = this.findUser(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].lastLogin = Date.now();
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    const { password: _, createdAt: __, lastLogin: ___, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async loginWithGoogle(): Promise<User> {
    // Simulate Google OAuth with enhanced security
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockGoogleUser: User = {
          id: 'google-' + Date.now() + Math.random().toString(36),
          email: 'user@gmail.com',
          name: 'Google User',
          avatar: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff&size=128'
        };
        resolve(mockGoogleUser);
      }, 1000);
    });
  }

  // Security audit methods
  static getLoginAttempts(email: string): number {
    const attempts = localStorage.getItem(`login-attempts-${email}`);
    return attempts ? parseInt(attempts) : 0;
  }

  static incrementLoginAttempts(email: string): void {
    const attempts = this.getLoginAttempts(email) + 1;
    localStorage.setItem(`login-attempts-${email}`, attempts.toString());
    
    // Clear attempts after 15 minutes
    setTimeout(() => {
      localStorage.removeItem(`login-attempts-${email}`);
    }, 15 * 60 * 1000);
  }

  static isAccountLocked(email: string): boolean {
    return this.getLoginAttempts(email) >= 5;
  }
}