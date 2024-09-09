'use client';

import { useState } from 'react';
import axios from 'axios';

const Compiler = () => {
  const [code, setCode] = useState<string>(`
    #include <iostream>
    using namespace std;
    
    int main() {
        cout << "hello world!"<< endl;
        return 0;
    }
  `);
  
    const [numberInput, setNumberInput] = useState<string>(''); // State for user input
    const [output, setOutput] = useState<string | null>(null);

  const handleCompile = async () => {

    const encodedCppCode = Buffer.from(code).toString('base64'); // Encode the code here
    const encodedStdin = Buffer.from(numberInput).toString('base64');
    try {
      const response = await axios.post('/api/compile', {
        encodedCppCode,
        language:52,
        stdin: encodedStdin // For example, 63 is the language ID for JavaScript
      });
      const decodedOutput = response.data.stdout
        ? Buffer.from(response.data.stdout, 'base64').toString('utf-8')
        : Buffer.from(response.data.stderr, 'base64').toString('utf-8');

      setOutput(decodedOutput);
    } catch (error: any) {
      // Check if error.response exists, otherwise log the full error
      if (error.response) {
        // The request was made, and the server responded with a status code
        // that falls out of the range of 2xx
        setOutput(`Error: ${error.response.data.message || error.response.data}`);
        console.error('Error Response:', error.response);
      } else if (error.request) {
        // The request was made but no response was received
        setOutput('No response received from server');
        console.error('Error Request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setOutput(`Request error: ${error.message}`);
        console.error('General Error:', error.message);
      }
    }

  };

  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        cols={50}
      />
      <button onClick={handleCompile}>Compile</button>
      <pre>{output}</pre>
    </div>
  );
};

export default Compiler;
