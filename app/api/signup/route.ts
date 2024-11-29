import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Prevent multiple Prisma client instances
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      username, 
      password, 
      role 
    } = body

    console.log('Signup password length:', password?.length);

    // Hash password for credential signup
    const hashedPassword = password 
      ? await bcrypt.hash(password, 10) 
      : undefined

    console.log('Hashed password length:', hashedPassword?.length);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword || "",
        role: role === 'teacher' ? 'TEACHER' : 'STUDENT'
      }
    })

    // Log the stored password length
    console.log('Stored password length in DB:', user.password?.length);

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : error }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 
