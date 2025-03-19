import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLIENT_ID || "");

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SubmissionData {
  questionId: number;
  questionText: string;
  code: string;
  language: string;
}

interface EvaluationRequest {
  quizId: number;
  submissions: SubmissionData[];
  ownerEmail: string;
  language: string;
}

interface EvaluationResult {
  questionId: number;
  questionText: string;
  code: string;
  evaluation: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: EvaluationRequest = await request.json();
    const { quizId, submissions, ownerEmail, language } = data;

    if (
      !submissions ||
      !Array.isArray(submissions) ||
      submissions.length === 0
    ) {
      return NextResponse.json(
        { error: "No submissions provided" },
        { status: 400 }
      );
    }

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "Owner email is required" },
        { status: 400 }
      );
    }

    // Evaluate each submission with Gemini
    const evaluationResults = await Promise.all(
      submissions.map(async (submission) => {
        const result = await evaluateWithGemini(submission, quizId);
        return {
          questionId: submission.questionId,
          questionText: submission.questionText,
          code: submission.code,
          evaluation: result,
        };
      })
    );

    // Send email with evaluation results
    await sendEvaluationEmail(ownerEmail, quizId, evaluationResults, language);

    return NextResponse.json({
      success: true,
      message: "Evaluation completed and sent to instructor",
    });
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate submissions" },
      { status: 500 }
    );
  }
}

async function evaluateWithGemini(submission: SubmissionData, quizId: number) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Fetch the rubric settings for this quiz
    const prisma = new PrismaClient();
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        rubricType: true,
        customRubric: true,
      },
    });

    // Default prompt if no custom rubric exists
    let promptText = `
You are an expert programming instructor evaluating a student's code submission for a programming quiz.

QUESTION:
${submission.questionText}

STUDENT'S CODE (${submission.language}):
\`\`\`${submission.language}
${submission.code}
\`\`\`

Please evaluate this code on a scale of 1-5, where:
1 = Completely incorrect, does not compile or run
2 = Major issues, partially addresses the problem but with significant errors
3 = Works but has some issues or inefficiencies
4 = Good solution with minor improvements possible
5 = Excellent, optimal solution

Your evaluation should include:
1. Score (1-5)
2. Correctness: Does the code correctly solve the problem?
3. Efficiency: Is the algorithm efficient? Any performance concerns?
4. Code quality: Is the code well-structured, readable, and maintainable?
5. Specific issues: Point out any bugs or errors
6. Suggestions: How could the code be improved?

Format your response as follows:
Score: [1-5]
Correctness: [Your assessment]
Efficiency: [Your assessment]
Code Quality: [Your assessment]
Issues: [List specific issues]
Suggestions: [Your recommendations]
`;

    // If there's a custom rubric, use it instead
    if (quiz?.rubricType === "custom" && quiz?.customRubric) {
      promptText = `
You are an expert programming instructor evaluating a student's code submission for a programming quiz.

QUESTION:
${submission.questionText}

STUDENT'S CODE (${submission.language}):
\`\`\`${submission.language}
${submission.code}
\`\`\`

EVALUATION INSTRUCTIONS:
${quiz.customRubric}
`;
    }

    const result = await model.generateContent(promptText);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return `Error evaluating submission: ${error.message}`;
  }
}

async function sendEvaluationEmail(
  ownerEmail: string,
  quizId: number,
  evaluations: EvaluationResult[],
  language: string
) {
  const emailSubject = `Quiz #${quizId} - Student Submission Evaluation`;

  // Create HTML content for email
  let emailContent = `
    <h1>Quiz #${quizId} Evaluation Results</h1>
    <p>A student has completed the quiz and their submissions have been evaluated by AI.</p>
    <p>Language: ${language}</p>
    <hr>
  `;

  // Add each evaluation to the email
  evaluations.forEach((evaluation, index) => {
    emailContent += `
      <h2>Question ${index + 1}: ${evaluation.questionText}</h2>
      <h3>Student's Code:</h3>
      <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
${evaluation.code}
      </pre>
      <h3>AI Evaluation:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin-bottom: 20px;">
        <pre>${evaluation.evaluation}</pre>
      </div>
      <hr>
    `;
  });

  // Add footer
  emailContent += `
    <p>This is an automated evaluation. You may want to review the submissions yourself.</p>
  `;

  // Send the email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: ownerEmail,
    subject: emailSubject,
    html: emailContent,
  });
}
