import React, { useState } from 'react';
import { 
  Globe, 
  Cpu, 
  Lightbulb, 
  Sparkles, 
  Zap, 
  Timer, 
  Award, 
  Flame, 
  Play, 
  CheckCircle2, 
  BarChart2, 
  Info 
} from 'lucide-react';
import { CategoryId, Difficulty, UserProfile } from '../types';
import { CATEGORIES, DIFFICULTY_CONFIG, QUESTION_BANK } from '../data/questions';
import { soundFx } from '../utils/audio';

interface CategorySelectorProps {
  onStartQuiz: (categoryId: CategoryId, difficulty: Difficulty, questionCount: number) => void;
  profile: UserProfile;
  onNavigateLeaderboard: () => void;
  onNavigateProfile: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onStartQuiz,
  profile,
  onNavigateLeaderboard,
  onNavigateProfile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('gk-current-affairs');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState<number>(8);

  const renderIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Globe': return <Globe className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Lightbulb': return <Lightbulb className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Zap': return <Zap className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const getQuestionCountForCategory = (catId: CategoryId) => {
    if (catId === 'all') return QUESTION_BANK.length;
    return QUESTION_BANK.filter(q => q.categoryId === catId).length;
  };

  const handleStart = () => {
    soundFx.playClick();
    onStartQuiz(selectedCategory, selectedDifficulty, questionCount);
  };

  const currentDiff = DIFFICULTY_CONFIG[selectedDifficulty];
  const overallAccuracy = profile.totalQuestions > 0 
    ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Welcome & Quick Stats Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/60 rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Brain Trivia Arena
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Ready to test your intellect,{' '}
              <span className="bg-gradient-to-r from-amber-400 to-indigo-300 bg-clip-text text-transparent">
                {profile.username}?
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Master questions across GK &amp; Current Affairs, Modern Technology, Mind-Bending Puzzles, and Ancient World Lore with live timed rounds.
            </p>
          </div>

          {/* Player stats cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-center px-2 py-1">
              <div className="text-xs text-slate-400 font-medium">Total Score</div>
              <div className="text-lg font-bold text-amber-400">{profile.totalScore.toLocaleString()}</div>
            </div>
            <div className="text-center px-2 py-1 border-l border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Accuracy</div>
              <div className="text-lg font-bold text-emerald-400">{overallAccuracy}%</div>
            </div>
            <div className="text-center px-2 py-1 border-l border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Best Streak</div>
              <div className="text-lg font-bold text-orange-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
                {profile.bestStreak}x
              </div>
            </div>
            <div className="text-center px-2 py-1 border-l border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Quizzes</div>
              <div className="text-lg font-bold text-indigo-300">{profile.totalGames}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Category Selection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
              1
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              Choose Quiz Category
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Select a domain to challenge
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const qCount = getQuestionCountForCategory(cat.id);
            const userCatStats = profile.categoryStats[cat.id];
            const catAccuracy = userCatStats && userCatStats.totalQuestions > 0
              ? Math.round((userCatStats.correct / userCatStats.totalQuestions) * 100)
              : null;

            return (
              <div
                key={cat.id}
                id={`cat-card-${cat.id}`}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`relative cursor-pointer rounded-xl p-5 border text-left transition-all duration-200 group ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-900/20 translate-y-[-2px]'
                    : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
                }`}
              >
                {/* Checkmark icon for selected */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-500/20" />
                  </div>
                )}

                <div className="flex items-start gap-3.5 mb-3">
                  <div className={`p-3 rounded-xl border ${cat.bgGradient} ${cat.borderColor} ${cat.textColor} group-hover:scale-105 transition-transform`}>
                    {renderIcon(cat.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100 leading-snug">
                      {cat.name}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {qCount} Questions in database
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>

                {/* Bottom stats pill */}
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Personal High Score:</span>
                  <span className="font-semibold text-amber-400">
                    {userCatStats?.highScore ? `${userCatStats.highScore.toLocaleString()} pts` : 'No runs yet'}
                  </span>
                </div>
                {catAccuracy !== null && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Accuracy:</span>
                    <span className="text-emerald-400 font-medium">{catAccuracy}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Step 2: Difficulty & Timer Configuration */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
              2
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              Select Difficulty &amp; Timer
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Higher difficulty = tighter timer &amp; larger multipliers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diffKey) => {
            const config = DIFFICULTY_CONFIG[diffKey];
            const isSelected = selectedDifficulty === diffKey;

            return (
              <div
                key={diffKey}
                id={`diff-card-${diffKey}`}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedDifficulty(diffKey);
                }}
                className={`cursor-pointer rounded-xl p-5 border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/30 shadow-md translate-y-[-2px]'
                    : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.badgeClass}`}>
                    {config.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <Timer className="w-4 h-4 text-amber-400" />
                    <span>{config.timerSeconds}s / question</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-black text-slate-100">
                    {config.basePoints} pts
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    ({config.multiplier}x multiplier)
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {config.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step 3: Question Count & Launch Quiz Arena */}
      <section className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Question count selector */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-sm font-semibold text-slate-200 whitespace-nowrap">
            Questions per Round:
          </div>
          <div className="flex items-center gap-2">
            {[5, 8, 10].map((num) => (
              <button
                key={num}
                id={`btn-count-${num}`}
                onClick={() => {
                  soundFx.playClick();
                  setQuestionCount(num);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  questionCount === num
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {num} Qs
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          id="btn-start-quiz"
          onClick={handleStart}
          className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:via-orange-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Launch Quiz Arena</span>
        </button>

      </section>

      {/* Quick navigation bottom banner */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <button 
          onClick={onNavigateLeaderboard}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
        >
          <Award className="w-4 h-4 text-amber-400" />
          View Global &amp; Category Leaderboards
        </button>
        <span className="text-slate-700">•</span>
        <button 
          onClick={onNavigateProfile}
          className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"
        >
          <BarChart2 className="w-4 h-4 text-indigo-400" />
          Track Career Accuracy &amp; Historical Games
        </button>
      </div>

    </div>
  );
};
