'use client'
import React, { useState } from 'react';
import styles from './teachers.module.css'
import { Layout, Typography, Button, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import QuizzesList from '../Components/QuizzesList/page';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('myQuizzes');

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
            style={{backgroundColor:"#f5f5f5"}}
          >
            My Quizzes
          </Button>
          <Button
            type={activeTab === 'customQuestions' ? 'primary' : 'default'}
            onClick={() => handleTabChange('customQuestions')}
            style={{backgroundColor:"#c5e4f0"}}
          >
            Custom questions
          </Button>
        </div>
        {activeTab === 'myQuizzes' && <QuizzesList />}
        {activeTab === 'customQuestions' && (
          <p>Custom questions content goes here</p>
        )}
      </Content>
    </Layout>
  );
};

export default TeacherDashboard;
