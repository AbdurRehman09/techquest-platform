'use client';

import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { gql, useMutation } from '@apollo/client';

const DELETE_QUIZ = gql`
  mutation DeleteQuiz($quizId: Int!) {
    deleteQuiz(quizId: $quizId)
  }
`;

interface DeleteQuizButtonProps {
  quizId: number;
  userId: number;
  onDelete?: () => void;
}

const DeleteQuizButton: React.FC<DeleteQuizButtonProps> = ({ 
  quizId, 
  userId,
  onDelete 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [deleteQuiz, { loading }] = useMutation(DELETE_QUIZ, {
    onCompleted: () => {
      message.success('Quiz deleted successfully');
      setIsModalVisible(false);
      onDelete?.(); // Trigger refresh of quiz list
    },
    onError: (error) => {
      message.error(`Failed to delete quiz: ${error.message}`);
    }
  });

  const showDeleteConfirm = () => {
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await deleteQuiz({
        variables: { quizId },
        refetchQueries: ['GetUserQuizzes'] // Refetch quizzes after deletion
      });
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  return (
    <>
      <Button
        className='text-white bg-red-500'
        icon={<DeleteOutlined />}
        onClick={showDeleteConfirm}
        loading={loading}
      >
        Delete
      </Button>

      <Modal
        title="Delete Quiz"
        open={isModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsModalVisible(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ 
          danger: true,
          loading: loading 
        }}
      >
        <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default DeleteQuizButton; 
