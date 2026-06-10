import React from "react";
import { motion, Variants } from "framer-motion";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { ProjectMemory, Phase } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface Props {
  memory: ProjectMemory;
  onApprove: () => void;
  onReject: () => void;
}

export function Phase3Roadmap({ memory, onApprove, onReject }: Props) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center min-h-screen pt-8"
    >
      <div className="relative z-10 w-full px-6 flex flex-col items-center pb-80">


        <div className="mb-16 text-center w-full">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[13px] font-bold tracking-widest uppercase mb-8 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Strategy Architecture Finalized

          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight leading-tight mb-4">
            Generated Roadmap
          </h1>
          <p className="text-lg text-slate-400 font-medium">{memory.project_name}</p>
        </div>

        <div className="relative w-full">
          {/* Subtle Dash Line */}
          <div className="absolute left-[34px] md:left-[47px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200" />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-12"
          >
            {memory.phases && memory.phases.map((phase: Phase, idx: number) => (
              <motion.div 
                key={`${phase.name}-${idx}`} 
                variants={itemVariants} 
                className="relative pl-16 md:pl-24"
              >
                {/* Timeline Circle */}
                <div className="absolute left-0 md:left-2 top-3 w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-[2rem] bg-white border border-slate-200 flex flex-col items-center justify-center shadow-lg hover:border-blue-500 transition-colors cursor-default z-10">
                  <span className="text-blue-600 font-bold text-3xl leading-none">0{idx + 1}</span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mt-1">Phase</span>
                </div>

                {/* Card with improved spacing and padding */}
                <div className="bg-white/70 backdrop-blur-xl border border-slate-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <FileText className="w-48 h-48 text-blue-600" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight leading-none truncate">{phase.name}</h3>
                      <div className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/20 whitespace-nowrap">
                        {phase.duration_days} Days
                      </div>
                    </div>
                    <p className="text-slate-500 font-medium leading-[1.7] md:text-lg">
                      {phase.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Human Approval Gate - Improved Floating Bar */}
      <motion.div 
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 150, damping: 25 }}
        className="fixed bottom-10 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-50 px-2"
      >
        <div className="bg-white/90 backdrop-blur-3xl p-6 sm:p-8 rounded-[3rem] border border-slate-200 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.15)] flex flex-col md:flex-row items-center justify-between gap-8 ring-8 ring-white/50">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-bold text-slate-800 mb-1">Human Approval</h4>
            <p className="text-slate-400 font-medium text-sm">Review this strategy and proceed to PRD Generation.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={onReject}
              className="flex-1 md:flex-none h-14 px-8 rounded-full border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-all"
            >
              <XCircle className="w-5 h-5 mr-3" />
              Reset Room
            </Button>
            <Button 
              onClick={onApprove}
              className="flex-1 md:flex-none h-14 px-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-500/30 cursor-pointer transition-all active:scale-95"
            >
              <CheckCircle className="w-5 h-5 mr-3" />
              Approve & Generate
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
