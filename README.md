# Learnosity Custom Question

A demo project for implementing custom questions with Learnosity APIs.
Built with **Vite** (client) and **Express** (server), wired together via npm workspaces.

The project has two pieces:

- **Client** (`client/`) — a Vite multi-page app that renders the Learnosity Items API (player) and Reports API (session report), and also builds the custom question type as standalone IIFE bundles that Learnosity loads at runtime.
- **Server** (`server/`) — a small Express service whose only job is to sign Learnosity API requests with your consumer key + secret so the signed payload can be safely returned to the browser.

## Requirements

- Node.js 18+
- npm 9+ (for workspace support)

## Install

From the repository root:

```bash
npm install
```

This installs both `client/` and `server/` via npm workspaces.

## Run the app (development)

From the repository root, run **both** the server and client in one terminal:

```bash
npm start
```

This uses [`concurrently`](https://www.npmjs.com/package/concurrently) to launch:

- The Express signing server on **http://localhost:3004** (prefixed `[server]`)
- The Vite dev server on **http://localhost:8081** (prefixed `[client]`)

Press `Ctrl-C` once to stop both. Then open the player at **http://localhost:8081/**.

If you prefer separate terminals you can still run them individually:

```bash
npm run start:server   # Express signing server only
npm run start:client   # Vite dev server only (alias of npm run dev)
```

### Typical user flow

1. **Take the assessment** at `http://localhost:8081/`
   The page loads the Learnosity Items API and renders the activity defined by the `activityId` query parameter (default: `TestActivitySB`).
2. **Submit the test** — when submission succeeds the browser is automatically redirected to the report page at `report.html` with the new `sessionId` appended to the URL.
3. **View the report** — `report.html` loads the Learnosity Reports API (`session-detail-by-item`) and shows what the learner answered alongside the correct response.

You can also open the report page directly if you already have a session ID:

```
http://localhost:8081/report.html?sessionId=YOUR_SESSION_ID&userId=YOUR_USER_ID
```

## URL query parameters

The player and report pages both read configuration from query parameters.

| Parameter | Pages | Description | Default |
|---|---|---|---|
| `player` | index | Which mode to load on `index.html`: `assess` runs the Items API player, `author` runs the Author API editor | `assess` |
| `env` | player, report | Learnosity environment: `prod`, `staging`, or `dev` | `prod` |
| `activityId` | player | Activity template ID to load | `TestActivitySB` |
| `ignore` | player | Comma-separated list of question attributes to ignore. Use `1` or `valid_response` as a shortcut for ignoring `valid_response` | _(none)_ |
| `sessionId` | report | Required. Session to load in the report | — |
| `userId` | report | User ID associated with the session | `labs-site` |

### Example URLs

```
http://localhost:8081/?player=assess&env=dev&activityId=MyActivity
http://localhost:8081/?player=author
http://localhost:8081/?ignore=valid_response
http://localhost:8081/report.html?env=dev&sessionId=abc123&userId=user456
```

## Available npm scripts (root)

| Script | What it does |
|---|---|
| `npm install` | Installs all workspaces |
| `npm start` | Runs the server **and** client together (via `concurrently`) |
| `npm run dev` | Alias of `npm start` |
| `npm run start:server` | Starts only the Express signing server (nodemon, default port 3004) |
| `npm run start:client` | Starts only the Vite dev server on port 8081 |
| `npm run build` | Production build of the client (app + custom question bundles) into `client/dist/` |
| `npm run preview` | Serves the production build locally for inspection |

## Server configuration

The Express server reads its configuration from environment variables (with defaults baked into `server/src/config.js`):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3004` | Port the server listens on |
| `HOST` | `localhost` | Server host |
| `PROTOCOL` | `http` | URL protocol used when logging the listen address |
| `LEARNOSITY_CONSUMER_KEY` | demo key | Learnosity consumer key used to sign requests |
| `LEARNOSITY_SECRET` | demo secret | Learnosity secret used to sign requests |
| `LEARNOSITY_DOMAIN` | `localhost` | Domain claimed in the signed request |
| `CORS_ORIGINS` | `http://localhost:8081,http://localhost:8081,http://localhost:3000` | Allowed CORS origins (comma-separated) |

Override any of them when launching the server, e.g.:

```bash
LEARNOSITY_CONSUMER_KEY=your_key LEARNOSITY_SECRET=your_secret npm run start:server
```

The client expects the signing server at `http://localhost:3004` (see `client/src/signLearnosityRequest.js`). If you change `PORT`, update that URL too.

## Build for production

```bash
npm run build
```

This runs two Vite builds in sequence:

1. The multi-page app — emits `client/dist/index.html`, `client/dist/report.html`, and their JS assets under `client/dist/assets/`.
2. The custom question bundles — emits `client/dist/questions/customInput/question.js`, `scorer.js` (IIFE bundles that register themselves via `LearnosityAmd.define`), plus the authoring HTML layout.

The `questions/customInput/*` files are intended to be hosted on a CDN / static host (e.g. GitHub Pages) at the URL referenced by `BASE_URL` in `client/src/util.js`; Learnosity loads them at runtime when rendering the custom question type.

Preview the production build locally with:

```bash
npm run preview
```

## Project Structure

```
├── client/
│   ├── index.html              # Player HTML entry
│   ├── report.html             # Reports HTML entry
│   ├── vite.config.js          # App build config
│   ├── vite.config.questions.js# Custom question bundle config
│   └── src/
│       ├── index.js            # Player entry point
│       ├── report.js           # Reports entry point
│       ├── player.js           # Player functionality
│       ├── reporting.js        # Reporting functionality
│       ├── authoring.js        # Authoring functionality
│       ├── util.js             # Utility functions
│       └── questions/          # Custom question types
├── server/
│   └── src/
│       ├── index.js            # Express server
│       └── config.js           # Server configuration
└── client/dist/                # Build output
```

## License

ISC
