# Required Dependencies for Auth Module

If you're getting errors in `auth.module.ts` (lines 12-13), you need to install these npm packages:

## Required npm packages

Run this command to install all required dependencies:

```bash
npm install @nestjs/config @nestjs/mongoose @nestjs/jwt @nestjs/common @nestjs/core mongoose bcrypt cookie-parser passport passport-jwt class-validator class-transformer reflect-metadata rxjs
```

Or install them individually:

```bash
# Core NestJS packages
npm install @nestjs/common @nestjs/core

# Configuration
npm install @nestjs/config

# MongoDB/Mongoose
npm install @nestjs/mongoose mongoose

# JWT Authentication
npm install @nestjs/jwt @nestjs/passport passport passport-jwt

# Password hashing
npm install bcrypt

# Cookie handling
npm install cookie-parser

# Validation
npm install class-validator class-transformer

# Required for decorators
npm install reflect-metadata rxjs
```

## Type definitions (devDependencies)

For TypeScript support, also install:

```bash
npm install --save-dev @types/bcrypt @types/cookie-parser @types/passport-jwt @types/node @types/express
```

## Complete install command

```bash
npm install @nestjs/config @nestjs/mongoose @nestjs/jwt @nestjs/common @nestjs/core @nestjs/passport @nestjs/platform-express mongoose bcrypt cookie-parser passport passport-jwt class-validator class-transformer reflect-metadata rxjs

npm install --save-dev @types/bcrypt @types/cookie-parser @types/passport-jwt @types/node @types/express
```

## What each package does

- **@nestjs/config** - For `ConfigModule` and `ConfigService` (line 13)
- **@nestjs/mongoose** - For `MongooseModule` and schema imports (line 12)
- **@nestjs/jwt** - For JWT authentication
- **mongoose** - MongoDB ODM (needed for schemas)
- **bcrypt** - Password hashing
- **cookie-parser** - Cookie handling for JWT tokens
- **passport & passport-jwt** - Authentication strategy
- **class-validator & class-transformer** - DTO validation

## After installation

1. Make sure you have a `.env` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   ```

2. Make sure your `app.module.ts` imports `ConfigModule`:
   ```typescript
   import { ConfigModule } from '@nestjs/config';
   
   @Module({
     imports: [
       ConfigModule.forRoot({ isGlobal: true }),
       // ... other modules
     ],
   })
   ```

3. Make sure you have the employee-profile schemas in the correct path:
   - `src/employee-profile/models/employee-system-role.schema.ts`
   - `src/employee-profile/models/employee-profile.schema.ts`
   - `src/employee-profile/models/candidate.schema.ts`

