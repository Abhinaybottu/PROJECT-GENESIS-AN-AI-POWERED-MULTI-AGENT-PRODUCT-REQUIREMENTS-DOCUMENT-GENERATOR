import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";

// Hooks
import { useWorkflow } from "@/hooks/use-workflow";

// Phases
import { Phase1Input } from "@/components/Phase1Input";
import { Phase2WarRoom } from "@/components/Phase2WarRoom";
import { Phase3Roadmap } from "@/components/Phase3Roadmap";
import { Phase5Artifacts } from "@/components/Phase5Artifacts";

const queryClient = new QueryClient();

// Optional: Add space background image from requirements if present
// For this design, CSS gradients handle the core aesthetic, but we can overlay an image if we want.
const bgUrl = `${import.meta.env.BASE_URL}images/space-bg.png`;

function WorkflowController() {
  const {
    currentPhase,
    memory,
    startReflection,
    finishReflection,
    requestChanges,
    approvePlan,
    updateCycle
  } = useWorkflow();

  return (
    <div className="min-h-screen w-full relative selection:bg-primary/30 selection:text-white">
      {/* Background image overlay (subtle) */}
      <div 
        className="fixed inset-0 z-[-1] opacity-20 pointer-events-none mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      
      <main className="container mx-auto relative z-10 pt-12 md:pt-20 pb-20">
        <AnimatePresence mode="wait">
          {currentPhase === "input" && (
            <Phase1Input key="phase1" onSubmit={startReflection} />
          )}
          
          {currentPhase === "reflecting" && (
            <Phase2WarRoom 
              key="phase2" 
              memory={memory}
              onComplete={finishReflection} 
              updateCycle={updateCycle} 
            />
          )}

          {currentPhase === "roadmap" && (
            <Phase3Roadmap 
              key="phase3" 
              memory={memory}
              onApprove={approvePlan}
              onReject={requestChanges}
            />
          )}

          {currentPhase === "artifacts" && (
            <Phase5Artifacts 
              key="phase5" 
              memory={memory} 
              onReset={requestChanges}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  // Ensure dark mode is active by setting the class on a top-level wrapper
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <WorkflowController />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
