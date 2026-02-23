# Energy Monitoring Backend

Backend API for Energy Monitoring with Dynamic Role-Based Access Control (RBAC).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt

## Features

- Dynamic RBAC (database-driven, not hard-coded)
- JWT-based authentication
- User management (CRUD)
- Role management (CRUD)
- Permission management (CRUD)
- Role-permission assignment
- Service layer architecture

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema with RBAC models
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── role.controller.ts
│   │   └── permission.controller.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.middleware.ts    # JWT verification
│   │   └── rbac.middleware.ts    # Permission checking
│   ├── routes/                # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── role.routes.ts
│   │   └── permission.routes.ts
│   ├── services/              # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   └── permission.service.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── lib/
│   │   └── prisma.ts          # Prisma client instance
│   ├── index.ts               # App entry point
│   └── seed.ts                # Database seeding script
├── package.json
├── tsconfig.json
└── .env.example
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your database URL and JWT secret:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### 3. Generate Prisma client

```bash
npm run prisma:generate
```

### 4. Run database migrations

```bash
npm run prisma:migrate
```

Or push schema directly:

```bash
npm run prisma:push
```

### 5. Seed the database

```bash
npm run seed
```

This creates:
- **Permissions**: manage_users, view_users, manage_roles, view_energy
- **Roles**: superadmin (all permissions), admin (view_users, view_energy), user (view_energy)
- **Default superadmin user**:
  - Email: `superadmin@example.com`
  - Password: `superadmin123`

### 6. Start development server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with email/password | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/refresh` | Refresh user data | Yes |

### Users

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/users` | List all users | view_users |
| GET | `/api/users/:id` | Get user by ID | view_users |
| POST | `/api/users` | Create user | manage_users |
| PUT | `/api/users/:id` | Update user | manage_users |
| DELETE | `/api/users/:id` | Delete user | manage_users |

### Roles

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/roles` | List all roles | manage_roles |
| GET | `/api/roles/:id` | Get role by ID | manage_roles |
| POST | `/api/roles` | Create role | manage_roles |
| PUT | `/api/roles/:id` | Update role | manage_roles |
| DELETE | `/api/roles/:id` | Delete role | manage_roles |
| GET | `/api/roles/:id/permissions` | Get role permissions | manage_roles |
| POST | `/api/roles/:id/permissions` | Assign permission | manage_roles |
| DELETE | `/api/roles/:id/permissions/:permissionId` | Revoke permission | manage_roles |

### Permissions

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/permissions` | List all permissions | manage_roles |
| GET | `/api/permissions/:id` | Get permission by ID | manage_roles |
| POST | `/api/permissions` | Create permission | manage_roles |
| PUT | `/api/permissions/:id` | Update permission | manage_roles |
| DELETE | `/api/permissions/:id` | Delete permission | manage_roles |

### Other

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin-only` | Example protected route | manage_users |
| GET | `/api/health` | Health check | None |

## Authentication

### Login Request

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "superadmin@example.com",
  "password": "superadmin123"
}
```

### Login Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "superadmin@example.com",
      "name": "Super Admin",
      "roleId": "...",
      "isActive": true,
      "role": {
        "id": "...",
        "name": "superadmin",
        "permissions": [...]
      }
    }
  },
  "message": "Login successful"
}
```

### Using the Token

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## RBAC System

The RBAC system is fully database-driven:

1. **Permissions** define what actions can be performed
2. **Roles** are collections of permissions
3. **Users** are assigned to roles
4. **RolePermissions** link roles to permissions (many-to-many)

### Adding New Permissions

1. Create a new permission via API or directly in database
2. Assign the permission to appropriate roles
3. Use `rbacMiddleware("permission_name")` in routes to protect them

Example:

```typescript
router.get(
  "/reports",
  authMiddleware,
  rbacMiddleware("view_reports"),
  getReports
);
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed the database |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:push` | Push schema to database |

## License

MIT
