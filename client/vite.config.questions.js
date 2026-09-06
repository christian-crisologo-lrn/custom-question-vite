import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import * as sass from 'sass';

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
  'questions/customInputV2/question': 'src/questions/customInputV2/question.js',
  'questions/customInputV2/scorer': 'src/questions/customInputV2/scorer.js',
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
        const componentSourceDir = resolve(ROOT, 'src', questionTypeDir);
        const distQuestionDir = resolve(ROOT, 'dist', questionTypeDir);
        const publicQuestionDir = resolve(PUBLIC_ROOT, questionTypeDir);

        mkdirSync(distQuestionDir, { recursive: true });
        mkdirSync(publicQuestionDir, { recursive: true });

        const sourceLayoutPath = resolve(componentSourceDir, 'authoring_custom_layout.html');
        if (existsSync(sourceLayoutPath)) {
          copyFileSync(sourceLayoutPath, resolve(distQuestionDir, 'authoring_custom_layout.html'));
          copyFileSync(sourceLayoutPath, resolve(publicQuestionDir, 'authoring_custom_layout.html'));
        }

        const sourceScssPath = resolve(componentSourceDir, 'styles.scss');
        if (existsSync(sourceScssPath)) {
          const compiledCss = sass.compile(sourceScssPath, { style: 'expanded' }).css;
          const cssOutput = 'style.css';
          writeFileSync(resolve(distQuestionDir, cssOutput), compiledCss);
          writeFileSync(resolve(publicQuestionDir, cssOutput), compiledCss);
        }

        const publicAssetPath = resolve(PUBLIC_ROOT, outputFileName);
        copyFileSync(
          resolve(ROOT, 'dist', outputFileName),
          publicAssetPath
        );
      },
    },
  ],
});
