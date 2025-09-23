import { createServer, Response } from 'miragejs'
import {
  getAllJobs,
  getJob,
  updateJob,
  saveJob,
  getCandidatesByJob,
  getCandidate,
  updateCandidate,
  addTimelineEntry,
  getCandidateTimeline,
  getAssessmentByJob,
  getAssessmentsByJob,
  getAssessment,
  saveAssessment,
  updateAssessment,
  saveResponse,
  getResponse,
  saveBuilderState,
  getBuilderState,
  generateAssessmentForJob,
  deleteAssessment
} from './db/index.js'

const delay = () => new Promise(res => setTimeout(res, Math.random() * 1000 + 200))
const maybeError = (rate = 0.05) => {
  if (Math.random() < rate) {
    const error = new Error('Simulated server error')
    error.status = 500
    throw error
  }
}

export function makeServer({ environment = 'development' } = {}) {
  console.log('🚀 Creating MirageJS server...')
  return createServer({
    environment,

    routes() {
      console.log('🔧 Setting up MirageJS routes...')
      this.namespace = '/api'

      console.log('🔧 Registering GET /jobs route')
      this.get('/jobs', async (schema, request) => {
        console.log('🔍 MirageJS /jobs endpoint called')
        try {
          await delay()
          maybeError(0.02)

          const { search = '', status = '', tag = '', page = 1, pageSize = 10, sort = 'order' } = request.queryParams
          
          console.log('🔍 Calling getAllJobs()...')
          let jobs = await getAllJobs()
          console.log('📊 getAllJobs returned:', jobs?.length || 0, 'jobs')

          if (search) {
            jobs = jobs.filter(job =>
              job.title.toLowerCase().includes(search.toLowerCase()) ||
              job.tags?.some(jobTag => jobTag.toLowerCase().includes(search.toLowerCase()))
            )
          }

          if (status) {
            jobs = jobs.filter(job => job.status === status)
          }
          
          if (tag) {
            jobs = jobs.filter(job => job.tags?.includes(tag))
          }

          if (sort === 'order') {
            jobs.sort((a, b) => (a.order || 0) - (b.order || 0))
          } else if (sort === 'title') {
            jobs.sort((a, b) => a.title.localeCompare(b.title))
          }

          const total = jobs?.length || 0
          const startIndex = (page - 1) * pageSize
          const paginatedJobs = jobs?.slice(startIndex, startIndex + parseInt(pageSize)) || []

          const response = {
            data: paginatedJobs,
            pagination: {
              page: parseInt(page),
              pageSize: parseInt(pageSize),
              total,
              totalPages: Math.ceil(total / pageSize)
            }
          }
          console.log('📤 Returning response:', response)
          return response
        } catch (error) {
          console.error('❌ Jobs endpoint error:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: error.status || 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      })

      this.get('/jobs/:id', async (schema, request) => {
        try {
          await delay()
          maybeError(0.02)
          const job = await getJob(parseInt(request.params.id))
          if (!job) return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 })
          return job
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.post('/jobs', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const jobData = JSON.parse(request.requestBody)
          const job = await saveJob({ ...jobData, createdAt: new Date() })
          return job
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.patch('/jobs/:id', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const { id } = request.params
          const updates = JSON.parse(request.requestBody)
          await updateJob(parseInt(id), updates)
          return await getJob(parseInt(id))
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.patch('/jobs/:id/reorder', async (schema, request) => {
        try {
          await delay()
          maybeError(0.15)
          const { id } = request.params
          const { fromOrder, toOrder } = JSON.parse(request.requestBody)
          
          console.log(`🔄 Reordering job ${id} from ${fromOrder} to ${toOrder}`)
          
          // Get all jobs to update their order
          const allJobs = await getAllJobs()
          const jobToMove = allJobs.find(j => j.id === parseInt(id))
          
          if (!jobToMove) {
            throw new Error('Job not found')
          }
          
          // Update the moved job's order
          await updateJob(parseInt(id), { order: toOrder })
          
          // Update other jobs' order if needed
          const otherJobs = allJobs.filter(j => j.id !== parseInt(id))
          for (const job of otherJobs) {
            if (fromOrder < toOrder) {
              // Moving down: shift jobs up
              if (job.order > fromOrder && job.order <= toOrder) {
                await updateJob(job.id, { order: job.order - 1 })
              }
            } else {
              // Moving up: shift jobs down  
              if (job.order >= toOrder && job.order < fromOrder) {
                await updateJob(job.id, { order: job.order + 1 })
              }
            }
          }
          
          console.log('✅ Job reordering completed')
          return { success: true }
        } catch (error) {
          console.error('❌ Job reordering failed:', error)
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.get('/candidates', async (schema, request) => {
        try {
          await delay()
          maybeError(0.02)
          const { search = '', stage = '', jobId = '', page = 1, pageSize = 50 } = request.queryParams
          
          const allJobs = await getAllJobs()
          let candidates = []
          for (const job of allJobs) {
            const jobCandidates = await getCandidatesByJob(job.id)
            candidates.push(...jobCandidates)
          }

          if (search) {
            candidates = candidates.filter(c =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.email.toLowerCase().includes(search.toLowerCase())
            )
          }
          if (stage) candidates = candidates.filter(c => c.stage === stage)
          if (jobId) candidates = candidates.filter(c => c.jobId === parseInt(jobId))

          // Sort candidates alphabetically by name
          candidates.sort((a, b) => a.name.localeCompare(b.name))

          const total = candidates.length
          const startIndex = (page - 1) * pageSize
          const paginated = candidates.slice(startIndex, startIndex + parseInt(pageSize))

          return {
            data: paginated,
            pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / pageSize) }
          }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.get('/candidates/:id', async (schema, request) => {
        try {
          await delay()
          maybeError(0.02)
          const candidate = await getCandidate(parseInt(request.params.id))
          if (!candidate) return new Response(JSON.stringify({ error: 'Candidate not found' }), { status: 404 })
          return candidate
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.post('/candidates', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const data = JSON.parse(request.requestBody)
          // This would need a saveCandidate function
          return { id: Date.now(), ...data, createdAt: new Date() }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.patch('/candidates/:id', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const id = parseInt(request.params.id)
          const updates = JSON.parse(request.requestBody)
          const current = await getCandidate(id)
          if (updates.stage && updates.stage !== current.stage) {
            await addTimelineEntry({ 
              candidateId: id, 
              stage: updates.stage, 
              timestamp: new Date(), 
              notes: updates.notes || `Moved to ${updates.stage}` 
            })
          }
          await updateCandidate(id, updates)
          return await getCandidate(id)
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.get('/candidates/:id/timeline', async (schema, request) => {
        try {
          await delay()
          maybeError(0.02)
          const candidateId = parseInt(request.params.id)
          console.log(`🔍 Fetching timeline for candidate ${candidateId}`)
          const timeline = await getCandidateTimeline(candidateId)
          console.log(`📊 Found ${timeline.length} timeline entries:`, timeline)
          return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        } catch (error) {
          console.error('❌ Timeline fetch error:', error)
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.get('/assessments/:jobId', async (schema, request) => {
        try {
          await delay()
          maybeError(0.02)
          return await getAssessmentByJob(parseInt(request.params.jobId))
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.get('/assessments/job/:jobId/all', async (schema, request) => {
        try {
          await delay()
          maybeError(0.02)
          return await getAssessmentsByJob(parseInt(request.params.jobId))
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.post('/assessments/job/:jobId/create', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const jobId = parseInt(request.params.jobId)
          const { stage = 'applied' } = JSON.parse(request.requestBody || '{}')
          const job = await getJob(jobId)
          if (!job) {
            return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 })
          }
          const assessment = await generateAssessmentForJob(job, stage)
          return assessment
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.delete('/assessments/:id', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          await deleteAssessment(parseInt(request.params.id))
          return { success: true }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.put('/assessments/:jobId', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const jobId = parseInt(request.params.jobId)
          const data = JSON.parse(request.requestBody)
          const existing = await getAssessmentByJob(jobId)
          if (existing) {
            await updateAssessment(existing.id, { ...data, updatedAt: new Date() })
            return await getAssessment(existing.id)
          }
          const assessment = await saveAssessment({ ...data, jobId, createdAt: new Date(), updatedAt: new Date() })
          return assessment
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.post('/assessments/responses', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const data = JSON.parse(request.requestBody)
          const response = await saveResponse({ ...data, submittedAt: new Date() })
          return { success: true, id: response }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.post('/assessments/responses/draft', async (schema, request) => {
        try {
          await delay()
          maybeError(0.05)
          const { candidateId, assessmentId, responses } = JSON.parse(request.requestBody)
          const response = await saveDraftResponse(candidateId, assessmentId, responses)
          return { success: true, id: response }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.get('/assessments/responses/draft/:candidateId/:assessmentId', async (schema, request) => {
        try {
          await delay()
          const { candidateId, assessmentId } = request.params
          const response = await getDraftResponse(parseInt(candidateId), parseInt(assessmentId))
          return response || null
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      // New Assessment routes
      this.get('/assessments/:id/candidates/:candidateId', async (schema, request) => {
        try {
          await delay()
          maybeError(0.02)
          const { id, candidateId } = request.params
          
          const assessment = await getAssessment(parseInt(id))
          const candidate = await getCandidate(parseInt(candidateId))
          
          if (!assessment || !candidate) {
            return new Response(JSON.stringify({ error: 'Assessment or candidate not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          
          return new Response(JSON.stringify({ assessment, candidate }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: error.status || 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      })

      this.post('/assessments/:id/candidates/:candidateId/submit', async (schema, request) => {
        try {
          await delay()
          maybeError(0.08)
          const { id, candidateId } = request.params
          const data = JSON.parse(request.requestBody)
          
          const assessment = await getAssessment(parseInt(id))
          const candidate = await getCandidate(parseInt(candidateId))
          
          if (!assessment || !candidate) {
            return new Response(JSON.stringify({ error: 'Assessment or candidate not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          
          const response = await saveResponse({
            candidateId: parseInt(candidateId),
            jobId: assessment.jobId,
            stage: assessment.stage,
            assessmentId: parseInt(id),
            responses: data.responses,
            submittedAt: new Date()
          })
          
          return new Response(JSON.stringify({ success: true, responseId: response }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: error.status || 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      })

      // Builder state endpoints
      this.get('/builder-state/:jobId', async (schema, request) => {
        try {
          await delay()
          const state = await getBuilderState(parseInt(request.params.jobId))
          return state || null
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      this.post('/builder-state/:jobId', async (schema, request) => {
        try {
          await delay()
          const jobId = parseInt(request.params.jobId)
          const state = JSON.parse(request.requestBody)
          await saveBuilderState(jobId, state)
          return { success: true }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })

      // Assessment response endpoints
      this.get('/responses/:candidateId/:assessmentId', async (schema, request) => {
        try {
          await delay()
          const { candidateId, assessmentId } = request.params
          const response = await getResponse(parseInt(candidateId), parseInt(assessmentId))
          return response || null
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 })
        }
      })
    }
  })
}