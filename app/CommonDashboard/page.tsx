'use client'
import React from 'react';
import { Card, Typography, Button, Row, Col } from 'antd';
import { CodeOutlined, ApartmentOutlined, DatabaseOutlined, FundOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const { Title } = Typography;

const courses = [
  { 
    name: "Programming Fundamentals", 
    icon: <CodeOutlined style={{ fontSize: '48px' }} />,
    path: {
      STUDENT: '/Practise',
      TEACHER: '/TeachersDashboard'
    }
  },
  { 
    name: "Object Oriented Programming", 
    icon: <ApartmentOutlined style={{ fontSize: '48px' }} />,
    path: {
      STUDENT: '/OOPPractise',
      TEACHER: '/OOPTeachersDashboard'
    }
  },
  { 
    name: "Data Structures", 
    icon: <FundOutlined style={{ fontSize: '48px' }} />,
    path: {
      STUDENT: '/DSPractise',
      TEACHER: '/DSTeachersDashboard'
    }
  },
  { 
    name: "Database", 
    icon: <DatabaseOutlined style={{ fontSize: '48px' }} />,
    path: {
      STUDENT: '/DBPractise',
      TEACHER: '/DBTeachersDashboard'
    }
  }
];

const CourseOverview: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleCourseClick = (course: typeof courses[0]) => {
    if (!session?.user?.role) {
      // If not logged in, redirect to login
      router.push('/login');
      return;
    }

    const role = session.user.role as keyof typeof course.path;
    const path = course.path[role];
    console.log(path);
    if (path) {
      router.push(path);
    }
  };

  return (
    <div className="bg-[#e6f7ff] p-8 min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-4">
          <Button 
            type={session?.user?.role === 'STUDENT' ? "primary" : "default"}
          >
            Student
          </Button>
          <Button
            type={session?.user?.role === 'TEACHER' ? "primary" : "default"}
          >
            Teacher
          </Button>
        </div>
        
        <Title level={2} className="text-center mb-8">CS/SE/DS</Title>
        
        <Row gutter={[16, 16]} justify="center">
          {courses.map((course, index) => (
            <Col key={index} xs={24} sm={12} md={6}>
              <Card 
                hoverable 
                className="text-center" 
                onClick={() => handleCourseClick(course)}
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
