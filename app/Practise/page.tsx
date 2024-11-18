'use client'
import React, { useState } from 'react';
import { Card, Button, Radio, Space, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import AssignQuizModal from '../AssignQuiz/page'; // Import the AssignQuizModal component
import QuizzesList from '../Components/QuizzesList/page';

const { Title, Paragraph } = Typography;

// Dummy data (you would typically import this from a separate file)
const dummyData = {
    levels: ['Easy', 'Medium', 'Hard'],
    topics: ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming'],
    questions: [
        {
            id: 1,
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            difficulty: 'Easy',
            topic: 'Arrays',
            solutionType: 'JavaScript Solution',
            solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
            options: [
                { key: 'A', value: 'O(n)' },
                { key: 'B', value: 'O(n^2)' },
                { key: 'C', value: 'O(log n)' },
                { key: 'D', value: 'O(1)' }
            ],
            correctAnswer: 'A'
        },
        {
            id: 2,
            title: 'Reverse Linked List',
            description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
            difficulty: 'Medium',
            topic: 'Linked Lists',
            solutionType: 'Python Solution',
            solutionCode: `def reverseList(self, head):
    prev = None
    current = head
    while current:
        next_temp = current.next
        current.next = prev
        prev = current
        current = next_temp
    return prev`,
            options: [
                { key: 'A', value: 'Iterative approach' },
                { key: 'B', value: 'Recursive approach' },
                { key: 'C', value: 'Using a stack' },
                { key: 'D', value: 'Using an array' }
            ],
            correctAnswer: 'A'
        },
    ]
};

const TechQuestPortal = () => {
    const { levels, topics, questions } = dummyData;
    const [activeTab, setActiveTab] = useState('practice');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = questions[currentQuestionIndex];

    const handleNext = () => {
        setCurrentQuestionIndex((prevIndex) =>
            prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex
        );
    };

    const handleBack = () => {
        setCurrentQuestionIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'practice':
                return (
                    <>
                        <Title level={3}>{currentQuestion.difficulty.toUpperCase()}</Title>
                        <div className="flex gap-4">
                            <Card className="flex-grow">
                                <Paragraph>
                                    <strong>{currentQuestion.title}</strong>: {currentQuestion.description}
                                </Paragraph>
                                <Paragraph>
                                    <strong>{currentQuestion.solutionType}:</strong>
                                </Paragraph>
                                <pre className="bg-gray-100 p-2 rounded">
                                    {currentQuestion.solutionCode}
                                </pre>
                            </Card>
                            <Space direction="vertical" className="w-64">
                                <Card title="Select Difficulty Level:">
                                    <Radio.Group>
                                        <Space direction="vertical">
                                            {levels.map((level, index) => (
                                                <Radio.Button
                                                    key={level}
                                                    value={level.toLowerCase()}
                                                    style={{ background: index % 2 === 0 ? "#c5e4f0" : "#f0f0f0" }}
                                                >
                                                    {level}
                                                </Radio.Button>
                                            ))}
                                        </Space>
                                    </Radio.Group>
                                </Card>
                                <Card title="Select Topics:">
                                    <Radio.Group>
                                        <Space direction="vertical">
                                            {topics.map((topic, index) => (
                                                <Radio.Button
                                                    key={topic}
                                                    value={topic.toLowerCase().replace(/\s+/g, '-')}
                                                    style={{ background: index % 2 === 0 ? "#c5e4f0" : "#f0f0f0" }}
                                                >
                                                    {topic}
                                                </Radio.Button>
                                            ))}
                                        </Space>
                                    </Radio.Group>
                                </Card>
                            </Space>
                        </div>
                        <Card title="Select your answer:" className="mt-4">
                            <Radio.Group>
                                {currentQuestion.options.map((option) => (
                                    <Radio.Button
                                        key={option.key}
                                        value={option.key.toLowerCase()}
                                        style={{ background: option.key === 'A' || option.key === 'C' ? "#c5e4f0" : "#f0f0f0" }}
                                    >
                                        {option.key}: {option.value}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>
                        </Card>
                        <div className="flex justify-between mt-4">
                            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>Back</Button>
                            <Button type="primary" icon={<ArrowRightOutlined />} onClick={handleNext}>Next</Button>
                        </div>
                    </>
                );
            case 'quizzes':
                return (
                    <>
                        <Title level={3}>Quizzes</Title>
                        <QuizzesList showCreateButton={false} />
                    </>
                );
            case 'assigned':
                return (
                    <>
                        <Title level={3}>Assigned Content</Title>
                        {/* Render the AssignQuizModal component here */}
                        <AssignQuizModal />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-4" style={{ backgroundColor: "#c5e4f0" }}>
            <div className="flex mb-4">
                {['Practice', 'Quizzes', 'Assigned'].map((tab) => (
                    <Button
                        key={tab}
                        type={activeTab === tab.toLowerCase() ? "primary" : "default"}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className="mr-4"
                    >
                        {tab}
                    </Button>
                ))}
            </div>
            {renderContent()}
        </div>
    );
};

export default TechQuestPortal;
