import { NextRequest, NextResponse } from 'next/server';

const languageMap = {
  "c": { language: "c", version: "10.2.0" },
  "cpp": { language: "c++", version: "10.2.0" },
  "python": { language: "python", version: "3.10.0" },
  "java": { language: "java", version: "15.0.2" }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, input } = body;

    if (!languageMap[language as keyof typeof languageMap]) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
    }

    const data = {
      "language": languageMap[language as keyof typeof languageMap].language,
      "version": languageMap[language as keyof typeof languageMap].version,
      "files": [
        {
          "name": "main",
          "content": code
        }
      ],
      "stdin": input
    };

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return NextResponse.json(result.run);

  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 
