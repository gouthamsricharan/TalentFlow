import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Search, MessageSquare, Clock, FileText } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getAssessmentByJob, getCandidateTimeline } from '../db/index.js'
import MentionInput, { renderTextWithMentions } from '../components/MentionInput'

const stages = [
  { id: 'applied', title: 'Applied', color: 'bg-gradient-to-br from-gray-50 to-gray-100', icon: '📝' },
  { id: 'screen', title: 'Screening', color: 'bg-gradient-to-br from-blue-50 to-blue-100', icon: '📞' },
  { id: 'tech', title: 'Technical', color: 'bg-gradient-to-br from-yellow-50 to-yellow-100', icon: '💻' },
  { id: 'offer', title: 'Offer', color: 'bg-gradient-to-br from-purple-50 to-purple-100', icon: '🎯' },
  { id: 'hired', title: 'Hired', color: 'bg-gradient-to-br from-green-50 to-green-100', icon: '✅' },
  { id: 'rejected', title: 'Rejected', color: 'bg-gradient-to-br from-red-50 to-red-100', icon: '❌' }
]

function CandidateCard({ candidate, isReadOnly = false, jobId }) {
  const navigate = useNavigate()
  const [latestNote, setLatestNote] = useState('')
  const [hasNotes, setHasNotes] = useState(false)
  const [assessment, setAssessment] = useState(null)
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest note
        const timeline = await getCandidateTimeline(candidate.id)
        
        timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        
        if (timeline.length > 0) {
          const latestEntry = timeline[0]
          const note = latestEntry.notes || ''
          setLatestNote(note)
          setHasNotes(note.trim() !== '')
        }

        // Fetch assessment for this job (always use 'applied' stage)
        const actualJobId = jobId || candidate.jobId
        
        if (actualJobId) {
          const parsedJobId = parseInt(actualJobId)
          const assessmentData = await getAssessmentByJob(parsedJobId, 'applied')
          console.log(`Assessment check for job ${parsedJobId}:`, assessmentData ? 'Found' : 'Not found')
          setAssessment(assessmentData)
          
          // Check if candidate has submitted response
          if (assessmentData) {
            const { hasSubmittedResponse } = await import('../db/index.js')
            const hasSubmitted = await hasSubmittedResponse(candidate.id, assessmentData.id)
            setAssessment({...assessmentData, hasSubmitted})
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    
    fetchData()
  }, [candidate.id, candidate.stage, jobId])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isReadOnly ? {} : attributes)}
      {...(isReadOnly ? {} : listeners)}
      className={`bg-white p-3 rounded-2xl shadow-sm border border-gray-200/50 transition-all duration-300 min-w-[280px] hover:shadow-lg hover:-translate-y-1 ${
        hasNotes ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white' : 'hover:border-blue-200'
      } ${
        isReadOnly ? 'cursor-default opacity-75' : 'cursor-grab active:cursor-grabbing hover:scale-[1.02]'
      } ${isDragging ? 'shadow-2xl shadow-blue-500/20 scale-105 rotate-1' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-base flex-1 mr-2">{candidate?.name || 'Unknown'}</h4>
        <div className="flex items-center space-x-1 flex-shrink-0">
          {assessment && candidate.stage === assessment.stage ? (
            assessment.hasSubmitted ? (
              <button
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const route = `/assessment-results/${assessment.id}/${candidate.id}`;
                  window.location.href = route;
                }}
              >
                📊 RESULTS
              </button>
            ) : (
              <button
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 animate-pulse"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const route = `/take-assessment/${jobId || candidate.jobId}/${candidate.id}`;
                  console.log('🚀 MOUSEDOWN - Navigating to:', route);
                  window.location.href = route;
                }}
              >
                📝 ASSESS
              </button>
            )
          ) : (
            <span className="px-3 py-1.5 text-xs bg-gray-100 text-gray-500 rounded-full border border-gray-200">No Assessment</span>
          )}
          {hasNotes && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              {latestNote.includes('@') && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600 break-words mb-2">{candidate?.email || 'No email'}</p>
      {latestNote && latestNote.trim() !== '' && !latestNote.startsWith('Moved to') && (
        <div className="text-xs text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-xl border border-blue-200/50 mt-2">
          <div className="flex items-center mb-1">
            <MessageSquare className="w-3 h-3 text-blue-500 mr-1" />
            <span className="text-blue-600 font-medium text-xs">Latest Note</span>
          </div>
          <div className="line-clamp-2">
            {renderTextWithMentions(latestNote)}
          </div>
        </div>
      )}
    </div>
  )
}

function DropBox({ stage, title, color, isHighlighted }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  
  return (
    <div
      ref={setNodeRef}
      className={`${color} p-3 rounded-lg border-2 border-dashed transition-all min-h-[60px] flex items-center justify-center ${
        isHighlighted || isOver 
          ? 'border-blue-500 bg-blue-100 scale-105 shadow-md' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <p className="text-sm font-medium text-center text-gray-700">{title}</p>
    </div>
  )
}

function StageColumn({ stage, candidates, searchTerm, onSearchChange, showSearch = true, currentPage, onPageChange, updateTrigger = 0, isReadOnly = false }) {
  const filteredCandidates = candidates?.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const itemsPerPage = 3
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className={`${stage.color} p-6 rounded-3xl h-full flex flex-col border border-gray-200/30 shadow-sm hover:shadow-md transition-all duration-300`} id={stage.id}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center">
          <span className="text-2xl mr-2">{stage.icon}</span>
          {stage.title}
        </h3>
        <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
          {filteredCandidates.length}
        </span>
      </div>
      {showSearch && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => onSearchChange(stage.id, e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
          />
        </div>
      )}
      <div className="flex-1">
        <SortableContext items={paginatedCandidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-32">
            {paginatedCandidates.map(candidate => (
              <CandidateCard 
                key={`${candidate.id}-${updateTrigger}`} 
                candidate={candidate} 
                isReadOnly={isReadOnly}
                jobId={candidate.jobId}
              />
            ))}
          </div>
        </SortableContext>
      </div>
      {totalPages > 1 && (
        <div className="mt-3">
          <div className="flex justify-center items-center space-x-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(stage.id, pageNum)}
                  className={`w-8 h-8 text-xs rounded-full transition-all duration-200 ${
                    currentPage === pageNum 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-110' 
                      : 'bg-white/80 text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {totalPages > 5 && (
              <span className="text-xs text-gray-500">...{totalPages}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center space-x-2">
        <span>{type === 'success' ? '✅' : '❌'}</span>
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  )
}

export default function KanbanBoard({ 
  candidates: propCandidates, 
  onCandidateUpdate, 
  showDropBoxes = false,
  showSearch = true,
  title = "Kanban Board",
  description = "Drag candidates between stages to update their status",
  isReadOnly = false
}) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [searchTerms, setSearchTerms] = useState({})
  const [hoveredStage, setHoveredStage] = useState(null)
  const [currentPages, setCurrentPages] = useState({})
  const [toast, setToast] = useState(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [pendingMove, setPendingMove] = useState(null)
  const [notes, setNotes] = useState('')
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    if (propCandidates) {
      setCandidates(propCandidates)
      setLoading(false)
    } else {
      const fetchCandidates = async () => {
        try {
          const { getAllJobs, getCandidatesByJob } = await import('../db/index.js')
          const jobs = await getAllJobs()
          const allCandidates = []
          for (const job of jobs) {
            const jobCandidates = await getCandidatesByJob(job.id)
            allCandidates.push(...jobCandidates)
          }
          setCandidates(allCandidates)
        } catch (error) {
          console.error('Failed to fetch candidates:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchCandidates()
    }
  }, [propCandidates])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    setHoveredStage(null)
    // Auto-scroll to top to show drop boxes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDragOver = (event) => {
    const { over } = event
    if (over && over.id !== hoveredStage) {
      setHoveredStage(over.id)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)
    setHoveredStage(null)

    if (!over) return

    const candidateId = active.id
    let newStage = showDropBoxes ? hoveredStage : over.id

    // Check if dropped on a stage column or candidate within a stage
    if (!stages.some(s => s.id === newStage)) {
      const overCandidate = candidates.find(c => c.id === over.id)
      if (overCandidate) {
        newStage = overCandidate.stage
      } else {
        return
      }
    }

    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate || candidate.stage === newStage) return

    // Validate forward-only progression
    const stageOrder = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']
    const currentIndex = stageOrder.indexOf(candidate.stage)
    const newIndex = stageOrder.indexOf(newStage)
    
    // Allow moving to rejected from any stage, but otherwise only forward
    if (newStage !== 'rejected' && newIndex <= currentIndex) {
      setToast({ message: 'Cannot move candidate backward in the hiring process!', type: 'error' })
      return
    }

    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, stage: newStage } : c
    ))

    // Show notes modal for confirmation
    setPendingMove({ candidateId, newStage, candidate })
    setShowNotesModal(true)
    setNotes('')
  }

  const handleSearchChange = (stageId, searchTerm) => {
    setSearchTerms(prev => ({ ...prev, [stageId]: searchTerm }))
    setCurrentPages(prev => ({ ...prev, [stageId]: 1 }))
  }

  const handlePageChange = (stageId, page) => {
    setCurrentPages(prev => ({ ...prev, [stageId]: page }))
  }

  const handleConfirmMove = async () => {
    if (!pendingMove) return
    
    const { candidateId, newStage, candidate } = pendingMove
    
    try {
      if (onCandidateUpdate) {
        await onCandidateUpdate(candidateId, newStage, notes)
      } else {
        const { updateCandidate, addTimelineEntry } = await import('../db/index.js')
        await updateCandidate(candidateId, { stage: newStage })
        await addTimelineEntry({
          candidateId,
          stage: newStage,
          timestamp: new Date(),
          notes: notes || `Moved to ${newStage} stage`
        })
      }
      setToast({ message: `${candidate.name} successfully moved to ${newStage} stage!`, type: 'success' })
      setUpdateTrigger(prev => prev + 1)
    } catch (error) {
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, stage: candidate.stage } : c
      ))
      setToast({ message: `Failed to move ${candidate.name}. Please try again.`, type: 'error' })
      console.error('Failed to update candidate stage:', error)
    }
    
    setShowNotesModal(false)
    setPendingMove(null)
    setNotes('')
  }

  const handleCancelMove = () => {
    if (pendingMove) {
      setCandidates(prev => prev.map(c => 
        c.id === pendingMove.candidateId ? { ...c, stage: pendingMove.candidate.stage } : c
      ))
    }
    setShowNotesModal(false)
    setPendingMove(null)
    setNotes('')
  }

  if (loading) return <div className="text-center">Loading...</div>

  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = candidates.filter(c => c.stage === stage.id)
    return acc
  }, {})

  const activeCandidate = activeId ? candidates.find(c => c.id === activeId) : null

  return (
    <div className="w-full h-full">
      {title && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-700">{description}</p>
          )}
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={isReadOnly ? undefined : handleDragStart}
        onDragOver={isReadOnly ? undefined : handleDragOver}
        onDragEnd={isReadOnly ? undefined : handleDragEnd}
      >
        {showDropBoxes && activeCandidate && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-700 mb-4 text-center font-medium">Drop {activeCandidate.name} into a stage:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {stages.map(stage => (
                <DropBox 
                  key={`drop-${stage.id}`} 
                  stage={stage.id} 
                  title={stage.title}
                  color={`${stage.color.replace('100', '200')}`}
                  isHighlighted={hoveredStage === stage.id}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              candidates={candidatesByStage[stage.id] || []}
              searchTerm={searchTerms[stage.id] || ''}
              onSearchChange={handleSearchChange}
              showSearch={showSearch}
              currentPage={currentPages[stage.id] || 1}
              onPageChange={handlePageChange}
              updateTrigger={updateTrigger}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCandidate ? <CandidateCard candidate={activeCandidate} jobId={activeCandidate.jobId} /> : null}
        </DragOverlay>
      </DndContext>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {showNotesModal && pendingMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Add Notes</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Moving <strong>{pendingMove.candidate.name}</strong> to <strong className="capitalize">{pendingMove.newStage}</strong> stage
            </p>
            <MentionInput
              value={notes}
              onChange={setNotes}
              placeholder="Add notes... (use @username to mention team members)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleCancelMove}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMove}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}