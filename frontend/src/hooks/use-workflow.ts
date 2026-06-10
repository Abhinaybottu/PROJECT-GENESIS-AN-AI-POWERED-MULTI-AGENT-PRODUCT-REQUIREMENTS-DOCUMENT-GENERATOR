import { useState, useCallback } from "react";
import { AppPhase, ProjectMemory } from "@/lib/types";

const MOCK_PHASES = [
  { name: "Discovery & Research", duration_days: 7, description: "Stakeholder interviews, competitive analysis, and defining the core problem space. Establish user personas and key success metrics." },
  { name: "Design & Architecture", duration_days: 10, description: "System architecture design, UI/UX wireframes, database schema planning, and API contract definition using OpenAPI." },
  { name: "Core Development", duration_days: 21, description: "Backend API implementation, frontend component development, database migrations, and integration of core features." },
  { name: "Testing & QA", duration_days: 7, description: "Unit tests, integration tests, end-to-end test automation, performance profiling, and security audit." },
  { name: "Deployment & Launch", duration_days: 3, description: "CI/CD pipeline setup, production environment configuration, monitoring setup, and staged rollout to production." }
];

export function useWorkflow() {
  const [phase, setPhase] = useState<AppPhase>("input");
  const [memory, setMemory] = useState<ProjectMemory>({
    project_name: "Genesis Project",
    idea: "",
    phases: [],
    cycle: 1,
    maxCycles: 3,
    approved: false,
  });

  const startReflection = useCallback(async (idea: string, projectName: string, provider: string) => {
    setPhase("reflecting");
    try {
      const response = await fetch("http://localhost:8000/api/start-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, project_name: projectName, provider })
      });
      
      if (!response.ok) throw new Error("Failed to start reflection");
      
      const data = await response.json();
      setMemory(prev => ({
        ...prev,
        idea: data.idea,
        project_name: data.project_name,
        phases: data.phases,
        audit_log: data.audit_log,
        cycle: data.cycle,
        provider: provider,
        approved: false
      }));
      // Purposely NOT setting phase to "roadmap" here! 
      // Phase2WarRoom will animate the audit_log first, then automatically dispatch finishReflection()!
    } catch (error) {
      console.error("API Error:", error);
      setPhase("input");
    }
  }, []);

  const finishReflection = useCallback(() => {
    setPhase("roadmap");
  }, []);

  const requestChanges = useCallback(() => {
    setPhase("input");
  }, []);

  const approvePlan = useCallback(async () => {
    setPhase("artifacts");
    try {
      const response = await fetch("http://localhost:8000/api/generate-artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: memory, provider: memory.provider || "gemini" })
      });
      
      if (!response.ok) throw new Error("Failed to generate artifacts");
      
      const data = await response.json();
      console.log("Artifacts generated:", data);
      
      setMemory(prev => ({ 
        ...prev, 
        approved: true,
        artifacts: {
          prd: data.docs?.content,
          ics: data.calendar?.content
        }
      }));
    } catch (error) {
      console.error("Artifact Error:", error);
    }
  }, [memory]);

  const updateCycle = useCallback((cycle: number) => {
    setMemory(prev => prev.cycle === cycle ? prev : { ...prev, cycle });
  }, []);

  return {
    currentPhase: phase,
    memory,
    startReflection,
    finishReflection,
    requestChanges,
    approvePlan,
    updateCycle
  };
}
