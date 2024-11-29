'use client'
import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface AssignQuizModalProps {
  visible: boolean;
  onClose: () => void;
  quizId: number;
}

const AssignQuizModal: React.FC<AssignQuizModalProps> = ({ visible, onClose, quizId }) => {
  const [shareableLink, setShareableLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateShareableLink = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();
      if (response.ok) {
        setShareableLink(data.shareableLink);
      } else {
        message.error(data.error || 'Failed to generate link');
      }
    } catch (error) {
      message.error('Failed to generate link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink);
    message.success('Link copied to clipboard!');
  };

  return (
    <Modal
      title="Assign Quiz"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Close
        </Button>,
        <Button 
          key="generate" 
          type="primary" 
          onClick={generateShareableLink}
          loading={isLoading}
          disabled={!!shareableLink}
        >
          Generate Link
        </Button>
      ]}
    >
      {shareableLink ? (
        <div className="flex items-center gap-2">
          <Input value={shareableLink} readOnly />
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            Copy
          </Button>
        </div>
      ) : (
        <p>Click "Generate Link" to create a shareable link for students.</p>
      )}
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Note: This link can only be used by students to access the quiz.
          Teachers cannot use this link to access the quiz.
        </p>
      </div>
    </Modal>
  );
};

export default AssignQuizModal; 
