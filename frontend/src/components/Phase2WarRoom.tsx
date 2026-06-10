import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { ChatMessage, ProjectMemory } from "@/lib/types";

const STATIC_SCRIPT = [
  { agent: "system", text: "Initializing Secure Connection... [ENCRYPTED]", cycle: 1 },
  { agent: "system", text: "Connecting to Strategist Node...", cycle: 1 },
  { agent: "system", text: "Connecting to Critic Node...", cycle: 1 },
] as const;

interface Props {
  memory: ProjectMemory;
  onComplete: () => void;
  updateCycle: (cycle: number) => void;
}

export function Phase2WarRoom({ memory, onComplete, updateCycle }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayScript = React.useMemo(() => {
    return memory.audit_log && memory.audit_log.length > 0 
      ? [...STATIC_SCRIPT, ...memory.audit_log] 
      : [...STATIC_SCRIPT];
  }, [memory.audit_log]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (currentIndex >= displayScript.length) {
      if (memory.audit_log && memory.audit_log.length > 0) {
        const timer = setTimeout(() => {
          onComplete();
        }, 2000);
        return () => clearTimeout(timer);
      }
      return; 
    }

    const nextMsg = displayScript[currentIndex];
    if (nextMsg.agent !== "system") {
      updateCycle(nextMsg.cycle);
    }

    const typingDelay = nextMsg.agent === "system" ? 500 : 1500 + Math.random() * 800;
    setIsTyping(true);
    
    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { ...nextMsg, id: `msg-${currentIndex}` } as ChatMessage]);
      setCurrentIndex(prev => prev + 1);
    }, typingDelay);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete, updateCycle, displayScript, memory.audit_log]);

  const currentSpeaker = currentIndex < displayScript.length ? displayScript[currentIndex].agent : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-4 min-h-[85vh] text-slate-900"
    >
      <div className="relative z-10 w-full max-w-5xl h-full flex flex-col pt-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 px-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">REFLECTION LOOP LIVE</h2>
          </div>
          <div className="bg-white border border-slate-200 px-5 py-2 rounded-full text-slate-600 font-bold text-sm shadow-sm">
            CYCLE {messages.length > 0 ? messages[messages.length - 1].cycle : 1} / 3
          </div>
        </div>

        <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden flex flex-col relative border border-slate-200 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.06)]">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-8 custom-scrollbar scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex w-full ${msg.agent === 'critic' ? 'justify-end' : msg.agent === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  {msg.agent === 'system' ? (
                    <div className="bg-slate-50 border border-slate-100 text-slate-400 px-8 py-2.5 rounded-full text-[11px] font-bold tracking-[0.2em] flex items-center gap-2 uppercase shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-blue-500" />
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`flex gap-6 max-w-[85%] ${msg.agent === 'critic' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-105
                          ${msg.agent === 'strategist' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'}`}
                        >
                          {msg.agent === 'strategist' ? <Brain className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                        </div>
                      </div>
                      
                      <div className={`flex flex-col gap-2 ${msg.agent === 'critic' ? 'items-end' : 'items-start'}`}>
                        <span className={`text-[13px] font-bold tracking-wider uppercase flex items-center gap-2
                          ${msg.agent === 'critic' ? 'text-slate-500' : 'text-blue-600'}`}>
                          {msg.agent === 'strategist' ? 'Strategic Architect' : 'System Critic'}
                        </span>
                        <div className={`p-6 rounded-[2rem] text-[16px] leading-[1.6] shadow-sm font-medium
                          ${msg.agent === 'strategist' 
                            ? 'bg-blue-50 border border-blue-100/50 text-slate-700 rounded-tl-lg' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tr-lg'}`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isTyping && currentSpeaker !== 'system' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex w-full ${currentSpeaker === 'critic' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-6 max-w-[85%] ${currentSpeaker === 'critic' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse
                        ${currentSpeaker === 'strategist' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}
                      >
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 justify-center">
                      <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[2rem] flex items-center gap-2 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
