import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, FileText, Plus } from 'lucide-react'
import { getJob, getCandidatesByJob, getAssessmentsByJob, updateCandidate, addTimelineEntry } from '../db/index.js'
import KanbanBoard from './KanbanBoard'

export default function JobDetails() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [assessments, setAssessments] = useState([])
  const [activeTab, setActiveTab] = useState('candidates')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for job ID:', id)
        
        const [jobData, candidatesData, assessmentsData] = await Promise.all([
          getJob(parseInt(id)),
          getCandidatesByJob(parseInt(id)),
          getAssessmentsByJob(parseInt(id))
        ])
        
        console.log('Job data:', jobData)
        console.log('Assessments found:', assessmentsData?.length || 0)
        
        setJob(jobData)
        setCandidates(candidatesData)
        setAssessments(assessmentsData || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCandidateUpdate = async (candidateId, newStage, notes = '') => {
    await updateCandidate(candidateId, { stage: newStage })
    await addTimelineEntry({
      candidateId,
      stage: newStage,
      timestamp: new Date(),
      notes: notes || `Moved to ${newStage} stage`
    })
    
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, stage: newStage } : c
    ))
  }

  const createAssessment = async () => {
    const stage = prompt('Enter assessment stage (applied, screen, tech, offer, hired):', 'applied')
    if (!stage) return
    
    try {
      const response = await fetch(`/api/assessments/job/${id}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      })
      const newAssessment = await response.json()
      setAssessments(prev => [...prev, newAssessment])
    } catch (error) {
      console.error('Failed to create assessment:', error)
    }
  }

  const deleteAssessment = async (assessmentId) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return
    try {
      await fetch(`/api/assessments/${assessmentId}`, { method: 'DELETE' })
      setAssessments(prev => prev.filter(a => a.id !== assessmentId))
    } catch (error) {
      console.error('Failed to delete assessment:', error)
    }
  }

  if (loading) return <div className="text-center">Loading...</div>
  if (!job) return <div className="text-center">Job not found</div>

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <Link to="/jobs" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>

          <div className="mt-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {job.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'candidates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Candidates ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'assessment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Assessments ({assessments.length})
            </button>
          </div>

          {activeTab === 'candidates' && (
            <div>
              {candidates.length === 0 ? (
                <p className="text-gray-500">No candidates for this job yet.</p>
              ) : (
                <KanbanBoard 
                  candidates={candidates}
                  onCandidateUpdate={handleCandidateUpdate}
                  showDropBoxes={job.status === 'active'}
                  showSearch={true}
                  title={null}
                  description={null}
                  isReadOnly={job.status === 'archived'}
                />
              )}
            </div>
          )}

          {activeTab === 'assessment' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Assessments</h3>
                <button
                  onClick={createAssessment}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assessment
                </button>
              </div>
              
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Created</h3>
                  <p className="text-gray-600 mb-4">Create assessments to evaluate candidates for this position.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-medium text-gray-900">{assessment.title}</h4>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {assessment.stage}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {assessment.sections.length} sections, {' '}
                            {assessment.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/jobs/${id}/assessment/builder`}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteAssessment(assessment.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h5 className="font-medium text-gray-900 mb-2">Sections:</h5>
                        <ul className="space-y-1">
                          {assessment.sections.map((section, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              • {section.title} ({section.questions.length} questions)
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {(() => {
                        const stageCandidate = candidates.find(c => c.stage === assessment.stage);
                        return stageCandidate ? (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">Test Assessment:</h5>
                            <p className="text-xs text-gray-600 mb-2">
                              Available for candidates in <span className="font-medium">{assessment.stage}</span> stage
                            </p>
                            <Link
                              to={`/assessment/${assessment.id}/candidate/${stageCandidate.id}`}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Take Assessment (as {stageCandidate.name})
                            </Link>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">Test Assessment:</h5>
                            <p className="text-xs text-gray-600">
                              No candidates in <span className="font-medium">{assessment.stage}</span> stage to test with
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Created: {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}