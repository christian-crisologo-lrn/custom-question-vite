import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import * as sass from 'sass';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = resolve(ROOT, '..', 'public');

function getComponentEntries() {
  const questionsRoot = resolve(ROOT, 'src', 'questions');
  const entries = {};

  function addEntry(componentDir, fileName) {
    const relativeDir = componentDir
      .replace(questionsRoot, '')
      .replace(/\\/g, '/')
      .replace(/^\//, '');

    const componentPath = relativeDir ? `questions/${relativeDir}` : 'questions';
    const entryName = fileName.replace(/\.js$/, '');
    const entryPath = relativeDir
      ? `src/questions/${relativeDir}/${fileName}`
      : `src/questions/${fileName}`;

    entries[`${componentPath}/${entryName}`] = entryPath;
  }

  function walk(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = resolve(dir, item.name);

      if (item.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!item.isFile()) {
        continue;
      }

      const componentDir = dirname(fullPath);
      if (['question.js', 'scorer.js'].includes(item.name)) {
        addEntry(componentDir, item.name);
      }
    }
  }

  if (existsSync(questionsRoot)) {
    walk(questionsRoot);
  }

  return entries;
}

const ENTRIES = getComponentEntries();

// Builds a single custom-question IIFE bundle. The entry is selected via the
// QUESTION_ENTRY env var so we can invoke this config once per file (Rollup
// does not support multi-entry IIFE builds). The authoring HTML layout and
// per-component stylesheet are copied on the final build so the dist/ tree mirrors the BASE_URL paths
// referenced in CustomQuestionType.json and QuestionTypeTemplate.json.

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
