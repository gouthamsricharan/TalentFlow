import Dexie from 'dexie';

export const responseStorageDB = new Dexie('ResponseStorageDB');

responseStorageDB.version(1).stores({
  responses: '++id, candidateId, jobId, stage, assessmentId, responses, submittedAt, [candidateId+assessmentId]'
});

export const saveResponse = (response) => {
  const submittedResponse = {
    ...response,
    submittedAt: new Date(),
    updatedAt: new Date()
  };
  return responseStorageDB.responses.add(submittedResponse);
};

export const hasSubmittedResponse = async (candidateId, assessmentId) => {
  const response = await responseStorageDB.responses
    .where('candidateId').equals(candidateId)
    .and(r => r.assessmentId === assessmentId && r.submittedAt !== null && r.submittedAt !== undefined)
    .first();
  return !!response;
};

export const saveDraftResponse = async (candidateId, assessmentId, responses) => {
  console.log('Saving draft:', { candidateId, assessmentId, responses });
  
  await responseStorageDB.responses
    .where('candidateId').equals(candidateId)
    .and(r => r.assessmentId === assessmentId && !r.submittedAt)
    .delete();
  
  const id = await responseStorageDB.responses.add({
    candidateId,
    assessmentId,
    responses,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Draft saved with ID:', id);
  return id;
};

export const getResponse = async (candidateId, assessmentId) => {
  const responses = await responseStorageDB.responses
    .where('candidateId').equals(candidateId)
    .and(r => r.assessmentId === assessmentId)
    .first();
  return responses;
};

export const getDraftResponse = async (candidateId, assessmentId) => {
  console.log('Getting draft for:', { candidateId, assessmentId });
  const draft = await responseStorageDB.responses
    .where('candidateId').equals(candidateId)
    .and(r => r.assessmentId === assessmentId && !r.submittedAt)
    .first();
  console.log('Found draft:', draft);
  return draft;
};

export const saveAssessmentWithResponses = async (candidateId, jobId, stage, assessment, responses) => {
  const { getAssessmentByJob, saveAssessment } = await import('./assessmentStorage.js');
  
  let savedAssessment = await getAssessmentByJob(jobId, stage);
  if (!savedAssessment) {
    const assessmentId = await saveAssessment(assessment);
    savedAssessment = { ...assessment, id: assessmentId };
  }
  
  await saveDraftResponse(candidateId, savedAssessment.id, responses);
  
  return savedAssessment;
};

export const getAssessmentWithResponses = async (candidateId, jobId, stage) => {
  const { getAssessmentByJob } = await import('./assessmentStorage.js');
  
  const existingAssessment = await getAssessmentByJob(jobId, stage);
  if (existingAssessment) {
    const responses = await getDraftResponse(candidateId, existingAssessment.id);
    if (responses) {
      return { assessment: existingAssessment, responses: responses.responses, lastSaved: responses.updatedAt };
    }
  }
  return null;
};