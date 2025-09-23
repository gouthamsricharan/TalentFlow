import { jobsDB, seedJobs, getJob, getAllJobs, updateJob, saveJob } from './jobs.js';
import { candidatesDB, seedCandidates, getCandidatesByJob, getCandidate, updateCandidate, addTimelineEntry, getCandidateTimeline } from './candidates.js';
import { assessmentsDB, seedAssessments, getAssessmentByJob, getAssessmentsByJob, getAssessment, saveAssessment, updateAssessment, saveResponse, getResponse, saveDraftResponse, getDraftResponse, saveAssessmentWithResponses, getAssessmentWithResponses, generateAssessmentForJob, saveBuilderState, getBuilderState, clearBuilderState, deleteAssessment } from './assessments.js';

// Auto-initialize database when this module is imported
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing databases...');
    
    // Check existing counts
    const existingJobs = await jobsDB.jobs.count();
    const existingCandidates = await candidatesDB.candidates.count();
    const existingAssessments = await assessmentsDB.assessments.count();

    if (existingJobs > 0) {
      console.log('✅ Jobs exist:', existingJobs);
      // Backfill candidates/assessments if missing
      if (existingCandidates === 0) {
        console.log('⚠️ Candidates missing. Seeding candidates...');
        const jobs = await jobsDB.jobs.toArray();
        await seedCandidates(jobs.map(j => j.id));
        console.log('✅ Seeded candidates for existing jobs');
      }
      if (existingAssessments === 0) {
        console.log('⚠️ Assessments missing. Seeding question bank and enabling generation on demand...');
        const jobs = await jobsDB.jobs.toArray();
        await seedAssessments(jobs);
        console.log('✅ Assessment question bank seeded');
      }
      console.log('✅ Database already initialized/backfilled');
      return;
    }

    console.log('🔄 Initializing fresh database...');

    // Seed jobs first
    const jobs = await seedJobs();
    console.log(`✅ Created ${jobs.length} jobs`);

    // Seed candidates with job IDs
    const jobIds = jobs.map(job => job.id);
    await seedCandidates(jobIds);
    console.log('✅ Created 1000 candidates with timeline');
    console.log(candidatesDB.candidates);

    // Seed assessments question bank
    await seedAssessments(jobs);
    console.log('✅ Created comprehensive assessments');

    console.log('✅ Database initialization complete!');
    return { jobs, jobIds };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Don't auto-initialize, let main.jsx control timing

export { initializeDatabase };

// Export all database functions
export {
  // Jobs
  getJob,
  getAllJobs,
  updateJob,
  saveJob,
  
  // Candidates
  getCandidatesByJob,
  getCandidate,
  updateCandidate,
  addTimelineEntry,
  getCandidateTimeline,
  
  // Assessments
  getAssessmentByJob,
  getAssessmentsByJob,
  getAssessment,
  saveAssessment,
  updateAssessment,
  saveResponse,
  getResponse,
  saveDraftResponse,
  getDraftResponse,
  saveAssessmentWithResponses,
  getAssessmentWithResponses,
  generateAssessmentForJob,
  saveBuilderState,
  getBuilderState,
  clearBuilderState,
  deleteAssessment
};

// Global reset function
if (typeof window !== 'undefined') {
  window.resetModularDB = initializeDatabase;
}