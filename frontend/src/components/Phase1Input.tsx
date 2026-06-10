import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowUp } from "lucide-react";

interface Props {
  onSubmit: (idea: string, projectName: string, provider: string) => void;
}

export function Phase1Input({ onSubmit }: Props) {
  const [idea, setIdea] = useState("");
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("gemini");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea, name, provider);
    }
  };

  const samplePrompts = [
    "Build a freelance marketplace with Stripe",
    "Design an AI habit tracker app",
    "Create a real-estate dashboard",
    "Plan a food delivery platform",
    "Develop a SaaS analytics tool"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-4 min-h-[85vh] text-slate-900"
    >
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">


        
        {/* Header Text */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-bold text-[#1a1c23] tracking-tight leading-[1.1]">
            Architect High-Performing<br />
            <span className="text-slate-400">PRDs in Seconds</span>
          </h1>
        </motion.div>

        {/* Input Form Box */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-3xl"
        >
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-slate-100 p-6 flex flex-col gap-4"
          >
            {/* Optional Project Name */}
            <input
              type="text"
              placeholder="Project Name (Optional)"
              className="w-full bg-transparent border-b border-slate-100 pb-3 text-lg font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            
            {/* Main Idea Input */}
            <textarea
              placeholder="What do you want to build today?"
              className="w-full bg-transparent resize-none min-h-[140px] text-[1.1rem] leading-relaxed text-slate-700 placeholder:text-slate-400 focus:outline-none custom-scrollbar"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              autoFocus
            />
            
            {/* Bottom Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-400 mr-2">Model:</span>
                <button
                  type="button"
                  onClick={() => setProvider("gemini")}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-all ${
                    provider === "gemini" 
                      ? "bg-slate-100 text-slate-800 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Gemini
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("groq")}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-all ${
                    provider === "groq" 
                      ? "bg-slate-100 text-slate-800 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Groq
                </button>
              </div>
              
              <button 
                type="submit" 
                disabled={!idea.trim()}
                className="group flex flex-row-reverse sm:flex-row items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full pl-6 pr-3 py-2 font-semibold shadow-lg shadow-blue-500/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm">Generate PRD</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUp className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Floating Suggestion Pills */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mt-8 max-w-4xl"
        >
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIdea(prompt)}
              className="px-5 py-2.5 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200 text-sm font-medium text-slate-600 cursor-pointer hover:bg-white hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all"
            >
              {prompt}
            </button>
          ))}
        </motion.div>

      </div>
    </motion.div>
  );
}
