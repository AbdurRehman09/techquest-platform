'use client';
import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button, message, Modal, List, Tag, Space, Pagination, Descriptions, Tabs } from 'antd';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Question {
  id: number;
  description: string;
  difficulty: string;
  topics: {
    id: number;
    name: string;
  }[];
}

interface QuizDetails {
  id: number;
  title: string;
  duration: number;
  numberOfQuestions: number;
  yearStart: number;
  yearEnd: number;
  quizOwnedBy: number;
  topics: {
    id: number;
    name: string;
  }[];
  subject: {
    id: number;
    name: string;
  };
  questions: Question[];
}

const GET_QUIZ_DETAILS = gql`
  query GetQuizDetails($quizId: Int!) {
    quizDetails(quizId: $quizId) {
      id
      title
      duration
      numberOfQuestions
      yearStart
      yearEnd
      quizOwnedBy
      topics {
        id
        name
      }
      subject {
        id
        name
      }
      questions {
        id
        description
        difficulty
        topic{
          id
          name
        }
      }
    }
  }
`;

const GET_AVAILABLE_QUESTIONS = gql`
  query GetQuestions($subjectId: Int!) {
    questions(subjectId: $subjectId) {
      id
      description
      difficulty
      topic {
        id
        name
      }
    }
    customQuestions(subjectId: $subjectId) {
      id
      description
      topics {
        id
        name
      }
      author {
        email
      }
    }
  }
`;

const UPDATE_QUIZ_QUESTIONS = gql`
  mutation UpdateQuizQuestions($quizId: Int!, $questionIds: [Int!]!) {
    updateQuizQuestions(quizId: $quizId, questionIds: $questionIds) {
      id
      questions {
        id
      }
    }
  }
`;

const DELETE_QUESTION_FROM_QUIZ = gql`
  mutation DeleteQuestionFromQuiz($quizId: Int!, $questionId: Int!) {
    deleteQuestionFromQuiz(quizId: $quizId, questionId: $questionId) {
      id
      questions {
        id
      }
    }
  }
`;

const EditQuiz: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const quizId = Number(searchParams?.get('quizId') || '0');

  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [isAddQuestionsModalVisible, setIsAddQuestionsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const pageSize = 10;
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'custom'

  const { loading, error } = useQuery(GET_QUIZ_DETAILS, {
    variables: { quizId },
    onCompleted: (data) => {
      setQuiz(data.quizDetails);
      setSelectedQuestions(data.quizDetails.questions.map((q: Question) => q.id));
    }
  });

  const { data: availableQuestionsData } = useQuery(GET_AVAILABLE_QUESTIONS, {
    variables: { 
      subjectId: quiz?.subject.id,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updateQuizQuestions] = useMutation(UPDATE_QUIZ_QUESTIONS, {
    onCompleted: () => {
      message.success('Quiz questions updated successfully');
      setIsAddQuestionsModalVisible(false);
    },
    onError: (error) => {
      message.error('Failed to update quiz questions: ' + error.message);
    }
  });

  const [deleteQuestionFromQuiz] = useMutation(DELETE_QUESTION_FROM_QUIZ, {
    onCompleted: () => {
      message.success('Question deleted successfully');
      window.location.reload();
    },
    onError: (error) => {
      message.error('Failed to delete question: ' + error.message);
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!quiz) return <div>Quiz not found</div>;

  const handleAddQuestions = () => {
    setIsAddQuestionsModalVisible(true);
  };

  const handleSaveQuestions = async () => {
    try {
      await updateQuizQuestions({
        variables: {
          quizId: quiz.id,
          questionIds: selectedQuestions
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating quiz questions:', error);
    }
  };

  const handleQuestionSelect = (questionId: number) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteQuestionFromQuiz({
        variables: {
          quizId: quiz.id,
          questionId: questionId
        }
      });
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const availableQuestions = activeTab === 'regular' 
    ? availableQuestionsData?.questions || []
    : availableQuestionsData?.customQuestions || [];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentQuestions = availableQuestions.slice(startIndex, endIndex);

  const difficultyColor: Record<string, string> = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  };

  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card 
            title={`Edit Quiz: ${quiz.title}`}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddQuestions}
              >
                Add Questions
              </Button>
            }
            className="mb-6"
          >
            <Descriptions bordered>
              <Descriptions.Item label="Subject">{quiz.subject.name}</Descriptions.Item>
              <Descriptions.Item label="Duration">{quiz.duration} mins</Descriptions.Item>
              <Descriptions.Item label="Questions">{quiz.numberOfQuestions}</Descriptions.Item>
              <Descriptions.Item label="Year Range">{quiz.yearStart} - {quiz.yearEnd}</Descriptions.Item>
              <Descriptions.Item label="Topics">
                {quiz.topics.map(topic => (
                  <Tag key={topic.id}>{topic.name}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Title level={4}>Current Questions</Title>
          <List
            dataSource={quiz.questions}
            renderItem={(question, index) => (
              <List.Item>
                <Card style={{ width: '100%' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <Title level={5}>Question {index + 1}</Title>
                      <Paragraph>{question.description}</Paragraph>
                      <Space>
                        <Tag color={difficultyColor[question.difficulty.toLowerCase()]}>
                          {question.difficulty}
                        </Tag>
                        {question.topics?.map((topic: { id: number; name: string }) => (
                          <Tag key={topic.id} color="blue">{topic.name}</Tag>
                        ))}
                      </Space>
                    </div>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />

          <Modal
            title="Add Questions"
            open={isAddQuestionsModalVisible}
            onCancel={() => setIsAddQuestionsModalVisible(false)}
            onOk={handleSaveQuestions}
            width={800}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'regular',
                  label: 'Regular Questions',
                  children: (
                    <List
                      dataSource={availableQuestionsData?.questions || []}
                      renderItem={(question: Question) => (
                        <List.Item>
                          <Card 
                            style={{ width: '100%' }}
                            className={selectedQuestions.includes(question.id) ? 'border-2 border-blue-500' : ''}
                            onClick={() => handleQuestionSelect(question.id)}
                          >
                            <Paragraph>{question.description}</Paragraph>
                            <Space>
                              <Tag color={difficultyColor[question.difficulty.toLowerCase()]}>
                                {question.difficulty}
                              </Tag>
                              {question.topics?.map((topic: { id: number; name: string }) => (
                                <Tag key={topic.id} color="blue">{topic.name}</Tag>
                              ))}
                            </Space>
                          </Card>
                        </List.Item>
                      )}
                    />
                  )
                },
                {
                  key: 'custom',
                  label: 'Custom Questions',
                  children: (
                    <List
                      dataSource={availableQuestionsData?.customQuestions || []}
                      renderItem={(question: any) => (
                        <List.Item>
                          <Card 
                            style={{ width: '100%' }}
                            className={selectedQuestions.includes(question.id) ? 'border-2 border-blue-500' : ''}
                            onClick={() => handleQuestionSelect(question.id)}
                          >
                            <Paragraph>{question.description}</Paragraph>
                            <Space>
                              <Tag color="purple">Custom</Tag>
                              {question.topics?.map((topic: { id: number; name: string }) => (
                                <Tag key={topic.id} color="blue">{topic.name}</Tag>
                              ))}
                              <Tag color="cyan">By: {question.author.email}</Tag>
                            </Space>
                          </Card>
                        </List.Item>
                      )}
                    />
                  )
                }
              ]}
            />
            <Pagination
              current={currentPage}
              onChange={setCurrentPage}
              total={availableQuestions.length}
              pageSize={pageSize}
              className="mt-4"
            />
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default EditQuiz; 