import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { quizId } = await req.json();
    console.log(session?.user?.id)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a unique shareable link
    const shareableLink = crypto.randomBytes(32).toString('hex');

    // Create quiz assignment
    const assignment = await prisma.quiz_assignments.create({
      data: {
        quizId,
        shareableLink,
      },
    });

    return NextResponse.json({ shareableLink: `${process.env.NEXTAUTH_URL}/quiz/assign/${shareableLink}` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { shareableLink } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert session user ID to number
    const userId = parseInt(session.user.id as string, 10);

    // Verify and add student to assignment
    const assignment = await prisma.quiz_assignments.update({
      where: { shareableLink },
      data: {
        users: {
          connect: { id: userId }
        }
      },
      include: {
        quizzes: true,
        users: true
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to claim assignment' }, { status: 500 });
  }
} 
