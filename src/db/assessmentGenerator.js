import { questionBankDB, seedQuestionBank, shuffleQuestions } from './questionBank.js';
import { assessmentStorageDB } from './assessmentStorage.js';
import { responseStorageDB } from './responseStorage.js';

export const generateAssessmentForJob = async (job, stage = 'applied') => {
  const questionCount = await questionBankDB.questions.count();
  if (questionCount === 0) {
    await seedQuestionBank();
  }
  
  const seed = job.id * 1000 + stage.length;
  
  const allAptitude = await questionBankDB.questions.where('category').equals('aptitude').toArray();
  const aptitudeQuestions = shuffleQuestions(allAptitude, seed).slice(0, 10);
  
  let technicalQuestions = await questionBankDB.questions
    .where('category').equals('technical')
    .filter(q => q.tags.includes(job.title))
    .toArray();
    
  if (technicalQuestions.length < 20) {
    const generalTechnical = await questionBankDB.questions
      .where('category').equals('technical')
      .filter(q => q.tags.includes('general'))
      .toArray();
    
    const combinedQuestions = [...technicalQuestions, ...generalTechnical];
    technicalQuestions = shuffleQuestions(combinedQuestions, seed + 1).slice(0, 20);
  } else {
    technicalQuestions = shuffleQuestions(technicalQuestions, seed + 1).slice(0, 20);
  }
  
  const allManagerial = await questionBankDB.questions.where('category').equals('management').toArray();
  const managerialQuestions = shuffleQuestions(allManagerial, seed + 2).slice(0, 7);
  
  const assessment = {
    jobId: job.id,
    stage,
    title: `${job.title} Assessment`,
    sections: [
      { id: 1, title: 'Aptitude', questions: aptitudeQuestions },
      { id: 2, title: 'Technical', questions: technicalQuestions },
      { id: 3, title: 'Management', questions: managerialQuestions }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const assessmentId = await assessmentStorageDB.assessments.add(assessment);
  console.log(`✅ Generated assessment for ${job.title}: ${aptitudeQuestions.length + technicalQuestions.length + managerialQuestions.length} questions`);
  
  return { ...assessment, id: assessmentId };
};

export const seedAssessmentResponses = async (assessments, jobIds) => {
  const responses = [];
  
  for (let i = 1; i <= 300; i++) {
    const candidateId = i;
    const jobId = jobIds[Math.floor(Math.random() * jobIds.length)];
    const assessment = assessments.find(a => a.jobId === jobId);
    
    if (!assessment) continue;

    const candidateResponses = {};

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        switch (question.type) {
          case 'single-choice':
            candidateResponses[question.id] = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
            break;
          case 'multi-choice':
            const options = ['A', 'B', 'C', 'D'].slice(0, Math.floor(Math.random() * 3) + 1);
            candidateResponses[question.id] = options;
            break;
          case 'short-text':
            candidateResponses[question.id] = 'Sample response text';
            break;
          case 'long-text':
            candidateResponses[question.id] = 'This is a longer sample response with more detailed information about the candidate\'s experience and qualifications.';
            break;
          case 'numeric':
            candidateResponses[question.id] = Math.floor(Math.random() * 10) + 1;
            break;
        }
      });
    });
    
    responses.push({
      candidateId,
      jobId,
      stage: 'applied',
      assessmentId: assessment.id,
      responses: candidateResponses,
      submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });
  }
  
  await responseStorageDB.responses.bulkAdd(responses);
  console.log(`✅ Generated ${responses.length} sample assessment responses`);
};

export const seedAssessments = async (jobs) => {
  await seedQuestionBank();
  console.log(`✅ Generated focused question bank with role-based templates`);
};