"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { gql, useQuery, useMutation } from "@apollo/client";
import Editor, { OnChange } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import styles from "./compiler.module.css";
import Image from "next/image";
import { Button, Progress, Modal, Spin } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Split from "split.js";
import { useRouter } from "next/navigation";
import { message } from "antd";

// Dynamically import Navbar to avoid SSR issues with react-select
const CompilerNavbar = dynamic(
  () => import("./Compiler_Components/CompilerNavbar"),
  { ssr: false }
);

const GET_QUIZ_QUESTIONS = gql`
  query GetQuizQuestions($quizId: Int!) {
    quizQuestions(quizId: $quizId) {
      id
      description
      difficulty
    }
  }
`;

// Add new GraphQL query to get quiz owner's email
const GET_QUIZ_OWNER_EMAIL = gql`
  query GetQuizOwnerEmail($quizId: Int!) {
    quizOwnerEmail(quizId: $quizId)
  }
`;

// Add GraphQL mutations
const START_QUIZ = gql`
  mutation StartQuiz($quizId: Int!) {
    startQuiz(quizId: $quizId) {
      id
      start_time
      finished_at
      title
    }
  }
`;

const FINISH_QUIZ = gql`
  mutation FinishQuiz($quizId: Int!) {
    finishQuiz(quizId: $quizId) {
      id
      start_time
      finished_at
      title
    }
  }
`;

// Add new GraphQL mutation
const RESET_FINISHED_AT = gql`
  mutation ResetQuizFinishedAt($quizId: Int!) {
    resetQuizFinishedAt(quizId: $quizId) {
      id
      start_time
      finished_at
      title
    }
  }
`;

export default function CompilerPage() {
  const [userCode, setUserCode] = useState("");
  const [userLang, setUserLang] = useState("python");
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(20);
  const [userInput, setUserInput] = useState("");
  const [userOutput, setUserOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // New states for quiz functionality
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempted, setAttempted] = useState(0);

  // Add new state for timer
  const [isPaused, setIsPaused] = useState(false);

  // New states for code submission and evaluation
  const [submittedQuestions, setSubmittedQuestions] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);

  const searchParams = useSearchParams();
  const quizId = Number(searchParams?.get("quizId") || "0");

  const {
    loading: questionsLoading,
    error: questionsError,
    data: questionsData,
  } = useQuery(GET_QUIZ_QUESTIONS, {
    variables: { quizId },
    skip: quizId === 0,
  });

  // Query to get quiz owner's email
  const { data: ownerData } = useQuery(GET_QUIZ_OWNER_EMAIL, {
    variables: { quizId },
    skip: quizId === 0,
  });

  // Fetch quiz details to get duration
  const { loading: quizLoading, data: quizData } = useQuery(
    gql`
      query GetQuizDetails($quizId: Int!) {
        quizDetails(quizId: $quizId) {
          duration
        }
      }
    `,
    {
      variables: { quizId },
      skip: quizId === 0,
      onCompleted: (data) => {
        // Set timer based on quiz duration (convert minutes to seconds)
        setTimeLeft(data.quizDetails.duration * 60);
      },
    }
  );

  const questions = questionsData?.quizQuestions || [];
  const currentQuestionData = questions[currentQuestion];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {
      // Check if timer is not paused
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isPaused]); // Add isPaused to dependencies

  // Format time function
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const options = {
    fontSize: fontSize,
  };

  const router = useRouter();

  async function compile() {
    setLoading(true);
    if (userCode === "") {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: userCode,
          language: userLang,
          input: userInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Compilation failed");
      }

      setUserOutput(data.stdout || data.stderr);
    } catch (error: any) {
      console.error("Compilation error:", error);
      setUserOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function clearOutput() {
    setUserOutput("");
  }

  const handleEditorChange: OnChange = (value) => {
    setUserCode(value || "");
  };

  // Update question content when currentQuestion changes
  useEffect(() => {
    if (currentQuestionData) {
      setUserCode(""); // Reset code for new question
      setUserOutput(""); // Reset output
    }
  }, [currentQuestionData]);

  // Add timer control functions
  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  // Add editor container ref
  const editorRef = useRef(null);

  // Add onMount handler
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Add ref for split containers
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const ioContainerRef = useRef<HTMLDivElement>(null);

  // Initialize split on mount
  useEffect(() => {
    if (editorContainerRef.current && ioContainerRef.current) {
      Split([editorContainerRef.current, ioContainerRef.current], {
        direction: "vertical",
        sizes: [70, 30],
        minSize: [200, 200],
        gutterSize: 6,
        cursor: "row-resize",
      });
    }
  }, []);

  // Add mutations
  const [startQuiz] = useMutation(START_QUIZ);
  const [finishQuiz] = useMutation(FINISH_QUIZ);
  const [resetFinishedAt] = useMutation(RESET_FINISHED_AT);

  // Modify useEffect to start quiz automatically when first loaded
  useEffect(() => {
    if (quizId && questionsData) {
      try {
        startQuiz({
          variables: { quizId },
          // Optional: handle success/error
          onError: (error) => {
            console.error("Error starting quiz:", error);
          },
        });
      } catch (error) {
        console.error("Mutation error:", error);
      }
    }
  }, [quizId, questionsData]);

  // Function to submit current question
  const submitCurrentQuestion = () => {
    if (!userCode.trim()) {
      message.warning("Please write some code before submitting");
      return;
    }

    if (!currentQuestionData) {
      message.error("No question selected");
      return;
    }

    setIsSubmitting(true);

    // Store the submission
    setSubmittedQuestions((prev) => ({
      ...prev,
      [currentQuestionData.id]: userCode,
    }));

    // Update attempted count if this is a new submission
    if (!submittedQuestions[currentQuestionData.id]) {
      setAttempted((prev) => prev + 1);
    }

    // Show success message with a slight delay to avoid UI conflicts
    setTimeout(() => {
      message.success(
        `Question ${currentQuestion + 1} submitted successfully!`
      );
      setIsSubmitting(false);
    }, 300);
  };

  // Function to evaluate all submissions with Gemini
  const evaluateSubmissions = async () => {
    if (Object.keys(submittedQuestions).length === 0) {
      message.warning("No questions have been submitted for evaluation");
      return;
    }

    setIsEvaluating(true);
    setEvaluationModalVisible(true);

    try {
      // Get owner's email from the query
      const ownerEmail = ownerData?.quizOwnerEmail;

      if (!ownerEmail) {
        throw new Error("Could not determine quiz owner email");
      }

      // Prepare submissions for evaluation
      const evaluationRequests = Object.entries(submittedQuestions).map(
        ([questionId, code]) => {
          const question = questions.find(
            (q: { id: number }) => q.id === parseInt(questionId)
          );

          return {
            questionId: parseInt(questionId),
            questionText: question?.description || "Unknown question",
            code,
            language: userLang,
          };
        }
      );

      // Send to API for Gemini evaluation
      const response = await fetch("/api/evaluate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId,
          submissions: evaluationRequests,
          ownerEmail,
          language: userLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to evaluate submissions");
      }

      // Handle successful evaluation - close modal first, then show success message
      setEvaluationModalVisible(false);

      // Small delay before showing success message and finishing quiz
      setTimeout(async () => {
        message.success("Quiz evaluation completed and sent to instructor!");

        // Continue with finishing the quiz
        await finishQuiz({
          variables: { quizId },
          onCompleted: () => {
            // Redirect after a delay to allow user to see the success message
            setTimeout(() => {
              router.push("/Practise?tab=quizzes");
            }, 2000);
          },
        });
      }, 500);
    } catch (error: any) {
      console.error("Evaluation error:", error);
      setEvaluationModalVisible(false);

      // Show error message after modal is closed
      setTimeout(() => {
        message.error(`Evaluation failed: ${error.message}`);
      }, 300);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Update Finish Quiz button handler to include evaluation
  const handleFinishQuiz = async () => {
    // Check if any questions were submitted
    if (Object.keys(submittedQuestions).length === 0) {
      Modal.confirm({
        title: "No submissions detected",
        content:
          "You have not submitted any questions. Are you sure you want to finish the quiz?",
        okText: "Yes, finish quiz",
        cancelText: "No, continue quiz",
        onOk: async () => {
          await finishQuiz({
            variables: { quizId },
            onCompleted: () => {
              router.push("/Practise?tab=quizzes");
            },
          });
        },
      });
      return;
    }

    // If there are submissions, evaluate them
    Modal.confirm({
      title: "Finish Quiz and Submit for Evaluation",
      content: (
        <div>
          <p>
            You have submitted {Object.keys(submittedQuestions).length} out of{" "}
            {questions.length} questions.
          </p>
          <p>
            Your submissions will be evaluated by AI and the results will be
            sent at {ownerData?.quizOwnerEmail}.
          </p>
          <p>Continue?</p>
        </div>
      ),
      icon: <CheckCircleOutlined style={{ color: "#1890ff" }} />,
      okText: "Yes, evaluate and submit",
      cancelText: "No, continue quiz",
      onOk: evaluateSubmissions,
    });
  };

  return (
    <div className={styles.App}>
      <CompilerNavbar
        userLang={userLang}
        setUserLang={setUserLang}
        userTheme={userTheme}
        setUserTheme={setUserTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      <div className={styles.quizContainer}>
        {/* Left Section - Question Navigation */}
        <div className={styles.questionNav}>
          <div className={styles.timerSection}>
            <div className={styles.timerControls}>
              <div className={styles.timer}>
                {quizLoading ? "Loading..." : formatTime(timeLeft)}
              </div>
              <Button
                type="primary"
                onClick={handlePauseResume}
                disabled={quizLoading}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
            </div>
            <div className={styles.progress}>
              <span>Total Questions: {questions.length}</span>
              <span>Attempted: {attempted}</span>
              <Progress
                percent={(attempted / questions.length) * 100}
                status="active"
                strokeColor="#afec3f"
              />
            </div>
          </div>
          <div className={styles.questionContent}>
            <h3>Question {currentQuestion + 1}</h3>
            {questionsLoading ? (
              <p>Loading question...</p>
            ) : questionsError ? (
              <p>Error loading question</p>
            ) : currentQuestionData ? (
              <>
                <p>{currentQuestionData.description}</p>
                <div className={styles.questionMeta}>
                  <span>Difficulty: {currentQuestionData.difficulty}</span>
                  {submittedQuestions[currentQuestionData.id] && (
                    <span className={styles.submittedBadge}>
                      <CheckCircleOutlined /> Submitted
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p>No question found</p>
            )}
          </div>
          <div className={styles.navigation}>
            <Button
              type="primary"
              icon={<LeftOutlined />}
              onClick={() =>
                setCurrentQuestion((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              type="primary"
              onClick={submitCurrentQuestion}
              disabled={!currentQuestionData || isSubmitting}
            >
              Submit Question
            </Button>
            <Button
              type="primary"
              icon={<RightOutlined />}
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              disabled={currentQuestion === questions.length - 1}
            >
              Next
            </Button>
          </div>
          <Button
            type="primary"
            danger
            className={styles.finishBtn}
            onClick={handleFinishQuiz}
            disabled={isEvaluating}
          >
            {isEvaluating ? "Evaluating..." : "Finish Quiz"}
          </Button>
        </div>

        {/* Right Section - Editor with Input/Output */}
        <div className={styles.mainSection}>
          <div ref={editorContainerRef} className={styles.editorSection}>
            <Editor
              options={options}
              height="100%"
              width="100%"
              theme={userTheme}
              language={userLang}
              defaultLanguage="python"
              defaultValue="# Enter your code here"
              onChange={(value: string | undefined) => {
                setUserCode(value || "");
              }}
              onMount={handleEditorDidMount}
              key={currentQuestion}
            />
          </div>

          <div ref={ioContainerRef} className={styles.ioSection}>
            <div className={styles.ioContainer}>
              <h4 className={styles.sectionHeader}>Input:</h4>
              <textarea
                onChange={(e) => setUserInput(e.target.value)}
                className={styles.codeInput}
              />
            </div>
            <div className={styles.ioContainer}>
              <h4
                className={styles.sectionHeader}
                style={{ paddingTop: "10px" }}
              >
                Output:
              </h4>
              {loading ? (
                <div className={styles.spinnerBox}>
                  <Image
                    src="/spinner.svg"
                    alt="Loading..."
                    width={200}
                    height={200}
                  />
                </div>
              ) : (
                <div className={styles.outputBox}>
                  <pre>{userOutput}</pre>
                </div>
              )}
            </div>
            <div className={styles.buttonGroup}>
              <Button type="primary" onClick={() => compile()}>
                Run
              </Button>
              <Button type="primary" onClick={() => setUserOutput("")}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
