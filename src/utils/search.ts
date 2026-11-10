import { CATEGORIES, QUESTION_BANK } from "../data/questions";
import { HINDI_QUESTIONS } from "../data/questions.hi";
import { STUDY_IMAGES } from "../data/studyImages";
import { HINDI_MESSAGES } from "../i18n/hi";
import type { Language } from "../i18n/LanguageContext";
import type { CategoryId, Difficulty } from "../types";

export function normalizeSearch(query: string): string {
  return query.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}
function matches(text: string, query: string): boolean {
  const normalized = normalizeSearch(text);
  return normalizeSearch(query)
    .split(" ")
    .filter(Boolean)
    .every((word) => normalized.includes(word));
}
export function googleSearchUrl(
  query: string,
  language: Language,
  kind: "web" | "images" = "web",
): string | null {
  const cleanQuery = query
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 500);
  if (!cleanQuery) return null;
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", cleanQuery);
  url.searchParams.set("hl", language);
  url.searchParams.set("safe", "active");
  if (kind === "images") url.searchParams.set("udm", "2");
  return url.toString();
}
function categoryText(id: CategoryId): string {
  const category = CATEGORIES.find((category) => category.id === id);
  if (!category) return "";
  return [
    category.name,
    category.shortName,
    HINDI_MESSAGES[category.name],
    HINDI_MESSAGES[category.shortName],
  ].join(" ");
}
export function searchQuestions(
  query: string,
  category: CategoryId = "all",
  difficulty: Difficulty | "all" = "all",
) {
  return QUESTION_BANK.filter((question) => {
    if (category !== "all" && question.categoryId !== category) return false;
    if (difficulty !== "all" && question.difficulty !== difficulty)
      return false;
    const hi = HINDI_QUESTIONS[question.id];
    return matches(
      [
        question.question,
        ...question.options,
        question.hint,
        question.explanation,
        hi?.question,
        ...(hi?.options || []),
        hi?.hint,
        hi?.explanation,
        question.id === "gk-e3" ? "space अंतरिक्ष astronomy खगोल" : "",
        categoryText(question.categoryId),
      ].join(" "),
      query,
    );
  });
}
export function searchImages(query: string, category: CategoryId = "all") {
  return STUDY_IMAGES.filter(
    (image) =>
      (category === "all" || image.categoryId === category) &&
      matches(
        [
          image.title,
          image.description,
          image.keywords,
          HINDI_MESSAGES[image.title],
          HINDI_MESSAGES[image.description],
          categoryText(image.categoryId),
        ].join(" "),
        query,
      ),
  );
}
