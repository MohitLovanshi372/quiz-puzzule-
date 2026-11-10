import { useLanguage } from "../i18n/LanguageContext";
import { localizeQuestion } from "../data/questions.hi";
import { GoogleSearchLinks } from "./GoogleSearchLinks";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  Timer,
  Flame,
  Zap,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  CategoryId,
  Difficulty,
  LifelineState,
  Question,
  AnswerRecord,
  GameResult,
} from "../types";
import { DIFFICULTY_CONFIG, CATEGORIES } from "../data/questions";
import { soundFx } from "../utils/audio";

interface QuizArenaProps {
  categoryId: CategoryId;
  difficulty: Difficulty;
  questions: Question[];
  onFinishQuiz: (result: GameResult) => void;
  onExitQuiz: () => void;
}

const ActiveQuizArena: React.FC<QuizArenaProps> = ({
  categoryId,
  difficulty,
  questions,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const { t, language } = useLanguage();
  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const categoryInfo =
    CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(diffConfig.timerSeconds);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  // Lifelines
  const [lifelines, setLifelines] = useState<LifelineState>({
    fiftyFifty: true,
    timeFreeze: true,
    hint: true,
  });
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [timeFrozenEffect, setTimeFrozenEffect] = useState<boolean>(false);

  // Time tracking
  const questionStartTimeRef = useRef<number>(Date.now());
  const answeredRef = useRef(false);
  const advancingRef = useRef(false);
  const deadlineRef = useRef(Date.now() + diffConfig.timerSeconds * 1000);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const currentQuestion = useMemo(
    () => localizeQuestion(questions[currentIndex], language),
    [questions, currentIndex, language],
  );
  const isLastQuestion = currentIndex === questions.length - 1;

  // Handle Answer Selection
  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (answeredRef.current || !currentQuestion) return;
      if (
        optionIndex !== -1 &&
        (optionIndex < 0 || optionIndex >= currentQuestion.options.length)
      )
        return;
      if (eliminatedOptions.includes(optionIndex)) return;
      if (Date.now() >= deadlineRef.current) optionIndex = -1;
      // A ref locks immediately, including two events before React's next render.
      answeredRef.current = true;

      const timeSpent = Math.max(
        1,
        Math.round((Date.now() - questionStartTimeRef.current) / 1000),
      );
      const isCorrect = optionIndex === currentQuestion.correctIndex;
      setIsAnswered(true);
      setSelectedIndex(optionIndex);

      let pointsThisQuestion = 0;
      let nextStreak = streak;

      if (isCorrect) {
        soundFx.playCorrect();
        nextStreak = streak + 1;
        setStreak(nextStreak);
        if (nextStreak > maxStreak) {
          setMaxStreak(nextStreak);
        }

        // Base points + multiplier
        const basePts = diffConfig.basePoints * diffConfig.multiplier;

        // Speed bonus
        let speedBonus = 0;
        if (timeSpent <= Math.ceil(diffConfig.timerSeconds * 0.3)) {
          speedBonus = 60; // Lightning fast!
        } else if (timeSpent <= Math.ceil(diffConfig.timerSeconds * 0.6)) {
          speedBonus = 30; // Quick
        }

        // Streak combo multiplier: up to 1.5x
        const streakMultiplier = 1 + Math.min(0.5, (nextStreak - 1) * 0.1);

        pointsThisQuestion = Math.round(
          (basePts + speedBonus) * streakMultiplier,
        );
        setRoundScore((prev) => prev + pointsThisQuestion);
      } else {
        soundFx.playWrong();
        setStreak(0);
      }

      const record: AnswerRecord = {
        questionId: currentQuestion.id,
        questionText: questions[currentIndex].question,
        selectedOptionIndex: optionIndex,
        correctOptionIndex: currentQuestion.correctIndex,
        isCorrect,
        timeSpentSeconds: timeSpent,
        pointsEarned: pointsThisQuestion,
        explanation: questions[currentIndex].explanation,
      };

      setAnswers((prev) => [...prev, record]);
    },
    [eliminatedOptions, streak, maxStreak, currentQuestion, diffConfig],
  );

  // Focus and navigation unlock happen after the new question has committed.
  useLayoutEffect(() => {
    advancingRef.current = false;
    questionHeadingRef.current?.focus({ preventScroll: true });
    if (currentIndex > 0)
      questionHeadingRef.current?.scrollIntoView({ block: "center" });
  }, [currentIndex]);

  // Use an absolute deadline so rerenders and background tabs do not reset time.
  // Keep all side effects outside React state updater functions (StrictMode safe).
  useEffect(() => {
    if (isAnswered) return;
    let previousSeconds = Math.max(
      0,
      Math.ceil((deadlineRef.current - Date.now()) / 1000),
    );
    const timer = window.setInterval(() => {
      if (answeredRef.current) return;
      const seconds = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );
      setTimeLeft(seconds);
      if (seconds === 0) handleSelectOption(-1);
      else if (seconds <= 4 && seconds !== previousSeconds)
        soundFx.playTimeWarning();
      previousSeconds = seconds;
    }, 100);
    return () => window.clearInterval(timer);
  }, [currentIndex, isAnswered, handleSelectOption]);

  useEffect(() => {
    if (!timeFrozenEffect) return;
    const timer = window.setTimeout(() => setTimeFrozenEffect(false), 1500);
    return () => window.clearTimeout(timer);
  }, [timeFrozenEffect]);

  useEffect(() => {
    if (isAnswered) nextButtonRef.current?.focus({ preventScroll: true });
  }, [isAnswered]);

  // Keyboard Navigation: A, B, C, D or 1, 2, 3, 4
  useLayoutEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.repeat ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        target.closest(
          'input, select, textarea, button, a, [contenteditable="true"]',
        )
      )
        return;
      if (isAnswered) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextQuestion();
        }
        return;
      }

      const keyMap: Record<string, number> = {
        "1": 0,
        a: 0,
        A: 0,
        "2": 1,
        b: 1,
        B: 1,
        "3": 2,
        c: 2,
        C: 2,
        "4": 3,
        d: 3,
        D: 3,
      };

      if (e.key in keyMap) {
        const optionIdx = keyMap[e.key];
        if (optionIdx >= 0 && optionIdx < currentQuestion.options.length) {
          e.preventDefault();
          handleSelectOption(optionIdx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (
      !isAnswered ||
      !answeredRef.current ||
      advancingRef.current ||
      answers.length !== currentIndex + 1
    )
      return;
    advancingRef.current = true;
    soundFx.playClick();
    if (isLastQuestion) {
      // Calculate final results
      const totalQuestions = questions.length;
      // Ensure accuracy is calculated over actual answers
      const finalAnswers = answers;
      const finalCorrect = finalAnswers.filter((a) => a.isCorrect).length;
      const accuracy =
        totalQuestions > 0
          ? Math.round((finalCorrect / totalQuestions) * 100)
          : 0;
      const totalTime = finalAnswers.reduce(
        (acc, curr) => acc + curr.timeSpentSeconds,
        0,
      );

      // XP Earned calculation
      const xpEarned = Math.round(roundScore * 0.25 + finalCorrect * 20);

      const finalResult: GameResult = {
        id: "game-" + Date.now(),
        timestamp: Date.now(),
        categoryId,
        categoryName: categoryInfo.name,
        difficulty,
        score: roundScore,
        totalQuestions,
        correctAnswers: finalCorrect,
        accuracy,
        totalTimeSeconds: totalTime,
        maxStreak,
        xpEarned,
        answers: finalAnswers,
      };

      onFinishQuiz(finalResult);
    } else {
      // Reset all per-question state in one React update, before rendering the
      // next question. This prevents stale feedback or keyboard handlers.
      answeredRef.current = false;
      setTimeLeft(diffConfig.timerSeconds);
      setIsAnswered(false);
      setSelectedIndex(null);
      setEliminatedOptions([]);
      setHintVisible(false);
      setTimeFrozenEffect(false);
      questionStartTimeRef.current = Date.now();
      deadlineRef.current = Date.now() + diffConfig.timerSeconds * 1000;
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Lifeline 1: 50:50
  const handleUseFiftyFifty = () => {
    if (!lifelines.fiftyFifty || answeredRef.current) return;
    soundFx.playLifeline();

    // Pick 2 wrong indices to eliminate
    const wrongIndices = currentQuestion.options
      .map((_, i) => i)
      .filter((i) => i !== currentQuestion.correctIndex);

    // Shuffle and pick 2
    const toEliminate = wrongIndices
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    setEliminatedOptions(toEliminate);
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
  };

  // Lifeline 2: Time Freeze (+15s)
  const handleUseTimeFreeze = () => {
    if (!lifelines.timeFreeze || answeredRef.current) return;
    soundFx.playLifeline();

    deadlineRef.current += 15000;
    setTimeLeft(
      Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)),
    );
    setTimeFrozenEffect(true);
    setLifelines((prev) => ({ ...prev, timeFreeze: false }));
  };

  // Lifeline 3: Oracle Hint
  const handleUseHint = () => {
    if (!lifelines.hint || answeredRef.current) return;
    soundFx.playLifeline();

    setHintVisible(true);
    setLifelines((prev) => ({ ...prev, hint: false }));
  };

  // Progress calculations
  const progressPercent = Math.round(
    ((currentIndex + 1) / questions.length) * 100,
  );
  const timerPercent = (timeLeft / diffConfig.timerSeconds) * 100;
  const isTimeCritical = timeLeft <= 4 && !isAnswered;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header: Category, Question Counter & Quit button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {t(categoryInfo.shortName)}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diffConfig.badgeClass}`}
          >
            {t(diffConfig.label)}
          </span>
        </div>

        <button
          onClick={onExitQuiz}
          className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-slate-800"
        >
          {" "}
          {t("Quit Round")}{" "}
        </button>
      </div>

      {/* Progress & Score Bar */}
      <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Question Counter & Progress */}
        <div className="w-full sm:w-1/2 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>
              {t("Question {current} of {total}", {
                current: currentIndex + 1,
                total: questions.length,
              })}
            </span>
            <span className="text-indigo-400">
              {t("{percent}% complete", { percent: progressPercent })}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Score & Streak */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t("Score")}
            </div>
            <div className="text-lg font-black text-amber-400">
              {roundScore.toLocaleString()}
            </div>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 animate-pulse">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span className="text-xs font-extrabold">
                {t("{count}x Streak!", { count: streak })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timer Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5 text-xs font-bold">
          <div
            className={`flex items-center gap-1.5 ${isTimeCritical ? "text-rose-400 animate-bounce" : "text-slate-300"}`}
          >
            <Timer
              className={`w-4 h-4 ${isTimeCritical ? "text-rose-500" : "text-amber-400"}`}
            />
            <span>{t("Time Remaining:")}</span>
          </div>
          <span
            className={`text-sm font-black ${
              isTimeCritical
                ? "text-rose-400 scale-110 transition-transform"
                : timeLeft <= 8
                  ? "text-amber-400"
                  : "text-emerald-400"
            }`}
          >
            {t("{seconds}s", { seconds: timeLeft })}
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isTimeCritical
                ? "bg-rose-500 shadow-lg shadow-rose-500/50"
                : timeLeft <= 8
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            } ${timeFrozenEffect ? "ring-2 ring-cyan-400 shadow-cyan-400/50" : ""}`}
            style={{ width: `${Math.max(0, Math.min(100, timerPercent))}%` }}
          />
        </div>

        {timeFrozenEffect && (
          <div className="absolute -top-6 right-0 text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded shadow">
            {" "}
            {t("+15s Added!")}{" "}
          </div>
        )}
      </div>

      {/* Lifelines Bar */}
      <div className="flex items-center justify-end gap-2 text-xs">
        <span className="text-slate-400 mr-1 hidden sm:inline">
          {t("Tactical Lifelines:")}
        </span>

        {/* 50:50 */}
        <button
          id="btn-lifeline-5050"
          onClick={handleUseFiftyFifty}
          disabled={!lifelines.fiftyFifty || isAnswered}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
            lifelines.fiftyFifty && !isAnswered
              ? "bg-slate-800 hover:bg-slate-700 border-indigo-500/40 text-indigo-300 hover:scale-105"
              : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
          }`}
          title={t("Eliminates 2 incorrect options")}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>50:50</span>
        </button>

        {/* +15s Freeze */}
        <button
          id="btn-lifeline-freeze"
          onClick={handleUseTimeFreeze}
          disabled={!lifelines.timeFreeze || isAnswered}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
            lifelines.timeFreeze && !isAnswered
              ? "bg-slate-800 hover:bg-slate-700 border-cyan-500/40 text-cyan-300 hover:scale-105"
              : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
          }`}
          title={t("Adds 15 seconds to the countdown timer")}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t("+15s Freeze")}</span>
        </button>

        {/* Oracle Hint */}
        <button
          id="btn-lifeline-hint"
          onClick={handleUseHint}
          disabled={!lifelines.hint || isAnswered}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
            lifelines.hint && !isAnswered
              ? "bg-slate-800 hover:bg-slate-700 border-amber-500/40 text-amber-300 hover:scale-105"
              : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
          }`}
          title={t("Reveals a strategic clue about this question")}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{t("Oracle Hint")}</span>
        </button>
      </div>

      {/* Question Card */}
      <div className="bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl relative">
        <h2
          ref={questionHeadingRef}
          tabIndex={-1}
          className="text-lg sm:text-2xl font-bold text-white leading-relaxed"
        >
          {currentQuestion.question}
        </h2>

        {/* Oracle Hint Banner (if activated) */}
        {hintVisible && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              <span className="font-bold">{t("Oracle Clue:")} </span>
              {currentQuestion.hint}
            </div>
          </div>
        )}
      </div>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {currentQuestion.options.map((option, idx) => {
          const isEliminated = eliminatedOptions.includes(idx);
          const isSelected = selectedIndex === idx;
          const isCorrectAnswer = idx === currentQuestion.correctIndex;

          let cardStyle =
            "bg-slate-800/70 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-200 cursor-pointer";

          if (isEliminated) {
            cardStyle =
              "bg-slate-900/40 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed line-through";
          } else if (isAnswered) {
            if (isCorrectAnswer) {
              cardStyle =
                "bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-900/40";
            } else if (isSelected) {
              cardStyle =
                "bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50 shadow-lg shadow-rose-900/40";
            } else {
              cardStyle =
                "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60";
            }
          }

          const letter = ["A", "B", "C", "D"][idx];

          return (
            <button
              key={idx}
              id={`option-btn-${idx}`}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered || isEliminated}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-150 group ${cardStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                    isAnswered && isCorrectAnswer
                      ? "bg-emerald-500 text-white border-emerald-400"
                      : isAnswered && isSelected
                        ? "bg-rose-500 text-white border-rose-400"
                        : "bg-slate-700/60 border-slate-600 text-slate-300 group-hover:bg-slate-700"
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm font-medium leading-snug">
                  {option}
                </span>
              </div>

              {isAnswered && isCorrectAnswer && (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrectAnswer && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Explanation Drawer */}
      {isAnswered && (
        <div
          aria-live="polite"
          className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div
            className={`p-4 sm:p-5 rounded-xl border ${
              selectedIndex === currentQuestion.correctIndex
                ? "bg-emerald-950/40 border-emerald-500/40"
                : "bg-rose-950/40 border-rose-500/40"
            }`}
          >
            <div className="flex items-start gap-3">
              {selectedIndex === currentQuestion.correctIndex ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : selectedIndex === -1 ? (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">
                    {selectedIndex === currentQuestion.correctIndex
                      ? t("Spot On! Correct Answer")
                      : selectedIndex === -1
                        ? t("Time Expired! Let's check the fact:")
                        : t("Incorrect Answer")}
                  </span>
                  {selectedIndex === currentQuestion.correctIndex && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      +
                      {t("{points} pts", {
                        points: answers[answers.length - 1]?.pointsEarned ?? 0,
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>

          <GoogleSearchLinks query={currentQuestion.question} />
          {/* Next / Finish Button */}
          <div className="flex justify-end">
            <button
              ref={nextButtonRef}
              id="btn-next-question"
              onClick={handleNextQuestion}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:translate-x-1"
            >
              <span>
                {isLastQuestion ? t("View Round Results") : t("Next Question")}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Keyboard hints footer */}
      <div className="text-center text-[11px] text-slate-500">
        {t("Keyboard: 1–4 or A–D to answer. Enter to continue.")}
      </div>
    </div>
  );
};

export const QuizArena: React.FC<QuizArenaProps> = (props) => {
  const { t } = useLanguage();
  if (!props.questions.length)
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4" role="alert">
        <p>{t("No questions available. Please choose another category.")}</p>
        <button
          type="button"
          className="start-round"
          onClick={props.onExitQuiz}
        >
          {t("Change Category")}
        </button>
      </div>
    );
  return <ActiveQuizArena {...props} />;
};
