'use client'
import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { gql, useMutation } from '@apollo/client';

const ASSIGN_QUIZ = gql`
  mutation AssignQuiz($quizId: Int!) {
    assignQuiz(quizId: $quizId) {
      id
      shareableLink
    }
  }
`;

interface AssignQuizModalProps {
  quizId: number;
  visible: boolean;
  onClose: () => void;
}

const AssignQuizModal: React.FC<AssignQuizModalProps> = ({ quizId, visible, onClose }) => {
  const [shareableLink, setShareableLink] = useState('');
  const [assignQuiz] = useMutation(ASSIGN_QUIZ);

  const generateLink = async () => {
    try {
      const { data } = await assignQuiz({
        variables: { quizId }
      });
      setShareableLink(data.assignQuiz.shareableLink);
    } catch (error) {
      message.error('Failed to generate link');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink);
    message.success('Link copied to clipboard!');
  };

  return (
    <Modal
      open={visible}
      title="Share Quiz Link"
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <div className="mb-4">
        <Button 
          type="primary" 
          onClick={generateLink} 
          className="mb-4"
          style={{ width: '100%' }}
        >
          Generate Shareable Link
        </Button>
        {shareableLink && (
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 70px)' }}
              value={shareableLink}
              readOnly
            />
            <Button 
              icon={<CopyOutlined />} 
              onClick={handleCopy}
              style={{ width: '70px' }}
            >
              Copy
            </Button>
          </Input.Group>
        )}
      </div>
    </Modal>
  );
};

export default AssignQuizModal; 
