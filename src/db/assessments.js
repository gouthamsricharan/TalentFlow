import Dexie from 'dexie';

export const assessmentsDB = new Dexie('AssessmentsDB');

assessmentsDB.version(1).stores({
  questionBank: '++id, type, category, tags, difficulty, question, options, correctAnswer',
  assessments: '++id, jobId, stage, title, sections, createdAt, updatedAt',
  assessmentResponses: '++id, candidateId, jobId, stage, assessmentId, responses, submittedAt',
  builderStates: '++id, jobId, state, lastModified'
});

function shuffleArray(array, seed = Math.random()) {
  const shuffled = [...array];
  let random = seed;
  
  // Simple seeded random function
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
  await assessmentsDB.questionBank.clear();
  
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
    { type: 'multi-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'Which of the following are JavaScript frameworks? (Select all that apply)', options: ['React', 'Angular', 'Vue', 'Bootstrap'], correctAnswer: ['A', 'B', 'C'] },
    { type: 'multi-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'Which CSS properties affect layout? (Select all that apply)', options: ['display', 'position', 'color', 'margin'], correctAnswer: ['A', 'B', 'D'] },
    
    // Backend Developer (17)
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'easy', question: 'What is an API?', options: ['Application Programming Interface', 'Advanced Programming Interface', 'Automated Programming Interface', 'Application Process Interface'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'easy', question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Home Transfer Text Protocol', 'HyperText Transport Protocol'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is REST API?', options: ['Architectural style for web services', 'Database type', 'Programming language', 'Testing framework'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is database normalization?', options: ['Organizing data to reduce redundancy', 'Making database faster', 'Adding more tables', 'Deleting old data'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is middleware?', options: ['Software between OS and applications', 'Database layer', 'Frontend framework', 'Testing tool'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is API authentication?', options: ['Verifying user identity for API access', 'API documentation', 'API testing', 'API deployment'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is microservices architecture?', options: ['Distributed system of small services', 'Single large application', 'Database design pattern', 'Frontend framework'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is SQL injection?', options: ['Security vulnerability in database queries', 'Database optimization technique', 'Data migration method', 'Query performance tool'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is load balancing?', options: ['Distributing requests across servers', 'Database backup strategy', 'Code optimization technique', 'Security measure'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is caching?', options: ['Storing data for faster access', 'Data encryption method', 'Database normalization', 'Code compilation'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'easy', question: 'What is JSON?', options: ['JavaScript Object Notation', 'Java Standard Object Notation', 'JavaScript Object Network', 'Java Syntax Object Notation'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is NoSQL?', options: ['Non-relational database', 'New SQL version', 'Network SQL', 'Node SQL'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is CRUD?', options: ['Create, Read, Update, Delete', 'Create, Run, Update, Deploy', 'Code, Read, Update, Debug', 'Create, Retrieve, Update, Destroy'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is database indexing?', options: ['Data structure to improve query speed', 'Database backup method', 'Data encryption technique', 'Database migration tool'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is message queue?', options: ['System for asynchronous communication', 'Database query system', 'File storage system', 'User interface component'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'Which are NoSQL databases? (Select all that apply)', options: ['MongoDB', 'PostgreSQL', 'Redis', 'MySQL'], correctAnswer: ['A', 'C'] },
    { type: 'multi-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'Which HTTP methods are idempotent? (Select all that apply)', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: ['A', 'C', 'D'] },
    
    // Full Stack Developer (12)
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'easy', question: 'What is a database?', options: ['Organized collection of data', 'Programming language', 'Web framework', 'Testing tool'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'easy', question: 'What is Git?', options: ['Version control system', 'Programming language', 'Database', 'Web server'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'What is MVC architecture?', options: ['Model-View-Controller pattern', 'Database design', 'Testing method', 'Deployment strategy'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'What is version control?', options: ['System to track code changes', 'Code testing', 'Code deployment', 'Code documentation'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'What is CI/CD?', options: ['Continuous Integration/Deployment', 'Code review process', 'Testing framework', 'Database backup'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'What is containerization?', options: ['Packaging apps with dependencies', 'Code compression', 'Database optimization', 'UI design pattern'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'What is Docker?', options: ['Containerization platform', 'Programming language', 'Database', 'Testing framework'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'What is Kubernetes?', options: ['Container orchestration platform', 'Programming language', 'Database', 'Web framework'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'What is serverless computing?', options: ['Cloud execution model without server management', 'Programming without servers', 'Database without storage', 'Frontend without backend'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'What is GraphQL?', options: ['Query language for APIs', 'Database type', 'Programming language', 'Web framework'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'Which are cloud platforms? (Select all that apply)', options: ['AWS', 'Azure', 'React', 'Google Cloud'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'Which are version control systems? (Select all that apply)', options: ['Git', 'SVN', 'Docker', 'Mercurial'], correctAnswer: ['A', 'B', 'D'] },
    
    // Data Scientist (12)
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'easy', question: 'What is data?', options: ['Information in raw form', 'Programming code', 'Web content', 'Database software'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'easy', question: 'What is Python?', options: ['Programming language', 'Database', 'Web framework', 'Operating system'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'What is machine learning?', options: ['AI that learns from data', 'Database querying', 'Web development', 'Mobile app development'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'What is data preprocessing?', options: ['Cleaning and preparing data', 'Data visualization', 'Data storage', 'Data deletion'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'What is statistical significance?', options: ['Probability result is not due to chance', 'Data size', 'Processing speed', 'Storage capacity'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'What is cross-validation?', options: ['Model evaluation technique', 'Data collection method', 'Visualization tool', 'Database operation'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'What is deep learning?', options: ['ML with neural networks', 'Database optimization', 'Web development', 'Mobile development'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'What is overfitting?', options: ['Model performs well on training but poor on test data', 'Model performs poorly on all data', 'Model is too simple', 'Model has no parameters'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'What is feature engineering?', options: ['Creating new features from existing data', 'Database design', 'Web development', 'Mobile development'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'What is ensemble learning?', options: ['Combining multiple models', 'Single model approach', 'Database technique', 'Web framework'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'Which are Python data science libraries? (Select all that apply)', options: ['pandas', 'numpy', 'React', 'scikit-learn'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'Which are supervised learning algorithms? (Select all that apply)', options: ['Linear Regression', 'K-means', 'Decision Tree', 'Random Forest'], correctAnswer: ['A', 'C', 'D'] },
    
    // Product Manager (12)
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'easy', question: 'What is a product?', options: ['Solution that meets user needs', 'Programming code', 'Database', 'Web server'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'easy', question: 'What is UX?', options: ['User Experience', 'User Extension', 'Universal Experience', 'Unified Extension'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'What is user story mapping?', options: ['Visualizing user journey and features', 'Code documentation', 'Database design', 'Testing strategy'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'What is MVP?', options: ['Minimum Viable Product', 'Maximum Value Proposition', 'Most Valuable Player', 'Minimum Value Product'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'What is A/B testing?', options: ['Comparing two versions to see which performs better', 'Code testing', 'Database testing', 'Security testing'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'What is product roadmap?', options: ['Strategic plan for product development', 'Code structure', 'Database schema', 'Testing plan'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'What is product-market fit?', options: ['Product satisfies strong market demand', 'Product matches competitor features', 'Product has good design', 'Product is technically sound'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'What is customer acquisition cost (CAC)?', options: ['Cost to acquire a new customer', 'Cost to retain a customer', 'Cost to develop a product', 'Cost to market a product'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'What is churn rate?', options: ['Rate at which customers stop using product', 'Rate of product development', 'Rate of feature releases', 'Rate of bug fixes'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'What is OKR?', options: ['Objectives and Key Results', 'Operational Key Requirements', 'Organizational Knowledge Resources', 'Optimal Key Ratios'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'Which are product management frameworks? (Select all that apply)', options: ['Scrum', 'Kanban', 'React', 'Lean'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'Which are key product metrics? (Select all that apply)', options: ['DAU', 'CAC', 'HTML', 'LTV'], correctAnswer: ['A', 'B', 'D'] },
    
    // Additional Frontend Developer Questions (10)
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is the purpose of useEffect in React?', options: ['Handle side effects', 'Manage state', 'Create components', 'Style components'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is React Context?', options: ['Global state management', 'Component styling', 'Routing system', 'Testing framework'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is the difference between margin and padding?', options: ['Margin is outside, padding is inside', 'No difference', 'Margin is for text, padding for images', 'Padding is deprecated'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is tree shaking in webpack?', options: ['Removing unused code', 'Optimizing images', 'Minifying CSS', 'Compressing files'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is Progressive Web App (PWA)?', options: ['Web app with native app features', 'Mobile-only app', 'Desktop application', 'Server-side app'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is Server Side Rendering (SSR)?', options: ['Rendering pages on server', 'Client-side rendering', 'Database rendering', 'API rendering'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'What is CSS Flexbox?', options: ['1D layout method', '2D layout method', 'Animation library', 'Color system'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'What is lazy loading?', options: ['Loading content when needed', 'Slow loading', 'Background loading', 'Preloading everything'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'medium', question: 'Which are CSS preprocessors? (Select all that apply)', options: ['SASS', 'LESS', 'React', 'Stylus'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Frontend Developer'], difficulty: 'hard', question: 'Which are JavaScript testing frameworks? (Select all that apply)', options: ['Jest', 'Mocha', 'Django', 'Cypress'], correctAnswer: ['A', 'B', 'D'] },
    
    // Additional Backend Developer Questions (10)
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is JWT?', options: ['JSON Web Token', 'Java Web Technology', 'JavaScript Web Tool', 'JSON Web Template'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is database sharding?', options: ['Horizontal partitioning of data', 'Vertical partitioning', 'Data encryption', 'Data compression'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is OAuth?', options: ['Authorization framework', 'Database system', 'Programming language', 'Web server'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is eventual consistency?', options: ['Data consistency achieved over time', 'Immediate consistency', 'No consistency', 'Partial consistency'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is API rate limiting?', options: ['Controlling request frequency', 'API documentation', 'API testing', 'API deployment'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is ACID in databases?', options: ['Atomicity, Consistency, Isolation, Durability', 'Advanced Computer Interface Design', 'Application Code Integration Development', 'Automated Continuous Integration Deployment'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'What is horizontal scaling?', options: ['Adding more servers', 'Upgrading existing server', 'Reducing server load', 'Changing server location'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'What is CAP theorem?', options: ['Consistency, Availability, Partition tolerance', 'Create, Access, Process', 'Cache, API, Performance', 'Code, Architecture, Performance'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'medium', question: 'Which are message queue systems? (Select all that apply)', options: ['RabbitMQ', 'Apache Kafka', 'React', 'Redis'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Backend Developer'], difficulty: 'hard', question: 'Which are database optimization techniques? (Select all that apply)', options: ['Indexing', 'Query optimization', 'CSS styling', 'Connection pooling'], correctAnswer: ['A', 'B', 'D'] },
    
    // Additional Full Stack Developer Questions (8)
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'What is DevOps?', options: ['Development and Operations collaboration', 'Development only', 'Operations only', 'Database operations'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'What is Infrastructure as Code (IaC)?', options: ['Managing infrastructure through code', 'Writing application code', 'Database coding', 'Frontend coding'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'What is monitoring in applications?', options: ['Tracking application performance and health', 'Code review process', 'Testing methodology', 'Deployment strategy'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'What is blue-green deployment?', options: ['Zero-downtime deployment strategy', 'Color-coded deployment', 'Database deployment', 'Frontend deployment'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'What is API Gateway?', options: ['Entry point for API requests', 'Database connection', 'Frontend framework', 'Testing tool'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'What is service mesh?', options: ['Infrastructure layer for service communication', 'Database architecture', 'Frontend pattern', 'Testing framework'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'medium', question: 'Which are containerization tools? (Select all that apply)', options: ['Docker', 'Kubernetes', 'React', 'Podman'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Full Stack Developer'], difficulty: 'hard', question: 'Which are CI/CD tools? (Select all that apply)', options: ['Jenkins', 'GitLab CI', 'Bootstrap', 'GitHub Actions'], correctAnswer: ['A', 'B', 'D'] },
    
    // Additional Data Scientist Questions (8)
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'What is data visualization?', options: ['Graphical representation of data', 'Data storage', 'Data processing', 'Data deletion'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'What is natural language processing (NLP)?', options: ['AI for understanding human language', 'Database querying', 'Web development', 'Mobile development'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'What is regression analysis?', options: ['Statistical method to model relationships', 'Data cleaning technique', 'Visualization method', 'Storage technique'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'What is reinforcement learning?', options: ['Learning through rewards and penalties', 'Supervised learning', 'Data preprocessing', 'Data visualization'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'What is data mining?', options: ['Extracting patterns from large datasets', 'Database storage', 'Data deletion', 'Data encryption'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'What is dimensionality reduction?', options: ['Reducing number of features', 'Increasing data size', 'Data compression', 'Data encryption'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'medium', question: 'Which are data visualization tools? (Select all that apply)', options: ['Matplotlib', 'Tableau', 'React', 'Seaborn'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Data Scientist'], difficulty: 'hard', question: 'Which are unsupervised learning algorithms? (Select all that apply)', options: ['K-means', 'Linear Regression', 'PCA', 'Hierarchical Clustering'], correctAnswer: ['A', 'C', 'D'] },
    
    // Additional Product Manager Questions (8)
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'What is user persona?', options: ['Fictional character representing user segment', 'Real user data', 'Product feature', 'Marketing campaign'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'What is product analytics?', options: ['Measuring product usage and performance', 'Product design', 'Product development', 'Product marketing'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'What is user journey mapping?', options: ['Visualizing user interactions with product', 'Product roadmap', 'Technical architecture', 'Marketing strategy'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'What is cohort analysis?', options: ['Analyzing user groups over time', 'Product feature analysis', 'Competitor analysis', 'Market analysis'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'What is feature flag?', options: ['Toggle to enable/disable features', 'Product documentation', 'User interface element', 'Database field'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'What is North Star Metric?', options: ['Key metric that captures product value', 'Revenue metric', 'User count', 'Feature count'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'medium', question: 'Which are product research methods? (Select all that apply)', options: ['User interviews', 'A/B testing', 'CSS styling', 'Surveys'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['Product Manager'], difficulty: 'hard', question: 'Which are product prioritization frameworks? (Select all that apply)', options: ['RICE', 'MoSCoW', 'React', 'Kano Model'], correctAnswer: ['A', 'B', 'D'] },
    
    // HR Manager Technical Questions (20)
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'easy', question: 'What is HRIS?', options: ['Human Resource Information System', 'Human Resource Integration System', 'Human Resource Internal System', 'Human Resource Internet System'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is ATS?', options: ['Applicant Tracking System', 'Advanced Training System', 'Automated Testing System', 'Application Technology System'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is employee onboarding?', options: ['Process of integrating new employees', 'Employee termination process', 'Performance review process', 'Salary negotiation process'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is talent acquisition?', options: ['Strategic approach to finding and hiring skilled workers', 'Employee training program', 'Performance management system', 'Compensation planning'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is performance management?', options: ['Ongoing process of communication between supervisor and employee', 'Annual review process', 'Salary determination process', 'Employee termination process'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is employee engagement?', options: ['Emotional commitment employees have to organization', 'Employee satisfaction survey', 'Work-life balance program', 'Compensation package'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is diversity and inclusion?', options: ['Creating workplace where all individuals are valued', 'Hiring only diverse candidates', 'Training program for minorities', 'Legal compliance requirement'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is succession planning?', options: ['Process of identifying and developing future leaders', 'Employee promotion process', 'Retirement planning', 'Organizational restructuring'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is compensation and benefits?', options: ['Total rewards package for employees', 'Salary only', 'Health insurance only', 'Bonus payments only'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is organizational development?', options: ['Planned effort to increase organizational effectiveness', 'Employee training program', 'Recruitment strategy', 'Performance review system'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is employee retention?', options: ['Ability to keep employees in organization', 'Hiring new employees', 'Employee termination rate', 'Training completion rate'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is workforce analytics?', options: ['Data-driven approach to managing people', 'Employee survey tool', 'Performance tracking system', 'Recruitment database'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is learning and development?', options: ['Process of improving employee skills and knowledge', 'Recruitment process', 'Performance evaluation', 'Compensation planning'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is change management?', options: ['Structured approach to transitioning individuals and organizations', 'Employee termination process', 'Recruitment strategy', 'Performance improvement'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is employee relations?', options: ['Managing relationship between employer and employees', 'Customer service', 'Vendor management', 'Stakeholder communication'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is talent management?', options: ['Strategic approach to attracting, developing, and retaining talent', 'Recruitment only', 'Training only', 'Performance review only'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'What is HR compliance?', options: ['Ensuring adherence to employment laws and regulations', 'Employee handbook creation', 'Policy documentation', 'Training delivery'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'What is workforce planning?', options: ['Strategic process of forecasting future workforce needs', 'Daily scheduling', 'Project planning', 'Budget planning'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'medium', question: 'Which are key HR metrics? (Select all that apply)', options: ['Turnover rate', 'Time to hire', 'Customer satisfaction', 'Employee engagement score'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['HR Manager'], difficulty: 'hard', question: 'Which are components of total rewards? (Select all that apply)', options: ['Base salary', 'Benefits', 'Marketing budget', 'Recognition programs'], correctAnswer: ['A', 'B', 'D'] },
    
    // General Technical Questions (20) - for roles without specific technical questions
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'easy', question: 'What is a computer?', options: ['Electronic device that processes data', 'Mechanical calculator', 'Storage device only', 'Display device only'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'easy', question: 'What is the Internet?', options: ['Global network of interconnected computers', 'Local area network', 'Single computer system', 'Software application'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is cloud computing?', options: ['Delivery of computing services over the internet', 'Local server storage', 'Desktop computing', 'Mobile computing only'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is cybersecurity?', options: ['Protection of digital information and systems', 'Physical security only', 'Network hardware', 'Software development'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is artificial intelligence?', options: ['Computer systems that can perform tasks requiring human intelligence', 'Advanced calculator', 'Database system', 'Web browser'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'hard', question: 'What is blockchain?', options: ['Distributed ledger technology', 'Database management system', 'Web development framework', 'Mobile app platform'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is big data?', options: ['Large volumes of structured and unstructured data', 'Small database', 'Single file', 'Text document'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'hard', question: 'What is IoT?', options: ['Internet of Things - network of connected devices', 'Internet of Technology', 'Internal Operations Tool', 'Integrated Online Terminal'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is a mobile app?', options: ['Software application designed for mobile devices', 'Web browser', 'Operating system', 'Hardware component'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is social media?', options: ['Online platforms for social interaction and content sharing', 'Email system', 'File storage', 'Video game'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'easy', question: 'What is email?', options: ['Electronic mail system', 'Physical mail', 'Phone system', 'Fax machine'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is e-commerce?', options: ['Buying and selling goods online', 'Physical retail store', 'Manufacturing process', 'Transportation service'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'hard', question: 'What is digital transformation?', options: ['Integration of digital technology into business areas', 'Computer repair', 'Software installation', 'Hardware upgrade'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is remote work technology?', options: ['Tools enabling work from anywhere', 'Office equipment only', 'Physical workspace', 'Transportation system'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'hard', question: 'What is automation?', options: ['Technology performing tasks without human intervention', 'Manual process', 'Human-only tasks', 'Physical labor'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is data privacy?', options: ['Protection of personal information', 'Data sharing', 'Public information', 'Data deletion'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'hard', question: 'What is digital marketing?', options: ['Marketing using digital channels', 'Traditional advertising', 'Print media only', 'Radio advertising'], correctAnswer: 'A' },
    { type: 'single-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'What is video conferencing?', options: ['Real-time video communication over internet', 'Phone call only', 'Email system', 'Text messaging'], correctAnswer: 'A' },
    { type: 'multi-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'Which are common operating systems? (Select all that apply)', options: ['Windows', 'macOS', 'Microsoft Word', 'Linux'], correctAnswer: ['A', 'B', 'D'] },
    { type: 'multi-choice', category: 'technical', tags: ['general'], difficulty: 'medium', question: 'Which are digital communication tools? (Select all that apply)', options: ['Email', 'Slack', 'Physical mail', 'Zoom'], correctAnswer: ['A', 'B', 'D'] },
    
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
    { type: 'multi-choice', category: 'management', tags: ['management'], difficulty: 'medium', question: 'Which are signs of a healthy team culture? (Select all that apply)', options: ['Open communication', 'Fear of failure', 'Collaboration', 'Psychological safety'], correctAnswer: ['A', 'C', 'D'] },
    
    // EXPERIENCE QUESTIONS (2)
    { type: 'single-choice', category: 'experience', tags: ['experience'], difficulty: 'medium', question: 'Do you have experience in this field?', options: ['Yes', 'No'], correctAnswer: null },
    { type: 'file-upload', category: 'experience', tags: ['experience'], difficulty: 'medium', question: 'Please upload your resume', options: [], correctAnswer: null }
  ];
  
  await assessmentsDB.questionBank.bulkPut(questions);
  console.log(`✅ Created ${questions.length} focused questions`);
  console.log(`📊 Question breakdown: 15 aptitude + 179 technical + 14 management + 2 experience = ${questions.length} total`);
};

export const createDefaultAssessment = async (jobId, jobTitle) => {
  const questionCount = await assessmentsDB.questionBank.count();
  if (questionCount === 0) {
    await seedQuestionBank();
  }
  
  const allAptitude = await assessmentsDB.questionBank.where('category').equals('aptitude').toArray();
  const aptitudeQuestions = shuffleArray(allAptitude).slice(0, 15);
  
  const allTechnical = await assessmentsDB.questionBank.where('category').equals('technical').toArray();
  const technicalQuestions = shuffleArray(allTechnical).slice(0, 25);
  
  const allManagerial = await assessmentsDB.questionBank.where('category').equals('management').toArray();
  const managerialQuestions = shuffleArray(allManagerial).slice(0, 12);
  
  return {
    jobId,
    title: `${jobTitle} Assessment`,
    sections: [
      { id: 1, title: 'Aptitude', questions: aptitudeQuestions },
      { id: 2, title: 'Technical', questions: technicalQuestions },
      { id: 3, title: 'Management', questions: managerialQuestions },
      { id: 4, title: 'Experience', questions: [
        {
          id: 'experience-field',
          type: 'single-choice',
          question: 'Do you have experience in this field?',
          options: ['Yes', 'No'],
          required: true
        },
        {
          id: 'resume-upload',
          type: 'file-upload',
          question: 'Please upload your resume',
          required: true,
          validation: { allowedTypes: ['.pdf', '.doc', '.docx'] }
        }
      ] }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

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
    case 'file-upload':
      return { ...base, validation: { allowedTypes: ['.pdf', '.doc', '.docx'] }, question: 'Please upload your resume' };
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

export const generateAssessmentForJob = async (job, stage = 'applied') => {
  const questionCount = await assessmentsDB.questionBank.count();
  if (questionCount === 0) {
    await seedQuestionBank();
  }
  
  // Use job ID and stage as seed for consistent question selection
  const seed = job.id * 1000 + stage.length;
  
  const allAptitude = await assessmentsDB.questionBank.where('category').equals('aptitude').toArray();
  const aptitudeQuestions = shuffleArray(allAptitude, seed).slice(0, 10);
  
  // Get role-specific technical questions
  let technicalQuestions = await assessmentsDB.questionBank
    .where('category').equals('technical')
    .filter(q => q.tags.includes(job.title))
    .toArray();
    
  // If not enough role-specific questions, supplement with general technical questions
  if (technicalQuestions.length < 20) {
    const generalTechnical = await assessmentsDB.questionBank
      .where('category').equals('technical')
      .filter(q => q.tags.includes('general'))
      .toArray();
    
    // Combine role-specific and general questions
    const combinedQuestions = [...technicalQuestions, ...generalTechnical];
    technicalQuestions = shuffleArray(combinedQuestions, seed + 1).slice(0, 20);
  } else {
    technicalQuestions = shuffleArray(technicalQuestions, seed + 1).slice(0, 20);
  }
  
  const allManagerial = await assessmentsDB.questionBank.where('category').equals('management').toArray();
  const managerialQuestions = shuffleArray(allManagerial, seed + 2).slice(0, 7);
  
  const allExperience = await assessmentsDB.questionBank.where('category').equals('experience').toArray();
  const experienceQuestions = allExperience;
  
  const assessment = {
    jobId: job.id,
    stage,
    title: `${job.title} Assessment`,
    sections: [
      { id: 1, title: 'Aptitude', questions: aptitudeQuestions },
      { id: 2, title: 'Technical', questions: technicalQuestions },
      { id: 3, title: 'Management', questions: managerialQuestions },
      { id: 4, title: 'Experience', questions: experienceQuestions }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const assessmentId = await assessmentsDB.assessments.add(assessment);
  console.log(`✅ Generated assessment for ${job.title}: ${aptitudeQuestions.length + technicalQuestions.length + managerialQuestions.length + experienceQuestions.length} questions`);
  
  return { ...assessment, id: assessmentId };
};

export const seedAssessments = async (jobs) => {
  await seedQuestionBank();
  console.log(`✅ Generated focused question bank with role-based templates`);
};

export const getAssessmentByJob = (jobId, stage = 'applied') => 
  assessmentsDB.assessments.where('jobId').equals(jobId).and(a => a.stage === stage).first();

export const getAssessmentsByJob = (jobId) => 
  assessmentsDB.assessments.where('jobId').equals(jobId).toArray();

export const deleteAssessment = (id) => assessmentsDB.assessments.delete(id);
  
export const getAssessment = (id) => assessmentsDB.assessments.get(id);
export const saveAssessment = (assessment) => assessmentsDB.assessments.add(assessment);
export const updateAssessment = (id, data) => assessmentsDB.assessments.update(id, { ...data, updatedAt: new Date() });
export const saveResponse = (response) => assessmentsDB.assessmentResponses.add(response);
export const saveDraftResponse = async (candidateId, assessmentId, responses) => {
  console.log('Saving draft:', { candidateId, assessmentId, responses });
  
  // Delete any existing draft for this candidate/assessment
  await assessmentsDB.assessmentResponses
    .where(['candidateId', 'assessmentId']).equals([candidateId, assessmentId])
    .and(r => !r.submittedAt).delete();
  
  // Create new draft
  const id = await assessmentsDB.assessmentResponses.add({
    candidateId,
    assessmentId,
    responses,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Draft saved with ID:', id);
  return id;
};
export const getResponse = (candidateId, assessmentId) => 
  assessmentsDB.assessmentResponses.where(['candidateId', 'assessmentId']).equals([candidateId, assessmentId]).first();

export const getDraftResponse = async (candidateId, assessmentId) => {
  console.log('Getting draft for:', { candidateId, assessmentId });
  const draft = await assessmentsDB.assessmentResponses
    .where(['candidateId', 'assessmentId']).equals([candidateId, assessmentId])
    .and(r => !r.submittedAt).first();
  console.log('Found draft:', draft);
  return draft;
};

export const saveAssessmentWithResponses = async (candidateId, jobId, stage, assessment, responses) => {
  // Save assessment if not exists
  let savedAssessment = await getAssessmentByJob(jobId, stage);
  if (!savedAssessment) {
    const assessmentId = await assessmentsDB.assessments.add(assessment);
    savedAssessment = { ...assessment, id: assessmentId };
  }
  
  // Save/update responses
  await saveDraftResponse(candidateId, savedAssessment.id, responses);
  
  return savedAssessment;
};

export const getAssessmentWithResponses = async (candidateId, jobId, stage) => {
  // Check for existing assessment with responses
  const existingAssessment = await getAssessmentByJob(jobId, stage);
  if (existingAssessment) {
    const responses = await getDraftResponse(candidateId, existingAssessment.id);
    if (responses) {
      return { assessment: existingAssessment, responses: responses.responses, lastSaved: responses.updatedAt };
    }
  }
  return null;
};

export const saveBuilderState = async (jobId, state) => {
  const existing = await assessmentsDB.builderStates.where('jobId').equals(jobId).first();
  if (existing) {
    return assessmentsDB.builderStates.update(existing.id, { state, lastModified: new Date() });
  }
  return assessmentsDB.builderStates.add({ jobId, state, lastModified: new Date() });
};

export const getBuilderState = (jobId) => 
  assessmentsDB.builderStates.where('jobId').equals(jobId).first();

export const clearBuilderState = (jobId) => 
  assessmentsDB.builderStates.where('jobId').equals(jobId).delete();