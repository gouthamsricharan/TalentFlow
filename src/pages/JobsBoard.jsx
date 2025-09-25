import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Archive, Edit, GripVertical } from 'lucide-react'
import { apiClient } from '../api/client.js'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import JobModal from '../components/JobModal'

function SortableJobItem({ job, onEdit, onArchive }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition || 'transform 200ms ease',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-sm border border-gray-200/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500 group overflow-hidden ${isDragging ? 'shadow-2xl shadow-blue-500/20 scale-105 rotate-1' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-500/10 rounded-2xl transition-all duration-300 mt-1">
              <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/jobs/${job.id}`} className="block">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight mb-2">
                  {job.title}
                </h3>
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === 'active' 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                    : 'bg-gray-400 text-white shadow-lg shadow-gray-400/25'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    job.status === 'active' ? 'bg-green-200 animate-pulse' : 'bg-gray-200'
                  }`}></div>
                  {job.status === 'active' ? 'ACTIVE' : 'ARCHIVED'}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={() => onEdit(job)} 
              className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200 hover:scale-110"
              title="Edit job"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onArchive(job)} 
              className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-200 hover:scale-110"
              title={job.status === 'active' ? 'Archive job' : 'Activate job'}
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.slice(0, 4).map(tag => (
              <span key={tag} className="px-3 py-1.5 text-xs bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-medium border border-gray-200/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200">
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="px-3 py-1.5 text-xs bg-gray-100/80 text-gray-500 rounded-xl font-medium border border-gray-200/50">
                +{job.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobsBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [availableTags, setAvailableTags] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        pageSize: 12,
        sort: 'order'
      }
      if (search.trim()) params.search = search.trim()
      if (statusFilter) params.status = statusFilter
      if (tagFilter) params.tag = tagFilter
      
      console.log('📱 JobsBoard calling API with params:', params)
      const response = await apiClient.getJobs(params)
      console.log('📱 JobsBoard received response:', response)
      setJobs(response?.data || [])
      setTotalPages(response?.pagination?.totalPages || 1)
      
      // Extract unique tags for filter dropdown
      if (response?.data) {
        const allTags = response.data.flatMap(job => job.tags || [])
        const uniqueTags = [...new Set(allTags)].sort()
        setAvailableTags(uniqueTags)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])
  
  useEffect(() => {
    fetchJobs()
  }, [page, search, statusFilter, tagFilter])

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = jobs.findIndex(job => job.id === active.id)
    const newIndex = jobs.findIndex(job => job.id === over.id)
    
    const originalJobs = [...jobs]
    const newJobs = arrayMove(jobs, oldIndex, newIndex)
    
    // Update order values based on new positions
    const updatedJobs = newJobs.map((job, index) => ({
      ...job,
      order: index + 1
    }))
    
    setJobs(updatedJobs) // Optimistic update
    
    try {
      const activeJob = jobs.find(job => job.id === active.id)
      await apiClient.reorderJob(active.id, activeJob.order, newIndex + 1)
    } catch (error) {
      setJobs(originalJobs) // Rollback on failure
      console.error('Failed to reorder jobs:', error)
    }
  }

  const handleArchive = async (job) => {
    try {
      await apiClient.updateJob(job.id, { 
        status: job.status === 'active' ? 'archived' : 'active' 
      })
      fetchJobs()
    } catch (error) {
      console.error('Failed to archive job:', error)
    }
  }

  const handleSaveJob = async (jobData) => {
    try {
      if (editingJob) {
        await apiClient.updateJob(editingJob.id, jobData)
      } else {
        await apiClient.createJob(jobData)
      }
      
      setShowModal(false)
      setEditingJob(null)
      fetchJobs()
    } catch (error) {
      console.error('Failed to save job:', error)
    }
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Job
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border-0 rounded-xl px-4 py-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-200 cursor-pointer min-w-[140px] shadow-sm hover:shadow-md"
              >
                <option value="">🎯 All Status</option>
                <option value="active">🟢 Active</option>
                <option value="archived">⚫ Archived</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="appearance-none bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border-0 rounded-xl px-4 py-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-200 cursor-pointer min-w-[160px] shadow-sm hover:shadow-md"
              >
                <option value="">🏷️ All Tags</option>
                {availableTags.map(tag => {
                  const getTagIcon = (tagName) => {
                    const icons = {
                      'React': '⚛️', 'Vue.js': '🟢', 'Angular': '🔴',
                      'JavaScript': '📜', 'TypeScript': '🔷', 'Node.js': '🟢',
                      'Python': '🐍', 'Java': '☕', 'Spring': '🌱',
                      'AWS': '☁️', 'Azure': '🟦', 'Docker': '🐳',
                      'Kubernetes': '⚙️', 'MongoDB': '🍃', 'SQL': '📊',
                      'MySQL': '🐬', 'PostgreSQL': '🐘', 'GraphQL': '🔗',
                      'CSS': '🎨', 'HTML': '🏷️', 'Sass': '💎',
                      'Figma': '🎨', 'Sketch': '✏️', 'Adobe': '🌈',
                      'Git': '🌳', 'GitHub': '🐱', 'Linux': '🐧',
                      'Security': '🔒', 'Testing': '🧪', 'QA': '✅',
                      'Analytics': '📊', 'SEO': '🔍', 'Marketing': '📢',
                      'Leadership': '👑', 'Strategy': '🎯', 'Agile': '🏃',
                      'Scrum': '🏉', 'Management': '💼'
                    }
                    return icons[tagName] || '💻'
                  }
                  
                  return (
                    <option key={tag} value={tag}>
                      {getTagIcon(tag)} {tag}
                    </option>
                  )
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first job posting.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
                {jobs.map(job => (
                  <SortableJobItem
                    key={job.id}
                    job={job}
                    onEdit={(job) => {
                      setEditingJob(job)
                      setShowModal(true)
                    }}
                    onArchive={handleArchive}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`px-3 py-2 rounded-md ${
                page === pageNum ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <JobModal
          job={editingJob}
          onSave={handleSaveJob}
          onClose={() => {
            setShowModal(false)
            setEditingJob(null)
          }}
        />
      )}
    </div>
  )
}