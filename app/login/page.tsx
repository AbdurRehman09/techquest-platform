'use client';

import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import img from '../signup/signUp.jpg';
import styles from '../signup/signup.module.css';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with:', values);
      
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password
      });

      console.log('Login result:', result);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/CommonDashboard');
      }
    } catch (error) {
      console.error('Login error', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', { 
        callbackUrl: '/CommonDashboard',
        redirect: true 
      });

      if (result?.error) {
        setError(`Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className={styles.container}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
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
            rules={[{ required: true, message: 'Please input your email!' }]}
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
            <Button type="primary" htmlType="submit" block className={styles.submitButton}>
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
