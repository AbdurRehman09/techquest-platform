import { gql } from "@apollo/client";

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: Int!
    email: String!
    name: String
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!
    quizzes: [Quiz!]!
    customQuestions: [CustomQuestion!]!
    assignedQuizzes: [QuizAssignment!]!
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
    questions: [Question!]!
  }

  type CustomQuestion {
    id: Int!
    description: String!
    subject: Subject!
    author: User!
    topics: [Topic!]!
    createdAt: DateTime!
    updatedAt: DateTime!
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
    topic: Topic
  }

  type Quiz {
    id: Int!
    duration: Int!
    numberOfQuestions: Int!
    quizOwnedBy: Int!
    yearStart: Int!
    yearEnd: Int!
    title: String!
    type: QuizType!
    subject: Subject!
    topics: [Topic]!
    owner: User!
    questions: [Question!]!
    assignments: [QuizAssignment!]!
    start_time: DateTime
    finished_at: DateTime
    rubricType: String
    customRubric: String
  }

  enum QuizType {
    REGULAR
    ASSIGNED
  }

  type QuizAssignment {
    id: Int!
    quizId: Int!
    shareableLink: String!
    createdAt: DateTime!
    quizzes: Quiz!
    users: [User!]!
  }

  input CreateQuizInput {
    topicIds: [Int!]!
    difficulty: String!
    duration: Int!
    numberOfQuestions: Int!
    yearStart: Int!
    yearEnd: Int!
    name: String!
  }

  input CreateCustomQuestionInput {
    description: String!
    subjectId: Int!
    topicIds: [Int!]
  }

  type Query {
    subjects: [Subject!]!
    topics(subjectId: Int!): [Topic!]!
    topicsBySubject(subjectId: Int!): [Topic!]!
    questions(subjectId: Int!, difficulty: String): [Question!]!
    questionsByTopic(topicId: Int!): [Question!]!
    customQuestions(subjectId: Int): [CustomQuestion!]!
    questionExplanations(questionId: Int!): [QuestionExplanation!]!
    quizDetails(quizId: Int!): Quiz!
    userQuizzes(userId: Int!): [Quiz!]!
    assignedQuizzes(userId: Int!): [QuizAssignment!]!
    user(id: Int!): User
    getUserByEmail(email: String!): User
    quizQuestions(quizId: Int!): [Question!]!
    quizOwnerEmail(quizId: Int!): String
  }

  type Mutation {
    createQuiz(input: CreateQuizInput!): Quiz!
    claimQuizAssignment(shareableLink: String!): QuizAssignment!
    deleteQuiz(quizId: Int!): Boolean!
    startQuiz(quizId: Int!): Quiz!
    finishQuiz(quizId: Int!): Quiz!
    resetQuizFinishedAt(quizId: Int!): Quiz!
    setQuizRubric(
      quizId: Int!
      rubricType: String!
      customRubric: String
    ): Boolean!
    createCustomQuestion(input: CreateCustomQuestionInput!): CustomQuestion!
    updateQuizQuestions(quizId: Int!, questionIds: [Int!]!): Quiz!
    deleteQuestionFromQuiz(quizId: Int!, questionId: Int!): Quiz!
  }
`;
