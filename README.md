# QuizVerse

A React and Vite quiz app with 56 questions across general knowledge, technology, puzzles, and mythology.

## Run

```sh
npm install
npm run dev
```

Use the **English / हिन्दी** menu in the header to change language. The choice is saved on this browser. Questions, options, hints, explanations, results, and profile labels support both languages. Switching during a round preserves the question, time remaining, answers, score, and used lifelines. English spelling puzzles retain their original word choices with a Hindi explanation.

Scores and profile history are stored locally in this browser.

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

Browser regressions cover answer/Next transitions, duplicate clicks, full rounds and replay, timeout, extra time, keyboard controls, audio failure, Hindi question coverage, language persistence, translated review/history, and desktop/mobile layouts.
