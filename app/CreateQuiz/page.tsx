'use client';
import React, { useState } from 'react';
import { Layout, Typography, Select, Input, Slider, Button, Space, Radio, List, Switch, InputNumber, message, App } from 'antd';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const { Content } = Layout;
const { Title } = Typography;

const GET_TOPICS = gql`
  query GetTopics($subjectId: Int!) {
    topicsBySubject(subjectId: $subjectId) {
      id
      name
    }
  }
`;

const CREATE_QUIZ = gql`
  mutation CreateQuiz($input: CreateQuizInput!) {
    createQuiz(input: $input) {
      id
      title
      duration
      numberOfQuestions
      yearStart
      yearEnd
      topic {
        name
      }
      questions {
        id
        description
        difficulty
      }
      owner {
        role
      }
    }
  }
`;

const CreateQuiz = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [quizName, setQuizName] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
    const [difficulty, setDifficulty] = useState('easy');
    const [yearRange, setYearRange] = useState([2015, 2024]);
    const [numQuestions, setNumQuestions] = useState(10);
    const [totalTime, setTotalTime] = useState(30);

    // GraphQL hooks
    const { data: topicsData, loading: topicsLoading } = useQuery(GET_TOPICS, {
        variables: { subjectId: 1 }, // Hardcoded subjectId as requested
    });

    const [createQuiz, { loading: createLoading }] = useMutation(CREATE_QUIZ, {
        onCompleted: (data) => {
            if (data.createQuiz.questions.length < numQuestions) {
                message.warning(
                    `Only ${data.createQuiz.questions.length} questions were available. ` +
                    `Quiz created with available questions.`
                );
            } else {
                message.success(`Quiz created successfully!`);
            }

            // Redirect based on user role
            if (session?.user?.role === 'TEACHER') {
                router.push('/TeachersDashboard');
            } else {
                router.push('/Practise?tab=quizzes');
            }
        },
        onError: (error) => {
            console.error('GraphQL Error:', error);
            message.error(error.message || 'Failed to create quiz');
        }
    });

    const handleCreateQuiz = async () => {
        if (!selectedTopic || !quizName) {
            message.error('Please select a topic and provide a quiz name');
            return;
        }

        try {
            await createQuiz({
                variables: {
                    input: {
                        topicId: selectedTopic,
                        name: quizName,
                        difficulty,
                        duration: totalTime,
                        numberOfQuestions: numQuestions,
                        yearStart: yearRange[0],
                        yearEnd: yearRange[1]
                    }
                }
            });
        } catch (error) {
            console.error('Error creating quiz:', error);
        }
    };

    return (
        <App>
            <Layout className="min-h-screen bg-[#e6f7ff]">
                <Content className="p-6 flex-1">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Left Section */}
                            <div className="w-full md:w-2/3">
                                <div className="bg-white p-4 rounded-lg shadow mb-4">
                                    <div className="mb-4">
                                        <Title level={5}>Select Topic for Quiz:</Title>
                                        <List
                                            loading={topicsLoading}
                                            dataSource={topicsData?.topicsBySubject || []}
                                            renderItem={(topic: any) => (
                                                <List.Item>
                                                    <Radio
                                                        checked={selectedTopic === topic.id}
                                                        onChange={() => setSelectedTopic(topic.id)}
                                                    >
                                                        {topic.name}
                                                    </Radio>
                                                </List.Item>
                                            )}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <Title level={5}>Quiz Name:</Title>
                                        <Input
                                            placeholder="Enter quiz name..."
                                            value={quizName}
                                            onChange={(e) => setQuizName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="w-full md:w-1/3">
                                <div className="bg-white p-4 rounded-lg shadow mb-4">
                                    <div className="mb-4">
                                        <Title level={5}>Select Difficulty Level:</Title>
                                        <Radio.Group
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="flex space-x-2"
                                        >
                                            <Radio.Button value="easy">Easy</Radio.Button>
                                            <Radio.Button value="medium">Medium</Radio.Button>
                                            <Radio.Button value="hard">Hard</Radio.Button>
                                        </Radio.Group>
                                    </div>

                                    <div className="mb-4">
                                        <Title level={5}>Year Range:</Title>
                                        <div className="flex justify-between">
                                            <span>{yearRange[0]}</span>
                                            <span>{yearRange[1]}</span>
                                        </div>
                                        <Slider
                                            range
                                            min={2015}
                                            max={2024}
                                            value={yearRange}
                                            onChange={setYearRange}
                                            styles={{
                                                track: { backgroundColor: '#b0e0e6' },
                                                handle: { borderColor: '#b0e0e6', boxShadow: 'none' }
                                            }}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <Title level={5}>Number of Questions:</Title>
                                        <div className="flex justify-between">
                                            <span>1</span>
                                            <span>{numQuestions}</span>
                                        </div>
                                        <Slider
                                            min={1}
                                            max={20}
                                            value={numQuestions}
                                            onChange={setNumQuestions}
                                            styles={{
                                                track: { backgroundColor: '#b0e0e6' },
                                                handle: { borderColor: '#b0e0e6', boxShadow: 'none' }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Timer Settings Section - Simplified */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="mb-4">
                                        <Title level={5}>Total Quiz Duration</Title>
                                        <div className="flex items-center space-x-2">
                                            <InputNumber
                                                min={10}
                                                max={180}
                                                value={totalTime}
                                                onChange={(value) => setTotalTime(value || 30)}
                                                className="w-24"
                                            />
                                            <span>minutes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            className="mt-4"
                            onClick={handleCreateQuiz}
                            loading={createLoading}
                            disabled={!selectedTopic || !quizName}
                        >
                            Create Quiz
                        </Button>
                    </div>
                </Content>
            </Layout>
        </App>
    );
};

export default CreateQuiz;
