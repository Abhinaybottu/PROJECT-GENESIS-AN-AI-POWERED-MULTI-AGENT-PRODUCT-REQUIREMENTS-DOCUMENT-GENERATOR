import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Calendar, Download, FileText, ArrowRight, Loader2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { ProjectMemory } from "@/lib/types";
import { triggerDownload } from "@/lib/generators";
import { Button } from "@/components/ui/button";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { marked } from "marked";

interface Props {
  memory: ProjectMemory;
  onReset: () => void;
}

export function Phase5Artifacts({ memory, onReset }: Props) {
  useEffect(() => {
    if (memory.artifacts) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#2563eb', '#3b82f6', '#60a5fa']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#2563eb', '#3b82f6', '#60a5fa']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [memory.artifacts]);

  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const prdContent = memory.artifacts?.prd;

  const handleDownloadPRD = () => {
    console.log("PRD Download Triggered");
    if (!prdContent) {
      console.error("PRD Content is missing from memory artifacts");
      return;
    }
    try {
      console.log("Generating .md blob for:", memory.project_name);
      triggerDownload(prdContent, `${memory.project_name.replace(/\s+/g, '_')}_PRD.md`, 'text/markdown');
      console.log("PRD (.md) download started successfully");
    } catch (err) {
      console.error("Failed to trigger .md download:", err);
    }
  };

  const handleDownloadPDF = async () => {
    console.log("PDF Export Triggered");
    if (!prdContent || isExporting) return;
    
    try {
      setIsExporting(true);
      console.log("Starting secure PDF generation process...");
      
      const rawHtml = await marked.parse(prdContent);
      const fileName = `${memory.project_name.replace(/\s+/g, '_')}_PRD`;
      
      // The browser's native print engine is the most robust way to generate perfectly 
      // paginated, searchable vector PDFs without crashing on modern CSS.
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '-10000px';
      iframe.style.top = '0px';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not create iframe document for PDF");

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${fileName}</title>
          <style>
            @page { 
              size: auto;
              margin: 0mm; /* This removes the default browser headers/footers (watermarks) */
            }
            body { 
              padding: 20mm; /* We restore the page margin using padding instead */
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; 
              color: #0f172a; 
              line-height: 1.6; 
            }
            h1 { font-size: 24pt; font-weight: 800; margin-bottom: 12pt; border-bottom: 2pt solid #e2e8f0; padding-bottom: 6pt; color: #0f172a; }
            h2 { font-size: 18pt; font-weight: 700; margin-top: 20pt; margin-bottom: 10pt; color: #1e293b; }
            h3 { font-size: 14pt; font-weight: 600; margin-top: 14pt; margin-bottom: 6pt; color: #334155; }
            p { margin-bottom: 10pt; color: #334155; font-size: 11pt; }
            ul, ol { margin-bottom: 10pt; padding-left: 20pt; color: #334155; font-size: 11pt; }
            li { margin-bottom: 4pt; }
            strong { font-weight: 700; color: #0f172a; }
            blockquote { border-left: 4pt solid #cbd5e1; padding-left: 12pt; color: #475569; font-style: italic; margin-left: 0; background: #f8fafc; padding: 10pt 12pt; border-radius: 0 4pt 4pt 0; }
            code { background-color: #f1f5f9; padding: 2pt 4pt; border-radius: 3pt; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10pt; color: #b13a0b; }
            pre { background-color: #f8fafc; padding: 12pt; border-radius: 6pt; overflow-x: auto; margin-bottom: 12pt; border: 1pt solid #e2e8f0; page-break-inside: avoid; }
            pre code { background-color: transparent; padding: 0; color: #334155; border-radius: 0;}
            table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; font-size: 11pt; }
            th, td { border: 1pt solid #e2e8f0; padding: 6pt 10pt; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            a { color: #2563eb; text-decoration: none; }
            
            /* Print Specific Optimizations */
            img { max-width: 100%; page-break-inside: avoid; }
            h1, h2, h3 { page-break-after: avoid; }
            tr, blockquote { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          ${rawHtml}
        </body>
        </html>
      `);
      iframeDoc.close();

      console.log("Triggering native browser PDF engine...");
      
      // Wait briefly for iframe to fully render
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          console.error("Print dialog failed:", printErr);
          handleDownloadPRD();
        } finally {
          setIsExporting(false);
          // Wait before removing iframe so print dialog doesn't close prematurely in some browsers
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 500);

    } catch (error) {
      console.error("CRITICAL: PDF Export failed with error:", error);
      alert("An unexpected error occurred. Downloading as Markdown instead.");
      handleDownloadPRD();
    } finally {
      setIsExporting(false);
      console.log("Export state reset to idle");
    }
  };


  const handleDownloadICS = () => {
    const icsContent = memory.artifacts?.ics;
    if (!icsContent) return;
    triggerDownload(icsContent, `${memory.project_name.replace(/\s+/g, '_')}_Roadmap.ics`, 'text/calendar');
  };

  if (!memory.artifacts) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-4xl mx-auto py-12 px-6 flex flex-col items-center justify-center text-center min-h-[60vh]"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center relative z-10 border border-blue-100 shadow-lg">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight">Generating Assets...</h1>
        <p className="text-slate-400 text-base max-w-md font-medium leading-relaxed">
          AI agents are compiling your PRD and schedule.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto py-4 px-6 flex flex-col items-center min-h-screen pb-32"
    >
      <div className="mb-8 text-center w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[12px] font-bold tracking-widest uppercase mb-4 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Mission Success
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-2">
          Project Initialized
        </h1>
        <p className="text-base text-slate-400 font-medium">Your strategy documents are ready for deployment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col h-[700px] shadow-sm hover:shadow-md transition-all">
          <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-500">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              PRODUCT_SPEC.md
            </div>
            
            <div className="flex bg-slate-200/50 p-1 rounded-full self-center">
              <button 
                onClick={() => setViewMode("preview")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setViewMode("code")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${viewMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Markdown
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleDownloadPRD}
                className="rounded-full px-4 font-bold h-9 text-xs border-slate-200 text-slate-600 cursor-pointer bg-white"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                .md
              </Button>
              <Button 
                size="sm" 
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 font-bold h-9 text-xs shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'PDF'}
              </Button>
            </div>
          </div>
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white scroll-smooth relative">
            {viewMode === "code" ? (
              <pre className="text-[14px] font-mono text-slate-800 whitespace-pre-wrap leading-[1.6] font-medium selection:bg-blue-100 pr-4">
                <code>{prdContent}</code>
              </pre>
            ) : (
              <div className="pr-4 pb-8">
                <div ref={printRef} className="bg-white pdf-content-wrapper p-4">
                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed selection:bg-blue-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm as any]}>
                      {prdContent || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-blue-600 p-8 rounded-[2.5rem] flex flex-col items-center text-center group relative overflow-hidden shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
              <Calendar className="w-32 h-32 text-white" />
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-white backdrop-blur-md">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sync Calendar</h3>
            <p className="text-blue-100 text-xs font-medium mb-8 leading-relaxed px-2">
              Import all {memory.phases.length} phases directly into your calendar.
            </p>
            <Button 
              onClick={handleDownloadICS} 
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold h-12 rounded-xl shadow-md cursor-pointer text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Get .ics File
            </Button>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-slate-400">
              <ArrowRight className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Initialize New</h3>
            <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">
              Architect your next big project idea.
            </p>
            <Button 
              variant="outline" 
              onClick={onReset} 
              className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer text-sm"
            >
              Start New Room
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
