'use client'
import { Button, Row, Col, Typography, Progress } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const QuizResultPage = () => {
  const [correct, incorrect, notAttempted] = [40, 5, 55]; // Example data percentages

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* Title */}
      <Title level={3}>TechQuest</Title>
      
      {/* Progress Bars */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <div style={{ width: '80%', margin: '0 auto', background: '#F5F5F5', padding: '20px', borderRadius: '10px' }}>
            <Row justify="center" style={{ marginBottom: '20px' }}>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Progress
                    type="circle"
                    percent={correct}
                    format={(percent) => `${percent}%`}
                    strokeColor="#4CAF50"
                    strokeWidth={12}
                  />
                  <div style={{ marginLeft: '10px', color: '#4CAF50' }}>Correct</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Progress
                    type="circle"
                    percent={incorrect}
                    format={(percent) => `${percent}%`}
                    strokeColor="#F44336"
                    strokeWidth={12}
                  />
                  <div style={{ marginLeft: '10px', color: '#F44336' }}>Incorrect</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Progress
                    type="circle"
                    percent={notAttempted}
                    format={(percent) => `${percent}%`}
                    strokeColor="#9E9E9E"
                    strokeWidth={12}
                  />
                  <div style={{ marginLeft: '10px', color: '#9E9E9E' }}>Not Attempted</div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Legend */}
      <Row justify="center" gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={8} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ color: '#4CAF50' }}>● Correct</div>
        </Col>
        <Col span={8} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ color: '#F44336' }}>● Incorrect</div>
        </Col>
        <Col span={8} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ color: '#9E9E9E' }}>● Not Attempted</div>
        </Col>
      </Row>

      {/* Button */}
      <Button
        type="primary"
        size="large"
        style={{ border: 'none', marginTop: '20px' }}
      >
        See Details
      </Button>
    </div>
  );
};

export default QuizResultPage;
