'use client';
import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Tag, Descriptions, Button, message } from 'antd';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { CodeOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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

interface Topic {
  name: string;
}

interface QuizDetails {
  id: number;
  duration: number;
  numberOfQuestions: number;
  yearStart: number;
  yearEnd: number;
  topics: Topic[];
  subject: {
    name: string;
  };
  questions: Question[];
  quizOwnedBy: number;
  start_time: Date | null;
  finished_at: Date | null;
  type: 'REGULAR' | 'ASSIGNED';
}

const GET_QUIZ_DETAILS = gql`
  query GetQuizDetails($quizId: Int!) {
    quizDetails(quizId: $quizId) {
      id
      duration
      numberOfQuestions
      yearStart
      yearEnd
      topics {
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
      quizOwnedBy
      start_time
      finished_at
      type
    }
  }
`;

const RESET_FINISHED_AT = gql`
  mutation ResetQuizFinishedAt($quizId: Int!) {
    resetQuizFinishedAt(quizId: $quizId) {
      id
      start_time
      finished_at
      title
    }
  }
`;

const ShowDetails: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const quizId = searchParams?.get('quizId');

  // Early return if quizId is not available
  if (!quizId) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

 const [resetFinishedAt] = useMutation(RESET_FINISHED_AT);
  const { loading, error, data } = useQuery(GET_QUIZ_DETAILS, {
    variables: { quizId: parseInt(quizId) },
    fetchPolicy: 'network-only' // Ensure fresh data
  });

  // Show loading state
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading quiz details...</div>;
  }

  // Show error state
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error.message}</div>;
  }

  const quiz = data?.quizDetails;

  // Show not found state
  if (!quiz) {
    return <div className="flex justify-center items-center h-screen">Quiz not found</div>;
  }

 

  const handleStartQuiz = async () => {
    if (!quiz) return;
    
    if (quiz.type === 'ASSIGNED' && quiz.start_time && quiz.finished_at) {
      message.warning('This assigned quiz has already been submitted');
      return;
    }

    // If it's a restart scenario for a regular quiz
    if (quiz.type === 'REGULAR' && quiz.start_time && quiz.finished_at) {
      try {
        // Reset finished_at before starting
        await resetFinishedAt({ 
          variables: { quizId: quiz.id },
          onError: (error) => {
            console.error('Error resetting finished_at:', error);
            message.error('Failed to reset quiz');
          }
        });
      } catch (error) {
        console.error('Reset mutation error:', error);
        return;
      }
    }

    router.push(`/compiler?quizId=${quiz.id}`);
  };

  const handleEditQuiz = () => {
    router.push(`/Components/EditQuiz?quizId=${quiz?.id}`);
  };

  const getQuizButtonText = () => {
    if (quiz?.start_time === null) return 'Start Quiz';
    if (quiz?.finished_at === null) return 'Resume Quiz';
    return 'Restart Quiz';
  };

  // Use type assertion for difficultyColor to resolve indexing issue
  const difficultyColor: Record<string, string> = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  };

  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="p-6">
        {(() => {
          console.log('ShowDetails Values:', {
            sessionUserId: session?.user?.id,
            sessionUserIdType: typeof session?.user?.id,
            parsedSessionId: session?.user?.id ? parseInt(session.user.id) : undefined,
            quizOwnedBy: quiz?.quizOwnedBy,
            quizOwnedByType: typeof quiz?.quizOwnedBy,
            isMatch: quiz?.quizOwnedBy === (session?.user?.id ? parseInt(session.user.id) : undefined)
          });
          return null;
        })()}
        <div className="max-w-6xl mx-auto">
          {/* Quiz Overview */}
          <Card 
            title={
              <div className="flex justify-between items-center">
                <span>{`Quiz Details: ${quiz?.topics?.length ? quiz.topics.map((topic: Topic) => topic.name).join(', ') : 'No topics'}`}</span>
                <Tag color="blue" className="ml-4">{quiz?.subject.name}</Tag>
              </div>
            }
            extra={
              <div className="flex gap-3 items-center">
                {quiz?.quizOwnedBy === parseInt(session?.user?.id || "0") && (
                  <Button
                    className="bg-gray-100"
                    icon={<EditOutlined />}
                    onClick={handleEditQuiz}
                    size="large"
                  >
                    Edit Quiz
                  </Button>
                )}
                {session?.user?.role === "STUDENT" && (
                  <Button
                    className="bg-gray-100"
                    icon={<CodeOutlined />}
                    onClick={handleStartQuiz}
                    disabled={
                      quiz?.type === 'ASSIGNED' && 
                      quiz.start_time !== null && 
                      quiz.finished_at !== null
                    }
                    size="large"
                  >
                    {getQuizButtonText()}
                  </Button>
                )}
              </div>
            }
            className="mb-6 shadow-md"
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Duration" labelStyle={{ fontWeight: 'bold' }}>
                {quiz?.duration} mins
              </Descriptions.Item>
              <Descriptions.Item label="Questions" labelStyle={{ fontWeight: 'bold' }}>
                {quiz?.numberOfQuestions}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Questions Grid */}
          <Row gutter={[24, 24]}>
            {quiz?.questions.map((question: Question, index: number) => (
              <Col key={question.id} xs={24} md={12}>
                <Card
                  title={`Question ${index + 1}`}
                  extra={
                    <Tag color={difficultyColor[question.difficulty.toLowerCase()] || 'default'}>
                      {question.difficulty}
                    </Tag>
                  }
                  className="shadow-sm"
                >
                  <Paragraph className="text-base">{question.description}</Paragraph>
                  
                  {question.explanations.length > 0 && (
                    <Card type="inner" title="Explanation" className="mt-4">
                      {question.explanations.map((explanation: QuestionExplanation) => (
                        <Paragraph key={explanation.id} className="text-base">
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
