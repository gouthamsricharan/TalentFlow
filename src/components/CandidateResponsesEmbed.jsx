import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, User } from 'lucide-react';
import { getJob } from '../db/jobs';
import { getCandidatesByJob } from '../db/candidates';
import { getAssessmentByJob } from '../db/assessments';
import { assessmentsDB } from '../db/assessments';

const CandidateResponsesEmbed = ({ jobId }) => {
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const assessmentData = await getAssessmentByJob(parseInt(jobId), 'applied');
      setAssessment(assessmentData);

      if (assessmentData) {
        const allResponses = await assessmentsDB.assessmentResponses
          .where('assessmentId').equals(assessmentData.id)
          .and(r => r.submittedAt !== null)
          .toArray();

        const candidates = await getCandidatesByJob(parseInt(jobId));
        
        // Deduplicate responses - keep latest per candidate
        const latestResponses = new Map();
        allResponses.forEach(response => {
          const existing = latestResponses.get(response.candidateId);
          if (!existing || new Date(response.submittedAt) > new Date(existing.submittedAt)) {
            latestResponses.set(response.candidateId, response);
          }
        });
        
        const responseData = Array.from(latestResponses.values())
          .map(response => {
            const candidate = candidates.find(c => c.id === response.candidateId);
            const results = calculateResults(assessmentData, response);
            
            return {
              ...response,
              candidate,
              results
            };
          })
          .filter(response => response.candidate && response.candidate.name && response.candidate.email);

        setResponses(responseData.sort((a, b) => b.results.percentage - a.results.percentage));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = (assessment, response) => {
    let correct = 0;
    let wrong = 0;
    let total = 0;

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.type === 'file-upload' || 
            question.question.toLowerCase().includes('experience') ||
            question.question.toLowerCase().includes('resume')) {
          return;
        }

        if (question.correctAnswer && question.options) {
          total++;
          const userAnswer = response.responses[question.id];
          
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

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, wrong, total, percentage };
  };

  if (loading) return <div className="p-4">Loading responses...</div>;

  if (!assessment || responses.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses Yet</h3>
        <p className="text-gray-600">No candidates have submitted assessments for this job.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-700">High Performers (80%+)</p>
              <p className="text-xl font-bold text-green-800">
                {responses.filter(r => r.results.percentage >= 80).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-700">Average Score</p>
              <p className="text-xl font-bold text-blue-800">
                {Math.round(responses.reduce((sum, r) => sum + r.results.percentage, 0) / responses.length)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-yellow-700">Pass Rate (60%+)</p>
              <p className="text-xl font-bold text-yellow-800">
                {Math.round((responses.filter(r => r.results.percentage >= 60).length / responses.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-700">Needs Review</p>
              <p className="text-xl font-bold text-red-800">
                {responses.filter(r => r.results.percentage < 60).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Results</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {responses.slice(0, 10).map((response, index) => (
                <tr key={response.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {response.candidate?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {response.candidate?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      response.results.percentage >= 80 ? 'bg-green-100 text-green-800' :
                      response.results.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {response.results.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2 text-xs">
                      <span className="text-green-600">✓{response.results.correct}</span>
                      <span className="text-red-600">✗{response.results.wrong}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`/assessment-results/${assessment.id}/${response.candidateId}`}
                      className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {responses.length > 10 && (
          <div className="px-4 py-3 bg-gray-50 text-center">
            <Link
              to={`/candidate-responses/${jobId}`}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              View All {responses.length} Responses →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateResponsesEmbed;