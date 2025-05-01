"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import { message, Spin, Result, Button } from "antd";
import { useSession } from "next-auth/react";

const VERIFY_AND_CLAIM_QUIZ = gql`
  mutation VerifyAndClaimQuiz($shareableLink: String!) {
    claimQuizAssignment(shareableLink: $shareableLink) {
      id
      quizzes {
        id
        title
        type
        subject {
          name
        }
        topics {
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

export default function QuizAssignmentPage({
  params,
}: {
  params: { shareableLink: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<boolean>(false);
  const messageShown = useRef(false);

  const [verifyAndClaimQuiz, { loading }] = useMutation(VERIFY_AND_CLAIM_QUIZ, {
    onCompleted: (data) => {
      if (data.claimQuizAssignment && !messageShown.current) {
        messageShown.current = true;
        message.success(
          `Quiz "${data.claimQuizAssignment.quizzes.title}" has been assigned to you!`
        );
        router.push("/Practise?tab=assigned");
      }
    },
    onError: (error) => {
      // Check if error is about already being assigned
      if (
        error.message.includes("already been assigned") &&
        !messageShown.current
      ) {
        messageShown.current = true;
        message.info(
          "You have already been assigned this quiz. Redirecting to your assigned quizzes."
        );
        setTimeout(() => {
          router.push("/Practise?tab=assigned");
        }, 2000);
      } else {
        setError(error.message);
      }
    },
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(`/login?callbackUrl=/quiz/assign/${params.shareableLink}`);
      return;
    }

    // Check if user is a student
    if (session.user?.role !== "STUDENT") {
      setRoleError(true);
      return;
    }

    if (!messageShown.current) {
      verifyAssignment();
    }
  }, [session, status]);

  const verifyAssignment = async () => {
    try {
      await verifyAndClaimQuiz({
        variables: {
          shareableLink: params.shareableLink,
        },
      });
    } catch (error) {
      // Error is handled in the onError callback
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (roleError) {
    return (
      <Result
        status="error"
        title="Access Denied"
        subTitle="Teachers cannot use quiz assignment links. Only students can access assigned quizzes."
        extra={[
          <Button
            type="primary"
            key="dashboard"
            onClick={() => router.push("/CommonDashboard")}
          >
            Go to Dashboard
          </Button>,
        ]}
      />
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Failed to verify quiz assignment"
        subTitle={error}
        extra={[
          <Button
            type="primary"
            key="dashboard"
            onClick={() => router.push("/CommonDashboard")}
          >
            Go to Dashboard
          </Button>,
        ]}
      />
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Spin size="large" tip="Verifying quiz assignment..." />
    </div>
  );
}
