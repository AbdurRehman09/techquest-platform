'use client';

import { useState } from 'react';
import Editor, { OnChange } from "@monaco-editor/react";
import dynamic from 'next/dynamic';
import styles from './compiler.module.css';
import Image from 'next/image';

// Dynamically import Navbar to avoid SSR issues with react-select
const CompilerNavbar = dynamic(() => import('./Compiler_Components/CompilerNavbar'), { ssr: false });

export default function CompilerPage() {
  const [userCode, setUserCode] = useState('');
  const [userLang, setUserLang] = useState("python");
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(20);
  const [userInput, setUserInput] = useState("");
  const [userOutput, setUserOutput] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className={styles.App}>
      <CompilerNavbar
        userLang={userLang} setUserLang={setUserLang}
        userTheme={userTheme} setUserTheme={setUserTheme}
        fontSize={fontSize} setFontSize={setFontSize}
      />
      <div className={styles.main}>
        <div className={styles.leftContainer}>
          <Editor
            options={options}
            height="calc(100vh - 50px)"
            width="100%"
            theme={userTheme}
            language={userLang}
            defaultLanguage="python"
            defaultValue="# Enter your code here"
            onChange={(value: string | undefined) => { setUserCode(value || '') }}
          />
          <button className={styles.runBtn} onClick={() => compile()}>
            Run
          </button>
        </div>
        <div className={styles.rightContainer}>
          <h4>Input:</h4>
          <div className={styles.inputBox}>
            <textarea 
              id="code-inp" 
              onChange={(e) => setUserInput(e.target.value)}
              className={styles.codeInput}
            />
          </div>
          <h4>Output:</h4>
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
              <button 
                onClick={clearOutput}
                className={styles.clearBtn}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
