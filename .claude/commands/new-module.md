Scaffold a new NestJS backend module following project conventions.

Input: $ARGUMENTS

$ARGUMENTS should be the module name in kebab-case (e.g. "notifications", "audit-logs").

Steps:
1. Confirm the module name and purpose with the user
2. Create the following files in `backend/src/modules/<module-name>/`:
   - `<module-name>.module.ts` -- NestJS module with TypeORM imports
   - `<module-name>.controller.ts` -- Controller with CRUD endpoints, JwtAuthGuard, Swagger decorators
   - `<module-name>.service.ts` -- Service with TypeORM repository injection
   - `dto/create-<entity>.dto.ts` -- Create DTO with class-validator decorators
   - `dto/update-<entity>.dto.ts` -- Update DTO extending PartialType of Create DTO

3. Follow existing patterns:
   - Use `@Controller('module-name')` with global `/api` prefix
   - Apply `@UseGuards(JwtAuthGuard)` at controller level
   - Use `@CurrentUser()` decorator to get authenticated user
   - Add Swagger `@ApiTags()` and `@ApiOperation()` decorators
   - Service injects `@InjectRepository(Entity)`

4. If entity doesn't exist yet, create it in `backend/src/database/entities/`:
   - Follow existing entity patterns (BaseEntity, soft-delete, organizationId)
   - Export from `backend/src/database/entities/index.ts`

5. Register the module in `backend/src/app.module.ts`

6. Add shared types in `shared/types/` if needed and re-export from index.ts

7. Run `cd backend && npm run build` to verify no compilation errors
