import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            userrole: {
              include: {
                role: {
                  include: {
                    rolepermission: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            },
          },
        });

        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const passwordMatch = await compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        // Update the roles and permissions extraction
        const roles = user.userrole.map((ur) => ur.role.name);
        const permissions = user.userrole
          .flatMap((ur) => 
            ur.role.rolepermission.map(rp => 
              rp.permission.name
            )
          );

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          roles,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        // Handle token updates
        return { ...token, ...session.user }
      }
      
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          roles: user.roles,
          permissions: user.permissions,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          roles: token.roles,
          permissions: token.permissions,
        }
      }
      return session;
    },
  },
};