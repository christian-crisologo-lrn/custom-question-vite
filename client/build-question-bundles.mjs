import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const questionsRoot = path.join(projectRoot, 'src', 'questions');
const entries = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (item.isFile() && ['question.js', 'scorer.js'].includes(item.name)) {
      const relativeEntry = path
        .relative(path.join(projectRoot, 'src'), fullPath)
        .replace(/\\/g, '/')
        .replace(/\.js$/, '');

      entries.push(relativeEntry);
    }
  }
}

walk(questionsRoot);

for (const entry of entries.sort()) {
  const viteBin = path.join(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
  const result = spawnSync(viteBin, ['build', '--config', 'vite.config.questions.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      QUESTION_ENTRY: entry,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
