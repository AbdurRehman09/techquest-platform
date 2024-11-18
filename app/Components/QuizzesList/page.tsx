'use client'
import React, { useState } from 'react';
import { Typography, Button, Card, Row, Col, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ShowDetails from '../ShowDetails/page';

const { Title, Text } = Typography;

interface Quiz {
  id: number;
  name: string;
  teacherName: string;
  duration: string;
}

interface QuizzesListProps {
  showCreateButton?: boolean;
}

const QuizzesList: React.FC<QuizzesListProps> = ({ showCreateButton = true }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      name: 'Quiz No1',
      teacherName: '21a61b23',
      duration: '30 mins',
    },
  ]);

  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleCreateQuiz = () => {
    console.log('Create new quiz');
  };

  const handleAssignQuiz = (quizId: number) => {
    console.log('Assign quiz', quizId);
  };

  const handleEditQuiz = (quizId: number) => {
    console.log('Edit quiz', quizId);
  };

  const handleDeleteQuiz = (quizId: number) => {
    console.log('Delete quiz', quizId);
  };

  const handleShowDetails = (quizId: number) => {
    setSelectedQuizId(quizId);
    setShowDetailsModal(true);
  };

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
                {quiz.name}
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
            <Col span={12}>
              <Text>Teacher's Name: {quiz.teacherName}</Text>
            </Col>
            <Col span={12}>
              <Text>Duration: {quiz.duration}</Text>
            </Col>
          </Row>
        </Card>
      ))}

      <Modal
        title="Quiz Details"
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        width={800}
        footer={null}
      >
        {selectedQuizId && <ShowDetails quizId={selectedQuizId} />}
      </Modal>
    </>
  );
};

export default QuizzesList; 
