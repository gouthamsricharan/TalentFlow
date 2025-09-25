import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import JobsBoard from './pages/JobsBoard'
import JobDetails from './pages/JobDetails'
import CandidatesList from './pages/CandidatesList'
import CandidateProfile from './pages/CandidateProfile'
import AssessmentBuilder from './pages/AssessmentBuilder'
import AssessmentForm from './pages/AssessmentForm'
import TestAssessment from './pages/TestAssessment'
import AssessmentTest from './pages/AssessmentTest'
import AssessmentResults from './pages/AssessmentResults'
import CandidateResponses from './pages/CandidateResponses'
import ResponsesList from './pages/ResponsesList'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobsBoard />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/:jobId/assessment/builder" element={<AssessmentBuilder />} />
          <Route path="/take-assessment/:jobId/:candidateId" element={<AssessmentForm />} />
          <Route path="/assessment-results/:assessmentId/:candidateId" element={<AssessmentResults />} />
          <Route path="/candidate-responses/:jobId" element={<CandidateResponses />} />

          <Route path="/test-assessment" element={<TestAssessment />} />
          <Route path="/assessment-test" element={<AssessmentTest />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
