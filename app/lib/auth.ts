import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password, 
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      console.log('SignIn Callback:', { 
        provider: account?.provider, 
        email: profile?.email 
      });
      return true;  // Always allow sign-in
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect Callback:', { url, baseUrl });
      return `${baseUrl}/CommonDashboard`;  // Force redirect to CommonDashboard
    },
    async session({ session, token, user }) {
      console.log('Session Callback:', { 
        sessionUser: session.user, 
        token 
      });
      
      if (token.sub) {
        session.user.id = token.sub
      }
      
      // Ensure role is set
      session.user.role = token.role as 'STUDENT' | 'TEACHER' | 'ADMIN' || 'STUDENT';
      
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log('JWT Callback:', { 
        account, 
        user, 
        profile 
      });

      // Set role for different authentication methods
      if (account?.provider === 'google') {
        token.role = 'PENDING';
      }
      
      if (user) {
        token.role = user.role || 'PENDING';
      }

      return token;
    }
  },
  events: {
    async signIn(message) {
      console.log('SignIn Event:', message);
    },
    async session(message) {
      console.log('Session Event:', message);
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',  // Error page
    newUser: '/CommonDashboard'  // Redirect new users
  }
}
