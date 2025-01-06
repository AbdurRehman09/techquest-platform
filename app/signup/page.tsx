'use client';

import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, Radio, Space, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { signIn, getSession } from 'next-auth/react';
import img from './signUp.jpg';
import styles from './signup.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import bcrypt from 'bcryptjs';
import RoleSelectionModal from '../Components/RoleSelectionModal/RoleSelectionModal';

const SignUpPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);

  const showrolemodal = searchParams?.get('showRoleModal');

  if (showrolemodal === 'true' && !showRoleModal) {
    const hasShownMessage = localStorage.getItem('roleMessageShown');
    if (!hasShownMessage) {
      message.info('Please click "Continue with Google" one more time to select your role', 10);
      localStorage.setItem('roleMessageShown', 'true');
    }
  }
  React.useEffect(() => {
    // Show message only once using localStorage
    

    const session = getSession();
    if (showrolemodal === 'true' && session) {
      session.then((sess) => {
        if (sess?.user?.email) {
          setPendingGoogleUser({ email: sess.user.email });
          setShowRoleModal(true);
        }
      });
    }
  }, [searchParams, showrolemodal, showRoleModal]);

  // Clear the message flag when component unmounts
  React.useEffect(() => {
    return () => {
      localStorage.removeItem('roleMessageShown');
    };
  }, []);

  const onFinish = async (values: any) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          password: values.password,
          provider: 'credentials'
        }),
      });

      if (response.ok) {
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password
        });

        if (signInResult?.error) {
          console.error('Sign in after signup failed:', signInResult.error);
        } else {
          router.push('/CommonDashboard');
        }
      } else {
        const errorData = await response.json();
        console.error('Signup failed', errorData);
      }
    } catch (error) {
      console.error('Signup error', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (result?.error) {
        console.error('Google Sign-In error:', result.error);
      } else if (result?.ok) {
        // Wait for user creation and then check session
        const checkSessionAndShowModal = async () => {
          const session = await getSession();
          console.log('Current session:', session);

          if (session?.user?.email) {
            // Verify user exists in database
            const userResponse = await fetch(`/api/user?email=${session.user.email}`);
            const userData = await userResponse.json();

            if (userData) {
              setPendingGoogleUser({ email: session.user.email });
              setShowRoleModal(true);
            } else {
              // If user not found, try again in 1 second
              setTimeout(checkSessionAndShowModal, 1000);
            }
          } else {
            // If no session, try again in 1 second
            setTimeout(checkSessionAndShowModal, 1000);
          }
        };

        checkSessionAndShowModal();
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  const handleRoleSelection = async (role: string) => {
    try {
      if (!pendingGoogleUser?.email) {
        console.error('No pending user email');
        return;
      }

      const response = await fetch('/api/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingGoogleUser.email,
          role: role === 'teacher' ? 'TEACHER' : 'STUDENT',
        }),
      });

      if (response.ok) {
        // Force session update
        await signIn('google', {
          redirect: true,
          callbackUrl: '/CommonDashboard'
        });
      } else {
        console.error('Failed to update role');
      }
    } catch (error) {
      console.error('Role selection error:', error);
    }
  };

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
          name="basic"
          layout="vertical"
          className={styles.form}
          onFinish={onFinish}
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
              <Input placeholder="Last Name" className={styles.input} style={{ marginLeft: "10px" }} />
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
          <Form.Item className={styles.checkbox} name="role" label="Check valid option" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="teacher">Teacher</Radio>
              <Radio value="student">Student</Radio>
            </Radio.Group>
          </Form.Item>

          <Space size="small">
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[{ required: true, message: 'You must agree to the terms!' }]}
            >

              <Checkbox>
                I agree with TechQuest <a href="#">Terms of Service</a>
              </Checkbox>
            </Form.Item>
          </Space>
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

      <RoleSelectionModal
        isOpen={showRoleModal}
        onSubmit={handleRoleSelection}
      />
    </div>
  );
};

export default SignUpPage;
