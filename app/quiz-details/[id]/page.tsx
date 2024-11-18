'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import ShowDetails from '@/app/Components/ShowDetails/page';
import { Layout } from 'antd';

const { Content } = Layout;

const QuizDetailsPage = () => {
  const params = useParams();
  const quizId = parseInt(params.id as string);

  return (
    <Layout>
      <Content className="p-6">
        <ShowDetails quizId={quizId} />
      </Content>
    </Layout>
  );
};

export default QuizDetailsPage; 
