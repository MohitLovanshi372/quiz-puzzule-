export type CategoryId = 'gk-current-affairs' | 'technology' | 'puzzles' | 'mythology' | 'all';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

export interface Question {
  id: string;
  categoryId: CategoryId;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

export interface LifelineState {
  fiftyFifty: boolean;    // Used or available
  timeFreeze: boolean;    // Used or available (+15s)
  hint: boolean;          // Used or available
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
  explanation: string;
}

export interface GameResult {
  id: string;
  timestamp: number;
  categoryId: CategoryId;
  categoryName: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeSeconds: number;
  maxStreak: number;
  xpEarned: number;
  answers: AnswerRecord[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  isSecret?: boolean;
}

export interface CategoryStats {
  played: number;
  correct: number;
  totalQuestions: number;
  highScore: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  title: string;
  xp: number;
  level: number;
  createdAt: number;
  totalGames: number;
  totalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  bestStreak: number;
  highestScore: number;
  categoryStats: Record<CategoryId, CategoryStats>;
  history: GameResult[];
  achievements: string[]; // achievement IDs
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  score: number;
  accuracy: number;
  categoryId: CategoryId;
  categoryName: string;
  difficulty: Difficulty;
  date: string;
  isCurrentUser?: boolean;
}

export type ActiveTab = 'home' | 'quiz' | 'results' | 'leaderboard' | 'profile';
