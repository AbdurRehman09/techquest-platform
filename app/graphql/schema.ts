import { gql } from '@apollo/client'

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
    quizzes: [Quiz!]!
    customQuestions: [CustomQuestion!]!
  }

  enum UserRole {
    ADMIN
    STUDENT
    TEACHER
  }

  type Subject {
    id: Int!
    name: String!
    topics: [Topic!]!
    quizzes: [Quiz!]!
    questions: [Question!]!
    customQuestions: [CustomQuestion!]!
  }

  type Topic {
    id: Int!
    name: String!
    subject: Subject!
    quizzes: [Quiz!]!
  }

  type CustomQuestion {
    id: Int!
    description: String!
    subject: Subject!
    author: User!
  }

  type QuestionExplanation {
    id: Int!
    questionId: Int!
    feedback: String!
    createdAt: String!
    updatedAt: String!
    question: Question!
  }

  type Question {
    id: Int!
    uuid: String!
    description: String!
    difficulty: String!
    subject: Subject!
    explanations: [QuestionExplanation!]!
  }

  type Quiz {
    id: Int!
    duration: Int!
    subject: Subject!
    topic: Topic!
    owner: User!
  }

  type Query {
    subjects: [Subject!]!
    topics(subjectId: Int!): [Topic!]!
    questions(subjectId: Int!, difficulty: String): [Question!]!
    questionsByTopic(topicId: Int!): [Question!]!
    customQuestions(subjectId: Int): [CustomQuestion!]!
    questionExplanations(questionId: Int!): [QuestionExplanation!]!
    generateQuiz(topicId: Int!, duration: Int!): Quiz!
  }
` 
