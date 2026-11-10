import { useLanguage } from "../i18n/LanguageContext";
import { localizeAnswer } from "../data/questions.hi";
import React, { useState } from "react";
import {
  User,
  Edit3,
  Check,
  Flame,
  Trophy,
  Target,
  Clock,
  Calendar,
  Sparkles,
  Award,
  Globe,
  Cpu,
  Lightbulb,
  Play,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import { CategoryId, UserProfile } from "../types";
import { AVATAR_OPTIONS, ACHIEVEMENTS } from "../data/achievements";
import { CATEGORIES } from "../data/questions";
import { calculateLevelFromXp, saveProfile } from "../utils/storage";
import { soundFx } from "../utils/audio";

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onPlayCategory: (catId: CategoryId) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onPlayCategory,
}) => {
  const { t, language } = useLanguage();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(profile.username);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );

  const levelInfo = calculateLevelFromXp(profile.xp);

  const handleSaveName = () => {
    if (tempName.trim() === "") return;
    soundFx.playClick();
    const updated = { ...profile, username: tempName.trim() };
    saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditingName(false);
  };

  const handleSelectAvatar = (avatarEmoji: string) => {
    soundFx.playClick();
    const updated = { ...profile, avatar: avatarEmoji };
    saveProfile(updated);
    onUpdateProfile(updated);
    setShowAvatarModal(false);
  };

  const overallAccuracy =
    profile.totalQuestions > 0
      ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
      : 0;

  const renderCategoryIcon = (catId: CategoryId) => {
    switch (catId) {
      case "gk-current-affairs":
        return <Globe className="w-5 h-5 text-emerald-400" />;
      case "technology":
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case "puzzles":
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case "mythology":
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Profile Header & Customizer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/60 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with edit trigger */}
          <div
            className="relative group cursor-pointer"
            onClick={() => setShowAvatarModal(true)}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-slate-800 to-indigo-900 border-2 border-indigo-500/50 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl group-hover:scale-105 transition-transform">
              {profile.avatar}
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-indigo-600 text-white shadow-md group-hover:bg-indigo-500 transition-colors">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>

          {/* User Info & Title */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            {/* Username row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={20}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500 text-lg font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    aria-label={t("Save username")}
                    onClick={handleSaveName}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {profile.username}
                  </h1>
                  <button
                    aria-label={t("Edit username")}
                    onClick={() => {
                      setTempName(profile.username);
                      setIsEditingName(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Title badge */}
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide">
                {t(profile.title)}
              </span>
            </div>

            {/* Level & XP bar */}
            <div className="max-w-md pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-indigo-300 font-bold">
                  {t("Level {level}", { level: levelInfo.level })}
                </span>
                <span className="text-slate-400">
                  {levelInfo.currentXp} / {levelInfo.xpNeeded} {t("XP")}{" "}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((levelInfo.currentXp / levelInfo.xpNeeded) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-4 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t("Joined {date}", {
                  date: new Date(profile.createdAt).toLocaleDateString(
                    language === "hi" ? "hi-IN" : "en-IN",
                  ),
                })}
              </span>
              <span>•</span>
              <span className="text-amber-400 font-medium">
                {t("{score} Lifetime Pts", {
                  score: profile.totalScore.toLocaleString(),
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Career Statistics Grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />{" "}
          {t("Career Statistics")}{" "}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80 text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {t("Quizzes")}
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
              {profile.totalGames}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {t("Completed")}
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80 text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {t("Accuracy")}
            </div>
            <div
              className={`text-xl sm:text-2xl font-black mt-1 ${overallAccuracy >= 75 ? "text-emerald-400" : "text-amber-400"}`}
            >
              {overallAccuracy}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {t("{correct}/{total} hits", {
                correct: profile.totalCorrect,
                total: profile.totalQuestions,
              })}
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80 text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {t("High Score")}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {profile.highestScore.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {t("Best round")}
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80 text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {t("Best Streak")}
            </div>
            <div className="text-xl sm:text-2xl font-black text-orange-400 mt-1 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-orange-400" />
              <span>{profile.bestStreak}x</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {t("In a row")}
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80 text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {t("Badges")}
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">
              {profile.achievements.length} / {ACHIEVEMENTS.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {t("Unlocked")}
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80 text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {t("Rank Level")}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {levelInfo.level}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {t("Total XP: {xp}", { xp: profile.xp })}
            </div>
          </div>
        </div>
      </section>

      {/* Category Mastery Breakdown */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />{" "}
          {t("Category Mastery & Historical High Scores")}{" "}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const stats = profile.categoryStats[cat.id] || {
              played: 0,
              correct: 0,
              totalQuestions: 0,
              highScore: 0,
            };
            const catAccuracy =
              stats.totalQuestions > 0
                ? Math.round((stats.correct / stats.totalQuestions) * 100)
                : 0;

            return (
              <div
                key={cat.id}
                className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                      {renderCategoryIcon(cat.id)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">
                        {t(cat.name)}
                      </h3>
                      <div className="text-xs text-slate-400">
                        {t("{count} rounds played", { count: stats.played })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onPlayCategory(cat.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-xs font-bold text-indigo-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t("Play")}</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t("Accuracy")}</span>
                    <span className="font-semibold text-slate-200">
                      {catAccuracy}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${catAccuracy}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-700/60">
                  <span className="text-slate-400">
                    {t("Historical High Score:")}
                  </span>
                  <span className="font-bold text-amber-400">
                    {stats.highScore > 0
                      ? t("{points} pts", {
                          points: stats.highScore.toLocaleString(),
                        })
                      : t("No runs yet")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Achievements Showcase */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          {t("Achievements & Badges ({unlocked}/{total})", {
            unlocked: profile.achievements.length,
            total: ACHIEVEMENTS.length,
          })}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = profile.achievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? "bg-amber-950/20 border-amber-500/40 shadow-sm"
                    : "bg-slate-800/30 border-slate-800 opacity-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg border ${
                    isUnlocked
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md"
                      : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}
                >
                  {isUnlocked ? "🏆" : "🔒"}
                </div>
                <div>
                  <div
                    className={`text-xs font-bold ${isUnlocked ? "text-amber-300" : "text-slate-400"}`}
                  >
                    {t(ach.title)}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    {t(ach.description)}
                  </div>
                  {isUnlocked && (
                    <span className="inline-block text-[10px] text-emerald-400 font-semibold mt-1">
                      {" "}
                      {t("✓ Unlocked")}{" "}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Historical Games Log */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            {t("Historical Match Record ({count})", {
              count: profile.history.length,
            })}
          </h2>
          <span className="text-xs text-slate-400">
            {" "}
            {t("Past quiz performance & score details")}{" "}
          </span>
        </div>

        {profile.history.length === 0 ? (
          <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/60 text-center text-slate-400 space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-slate-600" />
            <p>{t("No historical quiz rounds recorded yet.")}</p>
            <p className="text-xs text-slate-500">
              {" "}
              {t(
                "Start a quiz round from the Arena to track your progress and high scores here!",
              )}{" "}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {profile.history.map((record) => {
              const isExpanded = expandedHistoryId === record.id;

              return (
                <div
                  key={record.id}
                  className="bg-slate-800/60 rounded-xl border border-slate-700/80 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    id={`history-round-${record.id}`}
                    aria-expanded={isExpanded}
                    aria-controls={`history-details-${record.id}`}
                    onClick={() =>
                      setExpandedHistoryId(isExpanded ? null : record.id)
                    }
                    className="p-4 w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/90"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-indigo-400">
                        {renderCategoryIcon(record.categoryId)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <span>{t(record.categoryName)}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              record.difficulty === "hard"
                                ? "bg-rose-500/20 text-rose-300"
                                : record.difficulty === "medium"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {t(record.difficulty)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(record.timestamp).toLocaleDateString(
                            language === "hi" ? "hi-IN" : "en-IN",
                          )}{" "}
                          •{" "}
                          {new Date(record.timestamp).toLocaleTimeString(
                            language === "hi" ? "hi-IN" : "en-IN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase">
                          {t("Accuracy")}
                        </div>
                        <div
                          className={`font-bold ${record.accuracy >= 75 ? "text-emerald-400" : "text-slate-200"}`}
                        >
                          {record.accuracy}% ({record.correctAnswers}/
                          {record.totalQuestions})
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-slate-400 text-[10px] uppercase">
                          {t("Score")}
                        </div>
                        <div className="text-sm font-black text-amber-400">
                          {t("{points} pts", {
                            points: record.score.toLocaleString(),
                          })}
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div
                      id={`history-details-${record.id}`}
                      className="p-4 border-t border-slate-700 bg-slate-900/60 space-y-2.5 text-xs"
                    >
                      <div className="font-bold text-slate-300 mb-2">
                        {" "}
                        {t("Round Question Summary:")}{" "}
                      </div>
                      {record.answers
                        .map((answer) => localizeAnswer(answer, language))
                        .map((ans, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex items-start gap-2 text-slate-300"
                          >
                            {ans.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-200">
                                {ans.questionText}
                              </span>
                              <div className="text-[11px] text-slate-400">
                                {t("Spent {seconds}s • Earned {points} pts", {
                                  seconds: ans.timeSpentSeconds,
                                  points: ans.pointsEarned,
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {t("Choose Your Avatar")}
              </h3>
              <button
                aria-label={t("Close")}
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 py-2">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectAvatar(item.emoji)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    profile.avatar === item.emoji
                      ? "bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40"
                      : "bg-slate-800/60 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <div className="text-3xl">{item.emoji}</div>
                  <div className="text-[10px] font-bold text-slate-300 mt-1 truncate">
                    {t(item.name)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
