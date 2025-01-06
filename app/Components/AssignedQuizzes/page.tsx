'use client'
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import QuizzesList from '../QuizzesList/page';

// Get user ID from email query
const GET_USER_ID = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
    }
  }
`;

const AssignedQuizzes = () => {
  const { data: session } = useSession();

  // Get database user ID using email
  const { data: userData } = useQuery(GET_USER_ID, {
    variables: { email: session?.user?.email },
    skip: !session?.user?.email
  });

  if (!userData?.getUserByEmail?.id) {
    return <div>Loading...</div>;
  }

  return (
    <QuizzesList
      showAssignButton={false}
      type="ASSIGNED"
      userId={userData.getUserByEmail.id}
      showCreateButton={false}
    />
  );
};

export default AssignedQuizzes; 
