import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
    });

    // Get current session
    const session = await getServerSession(authOptions);

    if (session?.user) {
      // Update session
      session.user.role = role;
    }

    return NextResponse.json({
      user: updatedUser,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
