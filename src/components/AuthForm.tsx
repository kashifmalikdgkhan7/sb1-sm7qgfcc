import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, AlertCircle, Key, Fingerprint, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { login, register, error } = useAuth();
  const { actualTheme } = useTheme();

  // Enhanced password strength checker
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
      password.length >= 12,
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    strength = checks.filter(Boolean).length;
    setPasswordStrength(strength);
  };

  // Enhanced form validation
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!isLogin) {
      if (!formData.name || formData.name.length < 2) {
        errors.push('Full name must be at least 2 characters');
      }
      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }
      if (passwordStrength < 4) {
        errors.push('Password is too weak - use uppercase, lowercase, numbers, and special characters');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      let success = false;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(formData.email, formData.password, formData.name);
      }

      if (success) {
        onSuccess();
      }
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'from-red-500 to-red-600';
    if (passwordStrength <= 4) return 'from-yellow-500 to-orange-500';
    if (passwordStrength <= 5) return 'from-blue-500 to-indigo-500';
    return 'from-emerald-500 to-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Fair';
    if (passwordStrength <= 5) return 'Good';
    return 'Excellent';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${
      actualTheme === 'dark' ? 'bootcamp-gradient-dark' : 'bootcamp-gradient'
    }`}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="card glass-modern animate-fade-in bootcamp-card">
          <div className="card-header text-center">
            <div className="flex justify-center mb-6 animate-pulse-glow">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 animate-gradient">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-black text-white mb-3 text-gradient">
              {isLogin ? 'Welcome Back' : 'Join Talko AI'}
            </h2>
            <p className="text-white/80 dark:text-gray-300 text-lg font-medium">
              {isLogin ? 'Continue your AI-powered journey' : 'Start your intelligent conversation experience'}
            </p>
          </div>

          <div className="card-body">
            {/* Security Features Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-200/20 dark:border-emerald-700/20 animate-slide-in">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center text-emerald-300 dark:text-emerald-400">
                  <Key className="w-4 h-4 mr-2" />
                  <span className="font-semibold">256-bit Encryption</span>
                </div>
                <div className="flex items-center text-emerald-300 dark:text-emerald-400">
                  <Fingerprint className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Secure Storage</span>
                </div>
                <div className="flex items-center text-emerald-300 dark:text-emerald-400">
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Private Data</span>
                </div>
              </div>
            </div>

            {(error || validationErrors.length > 0) && (
              <div className="alert alert-danger mb-6 animate-slide-in">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {error && <p className="font-semibold mb-1">{error}</p>}
                    {validationErrors.map((err, index) => (
                      <p key={index} className="text-sm">{err}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="animate-slide-in bootcamp-input">
                  <label className="form-label flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter your full name"
                    minLength={2}
                  />
                </div>
              )}

              <div className="animate-slide-in bootcamp-input" style={{animationDelay: '0.1s'}}>
                <label className="form-label flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="animate-slide-in bootcamp-input" style={{animationDelay: '0.2s'}}>
                <label className="form-label flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control pr-14"
                    placeholder="Enter your password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {!isLogin && formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Password Strength:</span>
                      <span className={`font-bold ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 4 ? 'text-yellow-500' : passwordStrength <= 5 ? 'text-blue-500' : 'text-emerald-500'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${getPasswordStrengthColor()}`}
                        style={{ width: `${Math.min((passwordStrength / 7) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center ${formData.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        8+ characters
                      </div>
                      <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uppercase
                      </div>
                      <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Lowercase
                      </div>
                      <div className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Numbers
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="animate-slide-in bootcamp-input" style={{animationDelay: '0.3s'}}>
                  <label className="form-label flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Confirm your password"
                  />
                  {formData.confirmPassword && (
                    <div className="mt-3 flex items-center">
                      {formData.password === formData.confirmPassword ? (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Passwords match perfectly
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500 dark:text-red-400 text-sm font-medium">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Passwords don't match
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full animate-slide-in text-lg font-bold"
                style={{animationDelay: '0.4s'}}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing securely...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2" />
                    {isLogin ? 'Sign In Securely' : 'Create Secure Account'}
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center animate-slide-in" style={{animationDelay: '0.6s'}}>
              <p className="text-white/80 dark:text-gray-300 text-lg">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setValidationErrors([]);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    setPasswordStrength(0);
                  }}
                  className="ml-2 text-white hover:text-white/80 dark:text-gray-200 dark:hover:text-gray-300 font-bold focus:outline-none transition-colors duration-200 underline decoration-2 underline-offset-4 hover:decoration-white/60"
                >
                  {isLogin ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Enhanced Security Features */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-900/20 to-gray-800/20 dark:from-gray-800/40 dark:to-gray-700/40 rounded-2xl animate-slide-in border border-white/10 dark:border-gray-600/20" style={{animationDelay: '0.7s'}}>
              <h4 className="text-white dark:text-gray-200 font-bold text-lg mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Enterprise-Grade Security
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-white/80 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Private user accounts</span>
                </div>
                <div className="flex items-center text-white/80 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Secure password hashing</span>
                </div>
                <div className="flex items-center text-white/80 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Isolated chat data</span>
                </div>
                <div className="flex items-center text-white/80 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Session management</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
                <p className="text-emerald-300 dark:text-emerald-400 text-sm font-medium text-center">
                  🔒 Each user gets a completely private and secure account with isolated data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;