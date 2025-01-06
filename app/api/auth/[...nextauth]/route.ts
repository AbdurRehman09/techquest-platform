import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import type { Account, Profile, User, Session } from 'next-auth'
import { SessionStrategy } from 'next-auth'
import type { JWT } from 'next-auth/jwt';
import { AuthOptions } from 'next-auth';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          role: 'PENDING'
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user.password) {
            return Promise.reject(new Error('No user found'));
          }

          // Log values for debugging
          console.log('Input password:', credentials.password);
          console.log('Stored hashed password:', user.password);

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || null,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, trigger }: any) {
      console.log('SignIn callback triggered:', {
        user,
        provider: account?.provider
      });

      if (account?.provider === 'google') {
        try {
          console.log('Checking for existing user:', user.email);
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            console.log('Creating new Google user');
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                provider: 'google',
                role: 'PENDING',
                password: 'OAUTH_USER',
              },
            });
            console.log('New user created:', newUser);
            return '/signup?showRoleModal=true';
          } else {
            console.log('Existing user found:', existingUser);
            user.role = existingUser.role;
          }
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }: {
      token: JWT;
      user: User | undefined;
      account: Account | null;
      trigger?: "update" | "signIn" | "signUp";
      session?: any;
    }) {
      if (user) {
        token.role = user.role;
      }

      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.sub!;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
