import React from 'react';
import { Link } from 'react-router-dom';

const AssessmentTest = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Assessment Route Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test Links:</h2>
          <div className="space-y-2">
            <div>
              <Link 
                to="/take-assessment/1/1" 
                className="text-blue-600 hover:underline"
              >
                /take-assessment/1/1 (simple route)
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Manual Navigation:</h2>
          <button 
            onClick={() => {
              console.log('Manual navigation to /take-assessment/1/1');
              window.location.href = '/take-assessment/1/1';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Navigate to Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTest;