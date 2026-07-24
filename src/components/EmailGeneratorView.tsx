import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Sparkles,
  Bookmark,
  Trash2,
  RefreshCw,
  Send,
  Building2,
  Smile,
  Briefcase,
  Clock,
  Zap,
  HeartHandshake,
  GraduationCap,
  Award,
  Copy,
  Check,
  Download,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  FileText,
  CheckCircle2,
  ExternalLink,
  AtSign,
} from 'lucide-react';
import { SavedEmailDraft } from '../types';
import { CopyButton } from './CopyButton';

interface EmailGeneratorViewProps {
  savedEmails: SavedEmailDraft[];
  onSaveEmail: (email: SavedEmailDraft) => void;
  onDeleteEmail: (id: string) => void;
  userName?: string;
}

export const toneOptions = [
  {
    id: 'Formal',
    name: 'Formal',
    desc: 'Official, structured tone for senior leaders or policy announcements',
    icon: Building2,
    color: 'text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/20',
  },
  {
    id: 'Friendly',
    name: 'Friendly',
    desc: 'Warm, approachable, conversational communication for team & peers',
    icon: Smile,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'Professional',
    name: 'Professional',
    desc: 'Executive, balanced, clear business focus with respectful clarity',
    icon: Briefcase,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'Follow-up',
    name: 'Follow-up',
    desc: 'Gentle nudge or status check on pending projects or proposals',
    icon: Clock,
    color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'Cold Email',
    name: 'Cold Email',
    desc: 'High-converting outreach with clear value proposition & call to action',
    icon: Zap,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: 'Apology',
    name: 'Apology',
    desc: 'Sincere, empathetic, accountable tone focused on fast resolution',
    icon: HeartHandshake,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'Thank You',
    name: 'Thank You',
    desc: 'Expressing genuine gratitude, post-interview thanks, or appreciation',
    icon: Sparkles,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'Internship',
    name: 'Internship',
    desc: 'Focused inquiry highlighting relevant skills, eagerness, and availability',
    icon: GraduationCap,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'Job Application',
    name: 'Job Application',
    desc: 'Compelling cover email emphasizing achievements & candidate fit',
    icon: Award,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
];

const defaultSubjectOptions = [
  'Q3 Product Alignment & Timeline Review Request',
  'Quick Request: Feedback on Q3 Proposal Draft',
  'Next Steps for Q3 Gemini Integration Roadmap',
];

const defaultBodyContent = `Dear Product Team,

I hope you're having a productive week.

I have finalized the draft proposal for our Q3 feature rollout, including the Gemini AI integration and time-blocking modules. I would greatly appreciate your feedback and approval on the roadmap by Friday at 5:00 PM.

Key highlights included in this proposal:
• Server-side API proxy implementation for enhanced key security
• Interactive time-blocking daily schedule generator
• Executive meeting notes summarizer with PDF export

If you have any questions or require a brief 15-minute sync before Friday, please let me know.

Best regards,
[Your Name]
[Your Title]`;

export const EmailGeneratorView: React.FC<EmailGeneratorViewProps> = ({
  savedEmails,
  onSaveEmail,
  onDeleteEmail,
  userName,
}) => {
  const [goal, setGoal] = useState('Request feedback on Q3 product proposal and confirm launch timeline');
  const [recipient, setRecipient] = useState('Executive Leadership & Engineering Leads');
  const [tone, setTone] = useState('Professional');
  const [context, setContext] = useState('Proposal includes scope for Gemini AI integration and time-blocking features. Approval deadline is Friday 5 PM.');
  const [bulletPoints, setBulletPoints] = useState('- Attached proposal draft\n- Need approval by Friday\n- Call scheduled for Thursday if needed');

  const [toEmail, setToEmail] = useState('leadership@company.com');
  const [subject, setSubject] = useState('Q3 Product Alignment & Timeline Review Request');
  const [subjectOptions, setSubjectOptions] = useState<string[]>(defaultSubjectOptions);
  const [emailBody, setEmailBody] = useState(defaultBodyContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Generate Email handler
  const handleGenerateEmail = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          recipient,
          tone,
          context,
          bulletPoints,
        }),
      });

      const data = await response.json();
      if (data.subject || data.body || data.email) {
        if (data.subject) setSubject(data.subject);
        if (Array.isArray(data.subjectOptions) && data.subjectOptions.length > 0) {
          setSubjectOptions(data.subjectOptions);
        }
        if (data.body) {
          setEmailBody(data.body);
        } else if (data.email) {
          setEmailBody(data.email);
        }
      } else {
        throw new Error(data.error || 'Failed to generate email');
      }
    } catch (err: any) {
      console.error('Email error:', err);
      setEmailBody(`⚠️ Error drafting email: ${err.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Formatting Helpers for Editor
  const handleInsertFormatting = (prefix: string, suffix: string = '') => {
    setEmailBody((prev) => `${prev}\n${prefix}sample text${suffix}`);
  };

  const handleInsertSignature = () => {
    setEmailBody((prev) => `${prev}\n\nBest regards,\n[Your Name]\n[Your Title]`);
  };

  const handleInsertCTA = () => {
    setEmailBody((prev) => `${prev}\n\nPlease let me know your thoughts or if you have time for a brief 15-minute sync.`);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleDownloadEmail = () => {
    const fullContent = `To: ${toEmail}\nSubject: ${subject}\n\n${emailBody}`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subject.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'email_draft'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCurrentEmail = () => {
    const fullContent = `Subject: ${subject}\n\n${emailBody}`;
    const newDraft: SavedEmailDraft = {
      id: Date.now().toString(),
      title: subject || goal.slice(0, 40) + '...',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      goal,
      recipient,
      tone,
      emailMarkdown: fullContent,
    };
    onSaveEmail(newDraft);
  };

  const wordCount = emailBody.trim() ? emailBody.trim().split(/\s+/).length : 0;
  const readTimeSeconds = Math.ceil((wordCount / 200) * 60);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Brief & Category Tone Selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
              <Mail className="w-4 h-4 text-orange-500" />
              <span>{userName ? `Create an email, ${userName}` : 'Create an email'}</span>
            </div>

            {/* Email Purpose */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Main Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What is the primary goal of this email?"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Recipient
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Hiring Manager, Client, Team"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* 9 Category / Tone Options Grid */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tone / Type
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {toneOptions.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`p-2 rounded-xl border text-left transition-all text-xs cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-orange-400 bg-[#FFF8F5] dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-medium'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="font-medium text-[11px] truncate">{t.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Context & Notes
              </label>
              <textarea
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Deadlines, specific project details, key points..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateEmail}
              disabled={isGenerating || !goal.trim()}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium text-xs md:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Drafting Email...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Email
                </>
              )}
            </button>
          </div>

          {/* Saved Drafts */}
          {savedEmails.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
              <h4 className="font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-orange-500" /> Saved Drafts
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedEmails.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs hover:border-orange-300 transition-colors"
                  >
                    <div
                      className="cursor-pointer flex-1 mr-2"
                      onClick={() => {
                        setGoal(e.goal);
                        setSubject(e.title);
                        setEmailBody(e.emailMarkdown.replace(/^Subject:.*?\n\n/, ''));
                      }}
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100 block truncate">{e.title}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">{e.date} • {e.tone}</span>
                    </div>
                    <button
                      onClick={() => onDeleteEmail(e.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Professional Email Editor */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col justify-between min-h-[600px]">
            {/* Editor Window Header Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Email Editor
                </span>
              </div>

              {/* Actions: Send Mailto, Copy, Download, Save */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleOpenMailClient}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Open in default mail app"
                >
                  <Send className="w-3 h-3" /> Send
                </button>

                <button
                  onClick={() => handleCopyText(`Subject: ${subject}\n\n${emailBody}`, 'full')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'full' ? <Check className="w-3 h-3 text-orange-500" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'full' ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleDownloadEmail}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Download email draft as text file"
                >
                  <Download className="w-3 h-3 text-slate-400" /> .txt
                </button>

                <button
                  onClick={handleSaveCurrentEmail}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#FFF0E8] dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 hover:bg-orange-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Bookmark className="w-3 h-3" /> Save
                </button>
              </div>
            </div>

            {/* Editor Body Fields */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* To: Field */}
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-medium text-slate-500 w-12 flex items-center gap-1">
                    <AtSign className="w-3.5 h-3.5 text-orange-500" /> To:
                  </span>
                  <input
                    type="text"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="recipient@company.com"
                    className="flex-1 text-xs font-normal text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Subject Line & AI Options */}
                <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 w-12">Subject:</span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject line..."
                      className="flex-1 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none focus:text-orange-600"
                    />
                  </div>

                  {/* AI Suggested Subject Pills */}
                  {subjectOptions.length > 0 && (
                    <div className="pl-14 pt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-400">Suggestions:</span>
                      {subjectOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSubject(opt)}
                          className={`text-[10px] font-normal px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            subject === opt
                              ? 'bg-[#FFF0E8] text-orange-600 border-orange-200 dark:bg-slate-800 dark:text-orange-400 font-medium'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-orange-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formatting Bar */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleInsertFormatting('**', '**')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleInsertFormatting('*', '*')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleInsertFormatting('• ')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleInsertFormatting('> ')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                      title="Quote Block"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleInsertCTA}
                      className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300/80 cursor-pointer"
                    >
                      + Call To Action
                    </button>
                    <button
                      onClick={handleInsertSignature}
                      className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300/80 cursor-pointer"
                    >
                      + Sign-off
                    </button>
                  </div>
                </div>

                {/* Main Editable Body Canvas */}
                <div>
                  <textarea
                    rows={13}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Draft your email message here..."
                    className="w-full text-xs md:text-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {/* Editor Footer Stats */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3 font-normal">
                  <span><strong className="font-semibold text-slate-700 dark:text-slate-300">{wordCount}</strong> words</span>
                  <span><strong className="font-semibold text-slate-700 dark:text-slate-300">~{readTimeSeconds}s</strong> read time</span>
                </div>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> Draft Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
