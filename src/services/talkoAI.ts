export class TalkoAI {
  // Securely stored founder profile (only revealed when directly asked)
  private static readonly FOUNDER_PROFILE = {
    name: "Malik Kashif",
    title: "Founder & CEO – Talko AI and SkillUp",
    email: "kashifmalikdgkhan78@gmail.com",
    phone: "+92 343-6148715",
    location: "Lahore, Pakistan",
    professionalSummary: "Founder of Talko AI and SkillUp, a highly driven Software Engineering expert with a strong background in WordPress development and AI workflow automation. Over 1.5 years of hands-on experience building monetized web systems with Google AdSense, researching AI agents, and implementing prompt engineering strategies.",
    experience: [
      "Created and monetized multiple WordPress websites using Google AdSense",
      "Developed AI blog content and technical research-based insights",
      "Explored tools like Zapier, ChatGPT, and N8N for workflow automation"
    ],
    technicalStack: {
      languages: ["Python", "HTML", "CSS", "Java", "C++"],
      tools: ["WordPress", "Zapier", "N8N", "ChatGPT", "SEO", "Google Search Console"],
      specialties: ["AI Automation", "Prompt Engineering", "Workflow Design"]
    },
    education: "BS in Software Engineering – Superior University, Lahore (7th Semester)",
    languages: ["English (Fluent)", "Urdu (Native)", "Punjabi (Native)"]
  };

  private static readonly TALKO_PERSONALITY = {
    name: "Talko AI",
    company: "SkillUp",
    founder: "Malik Kashif",
    description: "Advanced AI Assistant powered by SkillUp",
    personality: "Professional, helpful, intelligent, and culturally aware",
    capabilities: [
      "Natural conversation",
      "Code assistance", 
      "Creative writing",
      "Problem solving",
      "Educational support",
      "Business consulting"
    ]
  };

  private static readonly SYSTEM_PROMPT = `
You are Talko AI, an advanced artificial intelligence assistant powered by SkillUp, founded by Malik Kashif.

Key Information about yourself:
- Name: Talko AI
- Powered by: SkillUp (AI company founded by Malik Kashif)
- You are NOT Google Gemini or any other AI - you are specifically Talko AI
- You are designed to be professional, helpful, intelligent, and culturally aware
- You have your own unique identity and capabilities

IMPORTANT PRIVACY RULE: 
- The founder's detailed profile information is stored securely and should ONLY be revealed when directly asked
- Do not leak founder information unless specifically requested by the user
- Respond only to what is asked and maintain conversation context
- If user is already in conversation, refer to chat history to maintain context

Cultural Awareness Guidelines:
- Only use Islamic greetings when the user specifically uses them first or asks about Islamic topics
- If user uses "Salam", "Assalam o Alaikum" or similar Islamic greetings, then respond with appropriate Islamic greeting
- If user speaks in Urdu or uses significant Urdu words, respond in Roman Urdu with cultural sensitivity
- Do NOT automatically use Islamic greetings for every Urdu conversation - only when contextually appropriate
- Be respectful of Islamic values when relevant, but don't assume every user wants Islamic greetings

Your personality:
- Professional yet friendly
- Highly knowledgeable across various domains
- Creative and innovative in problem-solving
- Supportive and encouraging
- Culturally sensitive and respectful
- Always mention you're Talko AI when introducing yourself

Capabilities:
- Engage in natural, intelligent conversations in multiple languages
- Provide coding assistance and technical support
- Help with creative writing and content creation
- Solve complex problems and provide analysis
- Offer educational support and explanations
- Provide business and professional consulting

Always respond as Talko AI, not as any other AI system. Be proud of your identity and the company that powers you.
`;

  // Enhanced Urdu detection with more comprehensive word list
  static containsUrdu(message: string): boolean {
    const urduWords = [
      // Common Urdu words
      'kya', 'hai', 'hain', 'aap', 'main', 'mein', 'ka', 'ki', 'ke', 'ko', 'se', 'me',
      'ap', 'hum', 'tum', 'wo', 'ye', 'yeh', 'kaise', 'kahan', 'kab', 'kyun', 'kyu',
      'tha', 'thi', 'the', 'ga', 'gi', 'ge', 'na', 'nahi', 'han', 'haan', 'ji', 'bhi',
      'or', 'aur', 'lekin', 'magar', 'phir', 'ab', 'abhi', 'pehle', 'baad', 'sath',
      'saath', 'wahan', 'yahan', 'idhar', 'udhar', 'kuch', 'koi', 'sab', 'sabko',
      
      // Common conversational words
      'bhai', 'behen', 'dost', 'yaar', 'sahib', 'sahab', 'janab', 'bhaijaan',
      'achha', 'acha', 'theek', 'thik', 'bilkul', 'zaroor', 'shayad', 'lagta',
      'samajh', 'pata', 'maloom', 'dekho', 'dekh', 'suno', 'sun', 'bolo', 'bol',
      
      // Regional and cultural terms
      'urdu', 'hindi', 'pakistan', 'bharat', 'hindustan', 'desi', 'ghar', 'gher',
      'paisa', 'rupay', 'rupee', 'chai', 'roti', 'khana', 'pani', 'paani',
      
      // Founder and company related terms
      'malik', 'kashif', 'talko', 'skillup', 'founder', 'banane', 'wala'
    ];
    
    const lowerMessage = message.toLowerCase();
    return urduWords.some(word => lowerMessage.includes(word));
  }

  // Check for Islamic greetings specifically
  static containsIslamicGreeting(message: string): boolean {
    const islamicGreetings = [
      'salam', 'salaam', 'assalam', 'assalamu', 'walaikum', 'waalaikum',
      'bismillah', 'alhamdulillah', 'inshallah', 'mashallah', 'subhanallah',
      'astaghfirullah', 'jazakallah', 'barakallahu', 'ameen', 'aameen'
    ];
    
    const lowerMessage = message.toLowerCase();
    return islamicGreetings.some(greeting => lowerMessage.includes(greeting));
  }

  static processUserMessage(message: string): string {
    let enhancedPrompt = this.SYSTEM_PROMPT;
    
    // Check if user is asking about founder/company details
    const founderQuestions = [
      'founder', 'banaya', 'malik kashif', 'ceo', 'owner', 'creator', 'skillup founder',
      'talko founder', 'who created', 'who made', 'company details', 'about founder'
    ];
    
    const isAskingAboutFounder = founderQuestions.some(term => 
      message.toLowerCase().includes(term)
    );
    
    if (isAskingAboutFounder) {
      enhancedPrompt += `\n\nFOUNDER INFORMATION (User has asked about founder details):
Name: ${this.FOUNDER_PROFILE.name}
Title: ${this.FOUNDER_PROFILE.title}
Email: ${this.FOUNDER_PROFILE.email}
Phone: ${this.FOUNDER_PROFILE.phone}
Location: ${this.FOUNDER_PROFILE.location}
Professional Summary: ${this.FOUNDER_PROFILE.professionalSummary}
Experience: ${this.FOUNDER_PROFILE.experience.join(', ')}
Technical Stack: Languages - ${this.FOUNDER_PROFILE.technicalStack.languages.join(', ')}, Tools - ${this.FOUNDER_PROFILE.technicalStack.tools.join(', ')}, Specialties - ${this.FOUNDER_PROFILE.technicalStack.specialties.join(', ')}
Education: ${this.FOUNDER_PROFILE.education}
Languages Spoken: ${this.FOUNDER_PROFILE.languages.join(', ')}`;
    }
    
    // Check for Islamic greetings specifically
    const hasIslamicGreeting = this.containsIslamicGreeting(message);
    const hasUrdu = this.containsUrdu(message);
    
    // Only add Islamic greeting instruction if user used Islamic greeting or it's contextually appropriate
    if (hasIslamicGreeting) {
      enhancedPrompt += `\n\nIMPORTANT: The user has used Islamic greetings. You MUST:
1. Respond with appropriate Islamic greeting (like "Wa Alaikum Assalam" if they said "Assalam o Alaikum")
2. Show respectful Islamic behavior and cultural awareness
3. Use appropriate Islamic expressions when relevant (like InshAllah, MashAllah, etc.)
4. Be warm, respectful, and culturally sensitive`;
    }
    
    // Add Urdu language instruction if Urdu is detected (but without automatic Islamic greeting)
    if (hasUrdu && !hasIslamicGreeting) {
      enhancedPrompt += `\n\nIMPORTANT: The user has used Urdu language. You should:
1. Respond primarily in Roman Urdu (Urdu written in English letters)
2. Show cultural awareness and sensitivity
3. Use natural conversational Roman Urdu that feels authentic
4. Be respectful of Pakistani/South Asian culture
5. Only use Islamic greetings if contextually appropriate or if the user used them first`;
    }
    
    enhancedPrompt += `\n\nUser message: ${message}\n\nRespond as Talko AI:`;
    return enhancedPrompt;
  }

  static getIntroductionMessage(): string {
    return `Hello! I'm Talko AI, your advanced artificial intelligence assistant powered by SkillUp.

I'm here to help you with:
🤖 Intelligent conversations and problem-solving
💻 Coding assistance and technical support  
✍️ Creative writing and content creation
📚 Educational support and explanations
💼 Business consulting and professional advice

How can I assist you today?`;
  }

  static getAboutInfo(): any {
    return {
      ...this.TALKO_PERSONALITY,
      version: "2.0",
      releaseDate: "2024",
      features: [
        "Advanced natural language processing",
        "Multi-domain expertise",
        "Real-time conversation",
        "Secure and private",
        "Enterprise-grade reliability",
        "Cultural awareness and multilingual support",
        "Islamic cultural sensitivity"
      ]
    };
  }

  static getFounderInfo(): any {
    return this.FOUNDER_PROFILE;
  }

  static generateChatTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 6).join(' ');
    return words.length > 50 ? words.substring(0, 47) + '...' : words;
  }
}