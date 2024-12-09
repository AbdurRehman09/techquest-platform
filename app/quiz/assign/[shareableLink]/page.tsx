'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import { message, Spin } from 'antd';
import { useSession } from 'next-auth/react';

const VERIFY_AND_CLAIM_QUIZ = gql`
  mutation VerifyAndClaimQuiz($shareableLink: String!) {
    claimQuizAssignment(shareableLink: $shareableLink) {
      id
      isUsed
      quizzes {
        id
        title
        type
        subject {
          name
        }
        topic {
          name
        }
      }
      users {
        id
        email
      }
    }
  }
`;

export default function QuizAssignmentPage({ params }: { params: { shareableLink: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  const [verifyAndClaimQuiz, { loading }] = useMutation(VERIFY_AND_CLAIM_QUIZ, {
    onCompleted: (data) => {
      if (data.claimQuizAssignment) {
        message.success(`Quiz "${data.claimQuizAssignment.quizzes.title}" has been assigned to you!`);
        router.push('/Practise?tab=assigned');
      }
    },
    onError: (error) => {
      setError(error.message);
      message.error(error.message);
      // Redirect to practice page after showing error
      setTimeout(() => router.push('/Practise'), 3000);
    }
  });

  useEffect(() => {
    const verifyAssignment = async () => {
      if (status === 'loading') return;

      if (!session?.user) {
        setError('Please login to access this quiz');
        router.push('/login');
        return;
      }

      try {
        await verifyAndClaimQuiz({
          variables: { shareableLink: params.shareableLink }
        });
      } catch (error) {
        // Error will be handled by onError callback
      }
    };

    verifyAssignment();
  }, [params.shareableLink, verifyAndClaimQuiz, session, status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Verifying quiz assignment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <div className="text-gray-500">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spin size="large" tip="Processing quiz assignment..." />
    </div>
  );
} 
