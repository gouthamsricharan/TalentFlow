import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob } from '../db/jobs';
import { 
  createDefaultAssessment, 
  createQuestion, 
  saveAssessment, 
  updateAssessment,
  getAssessmentByJob,
  saveBuilderState,
  getBuilderState,
  validateResponse,
  shouldShowQuestion
} from '../db/assessments';

const AssessmentBuilder = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);
  const [previewResponses, setPreviewResponses] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    const jobData = await getJob(parseInt(jobId));
    setJob(jobData);

    // Force reset assessment database to load new questions
    const { resetAssessmentDatabase } = await import('../utils/resetDatabase');
    await resetAssessmentDatabase();

    // Create fresh assessment with new question bank
    const assessmentData = await createDefaultAssessment(parseInt(jobId), jobData.title);
    setAssessment(assessmentData);
  };

  const saveState = async () => {
    await saveBuilderState(parseInt(jobId), assessment);
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: `Section ${assessment.sections.length + 1}`,
      questions: []
    };
    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionIndex, field, value) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex ? { ...section, [field]: value } : section
      )
    }));
  };

  const deleteSection = (sectionIndex) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex)
    }));
    if (activeSection >= assessment.sections.length - 1) {
      setActiveSection(Math.max(0, assessment.sections.length - 2));
    }
  };

  const addQuestion = (sectionIndex, type = 'single-choice') => {
    const newQuestion = createQuestion(type);
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex 
          ? { ...section, questions: [newQuestion, ...section.questions] }
          : section
      )
    }));
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? {
              ...section,
              questions: section.questions.map((question, qIndex) => 
                qIndex === questionIndex ? { ...question, [field]: value } : question
              )
            }
          : section
      )
    }));
  };

  const deleteQuestion = (sectionIndex, questionIndex) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? { ...section, questions: section.questions.filter((_, qIndex) => qIndex !== questionIndex) }
          : section
      )
    }));
  };

  const reorderQuestion = (sectionIndex, fromIndex, toIndex) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) => {
        if (sIndex === sectionIndex) {
          const questions = [...section.questions];
          const [moved] = questions.splice(fromIndex, 1);
          questions.splice(toIndex, 0, moved);
          return { ...section, questions };
        }
        return section;
      })
    }));
  };

  const handlePreviewResponse = (questionId, value) => {
    setPreviewResponses(prev => ({ ...prev, [questionId]: value }));
    
    // Add years experience question if experience is Yes
    if (questionId === 'experience-field' && value === 'Yes') {
      const experienceSection = assessment.sections.find(s => s.title === 'Experience');
      if (experienceSection && !experienceSection.questions.find(q => q.id === 'years-experience')) {
        const yearsQuestion = {
          id: 'years-experience',
          type: 'numeric',
          question: 'How many years of experience do you have in this field?',
          required: true,
          validation: { min: 0, max: 50 },
          conditional: { dependsOn: 'experience-field', condition: 'equals', value: 'Yes' }
        };
        
        setAssessment(prev => ({
          ...prev,
          sections: prev.sections.map(section => 
            section.title === 'Experience' 
              ? { ...section, questions: [...section.questions, yearsQuestion] }
              : section
          )
        }));
      }
    }
    
    // Validate response
    const question = findQuestionById(questionId);
    if (question) {
      const errors = validateResponse(question, value);
      setValidationErrors(prev => ({
        ...prev,
        [questionId]: errors.length > 0 ? errors : undefined
      }));
    }
  };

  const findQuestionById = (questionId) => {
    for (const section of assessment.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  };

  const saveAssessmentData = async () => {
    try {
      if (assessment.id) {
        await updateAssessment(assessment.id, assessment);
      } else {
        const savedAssessment = await saveAssessment(assessment);
        setAssessment(prev => ({ ...prev, id: savedAssessment.id }));
      }
      alert('Assessment saved successfully!');
    } catch (error) {
      alert('Error saving assessment');
    }
  };

  if (!job || !assessment) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white shadow-sm border rounded-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={() => navigate(`/jobs/${jobId}`)}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Job
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">{job.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Stage:</span>
                  <select
                    value={assessment.stage || 'applied'}
                    onChange={(e) => setAssessment(prev => ({ ...prev, stage: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="select">Select</option>
                    <option value="applied">Applied</option>
                    <option value="screen">Screen</option>
                    <option value="tech">Technical</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveState}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Save Draft
              </button>
              <button
                onClick={saveAssessmentData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Builder Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <input
                  type="text"
                  value={assessment.title}
                  onChange={(e) => setAssessment(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-bold bg-transparent border-none outline-none"
                  placeholder="Assessment Title"
                />
                <button
                  onClick={addSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Section
                </button>
              </div>

              {/* Section Tabs */}
              <div className="flex border-b mb-6">
                {assessment.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(index)}
                    className={`px-4 py-2 font-medium ${
                      activeSection === index
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>

              {/* Active Section */}
              {assessment.sections[activeSection] && (
                <SectionEditor
                  section={assessment.sections[activeSection]}
                  sectionIndex={activeSection}
                  onUpdateSection={updateSection}
                  onDeleteSection={deleteSection}
                  onAddQuestion={addQuestion}
                  onUpdateQuestion={updateQuestion}
                  onDeleteQuestion={deleteQuestion}
                  onReorderQuestion={reorderQuestion}
                  allQuestions={assessment.sections.flatMap(s => s.questions)}
                />
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Live Preview</h2>
              <button
                onClick={() => setFullPreview(!fullPreview)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  fullPreview 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {fullPreview ? 'Section Only' : 'Full Preview'}
              </button>
            </div>
            <AssessmentPreview
              assessment={assessment}
              activeSection={fullPreview ? null : activeSection}
              responses={previewResponses}
              validationErrors={validationErrors}
              onResponseChange={handlePreviewResponse}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionEditor = ({ 
  section, 
  sectionIndex, 
  onUpdateSection, 
  onDeleteSection, 
  onAddQuestion, 
  onUpdateQuestion, 
  onDeleteQuestion,
  onReorderQuestion,
  allQuestions 
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    };
    
    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);
  
  const questionTypes = [
    { value: 'single-choice', label: 'Single Choice', icon: '◉' },
    { value: 'multi-choice', label: 'Multiple Choice', icon: '☑' },
    { value: 'short-text', label: 'Short Text', icon: '📝' },
    { value: 'long-text', label: 'Long Text', icon: '📄' },
    { value: 'numeric', label: 'Number', icon: '#' },
    { value: 'file-upload', label: 'File Upload', icon: '📎' }
  ];

  const handleAddQuestion = (type) => {
    onAddQuestion(sectionIndex, type);
    setShowAddMenu(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateSection(sectionIndex, 'title', e.target.value)}
          className="text-lg font-semibold bg-transparent border-none outline-none"
        />
        <div className="flex gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <span className={`transition-transform ${showAddMenu ? 'rotate-45' : ''}`}>+</span> 
              Add Question
            </button>
            
            {showAddMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Choose Question Type:</div>
                  {questionTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleAddQuestion(type.value)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-3 text-sm transition-colors"
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onDeleteSection(sectionIndex)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Section
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {section.questions.map((question, questionIndex) => (
          <QuestionEditor
            key={question.id}
            question={question}
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onReorderQuestion={onReorderQuestion}
            sectionQuestions={section.questions}
            allQuestions={allQuestions}
          />
        ))}
      </div>
    </div>
  );
};

const QuestionEditor = ({ 
  question, 
  sectionIndex, 
  questionIndex, 
  onUpdateQuestion, 
  onDeleteQuestion,
  onReorderQuestion,
  sectionQuestions,
  allQuestions 
}) => {
  const updateField = (field, value) => {
    onUpdateQuestion(sectionIndex, questionIndex, field, value);
  };

  const updateValidation = (field, value) => {
    onUpdateQuestion(sectionIndex, questionIndex, 'validation', {
      ...question.validation,
      [field]: value
    });
  };

  const updateConditional = (field, value) => {
    onUpdateQuestion(sectionIndex, questionIndex, 'conditional', {
      ...question.conditional,
      [field]: value
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex flex-col gap-1 mt-2">
          <button
            onClick={() => questionIndex > 0 && onReorderQuestion(sectionIndex, questionIndex, questionIndex - 1)}
            disabled={questionIndex === 0}
            className="w-8 h-8 flex items-center justify-center text-sm bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg border border-blue-200 disabled:border-gray-200 transition-colors"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => questionIndex < sectionQuestions.length - 1 && onReorderQuestion(sectionIndex, questionIndex, questionIndex + 1)}
            disabled={questionIndex === sectionQuestions.length - 1}
            className="w-8 h-8 flex items-center justify-center text-sm bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg border border-blue-200 disabled:border-gray-200 transition-colors"
            title="Move down"
          >
            ↓
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">Q{questionIndex + 1}</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <input
            type="text"
            value={question.question}
            onChange={(e) => updateField('question', e.target.value)}
            placeholder="Enter your question"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={() => onDeleteQuestion(sectionIndex, questionIndex)}
          className="mt-8 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors text-sm font-medium"
        >
          Delete
        </button>
      </div>

      {/* Question Type Specific Fields */}
      {(question.type === 'single-choice' || question.type === 'multi-choice') && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">Options:</label>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[index] = e.target.value;
                    updateField('options', newOptions);
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => {
                    const newOptions = question.options.filter((_, i) => i !== index);
                    updateField('options', newOptions);
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => updateField('options', [...question.options, `Option ${question.options.length + 1}`])}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Add Option
          </button>
        </div>
      )}

      {/* Validation Rules */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Validation Rules</h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center p-2 bg-white rounded border">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateField('required', e.target.checked)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Required</span>
          </label>

          {(question.type === 'short-text' || question.type === 'long-text') && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Max Length:</label>
              <input
                type="number"
                value={question.validation?.maxLength || ''}
                onChange={(e) => updateValidation('maxLength', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Characters"
              />
            </div>
          )}

          {question.type === 'numeric' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Min Value:</label>
                <input
                  type="number"
                  value={question.validation?.min || ''}
                  onChange={(e) => updateValidation('min', parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Max Value:</label>
                <input
                  type="number"
                  value={question.validation?.max || ''}
                  onChange={(e) => updateValidation('max', parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Conditional Logic */}
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <label className="flex items-center p-2 bg-white rounded border mb-3">
          <input
            type="checkbox"
            checked={!!question.conditional}
            onChange={(e) => {
              if (e.target.checked) {
                updateField('conditional', { dependsOn: '', condition: 'equals', value: '' });
              } else {
                updateField('conditional', null);
              }
            }}
            className="mr-2 text-yellow-600 focus:ring-yellow-500"
          />
          <span className="text-sm font-medium">Conditional Question</span>
        </label>

        {question.conditional && (
          <div className="space-y-3">
            <div className="text-xs text-yellow-700 mb-2">Show this question only when:</div>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={question.conditional.dependsOn || ''}
                onChange={(e) => updateConditional('dependsOn', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Question</option>
                {allQuestions
                  .filter(q => q.id !== question.id)
                  .map(q => (
                    <option key={q.id} value={q.id}>
                      {q.question.substring(0, 25)}...
                    </option>
                  ))}
              </select>
              <select
                value={question.conditional.condition || 'equals'}
                onChange={(e) => updateConditional('condition', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
              </select>
              <input
                type="text"
                value={question.conditional.value || ''}
                onChange={(e) => updateConditional('value', e.target.value)}
                placeholder="Value"
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AssessmentPreview = ({ assessment, activeSection, responses, validationErrors, onResponseChange }) => {
  const sectionsToShow = activeSection !== null 
    ? [assessment.sections[activeSection]].filter(Boolean)
    : assessment.sections;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{assessment.title}</h3>
      {activeSection !== null && (
        <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded">
          Previewing: {assessment.sections[activeSection]?.title} section
        </div>
      )}
      
      {sectionsToShow.map((section, sectionIndex) => (
        <div key={section.id} className="border rounded-lg p-4">
          <h4 className="font-medium mb-4">{section.title}</h4>
          
          {section.questions.map((question, questionIndex) => {
            if (!shouldShowQuestion(question, responses)) return null;
            
            return (
              <div key={question.id} className="mb-4">
                <label className="block font-medium mb-2">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                <QuestionInput
                  question={question}
                  value={responses[question.id] || ''}
                  onChange={(value) => onResponseChange(question.id, value)}
                  error={validationErrors[question.id]}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const QuestionInput = ({ question, value, onChange, error }) => {
  switch (question.type) {
    case 'single-choice':
      return (
        <div>
          {question.options.map((option, index) => (
            <label key={index} className="flex items-center mb-2">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
          {error && <div className="text-red-500 text-sm mt-1">{error.join(', ')}</div>}
        </div>
      );

    case 'multi-choice':
      return (
        <div>
          {question.options.map((option, index) => (
            <label key={index} className="flex items-center mb-2">
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
                className="mr-2"
              />
              {option}
            </label>
          ))}
          {error && <div className="text-red-500 text-sm mt-1">{error.join(', ')}</div>}
        </div>
      );

    case 'short-text':
      return (
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
            maxLength={question.validation?.maxLength}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error.join(', ')}</div>}
        </div>
      );

    case 'long-text':
      return (
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded h-24"
            maxLength={question.validation?.maxLength}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error.join(', ')}</div>}
        </div>
      );

    case 'numeric':
      return (
        <div>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
            min={question.validation?.min}
            max={question.validation?.max}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error.join(', ')}</div>}
        </div>
      );

    case 'file-upload':
      return (
        <div>
          <input
            type="file"
            onChange={(e) => onChange(e.target.files[0]?.name || '')}
            className="w-full p-2 border rounded"
            accept={question.validation?.allowedTypes?.join(',')}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error.join(', ')}</div>}
        </div>
      );

    default:
      return null;
  }
};

export default AssessmentBuilder;