from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uvicorn
import json
from dotenv import load_dotenv

# Import shared functions
from engine import run_strategist_loop, run_agent, create_calendar_file, create_markdown_doc

load_dotenv()

app = FastAPI(title="ProjectGenesis API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectRequest(BaseModel):
    idea: str
    project_name: Optional[str] = "Genesis Project"
    provider: Optional[str] = "gemini"

class ArtifactRequest(BaseModel):
    plan: Dict[str, Any]
    provider: Optional[str] = "gemini"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/start-reflection")
async def start_reflection(req: ProjectRequest):
    try:
        plan = run_strategist_loop(req.idea, req.provider)
        # Map the plan to the expected React state structure
        return {
            "project_name": plan.get("project_name", req.project_name),
            "idea": req.idea,
            "phases": plan.get("phases", []),
            "audit_log": plan.get("audit_log", []),
            "cycle": 1,
            "approved": False
        }
    except Exception as e:
        print(f"Error in start_reflection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-artifacts")
async def generate_artifacts(req: ArtifactRequest):
    try:
        plan_str = json.dumps(req.plan)
        today = "2026-03-24" # Mock today
        
        # Parallel logic simplified for the API (sequential for simplicity here)
        cal_prompt = f"Scheduler. Read plan: {plan_str}. Date: {today}. Events: title, start_date (YYYYMMDD), description. Call 'create_calendar_file'."
        doc_prompt = f"""
        You are an Expert Product Manager. Write a highly professional and structured Product Requirements Document (PRD) in Markdown.
        Base it entirely on this approved project plan: {plan_str}. 

        You MUST structure the document exactly with these 10 sections (use Markdown headers):

        # 1. Document Information & Context
        (Project Name, Status, Stakeholders, Document Versioning)

        # 2. Executive Summary (The "Why")
        (Problem Statement, Value Proposition, Goals, Non-Goals)

        # 3. Target Audience & User Personas
        (User Personas, User Needs, User Stories)

        # 4. Functional Requirements (The "What")
        (Feature Inventory P0/P1/P2, Detailed Functional Specs, User Flows)

        # 5. User Experience (UX) & Interface (UI)
        (Design Principles, Wireframes/Mockups, Accessibility Standards)

        # 6. Non-Functional Requirements (The "How Well")
        (Performance, Security, Scalability, Availability)

        # 7. Technical Constraints & Architecture
        (Tech Stack, API Requirements, Data Model)

        # 8. Analytics & Success Metrics
        (KPIs, Event Tracking)

        # 9. Assumptions, Risks, & Dependencies
        (Assumptions, Risks, Dependencies)

        # 10. Roadmap & Release Plan
        (Milestones, Phasing, Rollout Strategy based heavily on the generated timeline phases)

        Call the 'create_markdown_doc' tool with the complete Markdown text.
        """
        
        # Note: Gemini natively calls these tools, for Groq we have to parse and call.
        # This implementation will favor Gemini for artifacts or simulate with Gemini.
        # For simplicity in this demo, let's use Gemini for the tools part even if Groq planned it.
        
        cal_res = run_agent(req.provider, "CalendarBot", "Scheduling Assistant", cal_prompt, tools=[create_calendar_file] if req.provider == 'gemini' else None)
        doc_res = run_agent(req.provider, "DocBot", "Documentation Expert", doc_prompt, tools=[create_markdown_doc] if req.provider == 'gemini' else None)
        
        
        return {
            "calendar": cal_res if isinstance(cal_res, dict) else {"status": "success", "content": str(cal_res)},
            "docs": doc_res if isinstance(doc_res, dict) else {"status": "success", "content": str(doc_res)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
