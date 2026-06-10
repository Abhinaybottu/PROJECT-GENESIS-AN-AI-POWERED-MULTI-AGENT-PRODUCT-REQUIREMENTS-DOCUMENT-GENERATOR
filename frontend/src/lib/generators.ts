import { addDays, format } from "date-fns";
import { ProjectMemory } from "./types";

export function generatePRD(memory: ProjectMemory): string {
  let md = `# Project Requirements Document: ${memory.project_name || "Untitled Project"}\n\n`;
  
  md += `## 1. Executive Summary\n`;
  md += `> ${memory.idea}\n\n`;
  
  md += `## 2. Execution Roadmap\n`;
  md += `The project is divided into ${memory.phases.length} core phases, totaling ${memory.phases.reduce((acc, p) => acc + p.duration_days, 0)} days of effort.\n\n`;
  
  md += `| Phase | Duration | Description |\n`;
  md += `|-------|----------|-------------|\n`;
  memory.phases.forEach((p, i) => {
    md += `| ${i + 1}. ${p.name} | ${p.duration_days} days | ${p.description} |\n`;
  });
  
  md += `\n## 3. Success Metrics & Approvals\n`;
  md += `- Architecture signed off by AI Strategist\n`;
  md += `- Timelines vetted by AI Critic\n`;
  md += `- Final human approval granted\n`;
  
  return md;
}

export function generateICS(memory: ProjectMemory): string {
  let ics = `BEGIN:VCALENDAR\r\n`;
  ics += `VERSION:2.0\r\n`;
  ics += `PRODID:-//ProjectGenesis//AI Project Manager//EN\r\n`;
  ics += `CALSCALE:GREGORIAN\r\n`;

  let currentDate = new Date(); // Start today

  memory.phases.forEach((phase, index) => {
    const startDate = currentDate;
    const endDate = addDays(startDate, phase.duration_days);
    
    // Format: YYYYMMDDTHHMMSSZ
    const fmtStart = format(startDate, "yyyyMMdd'T'HHmmss'Z'");
    const fmtEnd = format(endDate, "yyyyMMdd'T'HHmmss'Z'");
    const stamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

    ics += `BEGIN:VEVENT\r\n`;
    ics += `DTSTAMP:${stamp}\r\n`;
    ics += `DTSTART:${fmtStart}\r\n`;
    ics += `DTEND:${fmtEnd}\r\n`;
    ics += `SUMMARY:[Phase ${index + 1}] ${phase.name}\r\n`;
    ics += `DESCRIPTION:${phase.description}\r\n`;
    ics += `UID:phase-${index}-${Date.now()}@projectgenesis.ai\r\n`;
    ics += `END:VEVENT\r\n`;

    // Next phase starts when this one ends
    currentDate = endDate;
  });

  ics += `END:VCALENDAR\r\n`;
  return ics;
}

export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
