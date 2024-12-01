import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
    });

    return NextResponse.json(updatedUser);
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