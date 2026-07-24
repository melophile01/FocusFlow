import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Sparkles,
  Bookmark,
  Trash2,
  RefreshCw,
  Download,
  Copy,
  Check,
  Calendar,
  Clock,
  HelpCircle,
  ListChecks,
  Lightbulb,
  CheckSquare,
  Square,
  FileCheck2,
  FileSpreadsheet,
} from 'lucide-react';
import { SavedSummary, StructuredNotes } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CopyButton } from './CopyButton';

interface NotesSummarizerViewProps {
  savedSummaries: SavedSummary[];
  onSaveSummary: (summary: SavedSummary) => void;
  onDeleteSummary: (id: string) => void;
  userName?: string;
}

const summaryFormats = [
  { id: 'Executive Brief', name: 'Executive Brief', desc: 'High-level synthesis, key takeaways & follow-ups' },
  { id: 'Action Items Only', name: 'Action Items Checklist', desc: 'Tasks, implied assignees & deadlines' },
  { id: 'Decision Log', name: 'Decision Log', desc: 'Key decisions, rationale & open questions' },
  { id: 'Detailed Synthesis', name: 'Detailed Synthesis', desc: 'In-depth structured topic breakdown' },
];

const sampleNotes = `Product Team Sync - July 24
Attendees: Sarah (PM), Dave (Lead Dev), Alex (Design)

Discussion Notes:
- Discussed Q3 roadmap and feature priorities for FocusFlow AI.
- Alex shared mockups for dark mode UI and time-blocking components. Overall team loved the sleek dark indigo palette.
- Dave mentioned we need to make sure Gemini API calls go through Express server-side routes to protect API keys.
- Sarah highlighted customer requests for email generation and goal roadmaps.
- We decided to add a Pomodoro focus timer widget on the dashboard.

Action Items & Key Dates:
- Dave to implement Express endpoints for /api/ai/chat, /api/ai/plan-day, /api/ai/summarize by Friday, July 26.
- Alex to finish design handoff for goal roadmap milestones by Monday, July 29.
- Sarah to draft launch announcement email using the AI Email Generator by next Tuesday, July 30.
- Product Launch Event scheduled for August 15.

Questions to Review:
- Should we include a custom audio bell sound for Pomodoro timer completion?
- Do we need multi-user team workspaces in V2?`;

const defaultStructuredNotes: StructuredNotes = {
  summary: "The Product Team reviewed Q3 roadmap priorities for FocusFlow AI, approving dark mode UI mockups and agreeing on server-side Gemini API routing for maximum key security. Strategic additions include an integrated Pomodoro timer widget, custom daily planner, and executive notes summarizer.",
  keyPoints: [
    "Approved dark mode UI and indigo design palette across all core app views.",
    "Mandated server-side API proxy routes (/api/ai/*) to protect API keys.",
    "Prioritized Pomodoro timer widget and email generator based on user feedback."
  ],
  actionItems: [
    { task: "Implement Express endpoints for /api/ai/chat, plan-day, summarize", assignee: "Dave (Lead Dev)", priority: "High" },
    { task: "Finish design handoff for goal roadmap milestones", assignee: "Alex (Design)", priority: "Medium" },
    { task: "Draft launch announcement email using AI Email Generator", assignee: "Sarah (PM)", priority: "Medium" }
  ],
  deadlines: [
    "Friday, July 26 - Backend Express Endpoints Handoff",
    "Monday, July 29 - Goal Roadmap Design Handoff",
    "Tuesday, July 30 - Launch Announcement Email Draft"
  ],
  importantDates: [
    "July 24 - Q3 Product Alignment Sync",
    "August 15 - FocusFlow AI Product Launch Event"
  ],
  questionsToReview: [
    "Should we include custom audio bell chime options for Pomodoro focus loops?",
    "Do we require multi-user team workspace permissions in the V2 release?"
  ]
};

export const NotesSummarizerView: React.FC<NotesSummarizerViewProps> = ({
  savedSummaries,
  onSaveSummary,
  onDeleteSummary,
  userName,
}) => {
  const [rawNotes, setRawNotes] = useState(sampleNotes);
  const [format, setFormat] = useState('Executive Brief');
  const [title, setTitle] = useState('Product Team Sync Summary');
  const [summaryMarkdown, setSummaryMarkdown] = useState('');
  const [structuredNotes, setStructuredNotes] = useState<StructuredNotes | null>(defaultStructuredNotes);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [viewTab, setViewTab] = useState<'structured' | 'markdown'>('structured');

  const handleSummarize = async () => {
    if (!rawNotes.trim()) return;
    setIsSummarizing(true);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes, format }),
      });

      const data = await response.json();
      if (data.summary) {
        setSummaryMarkdown(data.summary);
        if (data.structured) {
          setStructuredNotes({
            summary: data.structured.summary || 'Summary generated.',
            keyPoints: data.structured.keyPoints || [],
            actionItems: (data.structured.actionItems || []).map((item: any) =>
              typeof item === 'string'
                ? { task: item, assignee: 'Team', priority: 'Medium' }
                : { task: item.task || 'Task', assignee: item.assignee || 'Unassigned', priority: item.priority || 'Medium' }
            ),
            deadlines: data.structured.deadlines || [],
            importantDates: data.structured.importantDates || [],
            questionsToReview: data.structured.questionsToReview || [],
          });
        }
      } else {
        throw new Error(data.error || 'Failed to summarize notes');
      }
    } catch (err: any) {
      console.error('Summarize error:', err);
      setSummaryMarkdown(`⚠️ **Error summarizing notes**: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleToggleTask = (index: number) => {
    if (!structuredNotes) return;
    const updatedTasks = [...structuredNotes.actionItems];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setStructuredNotes({ ...structuredNotes, actionItems: updatedTasks });
  };

  const handleSaveCurrentSummary = () => {
    const content = summaryMarkdown || (structuredNotes ? `${structuredNotes.summary}\n\nKey Points:\n${structuredNotes.keyPoints.map(k=>`- ${k}`).join('\n')}` : rawNotes);
    const newSummary: SavedSummary = {
      id: Date.now().toString(),
      title: title || 'Executive Summary',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rawNotes,
      format,
      summaryMarkdown: content,
      structured: structuredNotes || undefined,
    };
    onSaveSummary(newSummary);
  };

  // Download PDF / Printable Executive Summary
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const notesData = structuredNotes || defaultStructuredNotes;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'Executive Summary Report'}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; margin-bottom: 8px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
            .section { margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
            .section-title { font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #d97706; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
            ul { margin: 0; padding-left: 20px; }
            li { margin-bottom: 6px; }
            .task-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px border #f1f5f9; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: #fef3c7; color: #b45309; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title || 'Executive Summary Report'}</h1>
          <div class="meta">Generated by FocusFlow AI • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>

          <div class="section">
            <div class="section-title">📌 Executive Summary</div>
            <p style="margin: 0;">${notesData.summary}</p>
          </div>

          ${notesData.keyPoints?.length ? `
          <div class="section">
            <div class="section-title">💡 Key Points</div>
            <ul>${notesData.keyPoints.map(k => `<li>${k}</li>`).join('')}</ul>
          </div>` : ''}

          ${notesData.actionItems?.length ? `
          <div class="section">
            <div class="section-title">✅ Action Items</div>
            <ul>${notesData.actionItems.map(a => `<li><strong>${a.task}</strong> — <em>${a.assignee || 'Unassigned'}</em> [${a.priority || 'Medium'}]</li>`).join('')}</ul>
          </div>` : ''}

          ${notesData.deadlines?.length ? `
          <div class="section">
            <div class="section-title">⏰ Deadlines</div>
            <ul>${notesData.deadlines.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>` : ''}

          ${notesData.importantDates?.length ? `
          <div class="section">
            <div class="section-title">📅 Important Dates</div>
            <ul>${notesData.importantDates.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>` : ''}

          ${notesData.questionsToReview?.length ? `
          <div class="section">
            <div class="section-title">❓ Questions to Review</div>
            <ul>${notesData.questionsToReview.map(q => `<li>${q}</li>`).join('')}</ul>
          </div>` : ''}

          <div style="margin-top: 40px; text-align: center;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Compile full text to copy
  const getFullTextToCopy = () => {
    if (summaryMarkdown) return summaryMarkdown;
    if (!structuredNotes) return rawNotes;
    return `SUMMARY:
${structuredNotes.summary}

KEY POINTS:
${structuredNotes.keyPoints.map(k => `- ${k}`).join('\n')}

ACTION ITEMS:
${structuredNotes.actionItems.map(a => `- ${a.task} (Assignee: ${a.assignee})`).join('\n')}

DEADLINES:
${structuredNotes.deadlines.map(d => `- ${d}`).join('\n')}

IMPORTANT DATES:
${structuredNotes.importantDates.map(d => `- ${d}`).join('\n')}

QUESTIONS TO REVIEW:
${structuredNotes.questionsToReview.map(q => `- ${q}`).join('\n')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input: Raw Notes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>{userName ? `${userName}'s Notes` : 'Your Notes'}</span>
              </div>

              <button
                onClick={() => setRawNotes(sampleNotes)}
                className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Load Sample Notes
              </button>
            </div>

            {/* Note Title */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Note Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Roadmap Strategy Sync"
                className="w-full text-xs md:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Template Format Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Output Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {summaryFormats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      format === f.id
                        ? 'border-orange-400 bg-[#FFF8F5] dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-medium'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-medium block">{f.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Raw Notes Area */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Paste Notes or Ideas
              </label>
              <textarea
                rows={9}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Paste unformatted meeting notes, brain dumps, Slack transcripts..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400 leading-relaxed"
              />
            </div>

            <button
              onClick={handleSummarize}
              disabled={isSummarizing || !rawNotes.trim()}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium text-xs md:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Summarize
                </>
              )}
            </button>
          </div>

          {/* Saved Summaries */}
          {savedSummaries.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
              <h4 className="font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-orange-500" /> Saved Summaries
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedSummaries.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs hover:border-orange-300 transition-colors"
                  >
                    <div
                      className="cursor-pointer flex-1 mr-2"
                      onClick={() => {
                        setTitle(s.title);
                        setSummaryMarkdown(s.summaryMarkdown);
                        if (s.structured) setStructuredNotes(s.structured);
                      }}
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100 block">{s.title}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">{s.date} • {s.format}</span>
                    </div>
                    <button
                      onClick={() => onDeleteSummary(s.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      title="Delete summary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output: Summary with Copy and Download PDF */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs min-h-[560px] flex flex-col justify-between">
            <div>
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FFF0E8] text-orange-500 border border-orange-200/50 dark:bg-slate-800 dark:border-slate-700">
                    <FileCheck2 className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      Summary
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      Structured overview & key insights
                    </p>
                  </div>
                </div>

                {/* Copy, Download PDF, Save Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <CopyButton textToCopy={getFullTextToCopy()} />

                  <button
                    onClick={handleDownloadPDF}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-500" /> Download PDF
                  </button>

                  <button
                    onClick={handleSaveCurrentSummary}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#FFF0E8] text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 hover:bg-orange-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-orange-500" /> Save
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setViewTab('structured')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewTab === 'structured'
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" /> Structured Sections
                </button>
                <button
                  onClick={() => setViewTab('markdown')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewTab === 'markdown'
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Raw Markdown Report
                </button>
              </div>

              {/* Tab 1: Structured Output Cards */}
              {viewTab === 'structured' && structuredNotes ? (
                <div className="space-y-4">
                  {/* 1. Summary Section */}
                  <div className="p-4 rounded-2xl bg-[#FFF0E8]/80 border border-[#F5D7C6] space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#E86A33] dark:text-amber-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#F97316]" /> Summary (Executive Overview)
                    </h4>
                    <p className="text-xs md:text-sm text-[#2D2D2D] dark:text-slate-200 leading-relaxed font-medium">
                      {structuredNotes.summary}
                    </p>
                  </div>

                  {/* 2. Key Points */}
                  {structuredNotes.keyPoints && structuredNotes.keyPoints.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-[#F5D7C6] dark:border-slate-800/80 space-y-2">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#2D2D2D] dark:text-slate-300 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-[#F97316]" /> Key Points
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#2D2D2D] dark:text-slate-300">
                        {structuredNotes.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] mt-1.5 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. Action Items */}
                  {structuredNotes.actionItems && structuredNotes.actionItems.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-[#F5D7C6] dark:border-slate-800/80 space-y-2">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#2D2D2D] dark:text-slate-300 flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4 text-[#F97316]" /> Action Items
                      </h4>
                      <div className="space-y-2">
                        {structuredNotes.actionItems.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleToggleTask(idx)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              item.completed
                                ? 'bg-[#FFF0E8]/50 border-[#F5D7C6] line-through opacity-70'
                                : 'bg-white dark:bg-slate-900 border-[#F5D7C6] dark:border-slate-700/80 hover:border-[#FFB38A]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {item.completed ? (
                                <CheckSquare className="w-4 h-4 text-[#F97316] shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-[#8C7A70] shrink-0" />
                              )}
                              <span className="font-semibold text-[#2D2D2D] dark:text-slate-100">{item.task}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.assignee && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0E8] border border-[#F5D7C6] text-[#E86A33]">
                                  {item.assignee}
                                </span>
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0E8] text-[#E86A33] border border-[#F5D7C6]">
                                {item.priority || 'Medium'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Deadlines & 5. Important Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Deadlines */}
                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Deadlines
                      </h4>
                      {structuredNotes.deadlines && structuredNotes.deadlines.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-[#2D2D2D] dark:text-slate-300">
                          {structuredNotes.deadlines.map((d, idx) => (
                            <li key={idx} className="font-medium">• {d}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-[#8C7A70] italic">No explicit deadlines identified.</p>
                      )}
                    </div>

                    {/* Important Dates */}
                    <div className="p-4 rounded-2xl bg-[#FFF0E8]/80 border border-[#F5D7C6] space-y-2">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#E86A33] dark:text-indigo-400 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#F97316]" /> Important Dates
                      </h4>
                      {structuredNotes.importantDates && structuredNotes.importantDates.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-[#2D2D2D] dark:text-slate-300">
                          {structuredNotes.importantDates.map((d, idx) => (
                            <li key={idx} className="font-medium">• {d}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-[#8C7A70] italic">No specific dates noted.</p>
                      )}
                    </div>
                  </div>

                  {/* 6. Questions to Review */}
                  <div className="p-4 rounded-2xl bg-[#FFF0E8]/80 border border-[#F5D7C6] space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#E86A33] dark:text-sky-400 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#F97316]" /> Questions to Review
                    </h4>
                    {structuredNotes.questionsToReview && structuredNotes.questionsToReview.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-[#2D2D2D] dark:text-slate-300">
                        {structuredNotes.questionsToReview.map((q, idx) => (
                          <li key={idx} className="font-medium flex items-start gap-2">
                            <span className="text-[#F97316] font-bold">?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#8C7A70] italic">No unresolved questions flagged.</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Tab 2: Raw Markdown View */
                <div className="space-y-4">
                  {summaryMarkdown ? (
                    <MarkdownRenderer content={summaryMarkdown} showCopyButton={false} />
                  ) : (
                    <div className="py-20 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF0E8] text-[#F97316] border border-[#F5D7C6] flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-base text-[#2D2D2D] dark:text-slate-200">
                        Distill notes into structured intelligence
                      </h4>
                      <p className="text-xs text-[#8C7A70] dark:text-slate-400 max-w-sm mx-auto font-medium">
                        Paste raw meeting notes or ideas on the left and click Summarize to extract clean executive briefs, action items, deadlines, and questions.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="mt-6 pt-4 border-t border-[#F5D7C6] dark:border-slate-800/80 flex items-center justify-between text-xs text-[#8C7A70] dark:text-slate-400">
              <span className="flex items-center gap-1 text-[#E86A33] dark:text-amber-400 font-bold">
                <Sparkles className="w-4 h-4 text-[#F97316]" /> Executive summary ready for export
              </span>
              <span className="font-medium">Gemini AI Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

