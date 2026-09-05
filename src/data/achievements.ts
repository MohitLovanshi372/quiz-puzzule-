import { Achievement } from '../types';

export const AVATAR_OPTIONS = [
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', desc: 'Symbol of wisdom & strategy' },
  { id: 'fox', name: 'Clever Fox', emoji: '🦊', desc: 'Fast, sharp, and adaptable' },
  { id: 'wizard', name: 'Archmage', emoji: '🧙‍♂️', desc: 'Master of ancient lore' },
  { id: 'robot', name: 'Cyber Sentinel', emoji: '🤖', desc: 'High-tech computational prowess' },
  { id: 'dragon', name: 'Celestial Dragon', emoji: '🐉', desc: 'Legendary power and fury' },
  { id: 'astronaut', name: 'Stargazer', emoji: '👨‍🚀', desc: 'Pioneering explorer of the cosmos' },
  { id: 'sphinx', name: 'Sphinx Riddlemaster', emoji: '🦁', desc: 'Keeper of unsolvable enigmas' },
  { id: 'valkyrie', name: 'Valkyrie', emoji: '⚔️', desc: 'Champion of divine mythology' },
];

export const TITLES_BY_LEVEL = [
  { minLevel: 1, title: 'Novice Inquirer' },
  { minLevel: 3, title: 'Trivia Explorer' },
  { minLevel: 5, title: 'Adept Scholar' },
  { minLevel: 8, title: 'Master Polymath' },
  { minLevel: 12, title: 'Grandmaster of QuizVerse' },
  { minLevel: 18, title: 'Omniscient Oracle' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Voyage',
    description: 'Complete your first ever quiz match in QuizVerse.',
    icon: 'Compass',
  },
  {
    id: 'flawless',
    title: 'Perfectionist',
    description: 'Score 100% accuracy on any quiz round.',
    icon: 'Crown',
  },
  {
    id: 'speed-demon',
    title: 'Lightning Reflexes',
    description: 'Answer any question correctly in under 3 seconds.',
    icon: 'Zap',
  },
  {
    id: 'streak-master',
    title: 'Unstoppable Flow',
    description: 'Build a consecutive streak of 5 or more correct answers.',
    icon: 'Flame',
  },
  {
    id: 'hardcore-veteran',
    title: 'Iron Will',
    description: 'Complete a Hard difficulty quiz with at least 75% accuracy.',
    icon: 'ShieldAlert',
  },
  {
    id: 'myth-master',
    title: 'Pantheon Sage',
    description: 'Score over 1,500 points in World Mythology & Lore.',
    icon: 'Sparkles',
  },
  {
    id: 'tech-guru',
    title: 'Silicon Pioneer',
    description: 'Score over 1,500 points in Technology & Computing.',
    icon: 'Cpu',
  },
  {
    id: 'puzzle-prodigy',
    title: 'Enigma Decoder',
    description: 'Score over 1,500 points in Puzzles & Brain Teasers.',
    icon: 'Lightbulb',
  },
  {
    id: 'world-ambassador',
    title: 'Global Diplomat',
    description: 'Score over 1,500 points in GK & Current Affairs.',
    icon: 'Globe',
  },
  {
    id: 'century-club',
    title: 'High Roller',
    description: 'Accumulate over 5,000 total career points across all games.',
    icon: 'Trophy',
  },
];
