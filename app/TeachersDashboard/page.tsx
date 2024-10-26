'use client'
import React, { useState } from 'react';
import styles from './teachers.module.css'
import { Layout, Typography, Button, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface Quiz {
  id: number;
  name: string;
  students: number;
  teacherName: string;
  duration: string;
}

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('myQuizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      name: 'Quiz No1',
      students: 4,
      teacherName: '21a61b23',
      duration: '30 mins',
    },
  ]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <Title level={2}>PROGRAMMING FUNDAMENTALS</Title>
        <div className="mb-4">
          <Button
            onClick={() => handleTabChange('myQuizzes')}
            className="mr-2 text-black"
            style={{backgroundColor:"#f5f5f5"}}
          >
            My Quizzes
          </Button>
          <Button
            type={activeTab === 'customQuestions' ? 'primary' : 'default'}
            onClick={() => handleTabChange('customQuestions') }
            style={{backgroundColor:"#c5e4f0"}}
          >
            Custom questions
          </Button>
        </div>
        {activeTab === 'myQuizzes' && (
          <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateQuiz}
              className="mb-4"
            >
              Create new quiz
            </Button>
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
                    <Button style={{backgroundColor:"#c5e4f0"}} onClick={() => handleAssignQuiz(quiz.id)} className="mr-2">
                      Assign
                    </Button>
                    <Button     style={{backgroundColor:"#c5e4f0"}}icon={<EditOutlined />} onClick={() => handleEditQuiz(quiz.id)} className="mr-2">
                      Edit
                    </Button>
                    <Button className='text-white bg-red-500' icon={<DeleteOutlined />} onClick={() => handleDeleteQuiz(quiz.id)}>
                      Delete
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-2 flex-col">
                  <Col span={8}>
                    <Text>No of Students: {quiz.students}</Text>
                  </Col>
                  <Col span={8}>
                    <Text>Teacher's Name: {quiz.teacherName}</Text>
                  </Col>
                  <Col span={8}>
                    <Text>Duration: {quiz.duration}</Text>
                  </Col>
                </Row>
              </Card>
            ))}
          </>
        )}
        {activeTab === 'customQuestions' && (
          <p>Custom questions content goes here</p>
        )}
      </Content>
    </Layout>
  );
};

export default TeacherDashboard;
