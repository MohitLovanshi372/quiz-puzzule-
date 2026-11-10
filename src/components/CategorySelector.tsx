import { useLanguage } from "../i18n/LanguageContext";
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
import { StudyExplorer } from "./StudyExplorer";

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
  const { t } = useLanguage();
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
        <span>{t("YOUR DAILY DOSE OF DISCOVERY")}</span>
        <span className="welcome-player">
          {t("Welcome back, {name}", { name: profile.username })}{" "}
          <span aria-hidden="true">✦</span>
        </span>
      </div>
      <section className="discovery-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> {t("CURIOUS MINDS START HERE")}{" "}
          </div>
          <h1>
            {" "}
            {t("Big curiosity.")} <br />
            <span>{t("Bigger possibilities.")}</span>
          </h1>
          <p>
            {" "}
            {t(
              "A little knowledge. A little challenge. A whole lot of “I knew that!”",
            )}{" "}
            <br className="desktop-break" />{" "}
            {t(
              "Pick your world and give your brain something to play with.",
            )}{" "}
          </p>
          <div className="hero-actions">
            <a className="hero-link" href="#categories">
              {" "}
              {t("Find your next challenge")} <ArrowRight size={17} />
            </a>
            <a className="hero-link hero-study-link" href="#study-explorer">
              {t("Search questions & images")}
              <ArrowUpRight size={16} />
            </a>
          </div>
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
          <div className="art-note">{t("Stay curious.")}</div>
          <div className="art-dot" />
        </div>
      </section>
      <section className="player-stats" aria-label={t("Your quiz statistics")}>
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
            value: t("{count} in a row", { count: profile.bestStreak }),
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
              <span className="stat-label">{t(label)}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </section>
      <div className="play-layout">
        <section id="categories" className="category-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{t("EXPLORE YOUR INTERESTS")}</div>
              <h2>{t("Choose your playground")}</h2>
            </div>
            <span className="category-count">{t("5 categories")}</span>
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
                  <h3>{t(cat.shortName)}</h3>
                  <p>{t(labels[cat.id])}</p>
                  <div className="card-meta">
                    <span>{t("{count} questions", { count })}</span>
                    <span>
                      {cat.id === "all"
                        ? t("THE ULTIMATE MIX")
                        : t("EXPLORE & LEARN")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="curiosity-note">
            <Sparkles size={18} />
            <p>{t("Every question is a chance to discover something new.")}</p>
          </div>
        </section>
        <aside className="round-panel">
          <div className="panel-heading">
            <span className="panel-icon">
              <SlidersHorizontal size={19} />
            </span>
            <div>
              <h2>{t("Make it your round")}</h2>
              <p>{t("Your challenge, your rules.")}</p>
            </div>
          </div>
          <div className="round-field">
            <span className="field-label">{t("YOUR CATEGORY")}</span>
            <div className="chosen-category">
              <span className="live-dot" />
              {t(selected.shortName)}
            </div>
          </div>
          <fieldset className="round-field">
            <legend className="field-label">{t("DIFFICULTY")}</legend>
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
                  {t(DIFFICULTY_CONFIG[d].label)}
                </button>
              ))}
            </div>
            <p className="field-help">{t(config.description)}</p>
          </fieldset>
          <fieldset className="round-field">
            <legend className="field-label">{t("NUMBER OF QUESTIONS")}</legend>
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
                  <span>{t("questions")}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="round-summary">
            <span>
              <Timer size={16} />
              {t("{seconds}s per question", { seconds: config.timerSeconds })}
            </span>
            <span>
              <Zap size={16} />
              {t("{multiplier}× points", { multiplier: config.multiplier })}
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
            {" "}
            {t("Let's play")} <ArrowRight size={19} />
          </button>
          <p className="panel-footnote">
            {" "}
            {t("A fresh challenge. Every single round.")}{" "}
          </p>
        </aside>
      </div>
      <StudyExplorer />
      <section className="explore-banner">
        <div className="banner-symbol">
          <Trophy size={27} />
        </div>
        <div>
          <h3>{t("A little friendly competition?")}</h3>
          <p>{t("Beat your best. Find your place on the leaderboard.")}</p>
        </div>
        <button type="button" onClick={onNavigateLeaderboard}>
          {" "}
          {t("View leaderboard")} <ArrowUpRight size={17} />
        </button>
        <button
          type="button"
          className="progress-link"
          onClick={onNavigateProfile}
        >
          {" "}
          {t("My progress")} <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};
