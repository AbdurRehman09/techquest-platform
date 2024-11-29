'use client'
import React from 'react';
import { Card, Typography, Button, Row, Col } from 'antd';
import { CodeOutlined, ApartmentOutlined, DatabaseOutlined, FundOutlined } from '@ant-design/icons';

const { Title } = Typography;

const courses = [
  { name: "Programming Fundamentals", icon: <CodeOutlined style={{ fontSize: '48px' }} /> },
  { name: "Object Oriented Programming", icon: <ApartmentOutlined style={{ fontSize: '48px' }} /> },
  { name: "Data Structures", icon: <FundOutlined style={{ fontSize: '48px' }} /> },
  { name: "Database", icon: <DatabaseOutlined style={{ fontSize: '48px' }} /> }
];

const CourseOverview: React.FC = () => {
  return (
    // bg-blue-50
    <div className="bg-[#e6f7ff] p-8 min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-4">
          <Button type="primary">Student</Button>
          <Button>Teacher</Button>
        </div>
        
        <Title level={2} className="text-center mb-8">CS/SE/DS</Title>
        
        <Row gutter={[16, 16]} justify="center">
          {courses.map((course, index) => (
            <Col key={index} xs={24} sm={12} md={6}>
              <Card 
                hoverable 
                className="text-center" 
                cover={
                  <div className="p-4 bg-gray-100 flex justify-center items-center" style={{ height: '120px' }}>
                    {course.icon}
                  </div>
                }
              >
                <Card.Meta title={course.name} />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default CourseOverview;
