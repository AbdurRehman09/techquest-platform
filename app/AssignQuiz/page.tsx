'use client'
import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface AssignQuizModalProps {
  visible: boolean;
  onClose: () => void;
  quizId?: number;
}

const AssignQuizModal: React.FC<AssignQuizModalProps> = ({ 
  visible, 
  onClose,
  quizId 
}) => {
  const [shareableLink, setShareableLink] = useState('');
  const [students, setStudents] = useState<string[]>([]);

  useEffect(() => {
    if (visible && quizId) {
      // Generate shareable link when modal opens
      generateShareableLink(quizId);
    }
  }, [visible, quizId]);

  const generateShareableLink = async (quizId: number) => {
    // Implement API call to generate and save shareable link
    // const response = await fetch('/api/assignments/create', ...);
    // setShareableLink(response.data.shareableLink);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink);
    message.success('Link copied to clipboard!');
  };

  const handleAssign = async () => {
    // Implement API call to assign quiz to selected students
    // await fetch('/api/assignments/assign-students', ...);
    message.success('Quiz assigned successfully!');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      title="Assign Quiz to Students"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="assign" type="primary" onClick={handleAssign}>
          Assign
        </Button>
      ]}
    >
      {/* ... existing modal content ... */}
    </Modal>
  );
};

export default AssignQuizModal;
