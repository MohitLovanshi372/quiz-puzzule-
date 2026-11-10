import { useEffect, useId, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Image,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { CATEGORIES, DIFFICULTY_CONFIG } from "../data/questions";
import { localizeQuestion } from "../data/questions.hi";
import { useLanguage } from "../i18n/LanguageContext";
import type { CategoryId, Difficulty } from "../types";
import {
  normalizeSearch,
  searchImages,
  searchQuestions,
} from "../utils/search";
import { GoogleSearchLinks } from "./GoogleSearchLinks";
import { StudyImageCard } from "./StudyImageCard";

export function StudyExplorer() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [tab, setTab] = useState<"questions" | "images">("questions");
  const [limit, setLimit] = useState(6);
  const prefix = useId();
  const cleanQuery = query.normalize("NFKC").trim().replace(/\s+/g, " ");
  const questions = searchQuestions(query, category, difficulty);
  const images = searchImages(query, category);
  useEffect(() => setLimit(6), [query, category, difficulty]);
  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setDifficulty("all");
  };

  return (
    <section
      id="study-explorer"
      className="study-explorer"
      aria-labelledby={`${prefix}-title`}
    >
      <div className="study-heading">
        <div>
          <div className="eyebrow">
            <Sparkles size={13} />
            {t("EXPLORE & LEARN")}
          </div>
          <h2 id={`${prefix}-title`}>
            {t("One search. A world of knowledge.")}
          </h2>
          <p>
            {t(
              "Search our question bank in Hindi or English, or explore a topic on Google.",
            )}
          </p>
        </div>
        <span className="study-badge">
          <BookOpen size={15} />
          {t("56 questions. Endless curiosity.")}
        </span>
      </div>
      <form
        className="study-search"
        action="https://www.google.com/search"
        method="get"
        target="_blank"
        rel="noopener noreferrer"
        onSubmit={(event) => {
          if (!normalizeSearch(query)) event.preventDefault();
        }}
      >
        <div className="study-input-wrap">
          <Search size={19} />
          <label htmlFor={`${prefix}-query`} className="sr-only">
            {t("Search questions and images")}
          </label>
          <input
            id={`${prefix}-query`}
            type="search"
            maxLength={200}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Try space, technology, mythology…")}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setQuery("")}
              aria-label={t("Clear search")}
            >
              <X size={15} />
            </button>
          )}
        </div>
        <input type="hidden" name="q" value={cleanQuery} />
        <input type="hidden" name="hl" value={language} />
        <input type="hidden" name="safe" value="active" />
        <button type="submit" className="google-submit" disabled={!cleanQuery}>
          <Search size={15} />
          {t("Google search")}
          <ExternalLink size={12} />
        </button>
        <button
          type="submit"
          className="google-submit google-image-submit"
          name="udm"
          value="2"
          disabled={!cleanQuery}
        >
          <Image size={15} />
          {t("Google Images")}
          <ExternalLink size={12} />
        </button>
      </form>
      <div className="search-helper">
        <span>{t("Google results open in a new tab.")}</span>
        <div className="topic-suggestions">
          <span>{t("Try:")}</span>
          {["Space", "Technology", "Puzzles", "Mythology"].map((topic) => (
            <button
              type="button"
              key={topic}
              onClick={() => {
                setQuery(t(topic));
                setCategory("all");
                setDifficulty("all");
              }}
            >
              {t(topic)}
            </button>
          ))}
        </div>
      </div>
      <div className="study-toolbar">
        <div
          className="study-tabs"
          role="tablist"
          aria-label={t("Study results")}
        >
          <button
            type="button"
            id={`${prefix}-questions-tab`}
            role="tab"
            aria-selected={tab === "questions"}
            aria-controls={`${prefix}-results`}
            tabIndex={tab === "questions" ? 0 : -1}
            onClick={() => setTab("questions")}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                setTab("images");
                document.getElementById(`${prefix}-images-tab`)?.focus();
              }
            }}
          >
            <BookOpen size={16} />
            {t("Questions")}
            <span>{questions.length}</span>
          </button>
          <button
            type="button"
            id={`${prefix}-images-tab`}
            role="tab"
            aria-selected={tab === "images"}
            aria-controls={`${prefix}-results`}
            tabIndex={tab === "images" ? 0 : -1}
            onClick={() => setTab("images")}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                setTab("questions");
                document.getElementById(`${prefix}-questions-tab`)?.focus();
              }
            }}
          >
            <Image size={16} />
            {t("Images")}
            <span>{images.length}</span>
          </button>
        </div>
        <div className="study-filters">
          <label>
            <span className="sr-only">{t("Filter by topic")}</span>
            <select
              aria-label={t("Filter by topic")}
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as CategoryId)
              }
            >
              <option value="all">{t("All topics")}</option>
              {CATEGORIES.filter((cat) => cat.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.shortName)}
                </option>
              ))}
            </select>
          </label>
          {tab === "questions" && (
            <label>
              <span className="sr-only">{t("Filter by difficulty")}</span>
              <select
                aria-label={t("Filter by difficulty")}
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as Difficulty | "all")
                }
              >
                <option value="all">{t("All levels")}</option>
                {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                  <option key={diff} value={diff}>
                    {t(DIFFICULTY_CONFIG[diff].label)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
      <p className="search-result-count" role="status" aria-live="polite">
        {tab === "questions"
          ? t("{count} questions in our library", { count: questions.length })
          : t("{count} images in our gallery", { count: images.length })}
      </p>
      <div
        id={`${prefix}-results`}
        role="tabpanel"
        aria-labelledby={`${prefix}-${tab}-tab`}
        tabIndex={0}
      >
        {tab === "questions" ? (
          questions.length ? (
            <>
              <div className="study-question-grid">
                {questions.slice(0, limit).map((original) => {
                  const question = localizeQuestion(original, language);
                  const cat = CATEGORIES.find(
                    (c) => c.id === question.categoryId,
                  )!;
                  return (
                    <article
                      key={question.id}
                      className="study-question-card"
                      data-question-id={question.id}
                    >
                      <div className="study-question-meta">
                        <span>{t(cat.shortName)}</span>
                        <span>
                          {t(DIFFICULTY_CONFIG[question.difficulty].label)}
                        </span>
                      </div>
                      <h3>{question.question}</h3>
                      <details className="study-answer">
                        <summary>{t("Reveal answer & explanation")}</summary>
                        <p className="study-correct-answer">
                          {question.options[question.correctIndex]}
                        </p>
                        <p>{question.explanation}</p>
                        <GoogleSearchLinks query={question.question} />
                      </details>
                    </article>
                  );
                })}
              </div>
              {questions.length > limit && (
                <button
                  type="button"
                  className="show-more-questions"
                  onClick={() => setLimit((previous) => previous + 6)}
                >
                  {t("Show more questions")}
                  <ChevronDown size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="study-empty">
              <Search size={27} />
              <h3>{t("No matching questions yet")}</h3>
              <p>
                {t(
                  "Try another topic, clear the filters, or search this topic on Google.",
                )}
              </p>
              <button type="button" onClick={clearFilters}>
                {t("Clear filters")}
              </button>
            </div>
          )
        ) : images.length ? (
          <div className="study-image-grid">
            {images.map((image) => (
              <StudyImageCard key={image.id} image={image} />
            ))}
          </div>
        ) : (
          <div className="study-empty">
            <Image size={27} />
            <h3>{t("No matching images in our gallery")}</h3>
            <p>
              {t("Try another topic or use Google Images to explore more.")}
            </p>
            <button type="button" onClick={clearFilters}>
              {t("Clear filters")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
