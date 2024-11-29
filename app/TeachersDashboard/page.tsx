'use client'
import React, { useState } from 'react';
import { Layout, Typography, Button, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import QuizzesList from '../Components/QuizzesList/page';
import AssignedQuizzes from '../Components/AssignedQuizzes/page';
import AssignQuizModal from '../AssignQuiz/page';

const { Content } = Layout;
const { Title } = Typography;

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('myQuizzes');
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <Title level={2}>PROGRAMMING FUNDAMENTALS</Title>
        <div className="mb-4">
          <Button
            onClick={() => handleTabChange('myQuizzes')}
            className="mr-2 text-black"
            style={{backgroundColor: activeTab === 'myQuizzes' ? "#c5e4f0" : "#f5f5f5"}}
          >
            My Quizzes
          </Button>
          <Button
            onClick={() => handleTabChange('assigned')}
            style={{backgroundColor: activeTab === 'assigned' ? "#c5e4f0" : "#f5f5f5"}}
          >
            Assigned Quizzes
          </Button>
          <Button
            onClick={() => handleTabChange('customQuestions')}
            style={{backgroundColor: activeTab === 'customQuestions' ? "#c5e4f0" : "#f5f5f5"}}
          >
            Custom Questions
          </Button>
        </div>

        {activeTab === 'myQuizzes' && <QuizzesList showAssignButton={true} />}
        {activeTab === 'assigned' && <AssignedQuizzes showAssignButton={true} />}
        {activeTab === 'customQuestions' && <p>Custom questions content goes here</p>}

        <AssignQuizModal 
          visible={isAssignModalVisible}
          onClose={() => setIsAssignModalVisible(false)}
        />
      </Content>
    </Layout>
  );
};

export default TeacherDashboard;
