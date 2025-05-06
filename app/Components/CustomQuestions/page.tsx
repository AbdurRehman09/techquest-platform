'use client';
import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, message, List, Tag, Space, Modal } from 'antd';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSession } from 'next-auth/react';

const { TextArea } = Input;

const GET_SUBJECTS = gql`
  query GetSubjects {
    subjects {
      id
      name
      topics {
        id
        name
      }
    }
  }
`;

const GET_CUSTOM_QUESTIONS = gql`
  query GetCustomQuestions($subjectId: Int) {
    customQuestions(subjectId: $subjectId) {
      id
      description
      subject {
        id
        name
      }
      topics {
        id
        name
      }
      author {
        id
        email
      }
      createdAt
    }
  }
`;

const CREATE_CUSTOM_QUESTION = gql`
  mutation CreateCustomQuestion($input: CreateCustomQuestionInput!) {
    createCustomQuestion(input: $input) {
      id
      description
      subject {
        name
      }
      topics {
        name
      }
    }
  }
`;

interface CustomQuestion {
  id: number;
  description: string;
  subject: {
    id: number;
    name: string;
  };
  topics: {
    id: number;
    name: string;
  }[];
  author: {
    id: number;
    email: string;
  };
  createdAt: string;
}

const CustomQuestions: React.FC = () => {
  const { data: session, status } = useSession();
  const [form] = Form.useForm();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [topicsForSubject, setTopicsForSubject] = useState<any[]>([]);

  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS);

  const { data: questionsData, loading: questionsLoading, refetch: refetchQuestions } = useQuery(GET_CUSTOM_QUESTIONS, {
    fetchPolicy: 'network-only',
  });

  // Handle subject change
  const handleSubjectChange = (subjectId: number | null) => {
    setSelectedSubject(subjectId);
    if (subjectId) {
      const subject = subjectsData?.subjects.find((s: any) => s.id === subjectId);
      setTopicsForSubject(subject?.topics || []);
    } else {
      setTopicsForSubject([]);
    }
    form.setFieldsValue({ topicIds: [] });
  };

  // Filter questions based on selected subject
  const filteredQuestions = React.useMemo(() => {
    if (!questionsData?.customQuestions) return [];
    if (!selectedSubject) return questionsData.customQuestions;
    return questionsData.customQuestions.filter(
      (q: CustomQuestion) => q.subject.id === selectedSubject
    );
  }, [questionsData?.customQuestions, selectedSubject]);

  const [createQuestion, { loading: creating }] = useMutation(CREATE_CUSTOM_QUESTION, {
    onCompleted: () => {
      message.success('Question created successfully!');
      form.resetFields();
      setIsModalVisible(false);
      refetchQuestions();
    },
    onError: (error) => {
      message.error('Failed to create question: ' + error.message);
    },
  });

  const handleSubmit = async (values: any) => {
    if (!session || status !== 'authenticated') {
      message.error('You must be logged in to create questions');
      return;
    }

    try {
      await createQuestion({
        variables: {
          input: {
            description: values.description,
            subjectId: values.subjectId,
            topicIds: values.topicIds || [],
          },
        },
      });
    } catch (error: any) {
      message.error('Failed to create question: ' + error.message);
      console.error('Error creating question:', error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title="Custom Questions"
        extra={
          <Button type="primary" onClick={showModal}>
            Add New Question
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by subject"
            allowClear
            onChange={(value) => handleSubjectChange(value)}
            loading={subjectsLoading}
            value={selectedSubject}
          >
            {subjectsData?.subjects.map((subject: any) => (
              <Select.Option key={subject.id} value={subject.id}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <List
          loading={questionsLoading}
          dataSource={filteredQuestions}
          renderItem={(question: CustomQuestion) => (
            <List.Item>
              <Card style={{ width: '100%' }}>
                <p>{question.description}</p>
                <Space>
                  <Tag color="blue">{question.subject.name}</Tag>
                  {question.topics.map((topic) => (
                    <Tag key={topic.name} color="green">
                      {topic.name}
                    </Tag>
                  ))}
                  <Tag color="default">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </Tag>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Add New Question"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ subjectId: selectedSubject }}
        >
          <Form.Item
            name="subjectId"
            label="Subject"
            rules={[{ required: true, message: 'Please select a subject' }]}
          >
            <Select
              placeholder="Select a subject"
              onChange={handleSubjectChange}
              loading={subjectsLoading}
            >
              {subjectsData?.subjects.map((subject: any) => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="topicIds"
            label="Topics (Optional)"
          >
            <Select
              mode="multiple"
              placeholder="Select topics (optional)"
              disabled={!selectedSubject || subjectsLoading}
              loading={subjectsLoading}
            >
              {topicsForSubject.map((topic: any) => (
                <Select.Option key={topic.id} value={topic.id}>
                  {topic.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Question Description"
            rules={[{ required: true, message: 'Please enter the question description' }]}
          >
            <TextArea rows={4} placeholder="Enter your question here..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={creating}>
                Create Question
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomQuestions; 