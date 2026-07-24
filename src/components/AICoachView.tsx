import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  Zap,
  ShieldAlert,
  HeartHandshake,
  Target,
  RefreshCw,
  User,
} from 'lucide-react';
import { CoachPersona, ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

const personas: {
  id: CoachPersona;
  name: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'Focus',
    name: 'Focus',
    desc: 'Deep work, Eisenhower matrix & tactical execution',
    icon: Target,
  },
  {
    id: 'Calm',
    name: 'Calm',
    desc: 'Burnout prevention & sustainable momentum',
    icon: HeartHandshake,
  },
  {
    id: 'Challenge Me',
    name: 'Challenge Me',
    desc: 'No-nonsense direct accountability & zero excuses',
    icon: ShieldAlert,
  },
  {
    id: 'Brainstorm',
    name: 'Brainstorm',
    desc: 'Upbeat brainstorming & 5-minute micro-steps',
    icon: Zap,
  },
];

const starterPrompts = [
  'How do I overcome my 2 PM afternoon energy crash?',
  'Help me apply the Eisenhower Matrix to 5 competing urgent tasks.',
  'What is the best routine to eliminate phone distractions during deep work?',
  'I feel overwhelmed by a giant project. How do I break it into 15-minute steps?',
];

interface AICoachViewProps {
  userName?: string;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ userName = 'User' }) => {
  const [persona, setPersona] = useState<CoachPersona>('Focus');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('focusflow_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'init-1',
        role: 'assistant',
        content: `👋 Hello! I'm your **${persona}** mode coach. \n\nWhether you're battling procrastination, structuring deep work blocks, or streamlining your workflow, I'm here to keep you focused and aligned. \n\n*What is your single most important priority today?*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: 'Focus',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('focusflow_chat_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) throw new Error('No readable stream available.');

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId ? { ...msg, content: accumulatedText } : msg
                  )
                );
              }
            } catch (e) {
              // chunk parsing
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  '⚠️ **Connection error**: Could not connect to server. Please check connection.',
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Chat history cleared. Ready in **${persona}** mode. What shall we accomplish next?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          persona,
        },
      ]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-12 text-slate-800 dark:text-slate-100">
      {/* Personalized Greeting Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Hi {userName}! What would you like to accomplish today?
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select an AI coaching persona below or ask any productivity question.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0E8] dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-medium border border-orange-200/60 dark:border-orange-900/50">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>AI Coach Active</span>
        </div>
      </div>

      {/* Persona Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-orange-500" /> Select Mode
          </span>
          <button
            onClick={handleClearChat}
            className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-orange-400 bg-[#FFF8F5] dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="text-xs font-semibold truncate">{p.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 font-normal">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-3 max-w-3xl ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-medium text-xs ${
                    m.role === 'user'
                      ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-2xs'
                      : 'bg-[#FFF0E8] text-orange-600 border border-orange-200/60 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-xl p-3.5 text-xs md:text-sm ${
                    m.role === 'user'
                      ? 'bg-orange-500 text-white font-normal shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="flex items-center justify-between text-[11px] text-orange-600 dark:text-orange-400 font-medium mb-1.5 pb-1 border-b border-slate-200/60 dark:border-slate-700/50">
                      <span>{m.persona || persona} Mode</span>
                      <span className="text-slate-400 font-normal">{m.timestamp}</span>
                    </div>
                  )}

                  {m.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <MarkdownRenderer content={m.content} showCopyButton={true} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-medium pl-10">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider shrink-0">Prompts:</span>
          {starterPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isStreaming}
              className="px-2.5 py-1 rounded-lg text-xs font-normal bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:text-orange-600 whitespace-nowrap transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex gap-2"
        >
          <input
            type="text"
            placeholder={`Ask in ${persona} mode...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs md:text-sm font-normal focus:outline-none focus:border-orange-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium text-xs md:text-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};

