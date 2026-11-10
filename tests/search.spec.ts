import { test, expect } from "@playwright/test";
import {
  googleSearchUrl,
  searchQuestions,
  searchImages,
} from "../src/utils/search";
import { STUDY_IMAGES } from "../src/data/studyImages";
import { QUESTION_BANK } from "../src/data/questions";

const explorer = "#study-explorer";

test("search is bilingual and filters combine without returning duplicate questions", () => {
  expect(searchQuestions("Chandrayaan-3").map((q) => q.id)).toContain("gk-e3");
  expect(searchQuestions("चंद्रयान").map((q) => q.id)).toContain("gk-e3");
  expect(searchQuestions("अंतरिक्ष").map((q) => q.id)).toContain("gk-e3");
  expect(searchQuestions("  ").length).toBe(QUESTION_BANK.length);
  expect(searchQuestions("", "technology", "hard")).toHaveLength(4);
  expect(searchQuestions("चंद्रयान", "technology")).toHaveLength(0);
  expect(new Set(searchQuestions("the").map((q) => q.id)).size).toBe(
    searchQuestions("the").length,
  );
  expect(searchImages("Earth").map((image) => image.id)).toEqual(["earth"]);
  expect(searchImages("पृथ्वी").map((image) => image.id)).toEqual(["earth"]);
  expect(searchImages("", "puzzles").map((image) => image.id)).toEqual([
    "rubiks-cube",
  ]);
});

test("Google URLs encode queries and language without allowing extra parameters", () => {
  const query = 'चंद्रयान & space? #moon + "NASA"';
  const url = new URL(googleSearchUrl(query, "hi", "images")!);
  expect(url.origin).toBe("https://www.google.com");
  expect(url.pathname).toBe("/search");
  expect(url.searchParams.get("q")).toBe(query);
  expect(url.searchParams.get("hl")).toBe("hi");
  expect(url.searchParams.get("safe")).toBe("active");
  expect(url.searchParams.get("udm")).toBe("2");
  expect([...url.searchParams.keys()].sort()).toEqual([
    "hl",
    "q",
    "safe",
    "udm",
  ]);
  expect(googleSearchUrl("   ", "en")).toBeNull();
  expect(
    new URL(googleSearchUrl("a".repeat(1000), "en")!).searchParams.get("q")
      ?.length,
  ).toBe(500);
});

test("question search, filters, reveal and empty-state recovery work without web requests", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (req) => {
    if (req.url().startsWith("https://")) external.push(req.url());
  });
  await page.goto("/");
  const section = page.locator(explorer);
  const search = section.getByRole("searchbox");
  await search.fill("चंद्रयान");
  await expect(section.locator("[data-question-id]")).toHaveCount(1);
  await expect(section.locator('[data-question-id="gk-e3"]')).toBeVisible();
  await page.locator("#language-select").selectOption("hi");
  await expect(section.locator("h3").first()).toContainText("चंद्रयान-3");
  await section.locator("summary").click();
  await expect(section.locator(".study-correct-answer")).toHaveText("भारत");
  await section
    .getByRole("combobox", { name: "विषय से फ़िल्टर करें" })
    .selectOption("technology");
  await expect(
    section.getByRole("heading", { name: "इस खोज से कोई सवाल नहीं मिला" }),
  ).toBeVisible();
  await section.getByRole("button", { name: "फ़िल्टर हटाएँ" }).click();
  await expect(section.locator("[data-question-id]")).toHaveCount(6);
  await section.getByRole("button", { name: "और सवाल देखें" }).click();
  await expect(section.locator("[data-question-id]")).toHaveCount(12);
  await section
    .getByRole("combobox", { name: "कठिनाई से फ़िल्टर करें" })
    .selectOption("hard");
  await expect(section.locator("[data-question-id]")).toHaveCount(6);
  expect(external).toEqual([]);
});

test("Google search and image forms open the typed query in a new tab", async ({
  page,
  context,
}) => {
  await context.route("https://www.google.com/search**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Search destination</h1>",
    }),
  );
  await page.goto("/");
  const section = page.locator(explorer);
  await expect(
    section.getByRole("button", { name: "Google search", exact: true }),
  ).toBeDisabled();
  await section.getByRole("searchbox").fill("    ");
  await expect(
    section.getByRole("button", { name: "Google Images", exact: true }),
  ).toBeDisabled();
  await section.getByRole("searchbox").fill("  चंद्रयान & NASA  ");
  await page.locator("#language-select").selectOption("hi");
  for (const [name, isImage] of [
    ["Google पर खोजें", false],
    ["Google तस्वीरें", true],
  ] as const) {
    const popupPromise = context.waitForEvent("page");
    await section.getByRole("button", { name, exact: true }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    const url = new URL(popup.url());
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("q")).toBe("चंद्रयान & NASA");
    expect(url.searchParams.get("hl")).toBe("hi");
    expect(url.searchParams.get("safe")).toBe("active");
    expect(url.searchParams.get("udm")).toBe(isImage ? "2" : null);
    expect(await popup.evaluate(() => window.opener)).toBeNull();
    await popup.close();
    expect(page.url()).toBe("http://127.0.0.1:3173/");
  }
});

test("gallery uses working local images with source and license details and Hindi search", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator(explorer);
  await section.getByRole("tab", { name: /Images/ }).click();
  await expect(section.locator("figure")).toHaveCount(4);
  for (const image of STUDY_IMAGES) {
    const figure = section.locator(`[data-image-id="${image.id}"]`);
    await figure.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        figure
          .locator("img")
          .evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
      )
      .toBe(true);
    await figure.getByText("Image credit & license", { exact: true }).click();
    await expect(
      figure.getByRole("link", { name: "Original source", exact: true }),
    ).toHaveAttribute("href", image.sourceUrl);
    await expect(
      figure.getByRole("link", { name: image.license, exact: true }),
    ).toHaveAttribute("href", image.licenseUrl);
  }
  await section.getByRole("searchbox").fill("पृथ्वी");
  await expect(section.locator("figure")).toHaveCount(1);
  await expect(section.locator('[data-image-id="earth"]')).toBeVisible();
  await section.getByRole("searchbox").fill("nonexistentvisualtopic");
  await expect(
    section.getByRole("heading", { name: "No matching images in our gallery" }),
  ).toBeVisible();
});

test("Google learning links appear only after an answer and preserve the current round", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#btn-count-5").click();
  await page.locator("#btn-start-quiz").click();
  await expect(page.locator(".google-learning-links")).toHaveCount(0);
  const question = await page.locator("main h2").innerText();
  await page.locator("#option-btn-0").click();
  const links = page.locator(".google-learning-links a");
  await expect(links).toHaveCount(2);
  for (const index of [0, 1]) {
    const link = links.nth(index);
    const url = new URL((await link.getAttribute("href"))!);
    expect(url.searchParams.get("q")).toBe(question);
    expect(url.searchParams.get("udm")).toBe(index === 1 ? "2" : null);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await page.locator("#language-select").selectOption("hi");
  await expect(
    page.getByRole("link", {
      name: "Google पर समझें (नए टैब में खुलेगा)",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator("#btn-next-question").click();
  await expect(page.getByText("सवाल 2 / 5", { exact: true })).toBeVisible();
  await expect(page.locator(".google-learning-links")).toHaveCount(0);
});

test("search tabs support keyboard navigation and gallery fits a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/");
  const section = page.locator(explorer);
  const questions = section.getByRole("tab", { name: /Questions/ });
  await questions.focus();
  await page.keyboard.press("ArrowRight");
  await expect(section.getByRole("tab", { name: /Images/ })).toBeFocused();
  await expect(section.locator("figure")).toHaveCount(4);
  for (const language of ["en", "hi"]) {
    await page.locator("#language-select").selectOption(language);
    await section.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
});
