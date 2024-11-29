'use client';

import React from 'react';
import { Modal, Radio, Form, Button } from 'antd';
import styles from './RoleSelectionModal.module.css';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSubmit: (role: string) => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values.role);
    });
  };

  return (
    <Modal
      title="Select Your Role"
      open={isOpen}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Continue
        </Button>
      ]}
    >
      <Form form={form}>
        <Form.Item
          name="role"
          rules={[{ required: true, message: 'Please select your role!' }]}
        >
          <Radio.Group>
            <Radio.Button value="teacher">Teacher</Radio.Button>
            <Radio.Button value="student">Student</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleSelectionModal; 