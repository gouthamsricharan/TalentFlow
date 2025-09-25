import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText } from 'lucide-react';
import { getCandidate } from '../db/candidates';
import { getAssessment, getResponse } from '../db/assessments';

const AssessmentResults = () => {
  const { candidateId, assessmentId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [response, setResponse] = useState(null);
  const [results, setResults] = useState({ correct: 0, wrong: 0, total: 0 });

  useEffect(() => {
    loadData();
  }, [candidateId, assessmentId]);

  const loadData = async () => {
    try {
      console.log('Loading results for:', { candidateId, assessmentId });
      const candidateData = await getCandidate(parseInt(candidateId));
      const assessmentData = await getAssessment(parseInt(assessmentId));
      const responseData = await getResponse(parseInt(candidateId), parseInt(assessmentId));

      console.log('Loaded data:', { 
        candidate: !!candidateData, 
        assessment: !!assessmentData, 
        response: !!responseData 
      });

      setCandidate(candidateData);
      setAssessment(assessmentData);
      setResponse(responseData);

      if (assessmentData && responseData) {
        calculateResults(assessmentData, responseData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateResults = (assessment, response) => {
    let correct = 0;
    let wrong = 0;
    let total = 0;

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        // Skip experience/resume questions
        if (question.type === 'file-upload' || 
            question.question.toLowerCase().includes('experience') ||
            question.question.toLowerCase().includes('resume')) {
          return;
        }

        total++;
        const userAnswer = response.responses[question.id];
        
        if (question.correctAnswer && question.options) {
          if (question.type === 'single-choice') {
            // Convert letter answer to option text
            const correctOptionIndex = question.correctAnswer.charCodeAt(0) - 65;
            const correctOptionText = question.options[correctOptionIndex];
            
            if (userAnswer === correctOptionText) {
              correct++;
            } else {
              wrong++;
            }
          } else if (question.type === 'multi-choice') {
            const correctAnswers = Array.isArray(question.correctAnswer) 
              ? question.correctAnswer 
              : [question.correctAnswer];
            
            // Convert letter answers to option texts
            const correctOptionTexts = correctAnswers.map(letter => {
              const index = letter.charCodeAt(0) - 65;
              return question.options[index];
            }).filter(Boolean);
            
            const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
            
            if (JSON.stringify(correctOptionTexts.sort()) === JSON.stringify(userAnswers.sort())) {
              correct++;
            } else {
              wrong++;
            }
          }
        }
      });
    });

    setResults({ correct, wrong, total });
  };

  const getQuestionResult = (question, userAnswer) => {
    if (question.type === 'file-upload' || 
        question.question.toLowerCase().includes('experience') ||
        question.question.toLowerCase().includes('resume')) {
      return 'N/A';
    }

    if (!question.correctAnswer || !question.options) return 'N/A';

    if (question.type === 'single-choice') {
      // Convert letter answer (A, B, C, D) to actual option text
      const correctOptionIndex = question.correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      const correctOptionText = question.options[correctOptionIndex];
      return userAnswer === correctOptionText ? 'correct' : 'wrong';
    } else if (question.type === 'multi-choice') {
      const correctAnswers = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : [question.correctAnswer];
      
      // Convert letter answers to option texts
      const correctOptionTexts = correctAnswers.map(letter => {
        const index = letter.charCodeAt(0) - 65;
        return question.options[index];
      }).filter(Boolean);
      
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      
      return JSON.stringify(correctOptionTexts.sort()) === JSON.stringify(userAnswers.sort()) 
        ? 'correct' : 'wrong';
    }

    return 'N/A';
  };

  if (!candidate || !assessment || !response) {
    return (
      <div className="p-8">
        <div>Loading results...</div>
        <div className="text-sm text-gray-500 mt-2">
          Candidate: {candidate ? '✓' : '✗'} | 
          Assessment: {assessment ? '✓' : '✗'} | 
          Response: {response ? '✓' : '✗'}
        </div>
      </div>
    );
  }

  const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
                <p className="text-gray-600">{candidate.name} - {assessment.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Score Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.correct}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{results.wrong}</div>
              <div className="text-sm text-red-700">Wrong</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.total}</div>
              <div className="text-sm text-blue-700">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
              <div className="text-sm text-purple-700">Score</div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Detailed Results</h2>
          </div>
          
          <div className="p-6">
            {assessment.sections.map((section, sectionIndex) => (
              <div key={section.id} className="mb-8">
                <h3 className="text-lg font-medium mb-4">{section.title}</h3>
                
                <div className="space-y-4">
                  {section.questions.map((question, questionIndex) => {
                    const userAnswer = response.responses[question.id];
                    const result = getQuestionResult(question, userAnswer);
                    
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-600">
                                Q{questionIndex + 1}
                              </span>
                              {result === 'correct' && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {result === 'wrong' && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              {result === 'N/A' && (
                                <FileText className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h4>
                            <div className="p-3 bg-gray-50 rounded">
                              {Array.isArray(userAnswer) 
                                ? userAnswer.join(', ') 
                                : userAnswer || 'No answer'}
                            </div>
                          </div>
                          
                          {question.correctAnswer && result !== 'N/A' && question.options && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Correct Answer:</h4>
                              <div className="p-3 bg-green-50 rounded">
                                {Array.isArray(question.correctAnswer)
                                  ? question.correctAnswer.map(letter => {
                                      const index = letter.charCodeAt(0) - 65;
                                      return question.options[index];
                                    }).filter(Boolean).join(', ')
                                  : (() => {
                                      const index = question.correctAnswer.charCodeAt(0) - 65;
                                      return question.options[index] || question.correctAnswer;
                                    })()
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;