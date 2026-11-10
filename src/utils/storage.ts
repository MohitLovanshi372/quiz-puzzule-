import { ACHIEVEMENTS, AVATAR_OPTIONS, TITLES_BY_LEVEL } from '../data/achievements';
import { GameResult, LeaderboardEntry, UserProfile } from '../types';

const PROFILE_KEY = 'quizverse_user_profile_v1';
const LEADERBOARD_KEY = 'quizverse_leaderboard_v1';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user-' + Math.random().toString(36).substring(2, 9),
  username: 'Challenger',
  avatar: '🦉',
  title: 'Novice Inquirer',
  xp: 0,
  level: 1,
  createdAt: Date.now(),
  totalGames: 0,
  totalScore: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  bestStreak: 0,
  highestScore: 0,
  categoryStats: {
    'gk-current-affairs': { played: 0, correct: 0, totalQuestions: 0, highScore: 0 },
    'technology': { played: 0, correct: 0, totalQuestions: 0, highScore: 0 },
    'puzzles': { played: 0, correct: 0, totalQuestions: 0, highScore: 0 },
    'mythology': { played: 0, correct: 0, totalQuestions: 0, highScore: 0 },
    'all': { played: 0, correct: 0, totalQuestions: 0, highScore: 0 },
  },
  history: [],
  achievements: [],
};

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    username: 'Sophia_Athena',
    avatar: '🦉',
    score: 3450,
    accuracy: 100,
    categoryId: 'mythology',
    categoryName: 'World Mythology & Lore',
    difficulty: 'hard',
    date: '2025-05-10',
  },
  {
    id: 'lb-2',
    username: 'Alex_Turing',
    avatar: '🤖',
    score: 3120,
    accuracy: 92,
    categoryId: 'technology',
    categoryName: 'Technology & Computing',
    difficulty: 'hard',
    date: '2025-05-09',
  },
  {
    id: 'lb-3',
    username: 'EnigmaRiddle',
    avatar: '🦁',
    score: 2980,
    accuracy: 95,
    categoryId: 'puzzles',
    categoryName: 'Puzzles & Brain Teasers',
    difficulty: 'hard',
    date: '2025-05-08',
  },
  {
    id: 'lb-4',
    username: 'DiplomatPriya',
    avatar: '🦊',
    score: 2840,
    accuracy: 90,
    categoryId: 'gk-current-affairs',
    categoryName: 'GK & World Affairs',
    difficulty: 'medium',
    date: '2025-05-07',
  },
  {
    id: 'lb-5',
    username: 'CosmoExplorer',
    avatar: '👨‍🚀',
    score: 2750,
    accuracy: 88,
    categoryId: 'all',
    categoryName: 'Grand Mix',
    difficulty: 'medium',
    date: '2025-05-06',
  },
  {
    id: 'lb-6',
    username: 'ValkyrieNordic',
    avatar: '⚔️',
    score: 2600,
    accuracy: 85,
    categoryId: 'mythology',
    categoryName: 'World Mythology & Lore',
    difficulty: 'medium',
    date: '2025-05-05',
  },
  {
    id: 'lb-7',
    username: 'QuantumDev',
    avatar: '🐉',
    score: 2420,
    accuracy: 80,
    categoryId: 'technology',
    categoryName: 'Technology & Computing',
    difficulty: 'medium',
    date: '2025-05-04',
  },
];

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      categoryStats: {
        ...DEFAULT_PROFILE.categoryStats,
        ...(parsed.categoryStats || {}),
      },
      history: parsed.history || [],
      achievements: parsed.achievements || [],
    };
  } catch (err) {
    console.error('Failed to parse user profile', err);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

export function getTitleForLevel(level: number): string {
  let title = TITLES_BY_LEVEL[0].title;
  for (const t of TITLES_BY_LEVEL) {
    if (level >= t.minLevel) {
      title = t.title;
    }
  }
  return title;
}

export function calculateLevelFromXp(xp: number): { level: number; currentXp: number; xpNeeded: number } {
  // Level threshold: 300 XP per level scaling
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 300) {
    remaining -= level * 300;
    level++;
  }
  const xpNeeded = level * 300;
  return { level, currentXp: remaining, xpNeeded };
}

export function checkNewAchievements(profile: UserProfile, latestResult: GameResult): string[] {
  const newlyUnlocked: string[] = [];
  const currentSet = new Set(profile.achievements);

  const testAchievement = (id: string, condition: boolean) => {
    if (!currentSet.has(id) && condition) {
      newlyUnlocked.push(id);
    }
  };

  testAchievement('first-steps', profile.totalGames >= 1);
  testAchievement('flawless', latestResult.accuracy === 100);
  testAchievement(
    'speed-demon',
    latestResult.answers.some(a => a.isCorrect && a.timeSpentSeconds <= 3)
  );
  testAchievement('streak-master', latestResult.maxStreak >= 5 || profile.bestStreak >= 5);
  testAchievement(
    'hardcore-veteran',
    latestResult.difficulty === 'hard' && latestResult.accuracy >= 75
  );
  testAchievement(
    'myth-master',
    latestResult.categoryId === 'mythology' && latestResult.score >= 1500
  );
  testAchievement(
    'tech-guru',
    latestResult.categoryId === 'technology' && latestResult.score >= 1500
  );
  testAchievement(
    'puzzle-prodigy',
    latestResult.categoryId === 'puzzles' && latestResult.score >= 1500
  );
  testAchievement(
    'world-ambassador',
    latestResult.categoryId === 'gk-current-affairs' && latestResult.score >= 1500
  );
  testAchievement('century-club', profile.totalScore >= 5000);

  return newlyUnlocked;
}

export function recordGameCompletion(result: GameResult): { updatedProfile: UserProfile; newAchievements: string[] } {
  const currentProfile = getStoredProfile();

  const prevCat = currentProfile.categoryStats[result.categoryId] || {
    played: 0,
    correct: 0,
    totalQuestions: 0,
    highScore: 0,
  };

  const updatedCat = {
    played: prevCat.played + 1,
    correct: prevCat.correct + result.correctAnswers,
    totalQuestions: prevCat.totalQuestions + result.totalQuestions,
    highScore: Math.max(prevCat.highScore, result.score),
  };

  const newTotalScore = currentProfile.totalScore + result.score;
  const newXp = currentProfile.xp + result.xpEarned;
  const { level } = calculateLevelFromXp(newXp);
  const title = getTitleForLevel(level);

  const updatedProfile: UserProfile = {
    ...currentProfile,
    totalGames: currentProfile.totalGames + 1,
    totalScore: newTotalScore,
    totalCorrect: currentProfile.totalCorrect + result.correctAnswers,
    totalQuestions: currentProfile.totalQuestions + result.totalQuestions,
    bestStreak: Math.max(currentProfile.bestStreak, result.maxStreak),
    highestScore: Math.max(currentProfile.highestScore, result.score),
    xp: newXp,
    level,
    title,
    categoryStats: {
      ...currentProfile.categoryStats,
      [result.categoryId]: updatedCat,
    },
    history: [result, ...currentProfile.history].slice(0, 50), // keep latest 50 games
  };

  // Check achievements
  const newAchievements = checkNewAchievements(updatedProfile, result);
  updatedProfile.achievements = [...updatedProfile.achievements, ...newAchievements];

  saveProfile(updatedProfile);

  // Add to leaderboard if decent score
  if (result.score > 0) {
    recordToLeaderboard({
      id: 'usr-' + Date.now(),
      username: updatedProfile.username,
      avatar: updatedProfile.avatar,
      score: result.score,
      accuracy: result.accuracy,
      categoryId: result.categoryId,
      categoryName: result.categoryName,
      difficulty: result.difficulty,
      date: new Date(result.timestamp).toISOString().split('T')[0],
      isCurrentUser: true,
    });
  }

  return { updatedProfile, newAchievements };
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      saveLeaderboard(INITIAL_LEADERBOARD);
      return INITIAL_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LEADERBOARD;
  } catch (err) {
    console.error('Failed to get leaderboard', err);
    return INITIAL_LEADERBOARD;
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save leaderboard', err);
  }
}

export function recordToLeaderboard(newEntry: LeaderboardEntry): void {
  const current = getLeaderboard();
  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
    .slice(0, 100); // keep top 100
  saveLeaderboard(updated);
}
