'use client';


import React from 'react';
import {Button,Checkbox,Flex,Radio,Space ,theme} from 'antd';
import { Form,Input } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import img from './signUp.jpg'
import styles from './signup.module.css';
const SignUpPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <Image
          src={img} // Replace this with your image path
          alt="Signup Illustration"
          fill
          className="object-cover"
        />
      </div>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>SignUp</h1>
        <Button icon={<GoogleOutlined />} type="primary" block className={styles.googleButton}>
          Continue with Google
        </Button>
        <div className={styles.divider}>----------------or email----------------</div>
        <Form
          name="basic"
          layout="vertical"
          className={styles.form}
        >
          <div className={styles.rowclass}>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input placeholder="First Name" className={styles.input} />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input placeholder="Last Name" className={styles.input} style={{marginLeft:"10px"}} />
          </Form.Item>
          
          </div>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input type="email" placeholder="user@email.com" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="user123" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" className={styles.input} />
          </Form.Item>
          <Form.Item  name="role" label="Check valid option" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="teacher">Teacher</Radio>
              <Radio value="student">Student</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item 
            name="agreement"
            valuePropName="checked"
            rules={[{ required: true, message: 'You must agree to the terms!' }]}
          >
            <Checkbox>
              I agree with TechQuest <a href="#">Terms of Service</a>
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className={styles.submitButton}>
              Sign Up
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.loginPrompt} >
          Already have an account? <a href="/login">LogIn</a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
