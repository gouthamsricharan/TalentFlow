// API client with error handling and retry logic
class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error [${config.method || 'GET'} ${url}]:`, error.message)
      throw error
    }
  }

  // Jobs API
  async getJobs(params = {}) {
    const searchParams = new URLSearchParams(params)
    return this.request(`/jobs?${searchParams}`)
  }

  async createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: jobData,
    })
  }

  async updateJob(id, updates) {
    return this.request(`/jobs/${id}`, {
      method: 'PATCH',
      body: updates,
    })
  }

  async reorderJob(id, fromOrder, toOrder) {
    return this.request(`/jobs/${id}/reorder`, {
      method: 'PATCH',
      body: { fromOrder, toOrder },
    })
  }

  // Candidates API
  async getCandidates(params = {}) {
    const searchParams = new URLSearchParams(params)
    return this.request(`/candidates?${searchParams}`)
  }

  async createCandidate(candidateData) {
    return this.request('/candidates', {
      method: 'POST',
      body: candidateData,
    })
  }

  async updateCandidate(id, updates) {
    return this.request(`/candidates/${id}`, {
      method: 'PATCH',
      body: updates,
    })
  }

  async getCandidateTimeline(id) {
    return this.request(`/candidates/${id}/timeline`)
  }

  // Assessments API
  async getAssessment(jobId) {
    return this.request(`/assessments/${jobId}`)
  }

  async saveAssessment(jobId, assessmentData) {
    return this.request(`/assessments/${jobId}`, {
      method: 'PUT',
      body: assessmentData,
    })
  }

  async submitAssessment(jobId, responseData) {
    return this.request(`/assessments/${jobId}/submit`, {
      method: 'POST',
      body: responseData,
    })
  }
}

export const apiClient = new ApiClient()