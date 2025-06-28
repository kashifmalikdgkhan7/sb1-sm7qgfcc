import React from 'react';
import { MessageCircle, Sparkles, Zap, Phone, MessageSquare, Shield, Cpu, Globe, Users, Star, Award, Rocket, Brain, Target, Crown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const { actualTheme } = useTheme();

  const handleCall = () => {
    window.open('tel:+923436148715', '_self');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/923436148715', '_blank');
  };

  return (
    <div className={`relative min-h-screen overflow-hidden transition-all duration-500 ${
      actualTheme === 'dark' ? 'bootcamp-gradient-dark' : 'bootcamp-gradient'
    }`}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="navbar relative z-50">
        <div className="container">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow">
                  <MessageCircle className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-gradient">
                  Talko AI
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-bold text-blue-200 dark:text-blue-300">Powered by SkillUp</p>
                  <div className="w-1 h-1 bg-blue-200 dark:bg-blue-300 rounded-full"></div>
                  <p className="text-sm font-bold text-emerald-200 dark:text-emerald-300">Enterprise AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleCall}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">Call Support</span>
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="relative z-10 container mx-auto px-4 py-20 sm:py-32">
        <div className="text-center max-w-7xl mx-auto">
          {/* Hero Icon */}
          <div className="flex justify-center mb-12 animate-fade-in">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center transform rotate-3 shadow-2xl animate-float animate-gradient">
                <Brain className="w-20 h-20 text-white" />
              </div>
              <Sparkles className="w-12 h-12 text-yellow-400 absolute -top-6 -right-6 animate-pulse" />
              <Target className="w-10 h-10 text-pink-400 absolute -bottom-4 -left-4 animate-bounce" />
              <Rocket className="w-8 h-8 text-emerald-400 absolute top-4 -left-8 animate-bounce" style={{animationDelay: '0.5s'}} />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-50 -z-10 animate-pulse-glow"></div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black text-white mb-8 leading-tight animate-fade-in">
            Meet
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient"> Talko AI</span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl mt-4 text-emerald-300 dark:text-emerald-400">Your Intelligent Assistant</span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl sm:text-3xl text-white/90 mb-16 max-w-5xl mx-auto leading-relaxed animate-fade-in font-medium" style={{animationDelay: '0.2s'}}>
            Experience the future of AI conversation with Talko AI - your advanced intelligent assistant powered by SkillUp. 
            Get smart responses, creative solutions, and engaging discussions with cutting-edge technology.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="card glass-effect hover:scale-105 transition-transform duration-300 bootcamp-card">
              <div className="card-body text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-black text-xl mb-3">Lightning Fast</h3>
                <p className="text-white/80 text-sm leading-relaxed">Get instant intelligent responses with advanced AI processing and sub-second response times</p>
              </div>
            </div>
            <div className="card glass-effect hover:scale-105 transition-transform duration-300 bootcamp-card">
              <div className="card-body text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-black text-xl mb-3">Secure & Private</h3>
                <p className="text-white/80 text-sm leading-relaxed">Your conversations are protected with enterprise-grade security and complete privacy</p>
              </div>
            </div>
            <div className="card glass-effect hover:scale-105 transition-transform duration-300 bootcamp-card">
              <div className="card-body text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-black text-xl mb-3">AI Powered</h3>
                <p className="text-white/80 text-sm leading-relaxed">Advanced artificial intelligence for intelligent and contextual conversations</p>
              </div>
            </div>
            <div className="card glass-effect hover:scale-105 transition-transform duration-300 bootcamp-card">
              <div className="card-body text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-black text-xl mb-3">Culturally Aware</h3>
                <p className="text-white/80 text-sm leading-relaxed">Multilingual support with cultural sensitivity and respectful communication</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8 mb-16 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center px-12 py-6 text-2xl font-black text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 animate-pulse-glow"
            >
              <span className="mr-4">Start Chatting with Talko AI</span>
              <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform duration-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCall}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-6 h-6" />
                <span>Call Support</span>
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <MessageSquare className="w-6 h-6" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-white/80 text-lg animate-fade-in font-semibold" style={{animationDelay: '0.8s'}}>
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <span>100,000+ Happy Users</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6" />
              <span>Enterprise Grade</span>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6" />
              <span>Multilingual</span>
            </div>
          </div>

          {/* Company Info Banner */}
          <div className="mt-12 p-8 glass-modern rounded-3xl max-w-6xl mx-auto animate-fade-in shadow-2xl" style={{animationDelay: '1s'}}>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white">SkillUp</h3>
                  <p className="text-lg font-bold text-blue-200 dark:text-blue-300">Leading AI Innovation Company</p>
                  <p className="text-sm font-semibold text-purple-200 dark:text-purple-300">Advanced AI Solutions</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-white/90 text-lg font-medium mb-2">
                  🚀 <strong>Contact:</strong> +92 343 614 8715
                </p>
                <p className="text-white/80 text-sm">
                  Enterprise AI Solutions • No credit card required • Get started in seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L1440 120L1440 0C1440 0 1140 80 720 80C300 80 0 0 0 0L0 120Z" fill="white" fillOpacity="0.1"/>
          <path d="M0 120L1440 120L1440 20C1440 20 1140 100 720 100C300 100 0 20 0 20L0 120Z" fill="white" fillOpacity="0.05"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;