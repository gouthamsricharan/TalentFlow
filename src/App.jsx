import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import JobsBoard from './pages/JobsBoard'
import JobDetails from './pages/JobDetails'
import CandidatesList from './pages/CandidatesList'
import CandidateProfile from './pages/CandidateProfile'
import AssessmentBuilder from './pages/AssessmentBuilder'
import AssessmentForm from './pages/AssessmentForm'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobsBoard />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/:jobId/assessment/builder" element={<AssessmentBuilder />} />
          <Route path="/jobs/:jobId/assessment/:candidateId" element={<AssessmentForm />} />
          <Route path="/assessment/:jobId/candidate/:candidateId" element={<AssessmentForm />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
