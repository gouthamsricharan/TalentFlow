import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Calendar, MessageSquare } from 'lucide-react'
import { apiClient } from '../api/client.js'

export default function CandidateProfile() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get candidate data directly
        const candidateData = await fetch(`/api/candidates/${id}`).then(res => res.json())
        setCandidate(candidateData)

        if (candidateData && !candidateData.error) {
          console.log('🔍 Fetching timeline for candidate:', candidateData.id)
          const timelineData = await fetch(`/api/candidates/${candidateData.id}/timeline`).then(res => res.json())
          console.log('📊 Timeline data received:', timelineData)
          setTimeline(Array.isArray(timelineData) ? timelineData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [])
        }
      } catch (error) {
        console.error('Failed to fetch candidate data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-gray-100 text-gray-800 border-gray-200',
      screen: 'bg-blue-100 text-blue-800 border-blue-200',
      tech: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      offer: 'bg-purple-100 text-purple-800 border-purple-200',
      hired: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressStages = (currentStage, timeline) => {
    const allStages = [
      { key: 'applied', title: 'Application Submitted', description: 'Candidate applied for the position', icon: '📝' },
      { key: 'screen', title: 'Initial Screening', description: 'Phone/video screening completed', icon: '📞' },
      { key: 'tech', title: 'Technical Interview', description: 'Technical assessment and interview', icon: '💻' },
      { key: 'offer', title: 'Offer Extended', description: 'Job offer has been made', icon: '🎯' },
      { key: 'hired', title: 'Hired', description: 'Candidate accepted and onboarded', icon: '✅' }
    ]
    
    const stageOrder = ['applied', 'screen', 'tech', 'offer', 'hired']
    
    if (currentStage === 'rejected') {
      // For rejected candidates, show stages based on timeline entries
      const completedStages = timeline.filter(t => t.stage !== 'rejected').map(t => t.stage)
      const rejectionEntry = timeline.find(t => t.stage === 'rejected')
      
      return allStages.map((stage, index) => {
        const hasTimelineEntry = completedStages.includes(stage.key)
        return {
          ...stage,
          completed: hasTimelineEntry,
          current: false,
          pending: !hasTimelineEntry,
          rejected: rejectionEntry && index === completedStages.length // Show rejection at the right point
        }
      })
    } else {
      // Normal progression
      const currentIndex = stageOrder.indexOf(currentStage)
      
      return allStages.map((stage, index) => ({
        ...stage,
        completed: index < currentIndex || (currentStage === 'hired' && index <= currentIndex),
        current: index === currentIndex,
        pending: index > currentIndex
      }))
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!candidate || candidate.error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidate not found</h2>
        <Link to="/candidates" className="text-blue-600 hover:text-blue-800">
          ← Back to candidates
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <Link to="/candidates" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Candidates
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {candidate.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Applied {formatDate(candidate.createdAt)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStageColor(candidate?.stage || 'applied')}`}>
                {candidate?.stage ? candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1) : 'Applied'}
              </span>
              <div className="mt-2 text-sm text-gray-600">
                Job ID: #{candidate.jobId}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Progress Timeline
          </h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {getProgressStages(candidate.stage, timeline).map((stage, index) => {
                const stageEntry = timeline.find(t => t.stage === stage.key)
                const isCompleted = stage.completed
                const isCurrent = stage.current
                const isPending = stage.pending
                const rejectionEntry = timeline.find(t => t.stage === 'rejected')
                
                return (
                  <div key={stage.key} className="relative flex items-start">
                    {/* Stage Icon */}
                    <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-semibold">{stage.icon}</span>
                      )}
                    </div>
                    
                    {/* Stage Content */}
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {stage.title}
                        </h3>
                        <div className="text-right">
                          {stageEntry ? (
                            <span className="text-sm text-gray-500">
                              {new Date(stageEntry.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          ) : isCompleted ? (
                            <span className="text-xs text-gray-400">Completed</span>
                          ) : isCurrent ? (
                            <span className="text-xs text-blue-500 font-medium">In Progress</span>
                          ) : (
                            <span className="text-xs text-gray-400">Pending</span>
                          )}
                        </div>
                      </div>
                      
                      {stageEntry?.notes ? (
                        <p className={`text-sm mt-1 ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {stageEntry.notes}
                        </p>
                      ) : (
                        <p className={`text-sm mt-1 ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {stage.description}
                        </p>
                      )}
                      
                      {stageEntry?.notes && stageEntry.notes.trim() && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{stageEntry.notes}</p>
                        </div>
                      )}
                      
                      {!stageEntry?.notes && isCompleted && (
                        <p className="text-sm mt-1 text-gray-500">Stage completed</p>
                      )}
                      
                      {stageEntry && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="inline-flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {new Date(stageEntry.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {/* Show rejection entry for rejected candidates */}
              {candidate.stage === 'rejected' && timeline.find(t => t.stage === 'rejected') && (
                <div className="relative flex items-start">
                  <div className="relative z-10 w-8 h-8 rounded-full border-2 bg-red-500 border-red-500 text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-red-700">Application Rejected</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(timeline.find(t => t.stage === 'rejected').timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-red-600">
                      {timeline.find(t => t.stage === 'rejected').notes}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {new Date(timeline.find(t => t.stage === 'rejected').timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raw Timeline */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Activity Log ({timeline.length} entries)
          </h2>
          
          {timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No timeline entries yet.</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((entry, index) => (
                <div key={entry.id || index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStageColor(entry?.stage || 'applied')}`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        Moved to {entry?.stage ? entry.stage.charAt(0).toUpperCase() + entry.stage.slice(1) : 'Applied'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    {entry.notes && entry.notes.trim() && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}