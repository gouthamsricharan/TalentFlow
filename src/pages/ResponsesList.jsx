import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp } from 'lucide-react';
import { getAllJobs } from '../db/jobs';
import { assessmentsDB } from '../db/assessments';

const ResponsesList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const jobsData = await getAllJobs();
      
      const jobsWithResponses = await Promise.all(
        jobsData.map(async (job) => {
          const responses = await assessmentsDB.assessmentResponses
            .where('jobId').equals(job.id)
            .and(r => r.submittedAt !== null)
            .count();
          
          return {
            ...job,
            responseCount: responses
          };
        })
      );

      setJobs(jobsWithResponses.filter(job => job.responseCount > 0));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assessment Responses</h1>
        <p className="mt-2 text-gray-600">View and analyze candidate assessment responses by job</p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses Yet</h3>
          <p className="text-gray-600">No assessment responses have been submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/candidate-responses/${job.id}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{job.responseCount} responses</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {job.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {tag}
                  </span>
                ))}
                {job.tags?.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{job.tags.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.status}
                </span>
                <span className="text-sm text-blue-600 font-medium">View Responses →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsesList;