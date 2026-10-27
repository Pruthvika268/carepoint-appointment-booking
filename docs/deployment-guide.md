# GitHub and Live Deployment Guide

This guide explains how to publish CarePoint to GitHub and deploy it using Vercel, Render, and Neon. Follow the steps in order. Use fictional test appointments only.

## Publish the project to GitHub — every step

### 1. Create a GitHub account

1. Open <https://github.com/>.
2. Sign in or create an account.
3. Verify your email if GitHub asks you to.

### 2. Create a new repository

1. Click the **+** button near the top-right of GitHub and choose **New repository**.
2. Enter a repository name, for example `carepoint-appointment-booking`.
3. Add a short description such as `Full-stack appointment booking app built with React and Express`.
4. Choose **Public** if your instructor needs to view it without signing in, or **Private** if it should not be public.
5. Because you already have project files and a README, do **not** select the options to add a README, `.gitignore`, or license during repository creation. This avoids an initial-history conflict.
6. Click **Create repository**.
7. Keep the new repository page open; GitHub displays the repository URL, which you will use in Step 4.

### 3. Open a terminal in the project root

Extract the latest project ZIP. Open a terminal **inside the folder that contains this README and the `frontend`, `backend`, and `database` folders**. Do not run the Git commands from inside only `frontend` or only `backend`.

Check the folder contents with this command (works in Git Bash and macOS/Linux terminals; in PowerShell, `Get-ChildItem` also works):

```bash
ls
```

You should see `README.md`, `frontend`, `backend`, and `database`.

### 4. Initialize Git and push the code

If this folder is not already a Git repository, run:

```bash
git init
git add .
git status
git commit -m "Initial CarePoint appointment booking app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/carepoint-appointment-booking.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username and replace the URL with the exact URL from your new repository page.

If Git asks you to identify yourself, configure a name and email for commits:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Then run the `git commit` and `git push` commands again. Follow GitHub's authentication prompt in your browser if it appears. Do not put a GitHub password or access token in your source code.

**If `git remote add origin` says `origin` already exists**, run `git remote -v` to inspect it, then use:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/carepoint-appointment-booking.git
git push -u origin main
```

### 5. Confirm the repository

1. Refresh the GitHub repository page.
2. Confirm that `frontend`, `backend`, `database`, `docs`, and `README.md` appear.
3. Open `README.md` to confirm the project description and instructions are visible.
4. Confirm that no `.env` file, API key, password, or patient database was uploaded. The provided `.gitignore` excludes local secrets and the SQLite database directory.

## Live deployment — suggested free-tier workflow

The easiest architecture for this project is:

- **Frontend:** Vercel
- **Backend:** Render Web Service
- **Database:** Neon PostgreSQL (or another managed PostgreSQL service)
- **AI summaries:** Optional; configure the provider key only in the backend host

Free-tier limits, availability, and sleep/usage policies can change. Check the provider's current plan before relying on it. For public demonstration only, use fake/demo patient data. Do not use this starter app to store real patient data.

### Part 1 — Create a hosted PostgreSQL database in Neon

1. Open <https://neon.tech/> and sign up/sign in.
2. Create a new project. Choose a project name such as `carepoint-db` and a region appropriate for your backend hosting region, if available.
3. Open the project and choose **SQL Editor**.
4. On your computer, open this repository's `database/schema.sql` file.
5. Copy the complete contents of `database/schema.sql` and paste it into the Neon SQL Editor.
6. Click **Run**. Confirm that the `appointments` table and indexes are created successfully. Do not run `database/seed.sql` unless you intentionally want sample records.
7. In the Neon dashboard, click **Connect** and select the database, branch, and role.
8. Copy the PostgreSQL connection string. Keep it private. It usually begins with `postgresql://` and may include `sslmode=require`.
9. Save it temporarily somewhere private; you will add it to Render as `DATABASE_URL`. Do not paste it into GitHub or the frontend.

Reference: <https://neon.tech/docs/get-started/connect-neon>

### Part 2 — Deploy the backend API on Render

1. Open <https://render.com/> and sign up/sign in.
2. In Render, select **New** → **Web Service**.
3. Connect your GitHub account if asked, then grant Render access to the repository you created.
4. Select the `carepoint-appointment-booking` repository and the `main` branch.
5. Enter these settings:

   | Setting | Value |
   | --- | --- |
   | Name | `carepoint-api` (or another available name) |
   | Language / Runtime | `Node` |
   | Root Directory | `backend` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` (if shown) |

6. Choose a plan. If a free plan is offered, read its current limitations before selecting it.
7. Before or after creating the service, open its **Environment** section and add these variables:

   | Key | Value |
   | --- | --- |
   | `NODE_VERSION` | `20` (if supported as an environment variable by the selected runtime; otherwise use Render's Node version setting) |
   | `DATABASE_URL` | The private Neon connection string from Part 1 |
   | `DATABASE_SSL` | `true` |
   | `FRONTEND_ORIGIN` | Leave for now; add your Vercel URL in Part 3 |
   | `OPENAI_API_KEY` | Optional; your AI provider secret |
   | `OPENAI_MODEL` | Optional; `gpt-4o-mini` or a model supported by your provider |

   Do not set `SQLITE_PATH` for this deployment. With `DATABASE_URL` set, the backend uses PostgreSQL. Do not add quote marks around the values unless they are part of the actual value.

8. Click **Create Web Service** (or save the configuration if you created the service first).
9. Open the **Logs** tab and wait for the deploy to finish successfully. If the build fails, read the first relevant error in the build logs before trying again.
10. Copy the public service URL, for example `https://carepoint-api.onrender.com` (your actual URL will be different).
11. Test it by opening `https://YOUR-RENDER-SERVICE-URL/api/health` in a browser. You should see JSON with `"status":"ok"` and `"storage":"postgresql"`.

The backend runs PostgreSQL column migrations at startup, but the base table must already exist. That is why Part 1's `database/schema.sql` step is required.

Reference: <https://render.com/docs/deploy-node-express-app>

### Part 3 — Deploy the frontend on Vercel

1. Open <https://vercel.com/> and sign up/sign in.
2. Choose **Add New** → **Project**.
3. Connect GitHub if asked and import the `carepoint-appointment-booking` repository.
4. Configure the project settings:

   | Setting | Value |
   | --- | --- |
   | Framework Preset | `Vite` (or let Vercel detect it) |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

5. Open **Environment Variables** before deploying and add:

   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | Your Render backend base URL, e.g. `https://carepoint-api.onrender.com` — no trailing slash |

6. Click **Deploy** and wait for the build to finish.
7. When deployment succeeds, open the Vercel URL (for example, `https://carepoint-appointment-booking.vercel.app`). Your actual URL will be different.
8. Copy the exact frontend origin, including `https://`, but without a trailing slash.

Reference: <https://vercel.com/docs/frameworks/frontend/vite>

### Part 4 — Connect Render CORS to your Vercel URL

The backend needs to allow browser requests from the deployed frontend.

1. Return to Render and open your `carepoint-api` service.
2. Go to **Environment**.
3. Set `FRONTEND_ORIGIN` to the exact Vercel origin, for example `https://carepoint-appointment-booking.vercel.app`. Do not include a page path or trailing slash.
4. Save the change and let Render redeploy/restart the service.
5. Open your Vercel site again and refresh it.

If you later use a different frontend domain, update `FRONTEND_ORIGIN` on Render too. For local development, the default local origins are already allowed when `FRONTEND_ORIGIN` is not set.

### Part 5 — Test the live website

Use fake/demo data only.

1. Open the deployed Vercel website.
2. Confirm that the page loads without a blank screen.
3. Try submitting the form with missing fields; validation should stop invalid submissions.
4. Create a test appointment using a fictional name and number.
5. Confirm the appointment appears in the list.
6. Refresh the browser. The appointment should still appear because it is stored in PostgreSQL.
7. Mark the test appointment **Completed** and confirm the status updates.
8. Create another fake appointment, cancel it, and test deleting a record.
9. Open `https://YOUR-RENDER-SERVICE-URL/api/health` and confirm that the API is healthy and reports PostgreSQL storage.
10. If AI is configured, test **Generate AI summary**. If not configured, booking should still work and the AI control should report that the feature is unavailable/configuration is missing.
11. Open Render logs if API requests fail. Also check the browser's Developer Tools → Console and Network tabs for frontend errors or CORS failures.

## Update the live site after making changes

Once GitHub is connected to Vercel and Render, pushes to the connected branch normally trigger redeployments automatically.

```bash
git add .
git commit -m "Describe your change"
git push
```

Wait for both providers' deployment status to show success, then refresh the public website.

## Common deployment problems

- **Website loads but appointments do not:** Confirm `VITE_API_URL` is the correct Render URL, with no trailing slash. Redeploy the Vercel frontend after changing it.
- **CORS error in browser console:** Confirm `FRONTEND_ORIGIN` on Render exactly matches the Vercel origin, then redeploy/restart the backend.
- **Backend returns a database error:** Check that `database/schema.sql` ran successfully in Neon and that Render's `DATABASE_URL` is correct.
- **Health endpoint reports SQLite:** Render has not received `DATABASE_URL`, or the service has not restarted after it was set. Do not rely on ephemeral local SQLite for a hosted service.
- **AI summary fails:** Check `OPENAI_API_KEY`, provider quota/model availability, and Render logs. Keep the key only in Render environment variables.
- **A change is not visible:** Check that Git push succeeded and the latest deployments succeeded. Vite environment variables are embedded at build time, so changing `VITE_API_URL` requires a new frontend deployment.
- **Build fails:** Check that the Vercel root directory is `frontend` and Render's root directory is `backend`; use the deployment logs for the exact error.

