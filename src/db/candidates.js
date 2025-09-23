import Dexie from 'dexie';
import { jobsDB } from './jobs.js';

export const candidatesDB = new Dexie('CandidatesDB');

candidatesDB.version(1).stores({
  candidates: '++id, name, email, stage, jobId, createdAt',
  candidateTimeline: '++id, candidateId, stage, timestamp, notes'
});

export const seedCandidates = async (jobIds) => {
  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Vivek', 'Ananya', 'Diya', 'Priya', 'Kavya', 'Aanya', 'Ira', 'Pihu', 'Riya', 'Anvi', 'Vanya', 'Myra', 'Sara', 'Anika', 'Navya', 'Kiara', 'Saanvi', 'Aadhya', 'Avni', 'Pari', 'Fatima', 'Aryan', 'Kabir', 'Shivansh', 'Dev', 'Yash', 'Dhruv', 'Kian', 'Advait', 'Neil', 'Arnav', 'Harsh', 'Rudra', 'Aadhav', 'Daksh', 'Krish'];
  const lastNames = ['Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Bansal', 'Mittal', 'Goel', 'Arora', 'Malhotra', 'Chopra', 'Kapoor', 'Mehta', 'Shah', 'Patel', 'Joshi', 'Saxena', 'Srivastava', 'Tiwari', 'Pandey', 'Mishra', 'Yadav', 'Reddy', 'Nair', 'Menon', 'Iyer', 'Krishnan', 'Raman', 'Subramanian', 'Venkatesh', 'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Ganesh', 'Dinesh', 'Naresh', 'Mukesh', 'Rakesh', 'Umesh', 'Lokesh', 'Hitesh', 'Ritesh', 'Paresh', 'Jayesh', 'Kailash', 'Prakash', 'Aakash'];
  
  // Get actual job IDs from database
  const actualJobs = await jobsDB.jobs.toArray();
  const actualJobIds = actualJobs.map(job => job.id);
  console.log('Using actual job IDs:', actualJobIds);
  
  const candidates = Array.from({ length: 1000 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      id: i + 1, // Static ID starting from 1
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      stage: stages[Math.floor(Math.random() * stages.length)],
      jobId: actualJobIds[Math.floor(Math.random() * actualJobIds.length)], // Use actual job IDs
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    };
  });
  
  await candidatesDB.candidates.bulkPut(candidates); // Use bulkPut to preserve IDs
  console.log('📊 Created candidates with static IDs 1-1000');
  
  // Build timeline for each candidate
  const timelineEntries = [];
  candidates.forEach((candidate) => {
    const candidateTimeline = buildCandidateTimeline(candidate.id, candidate.stage, candidate.createdAt);
    timelineEntries.push(...candidateTimeline);
  });
  
  console.log(`🔍 About to create ${timelineEntries.length} timeline entries`);
  console.log('Sample timeline entries:', timelineEntries.slice(0, 3));
  
  await candidatesDB.candidateTimeline.bulkAdd(timelineEntries);
  
  // Verify timeline entries were created
  const timelineCount = await candidatesDB.candidateTimeline.count();
  console.log(`✅ Created ${timelineCount} timeline entries in database`);
};

export const getCandidatesByJob = (jobId) => candidatesDB.candidates.where('jobId').equals(jobId).toArray();
export const getCandidate = (id) => candidatesDB.candidates.get(id);
export const updateCandidate = (id, data) => candidatesDB.candidates.update(id, data);
export const addTimelineEntry = (entry) => candidatesDB.candidateTimeline.add(entry);
function buildCandidateTimeline(candidateId, currentStage, createdAt) {
  const stageOrder = ['applied', 'screen', 'tech', 'offer', 'hired'];
  const timeline = [];
  let currentTime = createdAt.getTime();
  
  if (currentStage === 'rejected') {
    // Rejected can happen after applied, screen, tech, or offer (not after hired)
    const rejectionAfterStages = ['applied', 'screen', 'tech', 'offer'];
    const rejectionAfter = rejectionAfterStages[Math.floor(Math.random() * rejectionAfterStages.length)];
    const rejectionIndex = stageOrder.indexOf(rejectionAfter);
    
    // Add stages up to and including rejection point
    for (let i = 0; i <= rejectionIndex; i++) {
      const stage = stageOrder[i];
      const daysBetween = i === 0 ? 0 : Math.floor(Math.random() * 3) + 1;
      const timestamp = new Date(currentTime + (daysBetween * 24 * 60 * 60 * 1000));
      
      let notes;
      if (i === 0) {
        notes = 'Application submitted successfully';
      } else if (i === rejectionIndex) {
        // This is the stage where they got rejected
        notes = `Started ${stage} process`;
      } else {
        notes = `Successfully cleared ${stage} stage`;
      }
      
      timeline.push({
        candidateId,
        stage,
        timestamp,
        notes
      });
      
      currentTime = timestamp.getTime();
    }
    
    // Add rejection entry
    const rejectionTime = new Date(currentTime + (Math.floor(Math.random() * 2) + 1) * 24 * 60 * 60 * 1000);
    const rejectionMessages = {
      applied: 'Application rejected - Did not meet basic requirements',
      screen: 'Rejected after initial screening - Not a good fit for the role',
      tech: 'Rejected after technical interview - Technical skills did not meet expectations',
      offer: 'Rejected after offer stage - Candidate declined the offer or failed background check'
    };
    
    timeline.push({
      candidateId,
      stage: 'rejected',
      timestamp: rejectionTime,
      notes: rejectionMessages[rejectionAfter]
    });
    
  } else {
    // Normal progression - add stages up to current stage
    const currentIndex = stageOrder.indexOf(currentStage);
    
    for (let i = 0; i <= currentIndex; i++) {
      const stage = stageOrder[i];
      const daysBetween = i === 0 ? 0 : Math.floor(Math.random() * 3) + 1;
      const timestamp = new Date(currentTime + (daysBetween * 24 * 60 * 60 * 1000));
      
      let notes;
      if (i === 0) {
        notes = 'Application submitted successfully';
      } else if (i === currentIndex && currentStage !== 'hired') {
        // Current stage in progress
        const stageMessages = {
          screen: 'Initial screening in progress',
          tech: 'Technical interview scheduled',
          offer: 'Offer being prepared'
        };
        notes = stageMessages[stage] || `Currently in ${stage} stage`;
      } else {
        // Completed stages
        const completedMessages = {
          screen: 'Successfully cleared initial screening',
          tech: 'Technical interview completed successfully',
          offer: 'Offer extended and accepted',
          hired: 'Successfully onboarded and hired'
        };
        notes = completedMessages[stage] || `Successfully cleared ${stage} stage`;
      }
      
      timeline.push({
        candidateId,
        stage,
        timestamp,
        notes
      });
      
      currentTime = timestamp.getTime();
    }
  }
  
  return timeline;
}

export const getCandidateTimeline = (candidateId) => {
  console.log('🔍 Getting timeline for candidateId:', candidateId, 'type:', typeof candidateId);
  return candidatesDB.candidateTimeline.where('candidateId').equals(parseInt(candidateId)).toArray();
};