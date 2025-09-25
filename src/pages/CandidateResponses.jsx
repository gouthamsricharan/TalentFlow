import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User } from 'lucide-react';
import { getJob } from '../db/jobs';
import { getCandidatesByJob } from '../db/candidates';
import { getAssessmentByJob } from '../db/assessments';
import { assessmentsDB } from '../db/assessments';

const CandidateResponses = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const jobData = await getJob(parseInt(jobId));
      const assessmentData = await getAssessmentByJob(parseInt(jobId), 'applied');
      
      setJob(jobData);
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

        setResponses(responseData);
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

  if (loading) return <div className="p-8">Loading...</div>;

  if (!assessment) {
    return (
      <div className="p-8">
        <div className="flex items-center mb-4">
          <Link to={`/jobs/${jobId}`} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">No Assessment Found</h1>
        </div>
        <p>No assessment available for this job.</p>
      </div>
    );
  }

  const sortedResponses = responses.sort((a, b) => b.results.percentage - a.results.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/jobs/${jobId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
                <p className="text-lg text-gray-600 mt-1">{job?.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Submissions</div>
              <div className="text-2xl font-bold text-blue-600">{responses.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses Yet</h3>
            <p className="text-gray-600">No candidates have submitted assessments for this job.</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">High Performers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {responses.filter(r => r.results.percentage >= 80).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <User className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(responses.reduce((sum, r) => sum + r.results.percentage, 0) / responses.length)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((responses.filter(r => r.results.percentage >= 60).length / responses.length) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Needs Review</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {responses.filter(r => r.results.percentage < 60).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-bold text-gray-900">Candidate Rankings</h2>
                <p className="text-sm text-gray-600 mt-1">Sorted by performance score</p>
              </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Results</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedResponses.map((response, index) => (
                    <tr key={response.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-sm ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                            'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {response.candidate?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {response.candidate?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {response.candidate?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                            response.results.percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                            response.results.percentage >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                            'bg-gradient-to-r from-red-400 to-red-500 text-white'
                          }`}>
                            {response.results.percentage}%
                          </span>
                          <div className="mt-1 text-xs text-gray-500">
                            {response.results.percentage >= 80 ? 'Excellent' :
                             response.results.percentage >= 60 ? 'Good' : 'Needs Review'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                            <span className="text-sm font-semibold text-green-600">
                              {response.results.correct}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <XCircle className="w-5 h-5 text-red-500 mr-1" />
                            <span className="text-sm font-semibold text-red-600">
                              {response.results.wrong}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            /{response.results.total}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {new Date(response.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(response.submittedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <Link
                          to={`/assessment-results/${assessment.id}/${response.candidateId}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateResponses;