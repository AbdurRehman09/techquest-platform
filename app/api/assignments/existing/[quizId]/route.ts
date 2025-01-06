import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export async function GET(
    request: Request,
    { params }: { params: { quizId: string } }
) {
    try {
        const quizId = parseInt(params.quizId);

        const existingAssignment = await prisma.quiz_assignments.findFirst({
            where: { quizId }
        });

        if (existingAssignment) {
            return NextResponse.json({ shareableLink:`${process.env.NEXTAUTH_URL}/quiz/assign/${existingAssignment.shareableLink}` });
        }

        return NextResponse.json({ shareableLink: null });
    } catch (error) {
        console.error('Error fetching existing link:', error);
        return NextResponse.json(
            { error: 'Failed to fetch existing link' },
            { status: 500 }
        );
    }
} 
