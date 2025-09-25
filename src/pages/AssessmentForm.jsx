import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob } from '../db/jobs';
import { getCandidate } from '../db/candidates';
import { 
  getAssessmentByJob,
  getAssessment,
  saveResponse, 
  getResponse,
  saveDraftResponse,
  getDraftResponse,
  saveAssessmentWithResponses,
  getAssessmentWithResponses,
  validateResponse,
  shouldShowQuestion,
  hasSubmittedResponse
} from '../db/assessments';

// Validation functions
const validateQuestionResponse = (question, response) => {
  const errors = [];
  
  if (question.required && (!response || response === '')) {
    errors.push('This field is required');
  }
  
  if (response && question.validation) {
    const { maxLength, min, max } = question.validation;
    
    if (maxLength && response.length > maxLength) {
      errors.push(`Maximum ${maxLength} characters allowed`);
    }
    
    if (question.type === 'numeric') {
      const num = parseFloat(response);
      if (isNaN(num)) {
        errors.push('Must be a valid number');
      } else {
        if (min !== undefined && num < min) errors.push(`Minimum value is ${min}`);
        if (max !== undefined && num > max) errors.push(`Maximum value is ${max}`);
      }
    }
  }
  
  return errors;
};

const shouldShowQuestionConditional = (question, responses) => {
  if (!question.conditional) return true;
  
  const { dependsOn, condition, value } = question.conditional;
  const dependentResponse = responses[dependsOn];
  
  switch (condition) {
    case 'equals': return dependentResponse === value;
    case 'not_equals': return dependentResponse !== value;
    case 'contains': return Array.isArray(dependentResponse) && dependentResponse.includes(value);
    default: return true;
  }
};

const AssessmentForm = () => {
  const { jobId, candidateId, assessmentId } = useParams();
  const actualCandidateId = candidateId || useParams().candidateId;
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    console.log('🚀 AssessmentForm mounted with params:', { jobId, candidateId, assessmentId });
    console.log('🚀 Current URL:', window.location.href);
    loadData();
  }, [jobId, candidateId, assessmentId]);

  const loadData = async () => {
    try {
      const candidateData = await getCandidate(parseInt(candidateId));
      setCandidate(candidateData);
      
      let assessmentData, jobData;
      
      if (assessmentId) {
        // Route: /assessment/:assessmentId/candidate/:candidateId - use API
        console.log('Fetching via assessmentId API:', assessmentId);
        const response = await fetch(`/api/assessments/${assessmentId}/candidates/${candidateId}`);
        if (response.ok) {
          const data = await response.json();
          assessmentData = data.assessment;
          jobData = await getJob(data.assessment.jobId);
        } else {
          console.error('API fetch failed:', response.status, await response.text());
        }
      } else if (jobId) {
        // Route: /assessment/:jobId/candidate/:candidateId or /jobs/:jobId/assessment/:candidateId
        console.log('Fetching via jobId:', jobId);
        jobData = await getJob(parseInt(jobId));
        assessmentData = await getAssessmentByJob(parseInt(jobId), 'applied');
        console.log('Direct fetch results:', { jobData: !!jobData, assessmentData: !!assessmentData });
      }
      
      setJob(jobData);
      setAssessment(assessmentData);
      
      console.log('Loaded data:', { 
        job: jobData?.title, 
        assessment: assessmentData?.title,
        candidate: candidateData?.name 
      });

      // Validate candidate stage matches assessment stage
      if (assessmentData && candidateData && assessmentData.stage !== candidateData.stage) {
        console.warn('Stage mismatch:', {
          candidateStage: candidateData.stage,
          assessmentStage: assessmentData.stage
        });
        setAssessment(null);
        return;
      }

      // Check if already submitted
      if (assessmentData) {
        const isSubmitted = await hasSubmittedResponse(parseInt(candidateId), assessmentData.id);
        if (isSubmitted) {
          const existingResponse = await getResponse(parseInt(candidateId), assessmentData.id);
          setResponses(existingResponse.responses);
          setIsSubmitted(true);
        } else {
          // Load draft if exists
          const draft = await getDraftResponse(parseInt(candidateId), assessmentData.id);
          if (draft) {
            setResponses(draft.responses);
          }
        }
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    // Clear validation error for this question
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
    
    // Auto-save draft every few seconds
    if (!isSubmitted) {
      clearTimeout(window.draftSaveTimeout);
      window.draftSaveTimeout = setTimeout(() => {
        saveDraftResponse(parseInt(candidateId), assessment.id, { ...responses, [questionId]: value });
      }, 2000);
    }
  };

  const validateSection = (sectionIndex) => {
    const section = assessment.sections[sectionIndex];
    const errors = {};
    let hasErrors = false;

    section.questions.forEach(question => {
      if (!shouldShowQuestionConditional(question, responses)) return;
      
      const response = responses[question.id];
      const questionErrors = validateQuestionResponse(question, response);
      
      if (questionErrors.length > 0) {
        errors[question.id] = questionErrors;
        hasErrors = true;
      }
    });

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return !hasErrors;
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, assessment.sections.length - 1));
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
  };

  const submitAssessment = async () => {
    // Validate all sections
    let allValid = true;
    for (let i = 0; i < assessment.sections.length; i++) {
      if (!validateSection(i)) {
        allValid = false;
      }
    }

    if (!allValid) {
      alert('Please fix all validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (assessmentId) {
        // Use API for assessmentId route
        const response = await fetch(`/api/assessments/${assessment.id}/candidates/${candidateId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses })
        });
        if (!response.ok) throw new Error('Submission failed');
      } else if (jobId) {
        // Use job-based submission endpoint
        const response = await fetch(`/api/assessments/${jobId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            candidateId: parseInt(candidateId),
            assessmentId: assessment.id,
            responses 
          })
        });
        if (!response.ok) throw new Error('Submission failed');
      } else {
        // Use direct DB for other routes
        await saveResponse({
          candidateId: parseInt(candidateId),
          jobId: assessment.jobId,
          stage: assessment.stage,
          assessmentId: assessment.id,
          responses
        });
      }
      
      setIsSubmitted(true);
      setTimeout(() => {
        navigate(`/assessment-results/${assessment.id}/${candidateId}`);
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const getVisibleQuestions = (section) => {
    return section.questions.filter(question => shouldShowQuestionConditional(question, responses));
  };

  const getProgress = () => {
    const totalQuestions = assessment.sections.reduce((total, section) => 
      total + getVisibleQuestions(section).length, 0
    );
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  if (!candidate) {
    return <div className="p-8">Loading candidate data...</div>;
  }
  
  if (!job && jobId) {
    return <div className="p-8">Loading job data...</div>;
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Assessment Available</h2>
          <p className="text-gray-600 mb-6">
            There is no assessment available for your current stage ({candidate.stage}) in this job.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the assessment for {job.title}. 
            We'll review your responses and get back to you soon.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const currentSectionData = assessment.sections[currentSection];
  const visibleQuestions = getVisibleQuestions(currentSectionData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-gray-600">{job.title}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-lg font-semibold text-blue-600">{getProgress()}%</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assessment Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Section Navigation */}
          <div className="border-b p-6">
            <div className="flex space-x-1">
              {assessment.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    index === currentSection
                      ? 'bg-blue-600 text-white'
                      : index < currentSection
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {section.title}
                  {index < currentSection && <span className="ml-2">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{currentSectionData.title}</h2>
            
            <div className="space-y-6">
              {visibleQuestions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <label className="block font-medium text-gray-900">
                      {index + 1}. {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  </div>
                  
                  <QuestionInput
                    question={question}
                    value={responses[question.id] || ''}
                    onChange={(value) => handleResponseChange(question.id, value)}
                    error={validationErrors[question.id]}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t p-6 flex justify-between">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentSection === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>

            {currentSection === assessment.sections.length - 1 ? (
              <button
                onClick={submitAssessment}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            ) : (
              <button
                onClick={nextSection}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionInput = ({ question, value, onChange, error }) => {
  switch (question.type) {
    case 'single-choice':
      return (
        <div>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    case 'multi-choice':
      return (
        <div>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter(v => v !== option));
                    }
                  }}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    case 'short-text':
      return (
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={question.validation?.maxLength}
            placeholder="Enter your answer..."
          />
          {question.validation?.maxLength && (
            <div className="text-sm text-gray-500 mt-1">
              {value.length}/{question.validation.maxLength} characters
            </div>
          )}
          {error && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    case 'long-text':
      return (
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={question.validation?.maxLength}
            placeholder="Enter your detailed answer..."
          />
          {question.validation?.maxLength && (
            <div className="text-sm text-gray-500 mt-1">
              {value.length}/{question.validation.maxLength} characters
            </div>
          )}
          {error && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    case 'numeric':
      return (
        <div>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={question.validation?.min}
            max={question.validation?.max}
            placeholder="Enter a number..."
          />
          {(question.validation?.min !== undefined || question.validation?.max !== undefined) && (
            <div className="text-sm text-gray-500 mt-1">
              Range: {question.validation?.min || 'No minimum'} - {question.validation?.max || 'No maximum'}
            </div>
          )}
          {error && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    case 'file-upload':
      return (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
            <input
              type="file"
              onChange={(e) => onChange(e.target.files[0]?.name || '')}
              className="hidden"
              id={`file-${question.id}`}
              accept={question.validation?.allowedTypes?.join(',')}
            />
            <label htmlFor={`file-${question.id}`} className="cursor-pointer">
              <div className="text-gray-600">
                <div className="text-4xl mb-2">📁</div>
                <div className="font-medium">Click to upload file</div>
                <div className="text-sm">
                  {question.validation?.allowedTypes?.length > 0 
                    ? `Allowed: ${question.validation.allowedTypes.join(', ')}`
                    : 'Any file type'
                  }
                </div>
              </div>
            </label>
          </div>
          {value && (
            <div className="mt-2 text-sm text-green-600">
              Selected: {value}
            </div>
          )}
          {error && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    default:
      return null;
  }
};

export default AssessmentForm;