import { useState } from 'react'
import { gql, useQuery, useLazyQuery } from '@apollo/client'

interface Subject {
  id: number
  name: string
  topics: Topic[]
}

interface Topic {
  id: number
  name: string
}

interface Question {
  id: number
  description: string
  difficulty: string
}

interface SubjectsData {
  subjects: Subject[]
}

interface QuizData {
  generateQuiz: {
    id: number
    duration: number
    questions: Question[]
  }
}

const GET_SUBJECTS = gql`
  query GetSubjects {
    subjects {
      id
      name
      topics {
        id
        name
      }
    }
  }
`

const GENERATE_QUIZ = gql`
  query GenerateQuiz($topicId: Int!, $duration: Int!) {
    generateQuiz(topicId: $topicId, duration: $duration) {
      id
      duration
      questions {
        id
        description
        difficulty
      }
    }
  }
`

export default function QuizGenerator() {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null)
  const { data: subjectsData } = useQuery<SubjectsData>(GET_SUBJECTS)
  const [generateQuiz, { data: quizData }] = useLazyQuery<QuizData>(GENERATE_QUIZ)

  const handleGenerateQuiz = () => {
    generateQuiz({
      variables: {
        topicId: selectedTopic,
        duration: 30 // 30 minutes default
      }
    })
  }

  return (
    <div>
      <h1>Generate Quiz</h1>
      
      <select onChange={(e) => setSelectedTopic(parseInt(e.target.value))}>
        <option value="">Select Topic</option>
        {subjectsData?.subjects.map(subject => (
          subject.topics.map(topic => (
            <option key={topic.id} value={topic.id}>
              {subject.name} - {topic.name}
            </option>
          ))
        ))}
      </select>

      <button onClick={handleGenerateQuiz}>
        Generate Quiz
      </button>

      {quizData && (
        <div>
          <h2>Quiz Questions:</h2>
          {quizData.generateQuiz.questions.map(question => (
            <div key={question.id}>
              <p>{question.description}</p>
              <p>Difficulty: {question.difficulty}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
