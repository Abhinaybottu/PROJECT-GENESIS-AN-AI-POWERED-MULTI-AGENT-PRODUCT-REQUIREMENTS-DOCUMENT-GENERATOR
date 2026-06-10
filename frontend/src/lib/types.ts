export interface Phase {
  name: string;
  duration_days: number;
  description: string;
}

export interface ProjectMemory {
  project_name: string;
  idea: string;
  phases: Phase[];
  cycle: number;
  maxCycles: number;
  approved: boolean;
  provider?: string;
  audit_log?: ChatMessage[];
  artifacts?: {
    prd?: string;
    ics?: string;
  };
}

export type AppPhase = "input" | "reflecting" | "roadmap" | "artifacts";

export interface ChatMessage {
  id: string;
  agent: "strategist" | "critic" | "system";
  text: string;
  cycle: number;
}
