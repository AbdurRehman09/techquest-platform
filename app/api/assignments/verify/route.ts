import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { shareableLink } = await req.json();

    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if link exists and hasn't been used
    const assignment = await prisma.quiz_assignments.findFirst({
      where: {
        shareableLink,
        isUsed: false,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
    }

    // Mark link as used and connect student
    const updatedAssignment = await prisma.quiz_assignments.update({
      where: { id: assignment.id },
      data: {
        isUsed: true,
        users: {
          connect: { id: parseInt(session.user.id as string) }
        }
      },
      include: {
        quizzes: true,
        users: true
      }
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify link' }, { status: 500 });
  }
} 
