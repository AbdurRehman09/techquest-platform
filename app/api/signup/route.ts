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

    // Check database connection
    try {
      await prisma.$connect()
    } catch (connectionError) {
      console.error('Database Connection Error:', connectionError)
      return NextResponse.json(
        { error: 'Database connection failed' }, 
        { status: 500 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' }, 
        { status: 400 }
      )
    }

    // Hash password for credential signup
    const hashedPassword = password 
      ? await bcrypt.hash(password, 10) 
      : undefined

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword || "",
        role: role === 'teacher' ? 'TEACHER' : 'STUDENT'
      }
    })

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
