'use client';
import React, { useState } from 'react';
import { Layout, Typography, Select, Input, Slider, Button, Space, Radio, List, Switch, InputNumber, message, App } from 'antd';
import { gql, useQuery, useMutation } from '@apollo/client';

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
    }
  }
`;

const CreateQuiz = () => {
    const [quizName, setQuizName] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
    const [difficulty, setDifficulty] = useState('easy');
    const [yearRange, setYearRange] = useState([2015, 2024]);
    const [numQuestions, setNumQuestions] = useState(10);
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [timePerQuestion, setTimePerQuestion] = useState(1);
    const [totalTime, setTotalTime] = useState(30);
    const [timerType, setTimerType] = useState('perQuestion');

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

        const duration = timerType === 'perQuestion'
            ? timePerQuestion * numQuestions
            : totalTime;

        try {
            const response = await createQuiz({
                variables: {
                    input: {
                        topicId: selectedTopic,
                        name: quizName,
                        difficulty,
                        duration,
                        numberOfQuestions: numQuestions,
                        yearStart: yearRange[0],
                        yearEnd: yearRange[1]
                    }
                }
            });
            console.log('Quiz created:', response.data);
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

                                {/* Timer Settings Section */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <Title level={5} className="mb-0">Timer Settings</Title>
                                        <Switch
                                            checked={timerEnabled}
                                            onChange={setTimerEnabled}
                                            className="bg-gray-300"
                                        />
                                    </div>

                                    {timerEnabled && (
                                        <div className="space-y-4">
                                            <div>
                                                <Radio.Group
                                                    value={timerType}
                                                    onChange={(e) => setTimerType(e.target.value)}
                                                    className="flex flex-col space-y-2"
                                                >
                                                    <Radio value="perQuestion">
                                                        Time per question
                                                    </Radio>
                                                    <Radio value="totalTime">
                                                        Total quiz time
                                                    </Radio>
                                                </Radio.Group>
                                            </div>

                                            {timerType === 'perQuestion' ? (
                                                <div className="flex items-center space-x-2">
                                                    <InputNumber
                                                        min={1}
                                                        max={10}
                                                        value={timePerQuestion}
                                                        onChange={(value) => setTimePerQuestion(value || 0)}
                                                        className="w-24"
                                                    />
                                                    <span>minutes per question</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <InputNumber
                                                        min={5}
                                                        max={180}
                                                        value={totalTime}
                                                        onChange={(value) => setTotalTime(value || 0)}
                                                        className="w-24"
                                                    />
                                                    <span>minutes total</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
