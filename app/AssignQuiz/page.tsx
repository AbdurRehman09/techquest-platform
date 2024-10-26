'use client'
import React, { useState } from 'react';
import { Modal, Input, Select, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Option } = Select;

const AssignQuizModal: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [link, setLink] = useState('https://quiz-link.com'); // Example link
  const [students, setStudents] = useState<string[]>([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    message.success('Link copied to clipboard!');
  };

  const handleSearch = (value: string) => {
    // Implement search logic here
    console.log('Search for:', value);
  };

  const handleDone = () => {
    setVisible(false);
    // Handle any other actions needed on closing
  };

  return (
    <Modal
      visible={visible}
      title="Assign Quiz to Students!"
      footer={null}
      onCancel={() => setVisible(false)}
    >
      {/* Link input */}
      <div style={{ marginBottom: '16px' }}>
        <Input
          addonBefore="Send this link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          suffix={
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copy
            </Button>
          }
        />
      </div>

      {/* Student Search Dropdown */}
      <div style={{ marginBottom: '16px' }}>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Search Students"
          onSearch={handleSearch}
          onChange={(value) => setStudents(value as string[])}
        >
          {/* Example student options */}
          <Option key="student1" value="Student 1">
            Student 1
          </Option>
          <Option key="student2" value="Student 2">
            Student 2
          </Option>
        </Select>
      </div>

      {/* Done Button */}
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" onClick={handleDone}>
          Done
        </Button>
      </div>
    </Modal>
  );
};

export default AssignQuizModal;
