import { defineConfig } from 'vite';
import { dirname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, createReadStream } from 'node:fs';

const ROOT = dirname(fileURLToPath(import.meta.url));

// During `npm run dev`, Learnosity fetches the custom-question assets from
// `{BASE_URL}/questions/customInput/...` (e.g. http://localhost:8081/questions/customInput/question.js).
// The source files live in `src/questions/`, so this plugin serves any
// `/questions/*` request straight from `src/questions/` for the dev server.
// The production build emits the same files to `dist/questions/`.
function serveQuestionAssets() {
  const QUESTIONS_ROOT = resolve(ROOT, 'src/questions');
  const CONTENT_TYPES = {
    '.js': 'application/javascript; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
  };

  return {
    name: 'serve-question-assets',
    configureServer(server) {
      server.middlewares.use('/questions', (req, res, next) => {
        const urlPath = decodeURIComponent((req.url || '').split('?')[0]);
        const filePath = normalize(resolve(QUESTIONS_ROOT, `.${urlPath}`));

        if (!filePath.startsWith(QUESTIONS_ROOT) || !existsSync(filePath)) {
          next();
          return;
        }

        const ext = filePath.slice(filePath.lastIndexOf('.'));
        if (CONTENT_TYPES[ext]) {
          res.setHeader('Content-Type', CONTENT_TYPES[ext]);
        }
        createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  root: ROOT,
  plugins: [serveQuestionAssets()],
  server: {
    port: 8081,
  },
  preview: {
    port: 8081,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(ROOT, 'index.html'),
        report: resolve(ROOT, 'report.html'),
      },
    },
  },
});
