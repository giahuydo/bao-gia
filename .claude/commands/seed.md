Seed the database with initial data.

Input: $ARGUMENTS

Steps:
1. Run `cd backend && npm run seed`
2. Report success/failure
3. If failed, check if the database is running: `pg_isready -h localhost -p 5432`
4. If database is not running, suggest: `docker compose up -d postgres` or start PostgreSQL
