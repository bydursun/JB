# JobFlow Portal

Modern MERN job board where employers post roles and review applicants, and job seekers browse, apply, and track status. Clean API + responsive UI.

## Stack
- React 18 + TypeScript + Vite + Tailwind
- Node.js 20 + Express 4 + MongoDB (Mongoose)
- JWT auth, Multer uploads

## Features
- Role-based auth (employer/job seeker) with protected routes
- CRUD for jobs and applications
- Dashboards for posting, reviewing, and tracking
- Search, filters, pagination; health checks for uptime
- Postman collection in `docs/postman/`

## Quick Start
```bash
git clone https://github.com/Ebru-K/JB2.git
cd JB2
npm install
cp .env.example .env   # fill values
npm run dev            # runs client + server concurrently
```
- Backend entry: `backend/server.js`
- Frontend: http://localhost:5173
- API: http://localhost:5000/api (health: `/api/health` and `/health`)
- API tests: import `docs/postman/Job-Portal-API.postman_collection.json`
- Production start (Render): `npm start` runs `backend/server.js`

## Environment
- Backend: `MONGODB_URI`, `JWT_SECRET`, `PORT=5000`, `NODE_ENV`, `CLIENT_URL`, `RENDER_FRONTEND_URL`, optional `MAX_FILE_SIZE`
- Frontend: `VITE_API_BASE_URL` (e.g., http://localhost:5000)

## Deploy Notes (Render-friendly)
- Backend: `npm install` then `npm start`; uses `process.env.PORT`, serves health checks.
- Frontend: `npm run build`, publish `dist`, set `VITE_API_BASE_URL` to your backend URL.
