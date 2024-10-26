'use client'
import React from 'react';
import { Layout, Typography, Button, Card, Row, Col } from 'antd';
import styles from './commondashboard.module.css'; // Add the correct path to your CSS module if using one

const { Content } = Layout;
const { Title } = Typography;

const courses = [
  "Programming Fundamentals",
  "OBJECT ORIENTED PROGRAMMING",
  "DATA STRUCTURES",
  "DATA BASE"
];

const CommonDashboard: React.FC = () => {
  return (
    <Layout className={`min-h-screen ${styles['background-section']}`}>
      <Content className="p-6">
        <div className="mb-4">
          <Title level={5} className="m-0 text-gray-600">HOME</Title>
        </div>
        <Row gutter={[16, 16]} className="mb-6">
          <Col>
            <Button type="primary">Student</Button>
          </Col>
          <Col>
            <Button>Teacher</Button>
          </Col>
        </Row>
        <Title level={2} className="mb-8"style={{marginLeft:"22rem" ,color:"white"}}>CS/SE/DS</Title>
        <Row gutter={[16, 16]} justify="center" className="flex-col">
          {courses.map((course, index) => (
            <Row key={index} className="flex-col" style={{width: "350px", marginLeft: "250px"}}>
              <Card hoverable className="text-center" style={{backgroundColor:"#4572c1"}}>
                <Typography.Text style={{color:"white"}}>{course}</Typography.Text>
              </Card>
            </Row>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default CommonDashboard;
