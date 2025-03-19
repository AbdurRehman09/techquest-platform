import { PrismaClient, Prisma, Question, Quiz } from "@prisma/client";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { DateTimeResolver } from "../scalars/DateTime";
import { title } from "process";

interface Context {
  prisma: PrismaClient;
  userId?: number;
  session?: any;
}

// Add all missing interfaces
interface TopicsArgs {
  subjectId: number;
}

interface QuestionsArgs {
  subjectId: number;
  difficulty?: string;
}

interface TopicArgs {
  topicId: number;
}

interface QuestionExplanationsArgs {
  questionId: number;
}

interface CreateQuizInput {
  topicId: number;
  difficulty: string;
  duration: number;
  numberOfQuestions: number;
  yearStart: number;
  yearEnd: number;
  name: string;
}

interface QuizCreateData extends Prisma.QuizCreateInput {
  numberOfQuestions: number;
  yearStart: number;
  yearEnd: number;
}

const prisma = new PrismaClient();

// Define custom types to match Prisma schema
type QuestionWithYear = Question & {
  year: number;
};

type QuizWithYearRange = Quiz & {
  yearStart: number;
  yearEnd: number;
};

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
      });
    },

    topics: async (_: any, { subjectId }: TopicsArgs, context: Context) => {
      return await prisma.topic.findMany({
        where: { subjectId },
        include: {
          subject: true,
          quizzes: true,
        },
      });
    },

    questions: async (
      _: any,
      { subjectId, difficulty }: QuestionsArgs,
      context: Context
    ) => {
      return await prisma.question.findMany({
        where: {
          subjectId,
          ...(difficulty && { difficulty }),
        },
        include: {
          subject: true,
          explanations: true,
        },
      });
    },

    questionsByTopic: async (
      _: any,
      { topicId }: TopicArgs,
      context: Context
    ) => {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: { subject: true },
      });

      if (!topic) throw new Error("Topic not found");

      return await prisma.question.findMany({
        where: {
          subjectId: topic.subject.id,
        },
        include: {
          subject: true,
          explanations: true,
        },
      });
    },

    customQuestions: async (
      _: any,
      { subjectId }: Partial<TopicsArgs>,
      context: Context
    ) => {
      return await prisma.customQuestion.findMany({
        where: {
          ...(subjectId && { subjectId }),
        },
        include: {
          subject: true,
          author: true,
        },
      });
    },

    questionExplanations: async (
      _: any,
      { questionId }: QuestionExplanationsArgs,
      context: Context
    ) => {
      return await prisma.questionExplanation.findMany({
        where: {
          questionId,
        },
        include: {
          question: true,
        },
      });
    },

    topicsBySubject: async (_: any, { subjectId }: { subjectId: number }) => {
      return await prisma.topic.findMany({
        where: { subjectId },
        include: {
          subject: true,
        },
      });
    },

    quizDetails: async (
      _: any,
      { quizId }: { quizId: number },
      context: Context
    ) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: {
          id: true,
          duration: true,
          numberOfQuestions: true,
          yearStart: true,
          yearEnd: true,
          title: true,
          type: true,
          start_time: true,
          finished_at: true,
          questions: {
            select: {
              id: true,
              description: true,
              difficulty: true,
              explanations: {
                select: {
                  id: true,
                  feedback: true,
                },
              },
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          owner: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      if (!quiz) throw new Error("Quiz not found");

      return quiz;
    },

    userQuizzes: async (
      _: any,
      { userId }: { userId: number },
      context: Context
    ) => {
      return await prisma.quiz.findMany({
        where: {
          quizOwnedBy: userId,
        },
        include: {
          topic: true,
          subject: true,
        },
      });
    },

    assignedQuizzes: async (
      _: any,
      { userId }: { userId: number },
      { prisma }: Context
    ) => {
      return prisma.quiz_assignments.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          quizzes: {
            include: {
              subject: true,
              topic: true,
            },
          },
          users: true,
        },
      });
    },

    user: async (_: any, { id }: { id: number }) => {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          role: true,
          // ... other fields
        },
      });
    },

    getUserByEmail: async (_: any, { email }: { email: string }) => {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    },

    quizQuestions: async (
      _: any,
      { quizId }: { quizId: number },
      { prisma }: Context
    ) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: true,
        },
      });

      if (!quiz) throw new Error("Quiz not found");
      return quiz.questions;
    },

    // New resolver to get quiz owner's email
    quizOwnerEmail: async (
      _: any,
      { quizId }: { quizId: number },
      { prisma }: Context
    ) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: {
          quizOwnedBy: true,
        },
      });

      if (!quiz) throw new Error("Quiz not found");

      const user = await prisma.user.findUnique({
        where: { id: quiz.quizOwnedBy },
        select: {
          email: true,
        },
      });

      if (!user) throw new Error("Quiz owner not found");

      return user.email;
    },
  },

  Mutation: {
    createQuiz: async (
      _: any,
      { input }: { input: CreateQuizInput },
      context: Context
    ) => {
      if (!context.session?.user?.email) {
        throw new Error("User must be authenticated");
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: context.session.user.email },
      });

      if (!dbUser) {
        throw new Error("User not found");
      }

      const {
        topicId,
        difficulty,
        duration,
        numberOfQuestions,
        yearStart,
        yearEnd,
        name,
      } = input;

      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        select: { subjectId: true },
      });

      if (!topic) throw new Error("Topic not found");

      // Get questions based on criteria
      const availableQuestions = await prisma.question.findMany({
        where: {
          subject: {
            topics: {
              some: {
                id: topicId,
              },
            },
          },
          difficulty,
          year: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
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

      // Create quiz with actual database user ID and title from input
      const quiz = await prisma.quiz.create({
        data: {
          duration,
          topicId,
          subjectId: topic.subjectId,
          quizOwnedBy: dbUser.id,
          numberOfQuestions: selectedQuestions.length,
          yearStart,
          yearEnd,
          title: name,
        },
      });

      // Connect questions to quiz in a separate step
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: {
          questions: {
            connect: selectedQuestions.map((q) => ({ id: q.id })),
          },
        },
      });

      // Fetch the complete quiz with all relations
      const completeQuiz = await prisma.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          subject: true,
          topic: true,
          owner: {
            select: {
              id: true,
              role: true,
            },
          },
          questions: {
            include: {
              explanations: true,
            },
          },
        },
      });

      if (!completeQuiz) {
        throw new Error("Failed to create quiz");
      }

      return completeQuiz;
    },

    claimQuizAssignment: async (
      _: any,
      { shareableLink }: { shareableLink: string },
      { prisma, session }: Context
    ) => {
      if (!session?.user?.email) {
        throw new Error("Please login to access this quiz");
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!dbUser) {
        throw new Error("User not found");
      }

      // Check if assignment exists
      const assignment = await prisma.quiz_assignments.findFirst({
        where: { shareableLink },
        include: {
          quizzes: {
            include: {
              subject: true,
              topic: true,
            },
          },
          users: true,
        },
      });

      if (!assignment) {
        throw new Error("Invalid quiz link");
      }

      // Check if user has already been assigned this quiz
      const existingAssignment = await prisma.quiz_assignments.findFirst({
        where: {
          id: assignment.id,
          users: {
            some: {
              id: dbUser.id,
            },
          },
        },
      });

      if (existingAssignment) {
        throw new Error("You have already been assigned this quiz");
      }

      // Update quiz type and connect student
      await prisma.quiz.update({
        where: { id: assignment.quizzes.id },
        data: { type: "ASSIGNED" },
      });

      const updatedAssignment = await prisma.quiz_assignments.update({
        where: { id: assignment.id },
        data: {
          users: {
            connect: { id: dbUser.id },
          },
        },
        include: {
          quizzes: {
            include: {
              subject: true,
              topic: true,
            },
          },
          users: true,
        },
      });

      return updatedAssignment;
    },

    deleteQuiz: async (
      _: any,
      { quizId }: { quizId: number },
      { prisma, session }: Context
    ) => {
      try {
        if (!session?.user?.email) {
          throw new Error("Not authenticated");
        }

        // Get the quiz with its relationships and check ownership
        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: {
            quiz_assignments: {
              include: {
                users: true,
              },
            },
            questions: true,
            owner: true,
          },
        });

        if (!quiz) {
          throw new Error("Quiz not found");
        }

        // Check if user is the owner
        if (quiz.owner.email !== session.user.email) {
          throw new Error("You can only delete your own quizzes");
        }

        // Check if quiz is assigned to any student
        if (
          quiz.quiz_assignments.some(
            (assignment) => assignment.users.length > 0
          )
        ) {
          throw new Error(
            "Cannot delete quiz as it has been assigned to students"
          );
        }

        // Delete with increased timeout and optimized operations
        await prisma.$transaction(
          async (tx) => {
            // 1. Delete all quiz assignments in one go
            await tx.quiz_assignments.deleteMany({
              where: { quizId },
            });

            // 2. Delete the quiz (this will automatically handle question relationships)
            await tx.quiz.delete({
              where: { id: quizId },
            });
          },
          {
            timeout: 10000, // Increase timeout to 10 seconds
            maxWait: 15000, // Maximum time to wait for transaction
          }
        );

        return true;
      } catch (error) {
        console.error("Error deleting quiz:", error);
        throw error;
      }
    },

    startQuiz: async (
      _: any,
      { quizId }: { quizId: number },
      { prisma, session }: Context
    ) => {
      // Ensure user is authenticated
      if (!session?.user?.email) {
        throw new Error("Not authenticated");
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Update quiz with start time
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quizId },
        data: {
          start_time: new Date(),
        },
        select: {
          id: true,
          start_time: true,
          finished_at: true,
          title: true,
          // Add other fields you might need
        },
      });

      return updatedQuiz;
    },

    finishQuiz: async (
      _: any,
      { quizId }: { quizId: number },
      { prisma, session }: Context
    ) => {
      // Ensure user is authenticated
      if (!session?.user?.email) {
        throw new Error("Not authenticated");
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Update quiz with finish time
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quizId },
        data: {
          finished_at: new Date(),
        },
        select: {
          id: true,
          start_time: true,
          finished_at: true,
          title: true,
          // Add other fields you might need
        },
      });

      return updatedQuiz;
    },

    resetQuizFinishedAt: async (
      _: any,
      { quizId }: { quizId: number },
      { prisma, session }: Context
    ) => {
      // Ensure user is authenticated
      if (!session?.user?.email) {
        throw new Error("Not authenticated");
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Update quiz by resetting finished_at
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quizId },
        data: {
          finished_at: null,
        },
        select: {
          id: true,
          start_time: true,
          finished_at: true,
          title: true,
        },
      });

      return updatedQuiz;
    },

    setQuizRubric: async (
      _: any,
      {
        quizId,
        rubricType,
        customRubric,
      }: { quizId: number; rubricType: string; customRubric?: string },
      { prisma, session }: Context
    ) => {
      if (!session?.user?.email) {
        throw new Error("Not authenticated");
      }

      // Find the quiz
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          owner: true,
        },
      });

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Check if the user is the owner of the quiz
      if (quiz.owner.email !== session.user.email) {
        throw new Error("You can only set rubrics for your own quizzes");
      }

      // Update the quiz with rubric settings
      await prisma.quiz.update({
        where: { id: quizId },
        data: {
          rubricType,
          customRubric: rubricType === "custom" ? customRubric : null,
        },
      });

      return true;
    },
  },
};
