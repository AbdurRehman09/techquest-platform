'use client';
import React from 'react';
import { Layout, Typography, Card, Row, Col, Tag, Descriptions } from 'antd';
import { gql, useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

// Define TypeScript interfaces for type safety
interface QuestionExplanation {
  id: number;
  feedback: string;
}

interface Question {
  id: number;
  description: string;
  difficulty: string;
  explanations: QuestionExplanation[];
}

interface QuizDetails {
  id: number;
  duration: number;
  numberOfQuestions: number;
  yearStart: number;
  yearEnd: number;
  topic: {
    name: string;
  };
  subject: {
    name: string;
  };
  questions: Question[];
}

const GET_QUIZ_DETAILS = gql`
  query GetQuizDetails($quizId: Int!) {
    quizDetails(quizId: $quizId) {
      id
      duration
      numberOfQuestions
      yearStart
      yearEnd
      topic {
        name
      }
      subject {
        name
      }
      questions {
        id
        description
        difficulty
        explanations {
          id
          feedback
        }
      }
    }
  }
`;

const ShowDetails: React.FC = () => {
  // Extract quizId from URL
  const searchParams = useSearchParams();
  const quizId = Number(searchParams?.get('quizId') || '0');

  const { loading, error, data } = useQuery(GET_QUIZ_DETAILS, {
    variables: { quizId },
    skip: quizId === 0
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data || !data.quizDetails) return <div>No quiz found</div>;

  const quiz: QuizDetails = data.quizDetails;

  // Use type assertion for difficultyColor to resolve indexing issue
  const difficultyColor: Record<string, string> = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  };

  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Overview */}
          <Card 
            title={`Quiz Details: ${quiz.topic.name}`} 
            extra={<Tag color="blue">{quiz.subject.name}</Tag>}
            className="mb-6"
          >
            <Descriptions bordered>
              <Descriptions.Item label="Duration">
                {quiz.duration === 30 ? `${quiz.duration} minutes` : `${quiz.numberOfQuestions * quiz.duration} minutes`}
              </Descriptions.Item>
              <Descriptions.Item label="Questions">{quiz.numberOfQuestions}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Questions Grid */}
          <Row gutter={[16, 16]}>
            {quiz.questions.map((question: Question, index: number) => (
              <Col key={question.id} xs={24} sm={12} md={8}>
                <Card
                  title={`Question ${index + 1}`}
                  extra={
                    <Tag color={difficultyColor[question.difficulty.toLowerCase()] || 'default'}>
                      {question.difficulty}
                    </Tag>
                  }
                >
                  <Paragraph>{question.description}</Paragraph>
                  
                  {question.explanations.length > 0 && (
                    <Card type="inner" title="Explanation">
                      {question.explanations.map((explanation: QuestionExplanation) => (
                        <Paragraph key={explanation.id}>
                          {explanation.feedback}
                        </Paragraph>
                      ))}
                    </Card>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default ShowDetails; 
