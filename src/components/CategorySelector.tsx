import React, { useState } from "react";
import {
  Globe,
  Cpu,
  Lightbulb,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowRight,
  Timer,
  Trophy,
  Target,
  Flame,
  Check,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";
import { CategoryId, Difficulty, UserProfile } from "../types";
import {
  CATEGORIES,
  DIFFICULTY_CONFIG,
  QUESTION_BANK,
} from "../data/questions";
import { soundFx } from "../utils/audio";

interface CategorySelectorProps {
  onStartQuiz: (
    categoryId: CategoryId,
    difficulty: Difficulty,
    questionCount: number,
  ) => void;
  profile: UserProfile;
  onNavigateLeaderboard: () => void;
  onNavigateProfile: () => void;
}
const icons = { Globe, Cpu, Lightbulb, Sparkles, Zap };
const labels: Record<CategoryId, string> = {
  "gk-current-affairs": "The world is your playground.",
  technology: "Think ahead. Think technology.",
  puzzles: "A little twist for your brain.",
  mythology: "Great stories. Legendary questions.",
  all: "A little bit of everything.",
};
export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onStartQuiz,
  profile,
  onNavigateLeaderboard,
  onNavigateProfile,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("gk-current-affairs");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState(8);
  const selected = CATEGORIES.find((c) => c.id === selectedCategory)!;
  const config = DIFFICULTY_CONFIG[selectedDifficulty];
  const accuracy = profile.totalQuestions
    ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
    : 0;
  return (
    <div className="arena-home">
      <div className="welcome-line">
        <span>YOUR DAILY DOSE OF DISCOVERY</span>
        <span className="welcome-player">
          Welcome back, {profile.username} <span aria-hidden="true">✦</span>
        </span>
      </div>
      <section className="discovery-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> CURIOUS MINDS START HERE
          </div>
          <h1>
            Big curiosity.
            <br />
            <span>Bigger possibilities.</span>
          </h1>
          <p>
            A little knowledge. A little challenge. A whole lot of “I knew
            that!”
            <br className="desktop-break" /> Pick your world and give your brain
            something to play with.
          </p>
          <a className="hero-link" href="#categories">
            Find your next challenge <ArrowRight size={17} />
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-star star-one">✦</span>
          <span className="art-star star-two">✧</span>
          <div className="art-tile tile-globe">
            <Globe />
          </div>
          <div className="art-tile tile-bulb">
            <Lightbulb />
          </div>
          <div className="art-tile tile-zap">
            <Zap />
          </div>
          <div className="art-note">Stay curious.</div>
          <div className="art-dot" />
        </div>
      </section>
      <section className="player-stats" aria-label="Your quiz statistics">
        {[
          {
            icon: Trophy,
            label: "Total score",
            value: profile.totalScore.toLocaleString(),
            color: "purple",
          },
          {
            icon: Target,
            label: "Accuracy",
            value: `${accuracy}%`,
            color: "green",
          },
          {
            icon: Flame,
            label: "Best streak",
            value: `${profile.bestStreak} in a row`,
            color: "orange",
          },
          {
            icon: BookOpen,
            label: "Quizzes played",
            value: profile.totalGames,
            color: "blue",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div className="stat-item" key={label}>
            <span className={`stat-icon ${color}`}>
              <Icon size={20} />
            </span>
            <div>
              <span className="stat-label">{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </section>
      <div className="play-layout">
        <section id="categories" className="category-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">EXPLORE YOUR INTERESTS</div>
              <h2>Choose your playground</h2>
            </div>
            <span className="category-count">5 categories</span>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((cat, i) => {
              const Icon =
                icons[cat.iconName as keyof typeof icons] || Sparkles;
              const active = cat.id === selectedCategory;
              const count =
                cat.id === "all"
                  ? QUESTION_BANK.length
                  : QUESTION_BANK.filter((q) => q.categoryId === cat.id).length;
              return (
                <button
                  type="button"
                  id={`cat-card-${cat.id}`}
                  key={cat.id}
                  aria-pressed={active}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`category-card category-${i} ${active ? "is-selected" : ""}`}
                >
                  <div className="card-top">
                    <span className="category-icon">
                      <Icon size={25} />
                    </span>
                    <span
                      className={active ? "selected-check" : "category-arrow"}
                    >
                      {active ? (
                        <Check size={15} />
                      ) : (
                        <ArrowUpRight size={19} />
                      )}
                    </span>
                  </div>
                  <h3>{cat.shortName}</h3>
                  <p>{labels[cat.id]}</p>
                  <div className="card-meta">
                    <span>{count} questions</span>
                    <span>
                      {cat.id === "all"
                        ? "THE ULTIMATE MIX"
                        : "EXPLORE & LEARN"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="curiosity-note">
            <Sparkles size={18} />
            <p>Every question is a chance to discover something new.</p>
          </div>
        </section>
        <aside className="round-panel">
          <div className="panel-heading">
            <span className="panel-icon">
              <SlidersHorizontal size={19} />
            </span>
            <div>
              <h2>Make it your round</h2>
              <p>Your challenge, your rules.</p>
            </div>
          </div>
          <div className="round-field">
            <span className="field-label">YOUR CATEGORY</span>
            <div className="chosen-category">
              <span className="live-dot" />
              {selected.shortName}
            </div>
          </div>
          <fieldset className="round-field">
            <legend className="field-label">DIFFICULTY</legend>
            <div className="segment-control">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  type="button"
                  id={`diff-card-${d}`}
                  key={d}
                  aria-pressed={d === selectedDifficulty}
                  onClick={() => setSelectedDifficulty(d)}
                  className={d === selectedDifficulty ? "active" : ""}
                >
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>
            <p className="field-help">{config.description}</p>
          </fieldset>
          <fieldset className="round-field">
            <legend className="field-label">NUMBER OF QUESTIONS</legend>
            <div className="question-options">
              {[5, 8, 10].map((n) => (
                <button
                  type="button"
                  key={n}
                  id={`btn-count-${n}`}
                  aria-pressed={questionCount === n}
                  onClick={() => setQuestionCount(n)}
                  className={questionCount === n ? "active" : ""}
                >
                  {n}
                  <span>questions</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="round-summary">
            <span>
              <Timer size={16} />
              {config.timerSeconds}s per question
            </span>
            <span>
              <Zap size={16} />
              {config.multiplier}× points
            </span>
          </div>
          <button
            type="button"
            id="btn-start-quiz"
            className="start-round"
            onClick={() => {
              soundFx.playClick();
              onStartQuiz(selectedCategory, selectedDifficulty, questionCount);
            }}
          >
            Let's play <ArrowRight size={19} />
          </button>
          <p className="panel-footnote">
            A fresh challenge. Every single round.
          </p>
        </aside>
      </div>
      <section className="explore-banner">
        <div className="banner-symbol">
          <Trophy size={27} />
        </div>
        <div>
          <h3>A little friendly competition?</h3>
          <p>Beat your best. Find your place on the leaderboard.</p>
        </div>
        <button type="button" onClick={onNavigateLeaderboard}>
          View leaderboard <ArrowUpRight size={17} />
        </button>
        <button
          type="button"
          className="progress-link"
          onClick={onNavigateProfile}
        >
          My progress <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};
