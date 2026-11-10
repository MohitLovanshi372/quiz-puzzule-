import { GoogleSearchLinks } from "./GoogleSearchLinks";
import { useLanguage } from "../i18n/LanguageContext";
import { localizeAnswer } from "../data/questions.hi";
import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Grid,
  Award,
  User,
  CheckCircle,
  XCircle,
  Flame,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GameResult, UserProfile } from "../types";
import { soundFx } from "../utils/audio";
import { ACHIEVEMENTS } from "../data/achievements";
import { calculateLevelFromXp } from "../utils/storage";

interface QuizResultsProps {
  result: GameResult;
  profile: UserProfile;
  newAchievements: string[];
  onPlayAgain: () => void;
  onChangeCategory: () => void;
  onViewLeaderboard: () => void;
  onViewProfile: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  profile,
  newAchievements,
  onPlayAgain,
  onChangeCategory,
  onViewLeaderboard,
  onViewProfile,
}) => {
  const { t, language } = useLanguage();
  const [showFullReview, setShowFullReview] = useState<boolean>(false);

  useEffect(() => {
    // Fire confetti for high accuracy
    if (result.accuracy >= 60) {
      soundFx.playFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#6366f1", "#10b981", "#ec4899"],
        });
      } catch {
        // ignore
      }
    }
  }, [result.accuracy]);

  const levelInfo = calculateLevelFromXp(profile.xp);
  const avgTime =
    result.answers.length > 0
      ? (result.totalTimeSeconds / result.answers.length).toFixed(1)
      : "0";

  const getVerdict = (acc: number) => {
    if (acc === 100)
      return { label: t("Flawless Mastery! 🌟"), color: "text-amber-400" };
    if (acc >= 80)
      return {
        label: t("Outstanding Knowledge! 🏆"),
        color: "text-emerald-400",
      };
    if (acc >= 60)
      return { label: t("Great Performance! 👍"), color: "text-indigo-400" };
    if (acc >= 40)
      return {
        label: t("Good Effort! Keep practicing 💡"),
        color: "text-amber-300",
      };
    return {
      label: t("Tough Round! Try an easier difficulty 🌱"),
      color: "text-rose-400",
    };
  };

  const verdict = getVerdict(result.accuracy);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Result Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
          <span>{t(result.categoryName)}</span>
          <span>•</span>
          <span className="uppercase text-amber-400">
            {t(result.difficulty)}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {" "}
          {t("Quiz Completed!")}{" "}
        </h1>
        <p className={`text-base sm:text-lg font-bold ${verdict.color}`}>
          {verdict.label}
        </p>
      </div>

      {/* Main Score & Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Score */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 text-center relative overflow-hidden shadow-lg">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            {" "}
            {t("Total Points")}{" "}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {result.score.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t("+{xp} XP gained", { xp: result.xpEarned })}
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 text-center relative overflow-hidden shadow-lg">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            {" "}
            {t("Accuracy")}{" "}
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black ${
              result.accuracy >= 75
                ? "text-emerald-400"
                : result.accuracy >= 50
                  ? "text-amber-400"
                  : "text-rose-400"
            }`}
          >
            {result.accuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t("{correct} of {total} correct", {
              correct: result.correctAnswers,
              total: result.totalQuestions,
            })}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 text-center relative overflow-hidden shadow-lg">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            {" "}
            {t("Max Streak")}{" "}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-orange-400" />
            <span>{result.maxStreak}x</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {" "}
            {t("Combo streak")}{" "}
          </div>
        </div>

        {/* Avg Time */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 text-center relative overflow-hidden shadow-lg">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            {" "}
            {t("Speed")}{" "}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 flex items-center justify-center gap-1">
            <Clock className="w-5 h-5" />
            <span>{t("{seconds}s", { seconds: avgTime })}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {" "}
            {t("Avg per question")}{" "}
          </div>
        </div>
      </div>

      {/* Level Progression Bar */}
      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">
              {t("Level {level}", { level: levelInfo.level })}
            </span>
            <span className="text-slate-400">({t(profile.title)})</span>
          </div>
          <span className="text-slate-400">
            {t("{current} / {needed} XP to Level {level}", {
              current: levelInfo.currentXp,
              needed: levelInfo.xpNeeded,
              level: levelInfo.level + 1,
            })}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(100, Math.round((levelInfo.currentXp / levelInfo.xpNeeded) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Unlocked Achievements Banner */}
      {newAchievements.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>{t("New Achievement Unlocked!")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newAchievements.map((achId) => {
              const ach = ACHIEVEMENTS.find((a) => a.id === achId);
              if (!ach) return null;
              return (
                <div
                  key={achId}
                  className="bg-slate-900/60 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-lg">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      {t(ach.title)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t(ach.description)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          id="btn-play-again"
          onClick={onPlayAgain}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-transform hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t("Play Again")}</span>
        </button>

        <button
          id="btn-change-category"
          onClick={onChangeCategory}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Grid className="w-4 h-4" />
          <span>{t("Change Category")}</span>
        </button>

        <button
          id="btn-view-leaderboard"
          onClick={onViewLeaderboard}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-400 font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Award className="w-4 h-4" />
          <span>{t("Leaderboard")}</span>
        </button>

        <button
          id="btn-view-profile"
          onClick={onViewProfile}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-400 font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <User className="w-4 h-4" />
          <span>{t("Profile & History")}</span>
        </button>
      </div>

      {/* Question-by-Question Review Accordion */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700 overflow-hidden">
        <button
          onClick={() => setShowFullReview(!showFullReview)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
            <span>
              {t("Review All {count} Questions & Explanations", {
                count: result.answers.length,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>{showFullReview ? t("Hide") : t("Show Details")}</span>
            {showFullReview ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showFullReview && (
          <div className="p-4 sm:p-6 border-t border-slate-700 space-y-4 bg-slate-900/40">
            {result.answers
              .map((answer) => localizeAnswer(answer, language))
              .map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-2 ${
                    ans.isCorrect
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : "bg-rose-950/20 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {ans.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          {t("Question {number}", { number: idx + 1 })}
                        </div>
                        <div className="text-sm font-bold text-slate-100">
                          {ans.questionText}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-400">
                        +{t("{points} pts", { points: ans.pointsEarned })}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {t("{seconds}s", { seconds: ans.timeSpentSeconds })}
                      </div>
                    </div>
                  </div>

                  {/* Explanation text */}
                  <div className="pl-7 text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-semibold text-slate-200">
                      {t("Fact:")}{" "}
                    </span>
                    {ans.explanation}
                  </div>
                  <GoogleSearchLinks query={ans.questionText} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
