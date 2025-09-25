import React, { useState, useEffect } from 'react';
import { getAllJobs, getAssessmentByJob } from '../db/index.js';

const TestAssessment = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobsData = await getAllJobs();
      setJobs(jobsData.slice(0, 5)); // First 5 jobs for testing
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadAssessment = async (jobId) => {
    try {
      const assessmentData = await getAssessmentByJob(jobId, 'applied');
      setAssessment(assessmentData);
      setSelectedJob(jobId);
    } catch (error) {
      console.error('Error loading assessment:', error);
      setAssessment(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Assessment Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Jobs</h2>
          <div className="space-y-2">
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => loadAssessment(job.id)}
                className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 ${
                  selectedJob === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-gray-600">ID: {job.id}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Assessment Status</h2>
          {selectedJob ? (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Job ID: {selectedJob}</h3>
              {assessment ? (
                <div className="space-y-2">
                  <div className="text-green-600 font-medium">✓ Assessment Found</div>
                  <div><strong>Title:</strong> {assessment.title}</div>
                  <div><strong>Stage:</strong> {assessment.stage}</div>
                  <div><strong>Sections:</strong> {assessment.sections?.length || 0}</div>
                  <div><strong>Total Questions:</strong> {
                    assessment.sections?.reduce((total, section) => 
                      total + (section.questions?.length || 0), 0
                    ) || 0
                  }</div>
                  <div className="mt-4">
                    <a 
                      href={`/jobs/${selectedJob}/assessment/builder`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Open Builder
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-red-600 font-medium">✗ No Assessment Found</div>
                  <div className="text-gray-600">No assessment exists for this job at 'applied' stage</div>
                  <div className="mt-4">
                    <a 
                      href={`/jobs/${selectedJob}/assessment/builder`}
                      className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Create Assessment
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Select a job to check its assessment status
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestAssessment;