# TaskFlow — a full-stack MERN task manager

A working task manager built on exactly the stack you've just been learning:
**Express + MongoDB/Mongoose** on the backend (which you finished), and
**React** on the frontend (which you're in the middle of). It has user
accounts (JWT auth), and full CRUD on tasks (create, read, update, delete)
with status, priority, and due dates.

This README has two parts: (1) how to actually run it, and (2) a plain-English
walkthrough of how the pieces talk to each other, since that's usually the
part that's confusing the first time you build auth yourself.

---

## 1. Project layout

```
taskflow/
  backend/     Express API (port 5000)
    config/db.js            connects to MongoDB
    models/                 Mongoose schemas (User, Task)
    middleware/              auth check + error handler
    controllers/             the actual logic for each route
    routes/                  maps URLs -> controller functions
    server.js                entry point
  frontend/    React app (port 5173, via Vite)
    src/
      api/axios.js           pre-configured HTTP client
      context/AuthContext.jsx  app-wide "who's logged in" state
      pages/                  Login, Register, Dashboard
      components/             Navbar, TaskForm, TaskCard
```

## 2. Setup — backend

You already have MongoDB Atlas set up from your curriculum (and hit a DNS
issue with it before — if it happens again here, it's almost always one of:
your current IP isn't in Atlas's "Network Access" allowlist, or the
password in the URI has a special character that needs URL-encoding).

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — from Atlas: Database > Connect > "Drivers" > copy the string, then swap in your real username/password and add `/taskflow` before the `?` so it uses a database named `taskflow`.
- `JWT_SECRET` — any long random string. Quick way to generate one:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Then run it:

```bash
npm run dev
```

You should see `MongoDB connected: ...` and `TaskFlow API listening on
http://localhost:5000`. Sanity check in the browser or Thunder Client:
`GET http://localhost:5000/api/health` should return `{"status":"ok"}`.

## 3. Setup — frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Sign up for an
account, then you're on the dashboard.

If your backend isn't on port 5000, copy `frontend/.env.example` to `.env`
and change `VITE_API_URL`.

## 4. How the auth flow actually works, end to end

This is the part worth tracing line-by-line, since it's the first time your
curriculum combines Express + MongoDB + a frontend that has to *remember*
who's logged in.

**Sign-up (`POST /api/auth/register`):**
1. `Register.jsx` collects name/email/password in React state and calls `register()` from `AuthContext`.
2. `AuthContext.register()` calls `api.post("/auth/register", ...)` — this hits the backend.
3. `authController.js`'s `register` function checks the email isn't taken, then calls `User.create(...)`.
4. Right before that document is saved, `User.js`'s `pre("save")` hook runs automatically and replaces the plain password with a bcrypt hash. **The plain password is never stored.**
5. The backend signs a JWT (`generateToken`) containing just the user's `_id`, and sends it back along with the user's name/email.
6. Back in `AuthContext`, that token is saved to `localStorage`, and `user` state is set — this is what makes the app instantly treat you as logged in and redirect to the dashboard.

**Every task request after that:**
1. `src/api/axios.js` has a request interceptor — before *any* API call goes out, it checks `localStorage` for the token and attaches it as `Authorization: Bearer <token>`.
2. On the backend, `middleware/auth.js`'s `protect` function runs first on every `/api/tasks` route. It verifies the token's signature (proving it was really issued by this server and hasn't been tampered with), looks up the matching user in MongoDB, and attaches it as `req.user`.
3. `taskController.js` then only ever queries `Task.find({ owner: req.user._id })` — so one user can never see or edit another user's tasks, even if they guessed a task's ID.

**Page refresh:** `AuthContext`'s `useEffect` runs once on load, finds the saved token, and calls `GET /api/auth/me` to ask the backend "who is this token for?" — that's what keeps you logged in across refreshes instead of bouncing back to `/login`.

## 5. Where to extend it next

A few natural next steps, roughly in order of difficulty:
- Add a "search tasks by title" input (backend: a `$regex` query; frontend: a controlled input + filter).
- Add task categories/tags (a new field on the `Task` model, same pattern as `priority`).
- Add pagination once you have many tasks (`.skip()` / `.limit()` in `taskController.js`).
- Swap `localStorage` for an httpOnly cookie for the JWT — more secure, but requires backend changes (setting/reading cookies) and removing the axios interceptor.
- Deploy it: backend to Render/Railway, frontend to Vercel (you've already done a Vercel deploy with `ai-resume-project`, so this part should feel familiar) — just remember to set `MONGO_URI`, `JWT_SECRET` on the backend host and `VITE_API_URL` pointing at it on Vercel.
