'use client'
import React, { useState } from 'react';
import { Typography, Button, Card, Row, message, Col, Empty, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import AssignQuizModal from '../AssignQuizModal/page';
import { useSession } from 'next-auth/react';
import DeleteQuizButton from '../DeleteQuizButton/page';


const { Title, Text } = Typography;


const GET_USER_QUIZZES = gql`
  query GetUserQuizzes($userId: Int!) {
    userQuizzes(userId: $userId) {
      id
      title
      duration
      numberOfQuestions
      topic {
        name
      }
      subject {
        name
      }
      yearStart
      yearEnd
      start_time
      finished_at
    }
    user(id: $userId) {
      role
    }
  }
`;

const GET_ASSIGNED_QUIZZES = gql`
  query GetAssignedQuizzes($userId: Int!) {
    assignedQuizzes(userId: $userId) {
      id
      quizzes {
        id
        title
        duration
        numberOfQuestions
        topic {
          name
        }
        subject {
          name
        }
        yearStart
        yearEnd
        type
        start_time
        finished_at
      }
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


interface AssignedQuizData {
  id: number;
  quizzes: Quiz;
}

interface Quiz {
  id: number;
  title: string;
  duration: number;
  numberOfQuestions: number;
  topic: {
    name: string;
  };
  subject: {
    name: string;
  };
  yearStart: number;
  yearEnd: number;
  type: 'REGULAR' | 'ASSIGNED';
  start_time: Date | null;
  finished_at: Date | null;
}

interface QuizzesListProps {
  showAssignButton?: boolean;
  type?: 'REGULAR' | 'ASSIGNED';
  userId?: number;
  showCreateButton?: boolean;
}

const QuizzesList: React.FC<QuizzesListProps> = ({
  showAssignButton = false,
  type = 'REGULAR',
  userId,
  showCreateButton = true
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [resetFinishedAt] = useMutation(RESET_FINISHED_AT);

  // Get quizzes based on type
  const { loading, error, data, refetch } = useQuery(
    type === 'ASSIGNED' ? GET_ASSIGNED_QUIZZES : GET_USER_QUIZZES,
    {
      variables: { userId },
      skip: !userId,
    }
  );
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Map data based on type with proper typing
  const quizzes: Quiz[] = type === 'ASSIGNED'
    ? data?.assignedQuizzes?.map((a: AssignedQuizData) => a.quizzes) || []
    : data?.userQuizzes || [];

  // Determine user role from data or session
  const userRole = data?.user?.role || session?.user?.role;

  const handleCreateQuiz = () => {
    router.push('/CreateQuiz');
  };

  const handleShowDetails = (quizId: number) => {
    router.push(`/Components/ShowDetails?quizId=${quizId}`);
  };

  const handleAssignQuiz = (quizId: number) => {
    setSelectedQuizId(quizId);
    setAssignModalVisible(true);
  };

  const getQuizButtonText = (quiz: Quiz) => {
    if (quiz?.start_time === null) return 'Start Quiz';
    if (quiz?.finished_at === null) return 'Resume Quiz';
    return 'Restart Quiz';
  };

  const isQuizRestartable = (quiz: Quiz) => {
    return type === 'REGULAR' && quiz.finished_at !== null;
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    if (!quiz) return;

    if (quiz.type === 'ASSIGNED' && quiz.start_time && quiz.finished_at) {
      message.warning('This assigned quiz has already been submitted');
      return;
    }

    // If it's a restart scenario for a regular quiz
    if (getQuizButtonText(quiz) === 'Restart Quiz') {
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

  if (!userId) return <div>Please log in to view quizzes</div>;

  const showAssignButtonForQuiz = showAssignButton && session?.user?.role === 'TEACHER';

  return (
    <>

      {showCreateButton && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateQuiz}
          className="mb-4"
        >
          Create new quiz
        </Button>
      )}



      {quizzes.map((quiz: Quiz) => (
        <Card key={quiz.id} className="mb-4" styles={{ body: { padding: '12px' } }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} className="m-0 flex items-center">
                {quiz.title}
                <EditOutlined className="ml-2 text-gray-400" />
              </Title>
            </Col>
            <Col>
              <Button
                style={{ backgroundColor: "#c5e4f0" }}
                icon={<EyeOutlined />}
                onClick={() => handleShowDetails(quiz.id)}
                className="mr-2"
              >
                Show Details
              </Button>
              {userRole !== 'TEACHER' && (
                <Tooltip
                  title={quiz.start_time && quiz.finished_at ? "Quiz already submitted" : undefined}
                >
                  <Button
                    className="bg-gray-100"
                    icon={<CodeOutlined />}
                    onClick={() => handleStartQuiz(quiz)}
                    disabled={
                      quiz.start_time !== null &&
                      quiz.finished_at !== null &&
                      type === 'ASSIGNED'
                    }
                  >
                    {getQuizButtonText(quiz)}
                  </Button>
                </Tooltip>
              )}
              {showAssignButtonForQuiz && (
                <Button
                  style={{ backgroundColor: "#c5e4f0" }}
                  onClick={() => handleAssignQuiz(quiz.id)}
                  className="mr-2"
                >
                  Assign
                </Button>
              )}
              {type === 'REGULAR' && (
                <DeleteQuizButton
                  quizId={quiz.id}
                  userId={userId!}
                  onDelete={() => {
                    refetch();
                  }}
                />
              )}
            </Col>
          </Row>
          <Row className="mt-2 flex-col">
            <Col span={8}>
              <Text>Subject: {quiz.subject.name}</Text>
            </Col>
            <Col span={8}>
              <Text>Questions: {quiz.numberOfQuestions}</Text>
            </Col>
            <Col span={8}>
              Duration: {quiz.duration} mins
            </Col>
            <Col span={24}>
              <Text>Year Range: {quiz.yearStart} - {quiz.yearEnd}</Text>
            </Col>
          </Row>
        </Card>
      ))
      }

      {selectedQuizId && (
        <AssignQuizModal
          quizId={selectedQuizId}
          visible={assignModalVisible}
          onClose={() => {
            setAssignModalVisible(false);
            setSelectedQuizId(null);
          }}
        />
      )}
    </>
  );
};

export default QuizzesList; 
