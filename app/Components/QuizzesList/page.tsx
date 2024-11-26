'use client'
import React, { useState } from 'react';
import { Typography, Button, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import AssignQuizModal from '../AssignQuizModal/page';

const { Title, Text } = Typography;

const GET_USER_QUIZZES = gql`
  query GetUserQuizzes($userId: Int!) {
    userQuizzes(userId: $userId) {
      id
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
    }
  }
`;

interface Quiz {
  id: number;
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
}

interface QuizzesListProps {
  showCreateButton?: boolean;
}

const QuizzesList: React.FC<QuizzesListProps> = ({ showCreateButton = true }) => {
  const router = useRouter();
  const userId = 1; // Hardcoded user ID
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const { loading, error, data } = useQuery(GET_USER_QUIZZES, {
    variables: { userId }
  });

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

  const handleEditQuiz = (quizId: number) => {
    console.log('Edit quiz', quizId);
  };

  const handleDeleteQuiz = (quizId: number) => {
    console.log('Delete quiz', quizId);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const quizzes: Quiz[] = data.userQuizzes;

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
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="mb-4" styles={{body:{ padding: '12px' }}}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} className="m-0 flex items-center">
                {quiz.topic.name}
                <EditOutlined className="ml-2 text-gray-400" />
              </Title>
            </Col>
            <Col>
              <Button 
                style={{backgroundColor:"#c5e4f0"}} 
                icon={<EyeOutlined />}
                onClick={() => handleShowDetails(quiz.id)} 
                className="mr-2"
              >
                Show Details
              </Button>
              <Button 
                style={{backgroundColor:"#c5e4f0"}} 
                onClick={() => handleAssignQuiz(quiz.id)} 
                className="mr-2"
              >
                Assign
              </Button>
              <Button 
                style={{backgroundColor:"#c5e4f0"}} 
                icon={<EditOutlined />} 
                onClick={() => handleEditQuiz(quiz.id)} 
                className="mr-2"
              >
                Edit
              </Button>
              <Button 
                className='text-white bg-red-500' 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteQuiz(quiz.id)}
              >
                Delete
              </Button>
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
              <Text>Duration: {quiz.duration} mins</Text>
            </Col>
            <Col span={24}>
              <Text>Year Range: {quiz.yearStart} - {quiz.yearEnd}</Text>
            </Col>
          </Row>
        </Card>
      ))}
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
