'use client'
import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Space, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import QuizzesList from '../Components/QuizzesList/page';
import AssignedQuizzes from '../Components/AssignedQuizzes/page';
import { gql, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';


const GET_USER_ID = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
    }
  }
`;

const { Title, Paragraph } = Typography;


const TechQuestPortal = () => {
    const searchParams = useSearchParams();

    // Determine the active tab from URL or prop
    const urlTab = searchParams?.get('tab');
    const [activeTab, setActiveTab] = useState(urlTab || 'quizzes');

    // Update active tab if URL changes
    useEffect(() => {
        if (urlTab) {
            setActiveTab(urlTab);
        }
    }, [urlTab]);

    

    const renderContent = () => {
        const { data: session } = useSession();

        // Get database user ID using email
        const { data: userData } = useQuery(GET_USER_ID, {
            variables: { email: session?.user?.email },
            skip: !session?.user?.email
        });

        if (!userData?.getUserByEmail?.id) {
            return <div>Loading...</div>;
        }
        switch (activeTab) {
                   
            case 'quizzes':
                return (
                    <>
                        <Title level={3}>Quizzes</Title>
                        <QuizzesList showAssignButton={false} type="REGULAR" userId={userData.getUserByEmail.id} />
                    </>
                );
            case 'assigned':
                return (
                    <>
                        <Title level={3}>Assigned Quizzes</Title>
                        <AssignedQuizzes />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-4" style={{ backgroundColor: "#c5e4f0" }}>
            <div className="flex mb-4">
                {['Quizzes', 'Assigned'].map((tab) => (
                    <Button
                        key={tab}
                        type={activeTab === tab.toLowerCase() ? "primary" : "default"}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className="mr-4"
                    >
                        {tab}
                    </Button>
                ))}
            </div>
            {renderContent()}
        </div>
    );
};

export default TechQuestPortal;
