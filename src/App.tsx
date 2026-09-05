import React, { useState, useEffect } from 'react';
import { ActiveTab, CategoryId, Difficulty, GameResult, LeaderboardEntry, Question, UserProfile } from './types';
import { getStoredProfile, getLeaderboard, recordGameCompletion } from './utils/storage';
import { getQuizQuestions } from './data/questions';
import { Navbar } from './components/Navbar';
import { CategorySelector } from './components/CategorySelector';
import { QuizArena } from './components/QuizArena';
import { QuizResults } from './components/QuizResults';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(getLeaderboard());

  // Active quiz state
  const [currentQuiz, setCurrentQuiz] = useState<{
    categoryId: CategoryId;
    difficulty: Difficulty;
    questions: Question[];
  } | null>(null);

  // Result state
  const [latestResult, setLatestResult] = useState<GameResult | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // Sync profile on mount
  useEffect(() => {
    setProfile(getStoredProfile());
    setLeaderboard(getLeaderboard());
  }, []);

  const handleStartQuiz = (categoryId: CategoryId, difficulty: Difficulty, questionCount: number = 8) => {
    const questions = getQuizQuestions(categoryId, difficulty, questionCount);
    setCurrentQuiz({
      categoryId,
      difficulty,
      questions,
    });
    setActiveTab('quiz');
  };

  const handleFinishQuiz = (result: GameResult) => {
    const { updatedProfile, newAchievements: unlocked } = recordGameCompletion(result);
    setProfile(updatedProfile);
    setNewAchievements(unlocked);
    setLeaderboard(getLeaderboard());
    setLatestResult(result);
    setActiveTab('results');
  };

  const handleExitQuiz = () => {
    setCurrentQuiz(null);
    setActiveTab('home');
  };

  const handlePlayAgain = () => {
    if (!currentQuiz) {
      setActiveTab('home');
      return;
    }
    handleStartQuiz(currentQuiz.categoryId, currentQuiz.difficulty, currentQuiz.questions.length);
  };

  const handlePlayCategoryFromProfile = (catId: CategoryId) => {
    handleStartQuiz(catId, 'medium', 8);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (activeTab === 'quiz' && tab !== 'quiz') {
            const confirmLeave = window.confirm('Leave active quiz? Your current progress in this round will be lost.');
            if (!confirmLeave) return;
            setCurrentQuiz(null);
          }
          setActiveTab(tab);
        }}
        profile={profile}
      />

      {/* Main App Content Body */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'home' && (
          <CategorySelector
            onStartQuiz={handleStartQuiz}
            profile={profile}
            onNavigateLeaderboard={() => setActiveTab('leaderboard')}
            onNavigateProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'quiz' && currentQuiz && (
          <QuizArena
            categoryId={currentQuiz.categoryId}
            difficulty={currentQuiz.difficulty}
            questions={currentQuiz.questions}
            onFinishQuiz={handleFinishQuiz}
            onExitQuiz={handleExitQuiz}
          />
        )}

        {activeTab === 'results' && latestResult && (
          <QuizResults
            result={latestResult}
            profile={profile}
            newAchievements={newAchievements}
            onPlayAgain={handlePlayAgain}
            onChangeCategory={() => setActiveTab('home')}
            onViewLeaderboard={() => setActiveTab('leaderboard')}
            onViewProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            entries={leaderboard}
            profile={profile}
            onPlayCategory={(catId) => handleStartQuiz(catId, 'medium', 8)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={(upd) => setProfile(upd)}
            onPlayCategory={handlePlayCategoryFromProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 text-slate-500 text-xs py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">QuizVerse</span> — Frontend Trivia &amp; Brain Challenge
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>GK &amp; Current Affairs</span>
            <span>•</span>
            <span>Technology</span>
            <span>•</span>
            <span>Puzzles &amp; Logic</span>
            <span>•</span>
            <span>World Mythology</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
