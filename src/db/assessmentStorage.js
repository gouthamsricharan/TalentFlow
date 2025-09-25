import Dexie from 'dexie';

export const assessmentStorageDB = new Dexie('AssessmentStorageDB');

assessmentStorageDB.version(1).stores({
  assessments: '++id, jobId, stage, title, sections, createdAt, updatedAt',
  builderStates: '++id, jobId, state, lastModified'
});

export const createQuestion = (type = 'single-choice') => {
  const base = {
    id: Date.now() + Math.random(),
    type,
    question: '',
    required: false,
    validation: {},
    conditional: null
  };

  switch (type) {
    case 'single-choice':
    case 'multi-choice':
      return { ...base, options: ['Option 1', 'Option 2'] };
    case 'short-text':
      return { ...base, validation: { maxLength: 100 } };
    case 'long-text':
      return { ...base, validation: { maxLength: 500 } };
    case 'numeric':
      return { ...base, validation: { min: 0, max: 100 }, question: 'How many years of experience do you have?' };
    default:
      return base;
  }
};

export const validateResponse = (question, response) => {
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

export const shouldShowQuestion = (question, responses) => {
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

export const getAssessment = (id) => assessmentStorageDB.assessments.get(id);
export const saveAssessment = (assessment) => assessmentStorageDB.assessments.add(assessment);
export const updateAssessment = (id, data) => assessmentStorageDB.assessments.update(id, { ...data, updatedAt: new Date() });
export const deleteAssessment = (id) => assessmentStorageDB.assessments.delete(id);
export const getAssessmentByJob = (jobId, stage = 'applied') => 
  assessmentStorageDB.assessments.where('jobId').equals(jobId).and(a => a.stage === stage).first();
export const getAssessmentsByJob = (jobId) => 
  assessmentStorageDB.assessments.where('jobId').equals(jobId).toArray();

export const saveBuilderState = async (jobId, state) => {
  const existing = await assessmentStorageDB.builderStates.where('jobId').equals(jobId).first();
  if (existing) {
    return assessmentStorageDB.builderStates.update(existing.id, { state, lastModified: new Date() });
  }
  return assessmentStorageDB.builderStates.add({ jobId, state, lastModified: new Date() });
};

export const getBuilderState = (jobId) => 
  assessmentStorageDB.builderStates.where('jobId').equals(jobId).first();

export const clearBuilderState = (jobId) => 
  assessmentStorageDB.builderStates.where('jobId').equals(jobId).delete();