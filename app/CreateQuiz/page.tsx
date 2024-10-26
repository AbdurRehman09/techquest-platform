'use client';
import React, { useState } from 'react';
import { Layout, Typography, Select, Input, Slider, Button, Space, Radio, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const CreateQuiz = () => {
    const [subject, setSubject] = useState('');
    const [difficulty, setDifficulty] = useState('easy');
    const [yearRange, setYearRange] = useState([2015, 2024]);
    const [numQuestions, setNumQuestions] = useState(10);

    const subjects = ['PF', 'OOP', 'DSA', 'DB'];
    const subTopics = [
        'Searching with arrays or lists',
        'Sorting with arrays or lists',
        'Manipulating arrays or lists',
        'Analyzing arrays or lists',
        'Optimizing array or list operations',
        'Advanced array or list techniques',
    ];

    return (
        <Layout>
            <Content className="p-6 bg-[#e6f7ff]">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between space-x-4">
                        {/* Left Section */}
                        <div className="w-2/3 bg-white p-4 rounded-lg shadow">
                            <div className="mb-4">
                                <Title level={5}>Select Topic for Quiz:</Title>
                                <Input
                                    placeholder="search here..."
                                    prefix={<SearchOutlined />}
                                    className="mb-2"
                                />
                            </div>

                            <div className="mb-4">
                                <Title level={5}>Select SubTopic :</Title>
                                <div className="h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
                                    <List
                                        dataSource={subTopics}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <Radio>{item}</Radio>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <Title level={5}>Quiz Name:</Title>
                                <Input placeholder="name here..." />
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="w-1/3 bg-white p-4 rounded-lg shadow">
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
                                    min={2000}
                                    max={2022}
                                    value={yearRange}
                                    onChange={setYearRange}
                                    styles={{
                                        track:
                                            { backgroundColor: '#b0e0e6' },

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
                                        track:
                                            { backgroundColor: '#b0e0e6' },

                                        handle: { borderColor: '#b0e0e6', boxShadow: 'none' }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <Button type="primary" className="mt-4">Create Quiz</Button>
                </div>
            </Content>
        </Layout>
    );
};

export default CreateQuiz;
