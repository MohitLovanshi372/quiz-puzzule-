import React, { useState } from 'react';
import { Trophy, User, Zap, Volume2, VolumeX, Flame, BookOpen } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, profile }) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());

  const handleToggleSound = () => {
    const next = soundFx.toggleMute();
    setIsMuted(next);
  };

  const handleNav = (tab: ActiveTab) => {
    soundFx.playClick();
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('home')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="nav-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
              QuizVerse
            </span>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
              Brain Arena &amp; Trivia
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            id="nav-tab-home"
            onClick={() => handleNav('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'home' || activeTab === 'quiz' || activeTab === 'results'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Arena</span>
          </button>

          <button
            id="nav-tab-leaderboard"
            onClick={() => handleNav('leaderboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          <button
            id="nav-tab-profile"
            onClick={() => handleNav('profile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </nav>

        {/* Right Utility Bar: Streak, Sound, User Level Preview */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak pill */}
          {profile.bestStreak > 0 && (
            <div 
              title={`Your best streak: ${profile.bestStreak} in a row`}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>{profile.bestStreak}x Best</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Profile Quick Widget */}
          <div 
            onClick={() => handleNav('profile')}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer hover:opacity-85 transition-opacity"
            id="nav-user-preview"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-lg shadow-inner">
              {profile.avatar}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                {profile.username}
              </div>
              <div className="text-[10px] text-amber-400 font-medium">
                Lv. {profile.level}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
