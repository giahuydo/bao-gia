Start or check dev servers.

Input: $ARGUMENTS

Behavior:
- If $ARGUMENTS is "backend" or "be":
  Run `cd backend && npm run start:dev` in background
- If $ARGUMENTS is "frontend" or "fe":
  Run `cd frontend && npm run dev` in background
- If $ARGUMENTS is "status" or empty:
  Check if servers are running:
  - `lsof -i :4001` for backend
  - `lsof -i :4000` for frontend
  - `lsof -i :5432` for PostgreSQL
  Report status of each service
- If $ARGUMENTS is "all":
  Start both backend and frontend in background
- If $ARGUMENTS is "stop":
  Find and report processes on ports 4000/4001, ask before killing

Always report the URLs:
- Backend API: http://localhost:4001/api
- Swagger docs: http://localhost:4001/api/docs
- Frontend: http://localhost:4000
