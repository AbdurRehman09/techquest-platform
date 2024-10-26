import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { encodedCppCode, language, stdin } = await req.json();

  try {
    const submissionResponse = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions',
      {
        source_code: encodedCppCode,
        language_id: language,
        stdin: stdin,
        expected_output: null,
        cpu_time_limit: 2,
        cpu_extra_time: 0.5,
        wall_time_limit: 5,
        memory_limit: 128000,
        stack_limit: 64000,
        enable_per_process_and_thread_time_limit: false,
        enable_per_process_and_thread_memory_limit: false,
        max_file_size: 1024
      },
      {
        params: {
          base64_encoded: 'true',
          wait: 'true',
        },
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      }
    );

    const { stdout, stderr, compile_output, status } = submissionResponse.data;
    return NextResponse.json({ stdout, stderr, compile_output, status });
  } catch (error) {
    console.error('Error in compilation process:', error);
    return NextResponse.json({ error: 'Error compiling code' }, { status: 500 });
  }
}
