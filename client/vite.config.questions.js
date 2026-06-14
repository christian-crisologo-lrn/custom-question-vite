import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = resolve(ROOT, '..', 'public');

// Builds a single custom-question IIFE bundle. The entry is selected via the
// QUESTION_ENTRY env var so we can invoke this config once per file (Rollup
// does not support multi-entry IIFE builds). The authoring HTML layout is
// copied on the final build so the dist/ tree mirrors the BASE_URL paths
// referenced in CustomQuestionType.json and QuestionTypeTemplate.json.
const ENTRIES = {
  'questions/customInput/question': 'src/questions/customInput/question.js',
  'questions/customInput/scorer': 'src/questions/customInput/scorer.js',
  'questions/multipleOption/question': 'src/questions/multipleOption/question.js',
  'questions/multipleOption/scorer': 'src/questions/multipleOption/scorer.js',
};

const entryName = process.env.QUESTION_ENTRY;
if (!entryName || !ENTRIES[entryName]) {
  throw new Error(
    `QUESTION_ENTRY must be one of: ${Object.keys(ENTRIES).join(', ')}`
  );
}

const outputFileName = `${entryName}.js`;
const questionTypeDir = entryName.substring(0, entryName.lastIndexOf('/'));

export default defineConfig({
  root: ROOT,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: resolve(ROOT, ENTRIES[entryName]),
      formats: ['iife'],
      name: 'LrnCustomQuestion',
      fileName: () => outputFileName,
    },
  },
  plugins: [
    {
      name: 'copy-question-assets',
      closeBundle() {
        const sourceLayoutPath = resolve(ROOT, 'src', questionTypeDir, 'authoring_custom_layout.html');
        if (existsSync(sourceLayoutPath)) {
          const distLayoutDir = resolve(ROOT, 'dist', questionTypeDir);
          const publicLayoutDir = resolve(PUBLIC_ROOT, questionTypeDir);
          mkdirSync(distLayoutDir, { recursive: true });
          mkdirSync(publicLayoutDir, { recursive: true });
          copyFileSync(sourceLayoutPath, resolve(distLayoutDir, 'authoring_custom_layout.html'));
          copyFileSync(sourceLayoutPath, resolve(publicLayoutDir, 'authoring_custom_layout.html'));
        }

        const publicAssetPath = resolve(PUBLIC_ROOT, outputFileName);
        const publicQuestionDir = resolve(PUBLIC_ROOT, questionTypeDir);
        mkdirSync(publicQuestionDir, { recursive: true });
        copyFileSync(
          resolve(ROOT, 'dist', outputFileName),
          publicAssetPath
        );
      },
    },
  ],
});
