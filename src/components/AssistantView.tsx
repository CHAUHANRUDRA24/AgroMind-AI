import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Mic, 
  PlusSquare, 
  MessageSquare, 
  Sparkles,
  Info,
  Loader2,
  Trash2,
  Database,
  ArrowRight,
  User,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, ChatHistorySession, ActiveTab } from '../types';

interface AssistantViewProps {
  onTabChange: (tab: ActiveTab) => void;
  showToast?: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function AssistantView({ onTabChange, showToast }: AssistantViewProps) {
  // Load chat sessions from local storage if existing, otherwise populate presets
  const [sessions, setSessions] = useState<ChatHistorySession[]>(() => {
    const local = localStorage.getItem('agromind_chat_sessions');
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return [
      {
        id: 'session-1',
        title: 'Best fertilizer for rice',
        lastActive: 'Today',
        messages: [
          {
            id: 'm1',
            sender: 'assistant',
            text: "Hello! I'm AgroMind AI. How can I assist you with your farm today? I can help analyze crop health, suggest fertilizers, or check weather impacts.",
            timestamp: '10:20 AM',
          },
          {
            id: 'm2',
            sender: 'user',
            text: 'What is the best fertilizer for rice in the vegetative stage?',
            timestamp: '10:21 AM',
          },
          {
            id: 'm3',
            sender: 'assistant',
            text: 'For rice in the vegetative stage, nitrogen (N) is the most critical nutrient to promote robust tillering and leaf growth. Here are the recommended approaches:\n\n* **Urea (46-0-0):** Standard choice. Apply in splits (e.g., 2-3 times) to minimize loss.\n* **Ammonium Sulfate (21-0-0-24S):** Excellent if your soil is deficient in sulfur.',
            timestamp: '10:21 AM',
            toolCard: {
              type: 'soil_npk',
              title: 'View Soil Analysis Tool',
              description: 'Check your current sector NPK parameters and adjust localized hydration ratios.',
            }
          }
        ]
      },
      {
        id: 'session-2',
        title: 'Wheat rust early signs',
        lastActive: 'Yesterday',
        messages: [
          {
            id: 'm4',
            sender: 'assistant',
            text: 'Visual diagnostics are ready. Wheat rust represents high hazard flags in early moist periods.',
            timestamp: 'Yesterday',
          }
        ]
      },
      {
        id: 'session-3',
        title: 'Optimal irrigation schedule',
        lastActive: 'Mon, Oct 12',
        messages: [
          {
            id: 'm5',
            sender: 'assistant',
            text: 'Weather predictions reflect rain in 48h. Evaporation holding verified.',
            timestamp: 'Mon, Oct 12',
          }
        ]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || 'session-1');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync sessions with local storage
  useEffect(() => {
    localStorage.setItem('agromind_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId, isLoading]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || inputText).trim();
    if (!rawText || isLoading) return;

    setInputText('');
    setIsLoading(true);

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message local State
    const updatedMessages = [...(activeSession?.messages || []), newUserMessage];
    
    // Update session title on first real message
    let sessionTitle = activeSession?.title || rawText;
    if (activeSession?.messages.length <= 1) {
      sessionTitle = rawText.length > 28 ? rawText.substring(0, 25) + '...' : rawText;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: sessionTitle,
          lastActive: 'Just now',
          messages: updatedMessages,
        };
      }
      return s;
    }));

    try {
      // Query our backend endpoint to obtain genuine Gemini responses!
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawText,
          history: (activeSession?.messages || []).map(m => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Paths to streaming AI answers were momentarily interrupted.');
      }

      const replyData = await res.json();

      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCard: replyData.suggestedTool,
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, newAiMessage],
          };
        }
        return s;
      }));

    } catch (err: any) {
      console.error(err);
      // Append fallback AI failure message
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `Consulting server AI returned a gateway interruption: ${err.message}. Please verify the backend GEMINI_API_KEY is properly initialized under Settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, errorMsg] };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatHistorySession = {
      id: newSessionId,
      title: 'New AgroMind Session',
      lastActive: 'Just now',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: "Welcome to a fresh AgroMind AI Session context. Ask me anything about fertilizers, crop pathology checks, humidity alerts, or soil diagnostics.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  const deleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== idToDelete);
    if (remaining.length === 0) {
      const fallbackId = `session-fallback-${Date.now()}`;
      setSessions([
        {
          id: fallbackId,
          title: 'Welcome Chat',
          lastActive: 'Just now',
          messages: [
            { id: 'welcome', sender: 'assistant', text: 'Hello! I am AgroMind AI Assistant.', timestamp: '12:00 PM' }
          ]
        }
      ]);
      setActiveSessionId(fallbackId);
    } else {
      setSessions(remaining);
      if (activeSessionId === idToDelete) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const suggestions = [
    'Optimal NPK ratio for soy in sector Beta',
    'How does high humidity spread early leaf blight?',
    'Action protocol for holding irrigation zones'
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] overflow-hidden">
      
      {/* Left Chat History Aside panel */}
      <aside className="hidden lg:flex w-72 bg-white rounded-2xl flex-col p-4 flex-shrink-0 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
          <h2 className="font-display-lg text-md font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={16} className="text-emerald-600" /> Chat History
          </h2>
          <button 
            onClick={startNewChat}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-all cursor-pointer"
            title="Start New Session"
          >
            <PlusSquare size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2.5 pr-1">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`p-3 rounded-xl border cursor-pointer select-none relative group transition-all duration-200 ${
                activeSessionId === s.id
                  ? 'bg-emerald-50/70 border-emerald-500/50 text-emerald-950'
                  : 'bg-white border-transparent hover:bg-slate-50 text-gray-700'
              }`}
            >
              <p className="text-xs font-bold truncate pr-6">{s.title}</p>
              <p className="text-[10px] text-gray-400 mt-1">{s.lastActive}</p>
              
              <button
                onClick={(e) => deleteSession(s.id, e)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                title="Delete Session"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Assistant Conversation workspace */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Bot size={22} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-display-lg text-sm font-bold text-gray-900">AgroMind AI Assistant</h2>
              <p className="text-[10px] text-emerald-600 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Gemini 3.5 Engine Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={startNewChat}
              className="lg:hidden p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="New Chat"
            >
              <PlusSquare size={18} />
            </button>
          </div>
        </div>

        {/* Messages Container scroll zone */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-6">
          <AnimatePresence initial={false}>
            {activeSession?.messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar sphere */}
                <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center border font-bold text-xs ${
                  m.sender === 'user' 
                    ? 'bg-slate-100 border-slate-200 text-slate-700' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Text bubble bubble */}
                <div className="max-w-[85%] md:max-w-[70%] space-y-2">
                  <div className={`p-4 rounded-2xl shadow-xs border ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white border-emerald-700 rounded-tr-none text-sm'
                      : 'bg-slate-50 text-gray-800 border-gray-100 rounded-tl-none text-sm leading-relaxed whitespace-pre-line'
                  }`}>
                    {m.text}
                  </div>

                  {/* Contextual Suggestion Tools interactive inside bubble */}
                  {m.sender === 'assistant' && m.toolCard && (
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        if (m.toolCard?.type === 'soil_npk') onTabChange('reports');
                        else if (m.toolCard?.type === 'disease_scan') onTabChange('detection');
                        else if (m.toolCard?.type === 'irrigation_warning') onTabChange('irrigation');
                      }}
                      className="bg-white p-3.5 border border-dashed border-emerald-500/30 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-emerald-50/10 transition-all shadow-xs w-auto max-w-sm"
                    >
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Database size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          {m.toolCard.title} <ExternalLink size={10} className="text-gray-400" />
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{m.toolCard.description}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* AI Typing Loader Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Bot size={14} />
                </div>
                <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl rounded-tl-none flex items-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                  <span>AgroMind pathing consult queries...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Actions & Dialog Input Tray shelf */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/70 z-10 relative space-y-3">
          
          {/* Quick chip queries suggestions */}
          <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(s)}
                disabled={isLoading}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-emerald-50 hover:border-emerald-500/20 text-gray-600 hover:text-emerald-800 text-[11px] font-medium transition-all shadow-xs cursor-pointer select-none disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Form message typing container */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 border border-gray-200 bg-white focus-within:border-emerald-500 rounded-xl p-1.5 shadow-sm transition-all"
          >
            <button 
              type="button" 
              onClick={() => {
                if (showToast) {
                  showToast("Photo attachment triggered. Select the 'Leaf Analyzer' tab to scan and diagnose diseases.", "info");
                } else {
                  alert("Photo leaf indexing attachment triggered within workspace. Choose 'Disease Detection' screen for automatic photo classification.");
                }
              }}
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
              title="Attach leaf photograph"
            >
              <Paperclip size={18} />
            </button>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Ask AgroMind AI regarding NPK ratios, crop diseases, or watering schedule..."
              className="flex-1 bg-transparent border-none text-gray-800 placeholder-gray-400 text-sm outline-none font-body-md py-1.5 px-1 focus:ring-0"
            />

            <button 
              type="button"
              onClick={() => {
                if (showToast) {
                  showToast("Speech transcription requires real-time microphone permissions.", "warning");
                } else {
                  alert("Speech transcription requires real-time microphone authorizations.");
                }
              }}
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
              title="Voice input"
            >
              <Mic size={18} />
            </button>

            <button 
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white p-2.5 rounded-lg shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </form>

          <p className="text-center text-[9px] text-gray-400 flex items-center justify-center gap-1">
            <Info size={10} /> AgroMind AI balances pathology references. Verify high-stake farming schedules.
          </p>
        </div>

      </div>

    </div>
  );
}
