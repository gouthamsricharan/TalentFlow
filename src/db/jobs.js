import Dexie from 'dexie';

export const jobsDB = new Dexie('JobsDB');

jobsDB.version(1).stores({
  jobs: '++id, title, slug, status, order, createdAt'
});

export const seedJobs = async () => {
  const staticJobs = [
    { id: 1, title: 'Senior Software Engineer', status: 'active', tags: ['React', 'Node.js', 'JavaScript'], order: 1 },
    { id: 2, title: 'Product Manager', status: 'active', tags: ['Strategy', 'Analytics', 'Leadership'], order: 2 },
    { id: 3, title: 'UX Designer', status: 'active', tags: ['Figma', 'Sketch', 'User Research'], order: 3 },
    { id: 4, title: 'Data Scientist', status: 'active', tags: ['Python', 'Machine Learning', 'Statistics'], order: 4 },
    { id: 5, title: 'DevOps Engineer', status: 'active', tags: ['AWS', 'Docker', 'Kubernetes'], order: 5 },
    { id: 6, title: 'Frontend Developer', status: 'active', tags: ['React', 'Vue.js', 'CSS'], order: 6 },
    { id: 7, title: 'Backend Developer', status: 'active', tags: ['Java', 'Spring', 'SQL'], order: 7 },
    { id: 8, title: 'Full Stack Developer', status: 'active', tags: ['React', 'Node.js', 'MongoDB'], order: 8 },
    { id: 9, title: 'Mobile App Developer', status: 'archived', tags: ['React Native', 'Flutter', 'iOS'], order: 9 },
    { id: 10, title: 'QA Engineer', status: 'active', tags: ['Selenium', 'Testing', 'QA'], order: 10 },
    { id: 11, title: 'Business Analyst', status: 'active', tags: ['Requirements', 'Analysis', 'Documentation'], order: 11 },
    { id: 12, title: 'Project Manager', status: 'active', tags: ['Agile', 'Scrum', 'Leadership'], order: 12 },
    { id: 13, title: 'Marketing Manager', status: 'archived', tags: ['Digital Marketing', 'SEO', 'Analytics'], order: 13 },
    { id: 14, title: 'Sales Representative', status: 'active', tags: ['Sales', 'CRM', 'Communication'], order: 14 },
    { id: 15, title: 'Customer Success Manager', status: 'active', tags: ['Customer Support', 'Relationship Management'], order: 15 },
    { id: 16, title: 'HR Specialist', status: 'active', tags: ['Recruitment', 'Employee Relations'], order: 16 },
    { id: 17, title: 'Financial Analyst', status: 'archived', tags: ['Excel', 'Financial Modeling', 'Analysis'], order: 17 },
    { id: 18, title: 'Operations Manager', status: 'active', tags: ['Process Improvement', 'Management'], order: 18 },
    { id: 19, title: 'Content Writer', status: 'active', tags: ['Content Creation', 'SEO', 'Writing'], order: 19 },
    { id: 20, title: 'Graphic Designer', status: 'active', tags: ['Adobe Creative Suite', 'Design'], order: 20 },
    { id: 21, title: 'System Administrator', status: 'active', tags: ['Linux', 'Networking', 'Security'], order: 21 },
    { id: 22, title: 'Database Administrator', status: 'archived', tags: ['MySQL', 'PostgreSQL', 'Database Design'], order: 22 },
    { id: 23, title: 'Security Engineer', status: 'active', tags: ['Cybersecurity', 'Penetration Testing'], order: 23 },
    { id: 24, title: 'Cloud Architect', status: 'active', tags: ['AWS', 'Azure', 'Cloud Computing'], order: 24 },
    { id: 25, title: 'Machine Learning Engineer', status: 'active', tags: ['TensorFlow', 'PyTorch', 'AI'], order: 25 }
  ];
  
  const jobs = staticJobs.map(job => ({
    ...job,
    slug: job.title.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date('2024-01-01')
  }));
  
  await jobsDB.jobs.bulkPut(jobs);
  return jobs;
};

export const getJob = (id) => jobsDB.jobs.get(id);
export const getAllJobs = () => jobsDB.jobs.toArray();
export const updateJob = async (id, data) => {
  console.log(`🔄 Updating job ${id} with:`, data);
  const result = await jobsDB.jobs.update(id, data);
  console.log(`✅ Job ${id} updated successfully`);
  return result;
};
export const saveJob = (job) => jobsDB.jobs.add(job);