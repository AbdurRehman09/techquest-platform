'use client'
import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Input, Button, message } from 'antd';
import { useSession } from 'next-auth/react';
import { gql, useQuery, useMutation } from '@apollo/client';

const { Title, Text } = Typography;

interface AssignedQuiz {
  id: number;
  quiz: {
    id: number;
    title: string;
    duration: number;
    subject: {
      name: string;
    };
    topic: {
      name: string;
    };
  };
}

interface AssignedQuizzesProps {
  showAssignButton?: boolean;
}

const GET_ASSIGNED_QUIZZES = gql`
  query GetAssignedQuizzes($userId: Int!) {
    assignedQuizzes(userId: $userId) {
      id
      quiz {
        id
        title
        duration
        subject {
          name
        }
        topic {
          name
        }
      }
    }
  }
`;

const CLAIM_QUIZ_ASSIGNMENT = gql`
  mutation ClaimQuizAssignment($shareableLink: String!) {
    claimQuizAssignment(shareableLink: $shareableLink) {
      id
      quiz {
        id
        title
      }
    }
  }
`;

const AssignedQuizzes: React.FC<AssignedQuizzesProps> = ({ showAssignButton = false }) => {
  const { data: session } = useSession();
  const [linkInput, setLinkInput] = useState('');

  const { data: assignedQuizzesData, loading, refetch } = useQuery<{
    assignedQuizzes: AssignedQuiz[];
  }>(GET_ASSIGNED_QUIZZES, {
    variables: { userId: parseInt(session?.user?.id as string, 10) },
    skip: !session?.user?.id
  });

  const [claimQuiz] = useMutation(CLAIM_QUIZ_ASSIGNMENT);

  const handleAddQuiz = async () => {
    try {
      if (!session?.user || session.user.role !== 'STUDENT') {
        message.error('Only students can add assigned quizzes');
        return;
      }

      const shareableLink = linkInput.split('/').pop();
      const { data } = await claimQuiz({ 
        variables: { shareableLink } 
      });

      if (data.claimQuizAssignment) {
        message.success('Quiz added successfully!');
        setLinkInput('');
        refetch();
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to add quiz');
    }
  };

  return (
    <div>
      <Title level={3}>Assigned Quizzes</Title>
      
      {!showAssignButton && (
        <div className="mb-4">
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 100px)' }}
              placeholder="Paste quiz link here"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <Button type="primary" onClick={handleAddQuiz}>
              Add Quiz
            </Button>
          </Input.Group>
        </div>
      )}

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={assignedQuizzesData?.assignedQuizzes || []}
        renderItem={(item: AssignedQuiz) => (
          <List.Item>
            <Card title={item.quiz.title}>
              <p>Subject: {item.quiz.subject.name}</p>
              <p>Topic: {item.quiz.topic.name}</p>
              <p>Duration: {item.quiz.duration} minutes</p>
              <Button type="primary" className="mt-2">
                Start Quiz
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AssignedQuizzes; 
