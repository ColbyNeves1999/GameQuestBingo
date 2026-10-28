# GameQuest Bingo

A multiplayer web app that turns video game achievements into bingo cards. Pick a game, choose a card size, and the server builds a randomized card from that game's Steam achievements (and optionally community-submitted objectives). Up to four players race on the same card in real time, each claiming squares in their own color; the first to complete a row, column, or diagonal wins.

## Features

- **Card generation** in 3×3, 5×5, or 9×9, with an optional center free space. If a game doesn't have enough objectives for the requested size, the card automatically drops to the largest size it can fill.
- **Real-time multiplayer** over Server-Sent Events. A host creates a room with a code; others join with that code and the host's identity. Players 1–4 get distinct colors; anyone past four joins as a spectator who can watch but not mark squares.
- **Server-side win detection** on every click (row, column, both diagonals). Once someone wins, the board locks and every client is notified. Wins are recorded to the player's profile only in games with more than one player.
- **Automatic game catalog** pulled from the IGDB API and enriched with achievement lists from the Steam Web API, refreshed weekly by a scheduled job.
- **Community objectives**: logged-in users can submit custom objectives for any game (validated and de-duplicated). Admins can review and delete them.
- **Accounts and roles**: registration and login with argon2-hashed passwords, persistent sessions, a player homepage with win count, and an admin page with a manual "refresh database" control.

## Tech stack

| Layer | Tools |
|---|---|
| Server | Node.js, Express, TypeScript (ES modules) |
| Database | SQLite via TypeORM (entities with decorators, query builder) |
| Views | EJS templates, vanilla JS, hand-written CSS |
| Real-time | Server-Sent Events (`text/event-stream`) |
| Auth / security | express-session with a SQLite session store, argon2, Joi request validation |
| Jobs | node-schedule (cron syntax) |
| External APIs | IGDB (via Twitch OAuth client-credentials), Steam Web API |
| Tooling | ESLint (Airbnb + TypeScript), Prettier, BrowserSync for live reload |

## How it works

```
                 weekly job (Tue 00:01)
 Twitch OAuth ──► IGDB /games (paged, 500 at a time) ──► Game + Platform tables
                                                              │
 Steam GetAppList ──► match by lowercase title ───────────────┘
        └──► GetSchemaForGame per matched game ──► SteamAchieve table

 Bingo Creator form ──► bingoSelector() picks N random, unique objectives
        └──► GameManager creates an in-memory room ──► /board/:gameCode

 Browser ──GET /board/subscribe/:code──► SSE stream (kept open)
 Browser ──POST /board/:code (x, y)────► toggle cell, check for bingo
                                         └──► broadcast update to every subscriber
```

### Data model

- `User`: email, password hash, admin flag, win count, plus placeholder token columns for platform integrations.
- `Game`: title (stored lowercase for matching), age rating, and relations to its platforms, Steam achievements, and user objectives.
- `Platform` / `PlatformList`: IGDB's platform IDs mapped to names, and which platforms each game shipped on.
- `SteamAchieve`: an achievement name linked to a game.
- `Objective`: a user-submitted objective linked to a game and its submitter.

Live game rooms (board state, square owners, player slots, open SSE connections) are kept in memory in `GameManager`, not in the database.

## Project layout

```
src/
  index.ts            Express setup, session store, routes, weekly job
  dataSource.ts       TypeORM/SQLite connection, dynamic entity loading
  controllers/        Request handlers (board, bingo, users, objectives, IGDB, Steam)
  models/             Data access and business logic; Game/GameManager hold live rooms
  entities/           TypeORM entities
  validators/         Joi schemas wrapped as Express middleware
views/                EJS pages (board, creator, join, player/admin pages)
public/               Static pages, CSS, and board.js (SSE client)
```

## Running locally

Requires Node 18+ (uses the built-in `fetch`).

Create a `.env` file:

```
PORT=8080
COOKIE_SECRET=some-long-random-string
DATABASE_NAME=gamequest.sqlite
DATABASEADMIN_EMAIL=you@example.com   # this account becomes admin on registration
TWITCH_ID=your-twitch-client-id       # IGDB uses Twitch app credentials
TWITCH_SECRET=your-twitch-client-secret
STEAM_API_KEY=your-steam-web-api-key
```

Then:

```
npm install
npm run build
npm start
```

For development, run `npm run compile` (TypeScript watch) alongside `npm run start-dev`, or `npm run start-dev-ui` for BrowserSync live reload.

The game catalog fills on the weekly schedule, or immediately from the admin page's **Refresh Database** button. The Steam achievement pass checks every app on Steam and takes over an hour.

## Known limitations

- Live rooms live in server memory, so they're lost on restart and the app can't scale past one process. 
- Room codes include the host's email and appear in the URL.
- Steam games are matched to IGDB entries by exact lowercase title, so games with differing names miss their achievements.
- Several API routes (`/steamGames`, `/getGameDatabase`, `/IGBDAuth`, `/adminForceDatabaseRefresh`) lack login or admin checks.
- Xbox and PlayStation achievement imports were prototyped and then shelved.

Most of these limitations were due to lack of experience at the time and my limited time frame. Potential fixes include:
- The use of an in-memory database system such as Redis.
- A function to hash user emails before they were added to the database and/or the URL.
- Utilizing Steam's game ID system to avoid matching games.
- Utilize user verification function to confirm login permissions.
- Dropped due to time constraints. Would need to contact both companies for an API list.

## Credits

The base Server-Sent Events board pattern was provided by Christopher Saldivar, as noted in the code. Project scaffolding (lint config, validator helper, database error parser) came from a starter template.
