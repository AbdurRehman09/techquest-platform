import { gql } from '@apollo/client';

export const typeDefs = gql`
  type Question {
    id: Int!
    description: String!
    difficulty: String!
    options: [Option!]!
  }

  type Option {
    id: Int!
    text: String!
    isCorrect: Boolean!
  }

  type Quiz {
    id: Int!
    name: String!
    difficulty: String!
    duration: Int!
    numberOfQuestions: Int!
    questions: [Question!]!
  }

  input CreateQuizInput {
    topicId: Int!
    name: String!
    difficulty: String!
    duration: Int!
    numberOfQuestions: Int!
    yearStart: Int!
    yearEnd: Int!
  }

  type Query {
    quiz(id: Int!): Quiz
  }

  type Mutation {
    createQuiz(input: CreateQuizInput!): Quiz
  }
`; 
