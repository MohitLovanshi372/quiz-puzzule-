# QuizVerse

A React and Vite quiz app with 56 questions across general knowledge, technology, puzzles, and mythology.

## Run

```sh
npm install
npm run dev
```

Use the **English / हिन्दी** menu in the header to change language. The choice is saved on this browser. Questions, options, hints, explanations, results, and profile labels support both languages. Switching during a round preserves the question, time remaining, answers, score, and used lifelines. English spelling puzzles retain their original word choices with a Hindi explanation.

Scores and profile history are stored locally in this browser.

## Search and study

Open **Search questions & images** from the homepage. Explore & Learn searches the built-in 56-question library in either Hindi or English and supports topic and difficulty filters. Answers and explanations can be revealed in study mode; this does not affect quiz scores.

**Google search** and **Google Images** open a new tab with the entered topic and selected language. These are external Google searches, not embedded or fetched Google results. They work without API credentials. The app does not scrape Google or generate new quiz questions from search results. During a timed quiz, related web/image links appear after the answer, and are also available in result review.

The Images tab contains four locally hosted study photos, with bilingual captions, source links and per-image licenses. Credit and license details are shown on each card and in [public/images/CREDITS.md](public/images/CREDITS.md). Local study browsing requires no third-party requests; a Google request happens only when a search link/form is used.

## Check

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
```

To test with an existing Chromium installation:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Browser regressions cover answer/Next transitions, duplicate clicks, full rounds and replay, timeout, extra time, keyboard controls, audio failure, Hindi question coverage, language persistence, translated review/history, desktop/mobile layouts, bilingual library search and filters, Google query encoding and new-tab forms, working local image assets with attribution, and image gallery keyboard navigation.
