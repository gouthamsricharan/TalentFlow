import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiClient } from '../api/client.js'

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']

const CandidateCard = React.memo(({ candidate, jobs }) => {
  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-300',
      screen: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300',
      tech: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300',
      offer: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300',
      hired: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300',
      rejected: 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300'
    }
    return colors[stage] || 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-300'
  }
  
  const getStageIcon = (stage) => {
    const icons = {
      applied: '📝',
      screen: '📞',
      tech: '💻',
      offer: '🎯',
      hired: '✅',
      rejected: '❌'
    }
    return icons[stage] || '📝'
  }
  
  const job = jobs.find(j => j.id === candidate.jobId)
  const jobTitle = job ? job.title : `Job #${candidate.jobId}`
  const initials = candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <Link 
      to={`/candidates/${candidate.id}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {initials}
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100">
            <span className="text-sm">{getStageIcon(candidate.stage)}</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 truncate w-full">
          {candidate.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 truncate w-full">{candidate.email}</p>
        
        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border ${getStageColor(candidate.stage)} shadow-sm mb-2`}>
          {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
        </span>
        
        <p className="text-xs text-gray-400 truncate w-full">
          {jobTitle}
        </p>
      </div>
    </Link>
  )
})

export default function CandidatesList() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [jobFilter, setJobFilter] = useState('')
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 24

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const params = {
        search: search.trim(),
        stage: stageFilter,
        jobId: jobFilter,
        page,
        pageSize
      }
      
      const response = await apiClient.getCandidates(params)
      setCandidates(response?.data || [])
      setTotal(response?.pagination?.total || 0)
      setTotalPages(response?.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
      setCandidates([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await apiClient.getJobs({ page: 1, pageSize: 100 })
      setJobs(response?.data || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    setPage(1) // Reset to first page when filters change
  }, [search, stageFilter, jobFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCandidates()
    }, 300)
    
    return () => clearTimeout(debounceTimer)
  }, [search, stageFilter, jobFilter, page])

  const Pagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (page <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages)
        } else if (page >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
        } else {
          pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex items-center justify-between mt-8 px-6 pb-6">
        <p className="text-sm text-gray-500">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} candidates
        </p>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' && setPage(pageNum)}
              disabled={pageNum === '...'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : pageNum === '...'
                  ? 'cursor-default'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Candidates
          </h1>
          <p className="text-gray-500 mt-1">{total.toLocaleString()} total candidates</p>
        </div>
        {/* <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            <User className="w-4 h-4 inline mr-2" />
            Active Pool
          </div>
        </div> */}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="appearance-none bg-gray-50 border-0 rounded-xl px-4 py-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 cursor-pointer min-w-[160px]"
              >
                <option value="">🎯 All Stages</option>
                <option value="applied">📝 Applied</option>
                <option value="screen">📞 Screening</option>
                <option value="tech">💻 Technical</option>
                <option value="offer">🎯 Offer</option>
                <option value="hired">✅ Hired</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="appearance-none bg-gray-50 border-0 rounded-xl px-4 py-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 cursor-pointer min-w-[200px]"
              >
                <option value="">💼 All Positions</option>
                {jobs?.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                )) || []}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading candidates...</p>
          </div>
        ) : !candidates || candidates.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500 max-w-sm">Try adjusting your search terms or filter criteria to find candidates.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {candidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} jobs={jobs} />
                ))}
              </div>
            </div>
            <Pagination />
          </>
        )}
      </div>
    </div>
  )
}