'use client'
import React from 'react';
import { Card, Typography, Layout } from 'antd';
import { gql, useQuery } from '@apollo/client';

const { Title, Text } = Typography;
const { Content } = Layout;

const GET_QUIZ_DETAILS = gql`
  query GetQuizDetails($quizId: Int!) {
    quiz(id: $quizId) {
      id
      name
      difficulty
      duration
      questions {
        id
        description
        options {
          id
          text
          isCorrect
        }
        difficulty
      }
    }
  }
`;

interface ShowDetailsProps {
  quizId: number;
}

const ShowDetails: React.FC<ShowDetailsProps> = ({ quizId }) => {
  const { loading, error, data } = useQuery(GET_QUIZ_DETAILS, {
    variables: { quizId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading quiz details</div>;

  const quiz = data?.quiz;

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <Title level={2}>{quiz.name}</Title>
        <Text className="block mb-4">
          Difficulty: {quiz.difficulty} | Duration: {quiz.duration} minutes
        </Text>
        
        <div className="space-y-4">
          {quiz.questions.map((question: any, index: number) => (
            <Card 
              key={question.id} 
              className="shadow-md"
              title={`Question ${index + 1}`}
              style={{ backgroundColor: '#f8f9fa' }}
            >
              <div className="space-y-4">
                <Text className="block text-lg">{question.description}</Text>
                
                <div className="space-y-2">
                  {question.options.map((option: any) => (
                    <div 
                      key={option.id}
                      className="p-2 border rounded"
                      style={{ 
                        backgroundColor: option.isCorrect ? '#e6f7ff' : 'white',
                        borderColor: option.isCorrect ? '#1890ff' : '#d9d9d9'
                      }}
                    >
                      <Text>{option.text}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Content>
    </Layout>
  );
};

export default ShowDetails; 
