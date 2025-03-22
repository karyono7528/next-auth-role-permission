This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## API Endpoints

### Authentication
- `POST /api/auth/login`
  - Login with email and password
  - Body: `{ email: string, password: string }`
  - Response: `{ user: User, token: string }`

### Users
- `GET /api/users`
  - Get all users
  - Requires: `users:read` permission
  - Response: `User[]`

- `GET /api/users/:id`
  - Get user by ID
  - Requires: `users:read` permission
  - Response: `User`

- `POST /api/users`
  - Create new user
  - Requires: `users:create` permission
  - Body: `{ name: string, email: string, password: string, selectedRoles: string[] }`
  - Response: `User`

- `PATCH /api/users/:id`
  - Update user
  - Requires: `users:update` permission
  - Body: `{ name?: string, email?: string, selectedRoles?: string[] }`
  - Response: `User`

- `DELETE /api/users/:id`
  - Delete user
  - Requires: `users:delete` permission
  - Response: `{ success: boolean }`

### Roles
- `GET /api/roles`
  - Get all roles
  - Requires: `roles:read` permission
  - Response: `Role[]`

- `GET /api/roles/:id`
  - Get role by ID
  - Requires: `roles:read` permission
  - Response: `Role`

- `POST /api/roles`
  - Create new role
  - Requires: `roles:create` permission
  - Body: `{ name: string, description?: string, permissions: string[] }`
  - Response: `Role`

- `PATCH /api/roles/:id`
  - Update role
  - Requires: `roles:update` permission
  - Body: `{ name?: string, description?: string, permissions?: string[] }`
  - Response: `Role`

- `DELETE /api/roles/:id`
  - Delete role
  - Requires: `roles:delete` permission
  - Response: `{ success: boolean }`

### Permissions
- `GET /api/permissions`
  - Get all permissions
  - Requires: `permissions:read` permission
  - Response: `Permission[]`

## Data Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

This documentation includes:
1. All available API endpoints
2. Required permissions for each endpoint
3. Request/response data structures
4. Data type definitions
5. Maintains the original getting started guide


## Production Deployment

### Prerequisites
- Node.js 18.x or later
- MySQL database
- Environment variables configured

### Environment Setup
1. Create a `.env.production` file in the root directory:
```env
DATABASE_URL="mysql://root:@localhost:3306/your_db"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
