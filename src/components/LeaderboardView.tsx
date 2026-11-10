import { useLanguage } from "../i18n/LanguageContext";
import React, { useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  Filter,
  Search,
  Crown,
  Flame,
  Globe,
  Cpu,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CategoryId,
  Difficulty,
  LeaderboardEntry,
  UserProfile,
} from "../types";
import { CATEGORIES } from "../data/questions";
import { soundFx } from "../utils/audio";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  profile: UserProfile;
  onPlayCategory: (catId: CategoryId) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  profile,
  onPlayCategory,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(
    "all",
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter entries
  const filtered = entries.filter((item) => {
    if (selectedCategory !== "all" && item.categoryId !== selectedCategory)
      return false;
    if (selectedDifficulty !== "all" && item.difficulty !== selectedDifficulty)
      return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.username.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        t(item.categoryName).toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort descending by score, then accuracy
  const sorted = [...filtered].sort(
    (a, b) => b.score - a.score || b.accuracy - a.accuracy,
  );

  const topThree = sorted.slice(0, 3);
  const remaining = sorted.slice(3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 font-bold">
          <Crown className="w-4 h-4 fill-amber-400" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-300/20 border border-slate-300 flex items-center justify-center text-slate-200 font-bold">
          <Medal className="w-4 h-4 text-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-600 flex items-center justify-center text-amber-500 font-bold">
          <Medal className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
        #{rank}
      </div>
    );
  };

  const renderCategoryIcon = (catId: CategoryId) => {
    switch (catId) {
      case "gk-current-affairs":
        return <Globe className="w-3.5 h-3.5" />;
      case "technology":
        return <Cpu className="w-3.5 h-3.5" />;
      case "puzzles":
        return <Lightbulb className="w-3.5 h-3.5" />;
      case "mythology":
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Zap className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
          <Trophy className="w-3.5 h-3.5" /> {t("Hall of Legends")}{" "}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {" "}
          {t("Global Quiz Leaderboard")}{" "}
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {" "}
          {t(
            "Top historical scores across all domains and difficulty settings. Test your trivia mastery and claim the #1 crown.",
          )}{" "}
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-4">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> {t("Category:")}{" "}
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory("all");
            }}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-700/60 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {" "}
            {t("All Categories")}{" "}
          </button>
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-700/60 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t(cat.shortName)}
            </button>
          ))}
        </div>

        {/* Difficulty & Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700/80">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold mr-1">
              {t("Difficulty:")}
            </span>
            {(["all", "easy", "medium", "hard"] as (Difficulty | "all")[]).map(
              (diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedDifficulty(diff);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize transition-all ${
                    selectedDifficulty === diff
                      ? "bg-amber-500 text-slate-900 shadow-sm"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t(diff)}
                </button>
              ),
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t("Search contender...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Podium for Top 3 (if we have >= 3 entries) */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto pt-6 pb-2 items-end">
          {/* #2 Silver */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-400/30 text-center relative flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700 border-2 border-slate-300 flex items-center justify-center text-xl sm:text-2xl shadow-md mb-2">
              {topThree[1].avatar}
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center -mt-5 mb-1 z-10 shadow">
              2
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-full">
              {topThree[1].username}
            </div>
            <div className="text-sm sm:text-base font-black text-slate-200 mt-1">
              {topThree[1].score.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              {topThree[1].accuracy}
              {t("% Acc")}{" "}
            </div>
          </div>

          {/* #1 Gold (Taller) */}
          <div className="bg-gradient-to-b from-amber-500/20 to-slate-800/80 rounded-2xl p-4 sm:p-6 border-2 border-amber-400 text-center relative flex flex-col items-center shadow-xl shadow-amber-500/10 -translate-y-2">
            <Crown className="w-6 h-6 text-amber-400 fill-amber-400 -mt-1 mb-1 animate-pulse" />
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-700 border-2 border-amber-400 flex items-center justify-center text-2xl sm:text-3xl shadow-lg mb-2">
              {topThree[0].avatar}
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center -mt-6 mb-1 z-10 shadow">
              1
            </div>
            <div className="text-sm sm:text-base font-black text-amber-300 truncate max-w-full">
              {topThree[0].username}
            </div>
            <div className="text-base sm:text-xl font-black text-amber-400 mt-1">
              {topThree[0].score.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold mt-0.5">
              {topThree[0].accuracy}
              {t("% Acc")}{" "}
            </div>
          </div>

          {/* #3 Bronze */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-amber-700/40 text-center relative flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700 border-2 border-amber-600 flex items-center justify-center text-xl sm:text-2xl shadow-md mb-2">
              {topThree[2].avatar}
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center -mt-5 mb-1 z-10 shadow">
              3
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-full">
              {topThree[2].username}
            </div>
            <div className="text-sm sm:text-base font-black text-amber-500 mt-1">
              {topThree[2].score.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              {topThree[2].accuracy}
              {t("% Acc")}{" "}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">{t("Rank")}</th>
                <th className="py-3.5 px-4">{t("Contender")}</th>
                <th className="py-3.5 px-4 hidden md:table-cell">
                  {t("Category")}
                </th>
                <th className="py-3.5 px-4 hidden sm:table-cell">
                  {t("Difficulty")}
                </th>
                <th className="py-3.5 px-4 text-center">{t("Accuracy")}</th>
                <th className="py-3.5 px-4 text-right">{t("Score")}</th>
                <th className="py-3.5 px-4 text-right hidden lg:table-cell">
                  {t("Date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {" "}
                    {t(
                      "No scores match the selected criteria. Play a round to establish a record!",
                    )}{" "}
                  </td>
                </tr>
              ) : (
                sorted.map((item, idx) => {
                  const rank = idx + 1;
                  const isUser =
                    item.isCurrentUser || item.username === profile.username;

                  return (
                    <tr
                      key={item.id || idx}
                      className={`transition-colors ${
                        isUser
                          ? "bg-indigo-950/40 hover:bg-indigo-950/60"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center">
                          {getRankBadge(rank)}
                        </div>
                      </td>

                      {/* Contender */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">
                            {item.avatar}
                          </span>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>{item.username}</span>
                              {isUser && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                  {" "}
                                  {t("YOU")}{" "}
                                </span>
                              )}
                            </div>
                            <div className="md:hidden text-[11px] text-slate-400">
                              {t(item.categoryName)} •{" "}
                              <span className="capitalize">
                                {t(item.difficulty)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          {renderCategoryIcon(item.categoryId)}
                          <span>{t(item.categoryName)}</span>
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            item.difficulty === "hard"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              : item.difficulty === "medium"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {t(item.difficulty)}
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span
                          className={
                            item.accuracy >= 80
                              ? "text-emerald-400"
                              : "text-slate-300"
                          }
                        >
                          {item.accuracy}%
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-amber-400 text-sm sm:text-base">
                          {item.score.toLocaleString()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right hidden lg:table-cell text-xs text-slate-400">
                        {item.date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
