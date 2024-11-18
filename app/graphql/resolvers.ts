import { PrismaClient } from '@prisma/client'

interface Context {
  prisma: PrismaClient
}

// Define types for resolver arguments
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
}

const prisma = new PrismaClient()

export const resolvers = {
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

    generateQuiz: async (_: any, { topicId, duration }: GenerateQuizArgs, context: Context) => {
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
          quizOwnedBy: 1, // You'll need to get this from context
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
    }
  }
} 
