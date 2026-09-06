import { defineConfig } from 'vite';
import { dirname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, createReadStream } from 'node:fs';
import * as sass from 'sass';

const ROOT = dirname(fileURLToPath(import.meta.url));

// During `npm run dev`, Learnosity fetches the custom-question assets from
// `{BASE_URL}/questions/customInput/...` (e.g. http://localhost:8081/questions/customInput/question.js).
// The source files live in `src/questions/`, so this plugin serves any
// `/questions/*` request straight from the relevant dev source while also
// compiling `styles.scss` on the fly for `style.css` requests.
function serveQuestionAssets() {
  const QUESTIONS_ROOT = resolve(ROOT, 'src/questions');
  const PUBLIC_QUESTIONS_ROOT = resolve(ROOT, '..', 'public', 'questions');
  const CONTENT_TYPES = {
    '.js': 'application/javascript; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
  };

  return {
    name: 'serve-question-assets',
    configureServer(server) {
      server.middlewares.use('/questions', (req, res, next) => {
        const urlPath = decodeURIComponent((req.url || '').split('?')[0]);
        const relativePath = urlPath.replace(/^\/questions/, '');

        // Prefer the source file, then the public generated file, then compile
        // the corresponding styles.scss when a style.css request is made.
        const srcFilePath = normalize(resolve(QUESTIONS_ROOT, `.${relativePath}`));
        const publicFilePath = normalize(resolve(PUBLIC_QUESTIONS_ROOT, `.${relativePath}`));

        if (srcFilePath.startsWith(QUESTIONS_ROOT) && existsSync(srcFilePath)) {
          const ext = srcFilePath.slice(srcFilePath.lastIndexOf('.'));
          if (CONTENT_TYPES[ext]) {
            res.setHeader('Content-Type', CONTENT_TYPES[ext]);
          }
          createReadStream(srcFilePath).pipe(res);
          return;
        }

        if (publicFilePath.startsWith(PUBLIC_QUESTIONS_ROOT) && existsSync(publicFilePath)) {
          const ext = publicFilePath.slice(publicFilePath.lastIndexOf('.'));
          if (CONTENT_TYPES[ext]) {
            res.setHeader('Content-Type', CONTENT_TYPES[ext]);
          }
          createReadStream(publicFilePath).pipe(res);
          return;
        }

        const stylesScssPath = normalize(
          resolve(QUESTIONS_ROOT, `.${relativePath.replace(/style\.css$/, 'styles.scss')}`)
        );

        if (
          stylesScssPath.startsWith(QUESTIONS_ROOT) &&
          existsSync(stylesScssPath) &&
          relativePath.endsWith('style.css')
        ) {
          res.setHeader('Content-Type', CONTENT_TYPES['.css']);
          res.end(sass.compile(stylesScssPath, { style: 'expanded' }).css);
          return;
        }

        next();
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
