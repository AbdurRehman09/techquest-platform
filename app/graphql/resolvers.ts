import { PrismaClient, Prisma, Question, QuestionExplanation } from '@prisma/client';

const prisma = new PrismaClient();

interface QuizInput {
  topicId: number;
  name: string;
  difficulty: string;
  duration: number;
  numberOfQuestions: number;
  yearStart: number;
  yearEnd: number;
}

interface QuestionWithExplanations extends Question {
  explanations: QuestionExplanation[];
}

// Helper function to generate unique IDs for options
let optionIdCounter = 1;
const generateOptionId = () => optionIdCounter++;

export const resolvers = {
  Query: {
    quiz: async (_: any, { id }: { id: number }) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          topic: true,
          subject: true,
          owner: true,
        }
      });

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Fetch random questions based on quiz criteria
      const questions = await prisma.question.findMany({
        where: {
          subjectId: quiz.subjectId,
          year: {
            gte: quiz.yearStart,
            lte: quiz.yearEnd
          }
        },
        take: quiz.numberOfQuestions,
        orderBy: {
          id: 'asc'
        },
        include: {
          explanations: true
        }
      });

      // Transform the data to match our GraphQL schema
      return {
        id: quiz.id,
        name: `Quiz ${quiz.id}`,
        difficulty: 'medium',
        duration: quiz.duration,
        numberOfQuestions: quiz.numberOfQuestions,
        questions: questions.map((q: QuestionWithExplanations) => ({
          id: q.id,
          description: q.description,
          difficulty: q.difficulty,
          options: q.explanations.map(exp => ({
            id: generateOptionId(), // Generate a unique ID for each option
            text: exp.feedback,
            isCorrect: false
          }))
        }))
      };
    }
  },
  
  Mutation: {
    createQuiz: async (_: any, { input }: { input: QuizInput }) => {
      const topic = await prisma.topic.findUnique({
        where: { id: input.topicId },
        select: { subjectId: true }
      });

      if (!topic) {
        throw new Error('Topic not found');
      }

      // Create the quiz
      const quiz = await prisma.quiz.create({
        data: {
          duration: input.duration,
          numberOfQuestions: input.numberOfQuestions,
          yearStart: input.yearStart,
          yearEnd: input.yearEnd,
          topicId: input.topicId,
          subjectId: topic.subjectId,
          quizOwnedBy: 1, // Hardcoded user ID
        },
        include: {
          topic: true,
          subject: true,
          owner: true,
        }
      });

      // Fetch random questions for the quiz
      const questions = await prisma.question.findMany({
        where: {
          subjectId: topic.subjectId,
          difficulty: input.difficulty,
          year: {
            gte: input.yearStart,
            lte: input.yearEnd
          }
        },
        take: input.numberOfQuestions,
        orderBy: {
          id: 'asc'
        },
        include: {
          explanations: true
        }
      });

      // Reset option ID counter for new quiz
      optionIdCounter = 1;

      // Transform and return the response
      return {
        id: quiz.id,
        name: input.name,
        difficulty: input.difficulty,
        duration: quiz.duration,
        numberOfQuestions: quiz.numberOfQuestions,
        questions: questions.map((q: QuestionWithExplanations) => ({
          id: q.id,
          description: q.description,
          difficulty: q.difficulty,
          options: q.explanations.map(exp => ({
            id: generateOptionId(), // Generate a unique ID for each option
            text: exp.feedback,
            isCorrect: false
          }))
        }))
      };
    }
  }
}; 
