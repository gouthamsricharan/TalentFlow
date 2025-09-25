import Dexie from 'dexie';

export const questionBankDB = new Dexie('QuestionBankDB');

questionBankDB.version(1).stores({
  questions: '++id, type, category, tags, difficulty, question, options, correctAnswer'
});

function shuffleArray(array, seed = Math.random()) {
  const shuffled = [...array];
  let random = seed;
  
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const seedQuestionBank = async () => {
  await questionBankDB.questions.clear();
  
  const questions = [
    // APTITUDE QUESTIONS (15)
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'easy', question: 'What is 15% of 200?', options: ['25', '30', '35', '40'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'easy', question: 'If 5 apples cost $10, what is the cost of 8 apples?', options: ['$14', '$16', '$18', '$20'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'medium', question: 'A train travels 240 km in 3 hours. What is its average speed?', options: ['70 km/h', '80 km/h', '90 km/h', '100 km/h'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'medium', question: 'What is the next number in the sequence: 2, 6, 18, 54, ?', options: ['108', '162', '216', '270'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'hard', question: 'If the ratio of boys to girls in a class is 3:2 and there are 15 boys, how many girls are there?', options: ['8', '10', '12', '15'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'easy', question: 'All cats are animals. Some animals are pets. Therefore:', options: ['All cats are pets', 'Some cats may be pets', 'No cats are pets', 'All pets are cats'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'medium', question: 'If A > B and B > C, then:', options: ['A < C', 'A = C', 'A > C', 'Cannot determine'], correctAnswer: 'C' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'hard', question: 'In a certain code, FLOWER is written as EKNVDQ. How is GARDEN written?', options: ['FZQCDM', 'FZQCEN', 'FZQDEM', 'GZQDEM'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'easy', question: 'Choose the synonym of "Abundant":', options: ['Scarce', 'Plentiful', 'Limited', 'Rare'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'medium', question: 'Choose the antonym of "Optimistic":', options: ['Hopeful', 'Positive', 'Pessimistic', 'Confident'], correctAnswer: 'C' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'easy', question: 'What is 25% of 80?', options: ['15', '20', '25', '30'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'medium', question: 'Complete the pattern: 1, 4, 9, 16, ?', options: ['20', '25', '30', '36'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'hard', question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?', options: ['5 minutes', '20 minutes', '100 minutes', '500 minutes'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'medium', question: 'Choose the word that best completes: Book is to Reading as Fork is to ?', options: ['Eating', 'Kitchen', 'Spoon', 'Food'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'aptitude', tags: [], difficulty: 'hard', question: 'If some Bloops are Razzles and all Razzles are Lazzles, then some Bloops are definitely Lazzles.', options: ['True', 'False', 'Cannot be determined', 'Insufficient information'], correctAnswer: 'A' },
    
    // TECHNICAL QUESTIONS (95)
    // Frontend Developer (15)
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'easy', question: 'What is HTML?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'easy', question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is the Virtual DOM in React?', options: ['Virtual representation of DOM', 'Database structure', 'CSS framework', 'Testing tool'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'How do you handle state in React?', options: ['useState and useReducer', 'Only props', 'Global variables', 'Local storage'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is CSS Grid?', options: ['2D layout system', '1D layout system', 'Animation library', 'Color scheme'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is responsive design?', options: ['Design that adapts to screen sizes', 'Fast loading design', 'Interactive design', 'Colorful design'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is JavaScript closure?', options: ['Function with access to outer scope', 'Loop structure', 'Data type', 'Error handling'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is the difference between let and var?', options: ['let has block scope, var has function scope', 'No difference', 'var is newer', 'let is faster'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is webpack?', options: ['Module bundler', 'Testing framework', 'Database', 'CSS preprocessor'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is TypeScript?', options: ['JavaScript with static typing', 'New programming language', 'CSS framework', 'Database query language'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'easy', question: 'What is DOM?', options: ['Document Object Model', 'Data Object Model', 'Dynamic Object Model', 'Database Object Model'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is SASS?', options: ['CSS preprocessor', 'JavaScript framework', 'Database', 'Testing tool'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript eXtension'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is Redux?', options: ['State management library', 'CSS framework', 'Database', 'Testing framework'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is Next.js?', options: ['React framework', 'CSS framework', 'Database', 'Testing tool'], correctAnswer: 'A' },
    
    // MANAGEMENT QUESTIONS (14)
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'How do you handle a conflict between two team members?', options: ['Ignore it and hope it resolves', 'Listen to both sides and mediate', 'Take sides with the better performer', 'Escalate to HR immediately'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'What is your approach to giving constructive feedback?', options: ['Only give positive feedback', 'Be specific, timely, and actionable', 'Give feedback only during reviews', 'Focus on personality traits'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'How do you prioritize tasks when everything seems urgent?', options: ['Work on easiest tasks first', 'Use impact vs effort matrix', 'Work randomly', 'Delegate everything'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'hard', question: 'How do you motivate an underperforming team member?', options: ['Threaten termination', 'Understand root causes and provide support', 'Reduce their workload', 'Ignore the issue'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'How do you communicate major changes to your team?', options: ['Send an email', 'Hold a team meeting with Q&A', 'Let them figure it out', 'Use informal channels'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'How do you ensure project deadlines are met?', options: ['Work overtime', 'Plan with buffer time and track progress', 'Rush at the end', 'Blame team members'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'hard', question: 'How do you build trust within your team?', options: ['Be authoritative', 'Be transparent and consistent', 'Avoid difficult conversations', 'Focus only on results'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'What is your approach to remote team management?', options: ['Micromanage everything', 'Focus on outcomes and regular check-ins', 'Let team work independently without guidance', 'Only communicate through email'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'How do you handle team burnout?', options: ['Ignore it', 'Redistribute workload and provide support', 'Add more people to team', 'Extend deadlines'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'hard', question: 'What is your strategy for cross-functional collaboration?', options: ['Work in silos', 'Regular alignment meetings and shared goals', 'Compete with other teams', 'Avoid other departments'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'How do you measure team performance?', options: ['Only track individual metrics', 'Combine team goals with individual contributions', 'Focus only on output quantity', 'Use peer reviews only'], correctAnswer: 'B' },
    { type: 'single-choice', category: 'management', tags: ['management'], difficulty: 'hard', question: 'How do you foster innovation in your team?', options: ['Stick to proven methods', 'Encourage experimentation and learning from failures', 'Punish mistakes', 'Only follow company guidelines'], correctAnswer: 'B' },
    { type: 'multi-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'Which are effective leadership qualities? (Select all that apply)', options: ['Empathy', 'Micromanagement', 'Clear communication', 'Adaptability'], correctAnswer: ['A', 'C', 'D'] },
    { type: 'multi-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'Which are signs of a healthy team culture? (Select all that apply)', options: ['Open communication', 'Fear of failure', 'Collaboration', 'Psychological safety'], correctAnswer: ['A', 'C', 'D'] }
  ];
  
  await questionBankDB.questions.bulkPut(questions);
  console.log(`✅ Created ${questions.length} questions in question bank`);
};

export const getQuestionsByCategory = (category) => 
  questionBankDB.questions.where('category').equals(category).toArray();

export const getQuestionsByTags = (tags) => 
  questionBankDB.questions.filter(q => tags.some(tag => q.tags.includes(tag))).toArray();

export const shuffleQuestions = shuffleArray;