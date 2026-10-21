# TaskFlow - Task / Todo Manager (MERN)

A clean, professional task manager built with **MongoDB, Express, React and Node.js**.
Each user has a private account and their own tasks, with priorities, due dates, a status toggle and a live **progress bar showing % complete**.

> **Problem statement:** People lose track of what is due, what is late and how much of their work is finished.
> **Target user:** Anyone who wants a simple personal task list (students, freelancers, small teams working individually).

---

## Features

| Area | What you get |
| --- | --- |
| **Tasks** | Create, edit, delete. Fields: Title, Description, Priority (Low/Medium/High), Due Date, Status (Pending/Done) |
| **Status toggle** | One-click check circle switches Pending / Done |
| **Progress bar** | Overall % complete, updated instantly (derived from the API stats) |
| **Derived UI values** | "Overdue by 2 days", "Due today", "Due tomorrow", "Due in 5 days" are computed from the due date in the user's own timezone |
| **Quick filters** | Clickable All / Pending / Done / Overdue / Due today counters |
| **Search, filter, sort** | Debounced search, priority filter, sort by newest, oldest, due date, priority or title |
| **Pagination** | Server-side, 8 tasks per page (max 50 allowed by the API) |
| **Bulk action** | "Clear completed" with confirmation |
| **Auth** | Register, login, JWT, protected routes, session restore, auto-logout on expiry |
| **UX** | Loading skeletons, empty states, error states with retry, toasts, confirm dialogs, keyboard-accessible dialogs |
| **Look & feel** | Responsive (mobile first), light and dark theme, accessible labels and focus rings, reduced-motion support |
| **Security** | bcrypt password hashing, helmet, CORS allow-list, rate limiting, NoSQL-injection sanitiser, input whitelisting, ownership checks, safe error messages |

## Tech stack

- **Frontend:** React 18, Vite, React Router 6 (plain CSS, no UI library, native `fetch`)
- **Backend:** Node.js, Express 4, Mongoose 8
- **Database:** MongoDB
- **Security libs:** bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit

---

# 1. One-time installation (nothing is installed yet? Start here)

You need four things: **Node.js**, **Git**, **VS Code** and **MongoDB** (local install *or* free cloud Atlas).

### 1.1 Install Node.js (includes npm)

Download the **LTS** version from <https://nodejs.org> and install with default options.

Windows (PowerShell) alternative:

```powershell
winget install OpenJS.NodeJS.LTS
```

Close and reopen the terminal, then verify:

```bash
node -v      # should print v18 or higher (v20 / v22 recommended)
npm -v
```

### 1.2 Install Git and VS Code

- Git: <https://git-scm.com/downloads> (or `winget install Git.Git`)
- VS Code: <https://code.visualstudio.com> (or `winget install Microsoft.VisualStudioCode`)

```bash
git --version
```

### 1.3 Set up MongoDB - choose ONE option

#### Option A - Local MongoDB (works offline)

**Windows**

1. Go to <https://www.mongodb.com/try/download/community> and download the **MongoDB Community Server** MSI for Windows.
2. Run the installer and choose **Complete**.
3. Keep **"Install MongoDB as a Service"** ticked (Run service as *Network Service user*). This makes MongoDB start automatically with Windows.
4. Keep **"Install MongoDB Compass"** ticked. Compass is the visual tool to browse your data.
5. Finish the installer. Verify it is running (PowerShell):

```powershell
Get-Service MongoDB          # Status should be "Running"
```

If it says *Stopped*: `net start MongoDB` (run PowerShell **as Administrator**).

**macOS (Homebrew)**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu / Linux:** follow the official steps for your distro:
<https://www.mongodb.com/docs/manual/administration/install-on-linux/> then `sudo systemctl start mongod`.

**Check it works:** open **MongoDB Compass**, click **Connect** using `mongodb://127.0.0.1:27017`. If it connects, MongoDB is ready. Nothing else to configure - the app creates the `taskflow` database automatically.

The default connection string in the project is already `mongodb://127.0.0.1:27017/taskflow`.

#### Option B - MongoDB Atlas (free cloud database, no installation)

1. Create a free account at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a free **M0** cluster (any region near you, e.g. Mumbai).
3. **Database Access** -> *Add New Database User* -> username + password (use letters and numbers only, to avoid URL-encoding problems) -> role *Read and write to any database*.
4. **Network Access** -> *Add IP Address* -> *Add current IP address* (or `0.0.0.0/0` for development only).
5. **Database** -> *Connect* -> *Drivers* -> copy the connection string and add the database name `taskflow`:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
```

6. After step 2 below, paste it as `MONGODB_URI` in `server/.env`.

---

# 2. Run the project (VS Code)

Open a terminal in the folder where you extracted the project:

```bash
cd taskflow
code .                  # opens the project in VS Code
```

In VS Code open the terminal (**Ctrl + `**) and run:

```bash
npm run setup           # installs root + server + client dependencies AND creates the .env files
npm run seed            # OPTIONAL: adds a demo user and 10 sample tasks
npm run dev             # starts the API (port 5000) and the React app (port 5173) together
```

Then open **<http://localhost:5173>**.

- No demo data? Click **Create an account** and register.
- Used the seed? Log in with `demo@taskflow.dev` / `Demo@1234`.

Check the API is alive: <http://localhost:5000/api/health> should return `{"success":true,"status":"ok",...}`.

> Using Atlas? Open `server/.env` after `npm run setup` and replace the `MONGODB_URI` value, then run `npm run dev`.

### Running the two apps separately (as in the guidelines)

| App | Folder | Command | Address |
| --- | --- | --- | --- |
| Express API | `server/` | `npm run dev` | <http://localhost:5000> |
| React client | `client/` | `npm run dev` | <http://localhost:5173> |

### Manual setup (if you prefer not to use `npm run setup`)

```bash
npm install
cd server && npm install && copy .env.example .env      # macOS/Linux: cp .env.example .env
cd ../client && npm install && copy .env.example .env
```

Then edit `server/.env` and set `JWT_SECRET` to a long random value:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

# 3. Environment variables

**`server/.env`** (never commit; see `server/.env.example`)

| Variable | Purpose | Local default |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGODB_URI` | Database connection string | `mongodb://127.0.0.1:27017/taskflow` |
| `JWT_SECRET` | Signs login tokens (min 32 chars in production) | generated by `npm run setup` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma separated | `http://localhost:5173` |

**`client/.env`** (visible to users - no secrets)

| Variable | Purpose | Local default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the API | `http://localhost:5000/api` |

---

# 4. Project structure

```
taskflow/
  package.json              root scripts: setup, dev, seed, build
  scripts/setup-env.js      creates .env files + random JWT secret
  server/
    .env.example
    src/
      config/               env.js (validated settings), db.js (MongoDB connection)
      models/               User.js, Task.js (Mongoose schemas, indexes, hooks)
      routes/               authRoutes.js, taskRoutes.js (URL -> controller only)
      controllers/          authController.js, taskController.js (request logic)
      middleware/           auth.js (JWT), sanitize.js (NoSQL injection), error.js (central errors)
      utils/                validators.js, AppError.js, asyncHandler.js
      app.js                Express app (helmet, CORS, rate limit, routes)
      server.js             connects to DB and starts listening
      seed.js               optional demo data
  client/
    .env.example
    src/
      services/             api.js (the ONLY place that calls fetch), authService.js, taskService.js
      context/              AuthContext, ThemeContext, ToastContext
      hooks/                useTasks.js (data + actions), useDebounce.js
      components/           Navbar, ProgressPanel, TaskFilters, TaskList, TaskItem, TaskForm, Modal, ...
      pages/                LoginPage, RegisterPage, DashboardPage, NotFoundPage
      utils/                date.js (derived due labels), constants.js
      index.css             design tokens, light + dark themes
```

# 5. Architecture

```
React (browser)  --HTTP JSON-->  Express/Node API  --Mongoose-->  MongoDB
  services/api.js               routes -> controllers -> models
```

Example request flow, **adding a task**: form validates -> `taskService.create` -> `POST /api/tasks` with `Authorization: Bearer <token>` -> `protect` middleware verifies the token -> controller validates again and whitelists fields -> Mongoose saves the task for `req.user` -> `201` + task JSON -> `useTasks` reloads list and stats -> UI and progress bar update.

# 6. Data model

**User** - `name`, `email` (unique, lowercase), `password` (bcrypt hash, never returned), timestamps

**Task**

| Field | Type | Rules |
| --- | --- | --- |
| `user` | ObjectId -> User | required, indexed (every query is scoped to the owner) |
| `title` | String | required, 1-120 chars |
| `description` | String | optional, up to 1000 chars |
| `priority` | `Low` / `Medium` / `High` | default `Medium` |
| `status` | `Pending` / `Done` | default `Pending` |
| `dueDate` | Date | optional; stored as midnight UTC of the chosen day, exposed as `YYYY-MM-DD` |
| `completedAt` | Date | set automatically when status becomes `Done` |
| `createdAt`, `updatedAt` | Date | timestamps |

Indexes: `{user, status, dueDate}` and `{user, createdAt}`. (`priorityRank` and `hasDueDate` are internal sort helpers kept in sync by a hook and hidden from the API.)

# 7. API contract

Base URL: `http://localhost:5000/api` - all `/tasks` routes need `Authorization: Bearer <token>`.
Error shape: `{ "success": false, "message": "...", "errors": [{ "field": "title", "message": "..." }] }`

| Method and path | Purpose | Body / query | Success | Errors |
| --- | --- | --- | --- | --- |
| `GET /health` | Health check | - | 200 | - |
| `POST /auth/register` | Create account | `name, email, password` | 201 `{token, data:{user}}` | 400, 409 email exists |
| `POST /auth/login` | Log in | `email, password` | 200 `{token, data:{user}}` | 400, 401 |
| `GET /auth/me` | Current user | - | 200 | 401 |
| `GET /tasks` | List own tasks | `page, limit, status, priority, due (overdue/today/week), search, sort (newest/oldest/due/priority/title), today (YYYY-MM-DD)` | 200 `{data[], pagination}` | 400, 401 |
| `GET /tasks/stats` | Counts + `percentComplete` | `today` | 200 | 401 |
| `POST /tasks` | Create | `title`, `description?`, `priority?`, `dueDate?` | 201 | 400, 401 |
| `GET /tasks/:id` | One task | - | 200 | 401, 404 |
| `PATCH /tasks/:id` | Update (partial; `PUT` also works) | any task field | 200 | 400, 401, 404 |
| `PATCH /tasks/:id/toggle` | Flip Pending / Done | - | 200 | 401, 404 |
| `DELETE /tasks/:id` | Delete | - | 200 | 401, 404 |
| `DELETE /tasks/completed` | Delete all Done tasks | - | 200 `{deleted}` | 401 |

Another user's task returns **404** (not 403) so the API never confirms that someone else's task exists.

# 8. Testing checklist

Use **Thunder Client** (VS Code extension) or Postman for the API, and the browser for the UI.

**API** - for each endpoint try: valid input, invalid input (empty title, bad date, priority `Urgent`), missing token, a token for another user (expect 404), and `{"email": {"$gt": ""}}` on login (expect 400).

**UI core flows**

- [ ] Register with a weak password -> inline error; with a good one -> lands on the dashboard
- [ ] Add a task with an empty title -> message, nothing saved
- [ ] Add task -> appears without refresh; progress bar and counters update
- [ ] Toggle done -> strike-through, % increases; toggle back -> % decreases
- [ ] Edit title/priority/due date; set a past date -> shows "Overdue by N days"
- [ ] Filter by status, priority, Overdue, Due today; search; sort
- [ ] Add more than 8 tasks -> pagination works; delete last item on page 2 -> returns to page 1
- [ ] Delete with confirmation; Clear completed with confirmation
- [ ] Stop the API -> error state with **Try again**; start it -> retry works
- [ ] Refresh the page -> still logged in; Log out -> redirected to login
- [ ] Mobile width (DevTools device mode), keyboard-only (Tab, Enter, Esc), dark theme

# 9. Git and GitHub

```bash
git init
git status                      # confirm no .env or node_modules appear
git add .
git commit -m "Initial TaskFlow MERN project"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

Commit small and often (for example `git switch -c feature/task-filters`). If a secret is ever committed, **rotate it immediately**; deleting the file is not enough.

# 10. Deployment (summary)

1. **Database:** MongoDB Atlas (see Option B). Use a dedicated DB user and restrict network access where possible.
2. **API:** a host that runs a long-lived Node server (for example Render). Root directory `server`, build command `npm install`, start command `npm start`. Set env vars: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET` (32+ chars), `CLIENT_URL=<your frontend URL>`.
3. **Frontend:** Vercel or Netlify. Root directory `client`, build command `npm run build`, output `dist`. Set `VITE_API_URL=<your API URL>/api` **before** building. SPA fallback is already included (`client/vercel.json` and `client/public/_redirects`).
4. Re-check: HTTPS everywhere, sign-up and login on the live site, refresh on a deep link, no requests to `localhost`, no secrets in the repo or browser.

Free tiers change and may sleep or expire - check each provider's current limits.

# 11. Security notes

- Passwords hashed with bcrypt (cost 12); hashes are never returned.
- JWT sent as a Bearer header; stored in `localStorage` (simple, but readable by injected scripts - the trade-off is that it is not sent automatically with cross-site requests). React escapes output by default, and the API sends hardened headers through helmet.
- All inputs validated on the server with whitelisted fields (no mass assignment); operator keys (`$...`) stripped from body, query and params.
- Every task query includes the logged-in user's id, so users can never read or change each other's tasks.
- Rate limiting on the API and a stricter limit on login/register in production.
- Generic error messages to clients, full details only in server logs.
- Run `npm audit` regularly in `server/` and `client/`.

# 12. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `[db] Could not connect to MongoDB` | Local: start the service (`net start MongoDB` as Administrator / `brew services start mongodb-community`). Atlas: check username, password, IP allow-list. Use `127.0.0.1`, not `localhost`. |
| `Missing environment variable(s)` | Run `npm run setup`, or copy `server/.env.example` to `server/.env`. |
| `EADDRINUSE: port 5000` | Another program uses the port. Change `PORT` in `server/.env` **and** `VITE_API_URL` in `client/.env`, then restart. |
| CORS error in the browser | `CLIENT_URL` in `server/.env` must exactly match the frontend address (including port). Restart the API after changing it. |
| Changed `client/.env` but nothing changed | Vite reads env files at start-up - stop and run `npm run dev` again. |
| PowerShell: *running scripts is disabled* | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, reopen the terminal. |
| Port 5173 shows a blank page | Open DevTools Console; usually the API is not running or `VITE_API_URL` is wrong. |
| Password with special characters fails on Atlas | URL-encode it (`@` -> `%40`) or choose letters and numbers only. |

# 13. Known limitations and future ideas

- No automated test suite yet (manual checklist above). Next step: Jest + Supertest for the API and Vitest for the UI.
- No password reset or email verification.
- Due dates are calendar dates without a time of day, and there are no reminders or notifications.
- Single-user lists only (no sharing or assignment), no drag-and-drop ordering, no tags or subtasks.
- Token lives in `localStorage`; an httpOnly-cookie flow would be a stronger production choice.

# 14. Screenshots

Add your own screenshots (desktop, mobile, dark mode) to `docs/screenshots/` and link them here before submission.

# 15. Official documentation

React <https://react.dev> - Vite <https://vite.dev> - Express <https://expressjs.com> - Mongoose <https://mongoosejs.com/docs/> - MongoDB <https://www.mongodb.com/docs/> - MongoDB Atlas <https://www.mongodb.com/docs/atlas/> - OWASP Top 10 <https://owasp.org/www-project-top-ten/>
