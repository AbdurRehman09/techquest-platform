// app/signup/page.tsx
'use client';

import React from 'react';
import { Form, Input, Button, Checkbox, Radio } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import img from './signUp.jpg'
import styled from 'styled-components';

const SignUpContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;

  .form-container {
    display: flex;
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  }

  .image-container {
    flex: 1;
    padding: 20px;
  }

  .form-fields {
    flex: 1;
    padding: 20px;
  }

  .form-title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
  }

  .google-btn {
    width: 100%;
    background-color: #4285f4;
    color: white;
    margin-bottom: 20px;
  }

  .submit-btn {
    width: 100%;
    background-color: #001529;
    color: white;
    margin-top: 20px;
  }

  .login-link {
    margin-top: 10px;
    text-align: center;
  }
`;

const SignUpPage: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <SignUpContainer>
      <div className="form-container">
        {/* Left Side Image */}
        <div className="image-container">
          <Image
            src={img} // You need to replace this with your actual image path
            alt="Sign Up Illustration"
            width={400}
            height={500}
            style={{ borderRadius: '8px' }}
          />
        </div>

        {/* Right Side Form */}
        <div className="form-fields">
          <div className="form-title">SignUp</div>
          <Button
            icon={<GoogleOutlined />}
            className="google-btn"
          >
            Continue with Google
          </Button>
          <Form
            name="basic"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Please input your first name!' }]}>
              <Input placeholder="First Name" />
            </Form.Item>
            <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Please input your last name!' }]}>
              <Input placeholder="Last Name" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
              <Input type="email" placeholder="user@email.com" />
            </Form.Item>
            <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
              <Input placeholder="user123" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password placeholder="******" />
            </Form.Item>

            <Form.Item>
              <Radio.Group>
                <Radio value="teacher">Teacher</Radio>
                <Radio value="student">Student</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="terms" valuePropName="checked" rules={[{ required: true, message: 'Please accept the terms!' }]}>
              <Checkbox>I agree with TechQuest Terms of Service</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="submit-btn">
                SignUp
              </Button>
            </Form.Item>

            <div className="login-link">
              Already have an account? <a href="/login">Log In</a>
            </div>
          </Form>
        </div>
      </div>
    </SignUpContainer>
  );
};

export default SignUpPage;
