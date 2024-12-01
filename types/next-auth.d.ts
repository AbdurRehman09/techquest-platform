import 'next-auth';
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string | null
    role: UserRole
    image?: string
  }

  interface Session {
    user: User & {
      id: string
      role: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
} 
