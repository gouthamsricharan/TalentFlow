import { jobsDB, seedJobs, getJob, getAllJobs, updateJob, saveJob } from './jobs.js';
import { candidatesDB, seedCandidates, getCandidatesByJob, getCandidate, updateCandidate, addTimelineEntry, getCandidateTimeline } from './candidates.js';
import { assessmentsDB, seedAssessments, getAssessmentByJob, getAssessmentsByJob, getAssessment, saveAssessment, updateAssessment, saveResponse, getResponse, saveDraftResponse, getDraftResponse, saveAssessmentWithResponses, getAssessmentWithResponses, generateAssessmentForJob, saveBuilderState, getBuilderState, clearBuilderState, deleteAssessment, hasSubmittedResponse, seedAssessmentResponses } from './assessments.js';

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
        console.log('⚠️ Assessments missing. Seeding question bank and creating assessments...');
        const jobs = await jobsDB.jobs.toArray();
        await seedAssessments(jobs);
        
        // Generate pre-developed assessment for each existing job
        const assessments = [];
        for (const job of jobs) {
          const assessment = await generateAssessmentForJob(job, 'applied');
          assessments.push(assessment);
        }
        
        // Generate sample responses for some candidates
        const jobIds = jobs.map(j => j.id);
        await seedAssessmentResponses(assessments, jobIds);
        console.log('✅ Assessment question bank seeded, assessments created, and sample responses generated');
      } else {
        // Check if all jobs have assessments, create missing ones
        const jobs = await jobsDB.jobs.toArray();
        const existingAssessmentJobs = await assessmentsDB.assessments.where('stage').equals('applied').toArray();
        const existingJobIds = new Set(existingAssessmentJobs.map(a => a.jobId));
        
        for (const job of jobs) {
          if (!existingJobIds.has(job.id)) {
            console.log(`Creating missing assessment for job: ${job.title}`);
            await generateAssessmentForJob(job, 'applied');
          }
        }
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

    // Seed assessments question bank and create assessments for each job
    await seedAssessments(jobs);
    
    // Generate pre-developed assessment for each job
    const assessments = [];
    for (const job of jobs) {
      console.log(`Creating assessment for job: ${job.title} (ID: ${job.id})`);
      const assessment = await generateAssessmentForJob(job, 'applied');
      assessments.push(assessment);
    }
    
    // Generate sample responses for some candidates
    await seedAssessmentResponses(assessments, jobIds);
    console.log(`✅ Created ${assessments.length} assessments and sample responses`);

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
  deleteAssessment,
  hasSubmittedResponse,
  seedAssessmentResponses
};

// Global reset function
if (typeof window !== 'undefined') {
  window.resetModularDB = initializeDatabase;
  
  // Manual assessment creation function
  window.createAllAssessments = async () => {
    const jobs = await getAllJobs();
    console.log(`Creating assessments for ${jobs.length} jobs...`);
    
    for (const job of jobs) {
      const existing = await getAssessmentByJob(job.id, 'applied');
      if (!existing) {
        console.log(`Creating assessment for: ${job.title}`);
        await generateAssessmentForJob(job, 'applied');
      } else {
        console.log(`Assessment exists for: ${job.title}`);
      }
    }
    
    console.log('Assessment creation complete!');
  };
}