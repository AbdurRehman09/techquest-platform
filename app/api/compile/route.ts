import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { encodedCppCode, language,stdin } = await req.json();

  try {
    // Step 1: Submit the code and get the token
    const submissionResponse = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions',
      {
        source_code: encodedCppCode,
        language_id: language,
        stdin: stdin,
      },
      {
        params: {
          base64_encoded: 'true',
          wait: 'false',
          fields: '*',
        },
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      }
    );

    const token = submissionResponse.data.token;
    console.log('Submission Token:', token);

    // Step 2: Poll for the result using the token
    let resultResponse;
    while (true) {
      resultResponse = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        {
          params: {
            base64_encoded: 'true',
            fields: '*',
          },
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      );

      if (resultResponse.data.status.id !== 1 && resultResponse.data.status.id !== 2) {
        // If the status is not "In Queue" or "Processing"
        break;
      }

      // Wait for a short time before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Return the result to the client
    return NextResponse.json(resultResponse.data);
  } catch (error) {
    console.error('Error in compilation process:', error);
    return NextResponse.json({ error: 'Error compiling code' }, { status: 500 });
  }
}
