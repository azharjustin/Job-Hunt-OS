import { useState, useEffect } from 'react';
import { Plus, X, Database, Shield, User, Mail, CheckCircle2, Loader2, Sparkles, Key, DollarSign } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/EmptyState';
import { SKILLS_DICTIONARY } from '../lib/constants';
import { cn } from '../lib/utils';

export function Settings() {
  const { settings, update: updateSettings, setTheme } = useSettingsStore();
  const { user, updateProfile, isLoading: isAuthLoading } = useAuthStore();

  const [name, setName] = useState(user?.name || settings.userName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState(user?.currency || settings.currency || '$');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const [showClear, setShowClear] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.currency) setCurrency(user.currency);
      if (user.userSkills && user.userSkills.length > 0) {
        updateSettings({ userSkills: user.userSkills });
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');

    updateSettings({ userName: name, currency });

    if (user) {
      const updates: any = { name, email, currency, userSkills: settings.userSkills };
      if (password.trim()) {
        updates.password = password;
      }
      const ok = await updateProfile(updates);
      if (ok) {
        setSaveSuccess('User details successfully saved to cloud!');
        setPassword('');
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        setSaveError('Failed to update user profile.');
      }
    } else {
      setSaveSuccess('Local settings updated!');
      setTimeout(() => setSaveSuccess(''), 3000);
    }
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !settings.userSkills.includes(skill)) {
      const updatedSkills = [...settings.userSkills, skill];
      updateSettings({ userSkills: updatedSkills });
      if (user) {
        updateProfile({ userSkills: updatedSkills });
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = settings.userSkills.filter((s) => s !== skill);
    updateSettings({ userSkills: updatedSkills });
    if (user) {
      updateProfile({ userSkills: updatedSkills });
    }
  };

  const handleAddFromDict = (skill: string) => {
    if (!settings.userSkills.includes(skill)) {
      const updatedSkills = [...settings.userSkills, skill];
      updateSettings({ userSkills: updatedSkills });
      if (user) {
        updateProfile({ userSkills: updatedSkills });
      }
    }
  };

  const handleClearData = () => {
    storage.clear();
    window.location.reload();
  };

  const handleExport = () => {
    const data = {
      applications: JSON.parse(localStorage.getItem('jhos_applications') ?? '[]'),
      companies: JSON.parse(localStorage.getItem('jhos_companies') ?? '[]'),
      interviews: JSON.parse(localStorage.getItem('jhos_interviews') ?? '[]'),
      resumes: JSON.parse(localStorage.getItem('jhos_resumes') ?? '[]'),
      followUps: JSON.parse(localStorage.getItem('jhos_followUps') ?? '[]'),
      questions: JSON.parse(localStorage.getItem('jhos_questions') ?? '[]'),
      settings: JSON.parse(localStorage.getItem('jhos_settings') ?? '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-hunt-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDictSkills = SKILLS_DICTIONARY.filter(
    (s) =>
      !settings.userSkills.includes(s) &&
      (!skillSearch || s.toLowerCase().includes(skillSearch.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings & Account</h1>
          <p className="text-sm text-slate-400">Manage your profile, account security, and preferences</p>
        </div>

        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
            <Sparkles size={14} />
            <span>JWT Authenticated</span>
          </div>
        )}
      </div>

      {/* User Account Details */}
      <Card>
        <CardHeader
          title="Account Profile"
          subtitle="Your personal account information and credentials"
        />
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <Shield size={16} />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                New Password (Optional)
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Currency Symbol
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="$">$ (USD)</option>
                  <option value="₹">₹ (INR)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY/CNY)</option>
                  <option value="A$">A$ (AUD)</option>
                  <option value="C$">C$ (CAD)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="md" type="submit" disabled={isAuthLoading}>
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                'Save Account Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme / Appearance */}
      <Card>
        <CardHeader title="Appearance" subtitle="Choose your preferred theme" />
        <div className="flex gap-3">
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'px-4 py-2.5 rounded-lg border text-sm font-semibold capitalize transition-all cursor-pointer',
                settings.theme === t
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
      </Card>

      {/* Skill Profile */}
      <Card>
        <CardHeader
          title="Your Skill Profile"
          subtitle="Skills used for job description matching"
        />
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">{settings.userSkills.length} skills in your profile</p>
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-10">
              {settings.userSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-400 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSkill();
                }}
                className="flex-1"
              />
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={handleAddSkill}>
                Add
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Add from dictionary:</p>
            <Input
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="mb-2"
            />
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {filteredDictSkills.slice(0, 60).map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleAddFromDict(skill)}
                  className="px-2 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-600/10 transition-all"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader title="Data Management" subtitle="Import, export, or clear your local cache" />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={<Database size={14} />} onClick={handleExport}>
            Export Data JSON
          </Button>
          <Button
            variant="danger"
            icon={<Shield size={14} />}
            onClick={() => setShowClear(true)}
          >
            Clear Local Storage
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={showClear}
        title="Clear Local Storage?"
        description="This will clear your local browser storage cache. Your cloud data in MongoDB remains safe under your account."
        confirmLabel="Clear Cache"
        danger
        onConfirm={handleClearData}
        onCancel={() => setShowClear(false)}
      />
    </div>
  );
}
