'use client';

import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import img from '../signup/signUp.jpg';
import styles from '../signup/signup.module.css';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password
      });

      if (result?.error) {
        // Show error message based on error type
        if (result.error.includes('No user found')) {
          message.error('Account does not exist. Please sign up first.');
        } else if (result.error.includes('Invalid password')) {
          message.error('Incorrect password. Please try again.');
        } else {
          message.error('Login failed. Please check your credentials.');
        }
      } else {
        message.success('Login successful!');
        router.push('/CommonDashboard');
      }
    } catch (error) {
      message.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (result?.error) {
        message.error('Google sign-in failed. Please try again.');
      }
    } catch (error) {
      message.error('Failed to connect with Google. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <Image
          src={img}
          alt="Login Illustration"
          fill
          className="object-cover"
        />
      </div>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Login</h1>
        <Button 
          icon={<GoogleOutlined />} 
          type="primary" 
          block 
          className={styles.googleButton}
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>
        <div className={styles.divider}>----------------or email----------------</div>
        <Form
          name="login"
          layout="vertical"
          className={styles.form}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input type="email" placeholder="user@email.com" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" className={styles.input} />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              className={styles.submitButton}
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.loginPrompt}>
          Don't have an account? <a href="/signup">Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
