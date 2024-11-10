'use client';
import { useState, useRef } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { cppLanguageConfig, setupEditor } from '../utils/editorConfig';
import { CPPStreamHandler } from '../utils/streamHandler';

const Compiler = () => {
  const [code, setCode] = useState<string>(`#include <iostream>
using namespace std;

int main() {
    int number;
    cout << "Enter a number: ";
    cin >> number;
    cout << "You entered: " << number << endl;
    return 0;
}`);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const consoleInputRef = useRef<HTMLInputElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const streamHandler = useRef(new CPPStreamHandler());

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleInputSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isWaitingForInput) {
      e.preventDefault();
      const input = currentInput.trim();
      streamHandler.current.pushInput(input);

      try {
        const allInputs = streamHandler.current.getAllInputs();
        const response = await axios.post('/api/compile', {
          encodedCppCode: Buffer.from(code).toString('base64'),
          language: 52,
          stdin: Buffer.from(allInputs).toString('base64')
        });

        const output = response.data.stdout
          ? Buffer.from(response.data.stdout, 'base64').toString('utf-8')
          : Buffer.from(response.data.stderr, 'base64').toString('utf-8');

        streamHandler.current.reset();
        streamHandler.current.pushOutput(output);
        setConsoleOutput(streamHandler.current.getFormattedOutput());
        setCurrentInput('');
        setIsWaitingForInput(streamHandler.current.isWaitingForInput());
      } catch (error: any) {
        setConsoleOutput(prev => [...prev, `Error: ${error.message}`]);
        setIsWaitingForInput(false);
      }
    }
  };

  const handleCompile = async () => {
    setIsRunning(true);
    streamHandler.current.reset();
    setConsoleOutput([]);

    try {
      const response = await axios.post('/api/compile', {
        encodedCppCode: Buffer.from(code).toString('base64'),
        language: 52,
        stdin: ''
      });

      if (response.data.compile_output) {
        const compileError = Buffer.from(response.data.compile_output, 'base64').toString('utf-8');
        setConsoleOutput([compileError]);
        return;
      }

      const output = response.data.stdout
        ? Buffer.from(response.data.stdout, 'base64').toString('utf-8')
        : Buffer.from(response.data.stderr, 'base64').toString('utf-8');

      streamHandler.current.pushOutput(output);
      setConsoleOutput(streamHandler.current.getFormattedOutput());

      if (streamHandler.current.isWaitingForInput()) {
        setIsWaitingForInput(true);
        consoleInputRef.current?.focus();
      }
    } catch (error: any) {
      setConsoleOutput([`Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setupEditor(editor, monaco);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 flex">
        <div className="w-2/3 p-4">
          <Editor
            height="90vh"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              suggestOnTriggerCharacters: true,
              parameterHints: { enabled: true },
              suggest: { enabled: true },
              quickSuggestions: true,
            }}
          />
        </div>
        <div className="w-1/3 p-4">
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-black text-white font-mono p-4 rounded-t overflow-auto">
              {consoleOutput.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {isWaitingForInput && (
                <div className="flex items-center">
                  <span className="text-green-500">{'>'}</span>
                  <input
                    ref={consoleInputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleInputSubmit}
                    className="flex-1 bg-transparent border-none outline-none ml-2"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleCompile}
              disabled={isRunning || isWaitingForInput}
              className={`mt-2 px-6 py-2 rounded ${isRunning || isWaitingForInput
                ? 'bg-gray-400'
                : 'bg-blue-500 hover:bg-blue-600'
                } text-white font-semibold`}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;
