import { User } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: string[];
    permissions: string[];
  }
}

export type SafeUser = Omit<User, "password"> & {
  createdAt: string;
  updatedAt: string;
};

export type UserWithRoles = User & {
  userRoles: {
    role: {
      name: string;
    };
  }[];
};

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  rolePerms: {
    permission: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}