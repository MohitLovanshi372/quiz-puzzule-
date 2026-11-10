import { test, expect, type Page } from "@playwright/test";
import {
  CATEGORIES,
  QUESTION_BANK,
  getQuizQuestions,
} from "../src/data/questions";
import { HINDI_QUESTIONS } from "../src/data/questions.hi";

const PROFILE_KEY = "quizverse_user_profile_v1";
async function startRound(page: Page, difficulty = "medium") {
  await page.goto("/");
  await page.locator(`#diff-card-${difficulty}`).click();
  await page.locator("#btn-count-5").click();
  await page.locator("#btn-start-quiz").click();
  await expect(
    page.getByText("Question 1 of 5", { exact: true }),
  ).toBeVisible();
}
async function storedProfile(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) || "null"),
    PROFILE_KEY,
  );
}
async function answerCorrectly(page: Page) {
  const heading = await page.locator("main h2").innerText();
  const question = QUESTION_BANK.find(
    (q) => q.question === heading || HINDI_QUESTIONS[q.id].question === heading,
  );
  expect(question).toBeDefined();
  await page.locator(`#option-btn-${question!.correctIndex}`).click();
}

test("every question has Hindi text, options, hint and explanation; all rounds have unique valid IDs", () => {
  expect(Object.keys(HINDI_QUESTIONS).sort()).toEqual(
    QUESTION_BANK.map((q) => q.id).sort(),
  );
  expect(new Set(QUESTION_BANK.map((q) => q.id)).size).toBe(
    QUESTION_BANK.length,
  );
  for (const q of QUESTION_BANK) {
    const hi = HINDI_QUESTIONS[q.id];
    expect(hi.options.length).toBe(q.options.length);
    expect(hi.question).toMatch(/[\u0900-\u097f]/);
    expect(hi.hint).toMatch(/[\u0900-\u097f]/);
    expect(hi.explanation).toMatch(/[\u0900-\u097f]/);
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctIndex).toBeLessThan(q.options.length);
  }
  for (const category of CATEGORIES)
    for (const difficulty of ["easy", "medium", "hard"] as const)
      for (const count of [5, 8, 10]) {
        const questions = getQuizQuestions(category.id, difficulty, count);
        expect(questions).toHaveLength(count);
        expect(new Set(questions.map((q) => q.id)).size).toBe(count);
        if (category.id !== "all")
          expect(questions.every((q) => q.categoryId === category.id)).toBe(
            true,
          );
      }
});

test("answer feedback remains visible and Next advances exactly once after rapid duplicate events", async ({
  page,
}) => {
  await startRound(page);
  await page.locator("#option-btn-0").evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(page.locator("#btn-next-question")).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator("#option-btn-0")).toBeDisabled();
  await expect(page.locator("#btn-next-question")).toBeVisible();
  await page
    .locator("#btn-next-question")
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await expect(
    page.getByText("Question 2 of 5", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#btn-next-question")).toHaveCount(0);
  await expect(page.locator("#option-btn-0")).toBeEnabled();
});

test("finish a complete round, save five answers once, and replay a clean round", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await startRound(page);
  for (let index = 0; index < 5; index++) {
    await expect(
      page.getByText(`Question ${index + 1} of 5`, { exact: true }),
    ).toBeVisible();
    await answerCorrectly(page);
    await expect(
      page.getByText("Spot On! Correct Answer", { exact: true }),
    ).toBeVisible();
    await page.locator("#btn-next-question").click();
  }
  await expect(
    page.getByRole("heading", { name: "Quiz Completed!" }),
  ).toBeVisible();
  const saved = await storedProfile(page);
  expect(saved.totalGames).toBe(1);
  expect(saved.totalQuestions).toBe(5);
  expect(saved.history[0].answers).toHaveLength(5);
  expect(new Set(saved.history[0].answers.map((a) => a.questionId)).size).toBe(
    5,
  );
  expect(saved.history[0].accuracy).toBe(100);
  expect(saved.history[0].maxStreak).toBe(5);
  expect(saved.history[0].score).toBe(
    saved.history[0].answers.reduce(
      (sum, answer) => sum + answer.pointsEarned,
      0,
    ),
  );
  await page.locator("#btn-play-again").click();
  await expect(
    page.getByText("Question 1 of 5", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#option-btn-0")).toBeEnabled();
  await expect(page.locator("#btn-lifeline-5050")).toBeEnabled();
  expect(errors).toEqual([]);
});

test("timeout creates one answer, freezes at zero and allows the next question", async ({
  page,
}) => {
  await page.clock.install();
  await startRound(page, "hard");
  await page.clock.runFor(12_100);
  await expect(
    page.getByText("Time Expired! Let's check the fact:", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#option-btn-0")).toBeDisabled();
  await page.clock.runFor(5_000);
  await expect(page.getByText("0s", { exact: true })).toBeVisible();
  await page.locator("#btn-next-question").click();
  await expect(
    page.getByText("Question 2 of 5", { exact: true }),
  ).toBeVisible();
  for (let index = 1; index < 5; index++) {
    await answerCorrectly(page);
    await page.locator("#btn-next-question").click();
  }
  const saved = await storedProfile(page);
  expect(saved.history[0].answers).toHaveLength(5);
  expect(saved.history[0].answers[0].selectedOptionIndex).toBe(-1);
  expect(saved.history[0].correctAnswers).toBe(4);
});

test("extra time is retained across language changes and cannot be used twice", async ({
  page,
}) => {
  await page.clock.install();
  await startRound(page, "hard");
  await page.clock.runFor(5_000);
  await page.locator("#btn-lifeline-freeze").click();
  await expect(page.locator("#btn-lifeline-freeze")).toBeDisabled();
  await page.locator("#language-select").selectOption("hi");
  await page.clock.runFor(8_000); // Original twelve-second deadline has now passed.
  await expect(page.locator("#option-btn-0")).toBeEnabled();
  await expect(page.locator("#btn-next-question")).toHaveCount(0);
  await page.clock.runFor(15_000);
  await expect(
    page.getByText("समय पूरा हुआ! सही जानकारी जानें:", { exact: true }),
  ).toBeVisible();
  await page.locator("#btn-next-question").click();
  await expect(page.getByText("सवाल 2 / 5", { exact: true })).toBeVisible();
  await expect(page.locator("#btn-lifeline-freeze")).toBeDisabled();
});

test("language switch translates question, options, hint and feedback without losing selection or time", async ({
  page,
}) => {
  await page.clock.install();
  await startRound(page);
  const englishQuestion = await page.locator("main h2").innerText();
  const question = QUESTION_BANK.find((q) => q.question === englishQuestion)!;
  await page.locator("#btn-lifeline-hint").click();
  await page.locator("#btn-lifeline-5050").click();
  await page.clock.runFor(5_000);
  await page.locator("#language-select").selectOption("hi");
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await expect(page.locator("main h2")).toHaveText(
    HINDI_QUESTIONS[question.id].question,
  );
  await expect(
    page.getByText(HINDI_QUESTIONS[question.id].hint, { exact: false }),
  ).toBeVisible();
  await expect(page.locator("#option-btn-0")).toContainText(
    HINDI_QUESTIONS[question.id].options[0],
  );
  await expect(page.locator('[id^="option-btn-"]:disabled')).toHaveCount(2);
  await page.clock.runFor(4_000);
  await page.locator("#language-select").selectOption("en");
  await expect(page.locator("main h2")).toHaveText(englishQuestion);
  await expect(page.getByText("9s", { exact: true })).toBeVisible();
  await page.locator(`#option-btn-${question.correctIndex}`).click();
  await page.locator("#language-select").selectOption("hi");
  await expect(page.locator("#option-btn-0")).toBeDisabled();
  await expect(page.locator("#btn-next-question")).toHaveText("अगला सवाल");
  await expect(
    page.getByText(HINDI_QUESTIONS[question.id].explanation, { exact: true }),
  ).toBeVisible();
  await page.locator("#btn-next-question").click();
  await expect(page.getByText("सवाल 2 / 5", { exact: true })).toBeVisible();
});

test("Hindi selection persists on reload and results and historical review use the chosen language", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#language-select").selectOption("hi");
  await page.reload();
  await expect(page.locator("#language-select")).toHaveValue("hi");
  await expect(
    page.getByRole("heading", { name: "अपना विषय चुनें" }),
  ).toBeVisible();
  await page.locator("#btn-count-5").click();
  await page.locator("#btn-start-quiz").click();
  for (let index = 0; index < 5; index++) {
    await answerCorrectly(page);
    await page.locator("#btn-next-question").click();
  }
  await expect(
    page.getByRole("heading", { name: "क्विज़ पूरा हुआ!" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "सभी 5 सवाल और जवाब का विवरण देखें" })
    .click();
  const saved = await storedProfile(page);
  const first = saved.history[0].answers[0];
  await expect(
    page.getByText(HINDI_QUESTIONS[first.questionId].question, { exact: true }),
  ).toBeVisible();
  await page.locator("#language-select").selectOption("en");
  await expect(
    page.getByText(first.questionText, { exact: true }),
  ).toBeVisible();
  await page.locator("#nav-tab-profile").click();
  await page.locator("#language-select").selectOption("hi");
  await expect(
    page.getByRole("heading", { name: "पिछले राउंड का रिकॉर्ड (1)" }),
  ).toBeVisible();
  await page.locator(`[id="history-round-${saved.history[0].id}"]`).click();
  await expect(
    page.getByText(HINDI_QUESTIONS[first.questionId].question, { exact: true }),
  ).toBeVisible();
});

test("number keys answer, Enter advances, and native Next button activation does not skip a question", async ({
  page,
}) => {
  await startRound(page);
  await page.keyboard.press("1");
  await expect(page.locator("#btn-next-question")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Question 2 of 5", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("b");
  await expect(page.locator("#btn-next-question")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(
    page.getByText("Question 3 of 5", { exact: true }),
  ).toBeVisible();
});

test("unavailable audio cannot block navigation, answering or Next", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() {
        throw new Error("Audio unavailable");
      }
    } as typeof AudioContext;
  });
  await startRound(page);
  await page.locator("#option-btn-0").click();
  await page.locator("#btn-next-question").click();
  await expect(
    page.getByText("Question 2 of 5", { exact: true }),
  ).toBeVisible();
});

for (const width of [375, 768, 1440])
  test(`English and Hindi layouts fit viewport width ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const language of ["en", "hi"]) {
      await page.locator("#language-select").selectOption(language);
      for (const tab of ["home", "leaderboard", "profile"]) {
        await page.locator(`#nav-tab-${tab}`).click();
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          )
          .toBe(true);
      }
    }
  });
