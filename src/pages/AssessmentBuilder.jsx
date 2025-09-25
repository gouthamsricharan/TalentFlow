import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  ArrowLeft, 
  GripVertical,
  Settings,
  FileText,
  Hash,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  Upload
} from 'lucide-react';
import { getJob } from '../db/jobs';
import { 
  getAssessmentByJob, 
  saveAssessment, 
  updateAssessment,
  saveBuilderState,
  getBuilderState 
} from '../db/assessments';

const QUESTION_TYPES = [
  { id: 'single-choice', label: 'Single Choice', icon: Circle, description: 'Radio buttons - one answer' },
  { id: 'multi-choice', label: 'Multiple Choice', icon: CheckSquare, description: 'Checkboxes - multiple answers' },
  { id: 'short-text', label: 'Short Text', icon: Type, description: 'Single line input' },
  { id: 'long-text', label: 'Long Text', icon: AlignLeft, description: 'Multi-line textarea' },
  { id: 'numeric', label: 'Numeric', icon: Hash, description: 'Number input with range' },
  { id: 'file-upload', label: 'File Upload', icon: Upload, description: 'File attachment' }
];

const createQuestion = (type = 'single-choice') => ({
  id: Date.now() + Math.random(),
  type,
  question: '',
  required: false,
  validation: {},
  conditional: null,
  ...(type === 'single-choice' || type === 'multi-choice' ? { options: ['Option 1', 'Option 2'] } : {}),
  ...(type === 'short-text' ? { validation: { maxLength: 100 } } : {}),
  ...(type === 'long-text' ? { validation: { maxLength: 500 } } : {}),
  ...(type === 'numeric' ? { validation: { min: 0, max: 100 } } : {}),
  ...(type === 'file-upload' ? { validation: { allowedTypes: ['.pdf', '.doc', '.docx'] } } : {})
});

const createSection = () => ({
  id: Date.now() + Math.random(),
  title: 'New Section',
  questions: []
});

const AssessmentBuilder = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [assessment, setAssessment] = useState({
    title: '',
    sections: [createSection()]
  });
  const [activeSection, setActiveSection] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    loadData();
  }, [jobId]);

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      if (assessment.title || assessment.sections.some(s => s.questions.length > 0)) {
        saveBuilderState(parseInt(jobId), assessment);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [assessment, jobId]);

  const loadData = async () => {
    try {
      const jobData = await getJob(parseInt(jobId));
      setJob(jobData);

      // Try to load existing assessment
      const existingAssessment = await getAssessmentByJob(parseInt(jobId), 'applied');
      if (existingAssessment) {
        setAssessment(existingAssessment);
        return;
      }

      // Try to load builder state
      const builderState = await getBuilderState(parseInt(jobId));
      if (builderState) {
        setAssessment(builderState.state);
        return;
      }

      // Initialize new assessment
      setAssessment({
        title: `${jobData.title} Assessment`,
        sections: [createSection()]
      });
    } catch (error) {
      console.error('Error loading assessment data:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const assessmentData = {
        ...assessment,
        jobId: parseInt(jobId),
        stage: 'applied',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const existingAssessment = await getAssessmentByJob(parseInt(jobId), 'applied');
      if (existingAssessment) {
        await updateAssessment(existingAssessment.id, assessmentData);
      } else {
        await saveAssessment(assessmentData);
      }

      setLastSaved(new Date());
      alert('Assessment saved successfully!');
    } catch (error) {
      alert('Error saving assessment. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, createSection()]
    }));
  };

  const updateSection = (sectionIndex, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionIndex) => {
    if (assessment.sections.length === 1) return;
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex)
    }));
    if (activeSection >= assessment.sections.length - 1) {
      setActiveSection(Math.max(0, activeSection - 1));
    }
  };

  const addQuestion = (sectionIndex, type = 'single-choice') => {
    const newQuestion = createQuestion(type);
    updateSection(sectionIndex, {
      questions: [...assessment.sections[sectionIndex].questions, newQuestion]
    });
  };

  const updateQuestion = (sectionIndex, questionIndex, updates) => {
    const section = assessment.sections[sectionIndex];
    const updatedQuestions = section.questions.map((question, index) =>
      index === questionIndex ? { ...question, ...updates } : question
    );
    updateSection(sectionIndex, { questions: updatedQuestions });
  };

  const deleteQuestion = (sectionIndex, questionIndex) => {
    const section = assessment.sections[sectionIndex];
    const updatedQuestions = section.questions.filter((_, index) => index !== questionIndex);
    updateSection(sectionIndex, { questions: updatedQuestions });
  };

  if (!job) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/jobs/${jobId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
                <p className="text-gray-600">{job.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Builder Panel */}
          <div className="space-y-6">
            {/* Assessment Title */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Title
              </label>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => setAssessment(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter assessment title..."
              />
            </div>

            {/* Sections */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* Section Tabs */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Sections</h3>
                  <button
                    onClick={addSection}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </button>
                </div>
                <div className="flex space-x-1">
                  {assessment.sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(index)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        index === activeSection
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Section Content */}
              {assessment.sections[activeSection] && (
                <SectionEditor
                  section={assessment.sections[activeSection]}
                  sectionIndex={activeSection}
                  onUpdateSection={(updates) => updateSection(activeSection, updates)}
                  onDeleteSection={() => deleteSection(activeSection)}
                  onAddQuestion={(type) => addQuestion(activeSection, type)}
                  onUpdateQuestion={(questionIndex, updates) => updateQuestion(activeSection, questionIndex, updates)}
                  onDeleteQuestion={(questionIndex) => deleteQuestion(activeSection, questionIndex)}
                  canDelete={assessment.sections.length > 1}
                />
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Live Preview</h3>
              </div>
              <AssessmentPreview assessment={assessment} />
            </div>
          )}
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
  canDelete 
}) => {
  return (
    <div className="p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateSection({ title: e.target.value })}
          className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        />
        {canDelete && (
          <button
            onClick={onDeleteSection}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Add Question */}
      <div className="mt-6 mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-sm text-gray-600 mb-3">Add a new question:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {QUESTION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => onAddQuestion(type.id)}
                className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300"
              >
                <Icon className="w-4 h-4 mr-2 text-gray-600" />
                <div>
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      

      {/* Questions */}
      <div className="space-y-4">
        {section.questions.map((question, questionIndex) => (
          <QuestionEditor
            key={question.id}
            question={question}
            questionIndex={questionIndex}
            onUpdate={(updates) => onUpdateQuestion(questionIndex, updates)}
            onDelete={() => onDeleteQuestion(questionIndex)}
            allQuestions={section.questions}
          />
        ))}
      </div>

      


    </div>
  );
};

const QuestionEditor = ({ question, questionIndex, onUpdate, onDelete, allQuestions }) => {
  const [showSettings, setShowSettings] = useState(false);

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onUpdate({ options: newOptions });
  };

  const updateOption = (optionIndex, value) => {
    const newOptions = question.options.map((option, index) =>
      index === optionIndex ? value : option
    );
    onUpdate({ options: newOptions });
  };

  const deleteOption = (optionIndex) => {
    if (question.options.length <= 2) return;
    const newOptions = question.options.filter((_, index) => index !== optionIndex);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Q{questionIndex + 1}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
            {QUESTION_TYPES.find(t => t.id === question.type)?.label}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <textarea
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Enter your question..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Question Type Specific Fields */}
      {(question.type === 'single-choice' || question.type === 'multi-choice') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {question.options.length > 2 && (
                  <button
                    onClick={() => deleteOption(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOption}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor={`required-${question.id}`} className="text-sm">
              Required field
            </label>
          </div>

          {/* Validation Settings */}
          {question.type === 'short-text' || question.type === 'long-text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={question.validation?.maxLength || ''}
                onChange={(e) => onUpdate({ 
                  validation: { ...question.validation, maxLength: parseInt(e.target.value) || undefined }
                })}
                className="w-24 p-2 border border-gray-300 rounded"
                min="1"
              />
            </div>
          ) : question.type === 'numeric' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  value={question.validation?.min || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { ...question.validation, min: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  value={question.validation?.max || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { ...question.validation, max: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          ) : question.type === 'file-upload' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed File Types (comma-separated)
              </label>
              <input
                type="text"
                value={question.validation?.allowedTypes?.join(', ') || ''}
                onChange={(e) => onUpdate({ 
                  validation: { 
                    ...question.validation, 
                    allowedTypes: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  }
                })}
                placeholder=".pdf, .doc, .docx"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          ) : null}

          {/* Conditional Logic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conditional Logic
            </label>
            <select
              value={question.conditional?.dependsOn || ''}
              onChange={(e) => {
                if (!e.target.value) {
                  onUpdate({ conditional: null });
                } else {
                  onUpdate({ 
                    conditional: { 
                      dependsOn: e.target.value,
                      condition: 'equals',
                      value: ''
                    }
                  });
                }
              }}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            >
              <option value="">No conditions</option>
              {allQuestions.map((q, index) => (
                index < questionIndex && (
                  <option key={q.id} value={q.id}>
                    Show if Q{index + 1} ({q.question.slice(0, 30)}...)
                  </option>
                )
              ))}
            </select>
            
            {question.conditional && (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={question.conditional.condition}
                  onChange={(e) => onUpdate({ 
                    conditional: { ...question.conditional, condition: e.target.value }
                  })}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">not equals</option>
                  <option value="contains">contains</option>
                </select>
                <input
                  type="text"
                  value={question.conditional.value}
                  onChange={(e) => onUpdate({ 
                    conditional: { ...question.conditional, value: e.target.value }
                  })}
                  placeholder="Value"
                  className="p-2 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AssessmentPreview = ({ assessment }) => {
  const [responses, setResponses] = useState({});
  const [currentSection, setCurrentSection] = useState(0);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const shouldShowQuestion = (question) => {
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

  const validateResponse = (question, response) => {
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

  if (!assessment.sections.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Add sections and questions to see the preview</p>
      </div>
    );
  }

  const currentSectionData = assessment.sections[currentSection];
  const visibleQuestions = currentSectionData.questions.filter(shouldShowQuestion);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{assessment.title}</h2>
        
        {/* Section Navigation */}
        <div className="flex space-x-1 mb-4">
          {assessment.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                index === currentSection
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {visibleQuestions.map((question, index) => {
          const errors = validateResponse(question, responses[question.id]);
          
          return (
            <div key={question.id} className="border rounded-lg p-4">
              <div className="mb-3">
                <label className="block font-medium text-gray-900">
                  {index + 1}. {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              
              <QuestionInput
                question={question}
                value={responses[question.id] || ''}
                onChange={(value) => handleResponseChange(question.id, value)}
                error={errors}
              />
            </div>
          );
        })}
      </div>

      {visibleQuestions.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No questions in this section</p>
        </div>
      )}
    </div>
  );
};

const QuestionInput = ({ question, value, onChange, error }) => {
  switch (question.type) {
    case 'single-choice':
      return (
        <div>
          <div className="space-y-2">
            {question.options?.map((option, index) => (
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
          {error?.length > 0 && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    case 'multi-choice':
      return (
        <div>
          <div className="space-y-2">
            {question.options?.map((option, index) => (
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
          {error?.length > 0 && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
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
          {error?.length > 0 && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
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
          {error?.length > 0 && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
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
          {error?.length > 0 && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
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
                <Upload className="w-8 h-8 mx-auto mb-2" />
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
          {error?.length > 0 && <div className="text-red-500 text-sm mt-2">{error.join(', ')}</div>}
        </div>
      );

    default:
      return null;
  }
};

export default AssessmentBuilder;