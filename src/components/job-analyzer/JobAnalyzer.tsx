import { useState } from 'react';
import { Wand2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { extractSkillsFromJD, matchSkills, categorizeMatches } from '../../services/analyzerService';
import { useApplicationStore } from '../../stores/applicationStore';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface JobAnalyzerProps {
  applicationId?: string;
  initialJD?: string;
  userSkills: string[];
}

export function JobAnalyzer({ applicationId, initialJD, userSkills }: JobAnalyzerProps) {
  const [jdText, setJdText] = useState(initialJD ?? '');
  const [extracted, setExtracted] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [categories, setCategories] = useState<ReturnType<typeof categorizeMatches> | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const updateApp = useApplicationStore((s) => s.update);

  const handleAnalyze = () => {
    const skills = extractSkillsFromJD(jdText);
    const { matches, score: s } = matchSkills(skills, userSkills);
    const cats = categorizeMatches(matches);
    setExtracted(skills);
    setScore(s);
    setCategories(cats);
    setAnalyzed(true);

    // Save JD to application
    if (applicationId) {
      updateApp(applicationId, { jobDescription: jdText });
    }
  };

  const handleReset = () => {
    setJdText('');
    setExtracted([]);
    setScore(null);
    setCategories(null);
    setAnalyzed(false);
  };

  const scoreColor = score === null ? '' :
    score >= 80 ? 'text-emerald-400' :
    score >= 60 ? 'text-amber-400' : 'text-red-400';

  const scoreRingColor = score === null ? 'stroke-slate-700' :
    score >= 80 ? 'stroke-emerald-400' :
    score >= 60 ? 'stroke-amber-400' : 'stroke-red-400';

  const circumference = 2 * Math.PI * 40;
  const progress = score !== null ? ((score / 100) * circumference) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Job Description Analyzer</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Paste a job description to see how well your skills match</p>
        </div>
        {analyzed && (
          <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>

      {!analyzed ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Paste Job Description</label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={12}
              placeholder="Paste the full job description here...&#10;&#10;We are looking for a Senior React Developer with experience in TypeScript, Node.js, AWS..."
              className="w-full rounded-xl bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={<Wand2 size={14} />}
              onClick={handleAnalyze}
              disabled={!jdText.trim()}
            >
              Analyze Job
            </Button>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Your skill profile ({userSkills.length} skills):</p>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.map((s) => (
                <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score */}
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            {/* Ring chart */}
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={cn('transition-all duration-1000', scoreRingColor)}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-xl font-bold', scoreColor)}>{score}%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">match</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {score! >= 80 ? 'Excellent Match! 🎯' : score! >= 60 ? 'Good Match 👍' : 'Partial Match 💪'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Matched {(categories?.strong.length ?? 0) + (categories?.partial.length ?? 0)} of {extracted.length} required skills
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {categories?.missing.length} skills to develop
              </p>
            </div>
          </div>

          {/* Skill categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strong */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Strong Match ({categories?.strong.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories?.strong.map((m) => (
                  <span key={m.skill} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                    {m.skill}
                  </span>
                ))}
                {categories?.strong.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">None</span>}
              </div>
            </div>

            {/* Partial */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={15} className="text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Partial ({categories?.partial.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories?.partial.map((m) => (
                  <span key={m.skill} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-600/20 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300">
                    {m.skill}
                  </span>
                ))}
                {categories?.partial.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">None</span>}
              </div>
            </div>

            {/* Missing */}
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={15} className="text-red-600 dark:text-red-400" />
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Missing ({categories?.missing.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories?.missing.map((m) => (
                  <span key={m.skill} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300">
                    {m.skill}
                  </span>
                ))}
                {categories?.missing.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">None</span>}
              </div>
            </div>
          </div>

          {/* All extracted skills */}
          {extracted.length > 0 && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                All Detected Skills ({extracted.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {extracted.map((skill) => {
                  const match = categories?.strong.find((m) => m.skill === skill) ||
                    categories?.partial.find((m) => m.skill === skill) ||
                    categories?.missing.find((m) => m.skill === skill);
                  const color = match?.matched ? 'bg-emerald-500' : match?.partial ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
                      <span className={cn('w-2 h-2 rounded-full shrink-0', color)} />
                      <span className="text-slate-800 dark:text-slate-200">{skill}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
