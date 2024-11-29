import { PrismaClient, Prisma, Question, Quiz } from '@prisma/client'
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { DateTimeResolver } from '../scalars/DateTime';

interface Context {
  prisma: PrismaClient;
  userId?: number;
  session?: any;
}

// Add all missing interfaces
interface TopicsArgs {
  subjectId: number
}

interface QuestionsArgs {
  subjectId: number
  difficulty?: string
}

interface TopicArgs {
  topicId: number
}

interface QuestionExplanationsArgs {
  questionId: number
}

interface GenerateQuizArgs {
  topicId: number
  duration: number
  yearStart: number
  yearEnd: number
}

interface CreateQuizInput {
  topicId: number
  difficulty: string
  duration: number
  numberOfQuestions: number
  yearStart: number
  yearEnd: number
  name: string
}

interface QuizCreateData extends Prisma.QuizCreateInput {
  numberOfQuestions: number
  yearStart: number
  yearEnd: number
}

const prisma = new PrismaClient()

// Define custom types to match Prisma schema
type QuestionWithYear = Question & {
  year: number
}

type QuizWithYearRange = Quiz & {
  yearStart: number
  yearEnd: number
}

export const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    subjects: async (_: any, __: any, context: Context) => {
      return await prisma.subject.findMany({
        include: {
          topics: true,
          quizzes: true,
          questions: true,
          customQuestions: true,
        },
      })
    },

    topics: async (_: any, { subjectId }: TopicsArgs, context: Context) => {
      return await prisma.topic.findMany({
        where: { subjectId },
        include: {
          subject: true,
          quizzes: true,
        },
      })
    },

    questions: async (_: any, { subjectId, difficulty }: QuestionsArgs, context: Context) => {
      return await prisma.question.findMany({
        where: {
          subjectId,
          ...(difficulty && { difficulty }),
        },
        include: {
          subject: true,
          explanations: true,
        },
      })
    },

    questionsByTopic: async (_: any, { topicId }: TopicArgs, context: Context) => {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: { subject: true },
      })

      if (!topic) throw new Error('Topic not found')

      return await prisma.question.findMany({
        where: {
          subjectId: topic.subject.id,
        },
        include: {
          subject: true,
          explanations: true,
        },
      })
    },

    customQuestions: async (_: any, { subjectId }: Partial<TopicsArgs>, context: Context) => {
      return await prisma.customQuestion.findMany({
        where: {
          ...(subjectId && { subjectId }),
        },
        include: {
          subject: true,
          author: true,
        },
      })
    },

    questionExplanations: async (_: any, { questionId }: QuestionExplanationsArgs, context: Context) => {
      return await prisma.questionExplanation.findMany({
        where: {
          questionId,
        },
        include: {
          question: true,
        },
      })
    },

    generateQuiz: async (_: any, { topicId, duration, yearStart, yearEnd }: GenerateQuizArgs, context: Context) => {
      const questions = await prisma.question.findMany({
        where: {
          subject: {
            topics: {
              some: {
                id: topicId
              }
            }
          }
        },
        include: {
          explanations: true,
          subject: true,
        },
        take: 10,
      })

      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        select: { subjectId: true }
      })

      if (!topic) throw new Error('Topic not found')

      const quiz = await prisma.quiz.create({
        data: {
          duration,
          topicId,
          subjectId: topic.subjectId,
          quizOwnedBy: 1,
          yearStart,
          yearEnd,
        },
        include: {
          subject: true,
          topic: true,
          owner: true,
        }
      })

      return {
        ...quiz,
        questions,
      }
    },

    topicsBySubject: async (_: any, { subjectId }: { subjectId: number }) => {
      return await prisma.topic.findMany({
        where: { subjectId },
        include: {
          subject: true,
        },
      })
    },

    quizDetails: async (_: any, { quizId }: { quizId: number }, context: Context) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              explanations: true
            }
          },
          topic: true,
          subject: true,
          owner: true
        }
      });

      if (!quiz) throw new Error('Quiz not found');

      return quiz;
    },

    userQuizzes: async (_: any, { userId }: { userId: number }, context: Context) => {
      return await prisma.quiz.findMany({
        where: {
          quizOwnedBy: userId
        },
        include: {
          topic: true,
          subject: true
        }
      });
    },

    assignedQuizzes: async (_: any, { userId }: { userId: number }, { prisma }: Context) => {
      return prisma.quizAssignment.findMany({
        where: {
          students: {
            some: {
              id: userId
            }
          }
        },
        include: {
          quiz: {
            include: {
              subject: true,
              topic: true
            }
          },
          students: true
        }
      });
    },

    quizAssignmentByLink: async (_: any, { shareableLink }: { shareableLink: string }) => {
      return prisma.$transaction(async (tx) => {
        const assignment = await tx.quizAssignment.findUnique({
          where: { shareableLink },
          include: {
            quiz: {
              include: {
                topic: true,
                subject: true
              }
            },
            students: true
          }
        });
        return assignment;
      });
    },

    user: async (_: any, { id }: { id: number }) => {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          role: true,
          // ... other fields
        }
      });
    }
  },

  Mutation: {
    createQuiz: async (_: any, { input }: { input: CreateQuizInput }) => {
      const { topicId, difficulty, duration, numberOfQuestions, yearStart, yearEnd, name } = input;

      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        select: { subjectId: true }
      });

      if (!topic) throw new Error('Topic not found');

      // Get questions based on criteria
      const availableQuestions = await prisma.question.findMany({
        where: {
          subject: {
            topics: {
              some: {
                id: topicId
              }
            }
          },
          difficulty,
          year: {
            gte: yearStart,
            lte: yearEnd
          }
        }
      });

      if (availableQuestions.length === 0) {
        throw new Error(
          `No questions available for the selected criteria. Please try different options.`
        );
      }

      // Randomly select questions
      const selectedQuestions = availableQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numberOfQuestions, availableQuestions.length));

      // Create quiz
      const quiz = await prisma.quiz.create({
        data: {
          duration,
          topicId,
          subjectId: topic.subjectId,
          quizOwnedBy: 90002, // Hardcoded user ID
          numberOfQuestions: selectedQuestions.length,
          yearStart,
          yearEnd
        }
      });

      // Connect questions to quiz in a separate step
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: {
          questions: {
            connect: selectedQuestions.map(q => ({ id: q.id }))
          }
        }
      });

      // Fetch the complete quiz with all relations
      const completeQuiz = await prisma.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          subject: true,
          topic: true,
          owner: true,
          questions: {
            include: {
              explanations: true
            }
          }
        }
      });

      if (!completeQuiz) {
        throw new Error('Failed to create quiz');
      }

      return completeQuiz;
    },

    assignQuiz: async (_: any, { quizId }: { quizId: number }, context: Context) => {
      const shareableLink = nanoid(10);
      
      return prisma.$transaction(async (tx) => {
        const assignment = await tx.quizAssignment.create({
          data: {
            quiz: { connect: { id: quizId } },
            shareableLink
          },
          include: {
            quiz: true,
            students: true
          }
        });
        return assignment;
      });
    },

    joinQuizByLink: async (_: any, { shareableLink }: { shareableLink: string }, context: Context) => {
      if (!context.userId) {
        throw new Error('User must be authenticated');
      }
      
      return prisma.$transaction(async (tx) => {
        const assignment = await tx.quizAssignment.update({
          where: { shareableLink },
          data: {
            students: {
              connect: { id: context.userId }
            }
          },
          include: {
            quiz: true,
            students: true
          }
        });
        return assignment;
      });
    },

    createQuizAssignment: async (_: any, { quizId }: { quizId: number }, { prisma }: Context) => {
      const shareableLink = crypto.randomBytes(32).toString('hex');
      
      return prisma.quizAssignment.create({
        data: {
          quizId,
          shareableLink,
          isUsed: false
        },
        include: {
          quiz: true,
          students: true
        }
      });
    },

    claimQuizAssignment: async (_: any, { shareableLink }: { shareableLink: string }, { prisma, session }: Context) => {
      if (!session?.user?.id) {
        throw new Error('Unauthorized');
      }

      const userId = parseInt(session.user.id as string, 10);

      const assignment = await prisma.quizAssignment.findFirst({
        where: {
          shareableLink,
          isUsed: false
        }
      });

      if (!assignment) {
        throw new Error('Invalid or expired link');
      }

      return prisma.quizAssignment.update({
        where: { id: assignment.id },
        data: {
          isUsed: true,
          students: {
            connect: { id: userId }
          }
        },
        include: {
          quiz: true,
          students: true
        }
      });
    }
  }
} 
