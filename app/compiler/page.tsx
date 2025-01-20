'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import Editor, { OnChange } from "@monaco-editor/react";
import dynamic from 'next/dynamic';
import styles from './compiler.module.css';
import Image from 'next/image';
import { Button, Progress } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Split from 'split.js';

// Dynamically import Navbar to avoid SSR issues with react-select
const CompilerNavbar = dynamic(() => import('./Compiler_Components/CompilerNavbar'), { ssr: false });

const GET_QUIZ_QUESTIONS = gql`
  query GetQuizQuestions($quizId: Int!) {
    quizQuestions(quizId: $quizId) {
      id
      description
      difficulty
    }
  }
`;

export default function CompilerPage() {
  const [userCode, setUserCode] = useState('');
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

  const searchParams = useSearchParams();
  const quizId = Number(searchParams?.get('quizId') || '0');
  
  const { loading: questionsLoading, error: questionsError, data: questionsData } = useQuery(
    GET_QUIZ_QUESTIONS,
    {
      variables: { quizId },
      skip: quizId === 0
    }
  );

  // Fetch quiz details to get duration
  const { loading: quizLoading, data: quizData } = useQuery(gql`
    query GetQuizDetails($quizId: Int!) {
      quizDetails(quizId: $quizId) {
        duration
      }
    }
  `, {
    variables: { quizId },
    skip: quizId === 0,
    onCompleted: (data) => {
      // Set timer based on quiz duration (convert minutes to seconds)
      setTimeLeft(data.quizDetails.duration * 60);
    }
  });

  const questions = questionsData?.quizQuestions || [];
  const currentQuestionData = questions[currentQuestion];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {  // Check if timer is not paused
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isPaused]);  // Add isPaused to dependencies

  // Format time function
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const options = {
    fontSize: fontSize
  }

  async function compile() {
    setLoading(true);
    if (userCode === '') {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: userCode,
          language: userLang,
          input: userInput
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Compilation failed');
      }

      setUserOutput(data.stdout || data.stderr);
    } catch (error: any) {
      console.error('Compilation error:', error);
      setUserOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function clearOutput() {
    setUserOutput("");
  }

  const handleEditorChange: OnChange = (value) => {
    setUserCode(value || '');
  };

  // Update question content when currentQuestion changes
  useEffect(() => {
    if (currentQuestionData) {
      setUserCode(''); // Reset code for new question
      setUserOutput(''); // Reset output
    }
  }, [currentQuestionData]);

  // Add timer control functions
  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
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
        direction: 'vertical',
        sizes: [70, 30],
        minSize: [200, 200],
        gutterSize: 6,
        cursor: 'row-resize'
      });
    }
  }, []);

  return (
    <div className={styles.App}>
      <CompilerNavbar
        userLang={userLang} setUserLang={setUserLang}
        userTheme={userTheme} setUserTheme={setUserTheme}
        fontSize={fontSize} setFontSize={setFontSize}
      />
      <div className={styles.quizContainer}>
        {/* Left Section - Question Navigation */}
        <div className={styles.questionNav}>
          <div className={styles.timerSection}>
            <div className={styles.timerControls}>
              <div className={styles.timer}>
                {quizLoading ? 'Loading...' : formatTime(timeLeft)}
              </div>
              <Button 
                type="primary"
                onClick={handlePauseResume}
                disabled={quizLoading}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
            <div className={styles.progress}>
              <span>Total Questions: {questions.length}</span>
              <span>Attempted: {attempted}</span>
              <Progress 
                percent={(attempted/questions.length) * 100} 
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
                </div>
              </>
            ) : (
              <p>No question found</p>
            )}
          </div>
          <div className={styles.navigation}>
            <Button 
              type='primary'
              icon={<LeftOutlined />} 
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button 
              type='primary'
              icon={<RightOutlined />} 
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestion === questions.length - 1}
            >
              Next
            </Button>
          </div>
          <Button 
            type="primary" 
            danger
            className={styles.finishBtn}
            onClick={() => {/* Handle finish quiz */}}
          >
            Finish Quiz
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
              onChange={(value: string | undefined) => { setUserCode(value || '') }}
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
              <h4 className={styles.sectionHeader} style={{paddingTop: '10px'}}>Output:</h4>
              {loading ? (
                <div className={styles.spinnerBox}>
                  <Image src="/spinner.svg" alt="Loading..." width={200} height={200} />
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
