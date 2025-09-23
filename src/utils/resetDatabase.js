import { assessmentsDB } from '../db/assessments';
import { seedQuestionBank } from '../db/assessments';

export const resetAssessmentDatabase = async () => {
  try {
    // Clear all assessment data
    await assessmentsDB.questionBank.clear();
    await assessmentsDB.assessments.clear();
    await assessmentsDB.assessmentResponses.clear();
    await assessmentsDB.builderStates.clear();
    
    // Reseed with new question bank
    await seedQuestionBank();
    
    console.log('✅ Assessment database reset complete');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    return false;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.resetAssessmentDB = resetAssessmentDatabase;
}