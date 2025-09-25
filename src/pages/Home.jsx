import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Target, BarChart3, ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Hiring Process</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              TalentFlow is a comprehensive hiring platform that helps you manage jobs, track candidates, 
              and conduct assessments with powerful analytics and seamless workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/jobs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/candidates"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                View Candidates
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Hire Better</h2>
          <p className="text-lg text-gray-600">Powerful features designed for modern hiring teams</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Briefcase className="w-8 h-8 text-blue-600" />}
            title="Job Management"
            description="Create, organize, and track job postings with drag-and-drop prioritization and status management."
            link="/jobs"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-indigo-600" />}
            title="Candidate Tracking"
            description="Kanban-style pipeline with 6-stage hiring process and forward-only progression logic."
            link="/candidates"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-purple-600" />}
            title="Smart Assessments"
            description="Build custom assessments with conditional logic, multiple question types, and automated scoring."
            link="/jobs"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-green-600" />}
            title="Analytics Dashboard"
            description="Real-time insights with candidate rankings, performance metrics, and hiring analytics."
            link="/jobs"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-600" />}
            title="Automated Workflows"
            description="Streamline repetitive tasks with automated candidate progression and notification systems."
            link="/jobs"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-red-600" />}
            title="Secure & Reliable"
            description="Enterprise-grade security with local data storage and comprehensive audit trails."
            link="/jobs"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="1000+" label="Candidates Managed" />
            <StatCard number="50+" label="Active Jobs" />
            <StatCard number="95%" label="Assessment Completion Rate" />
            <StatCard number="60%" label="Faster Hiring Process" />
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose TalentFlow?</h2>
            <div className="space-y-4">
              <BenefitItem text="Drag-and-drop kanban board for visual candidate management" />
              <BenefitItem text="Role-specific assessments with automatic scoring" />
              <BenefitItem text="Real-time analytics and performance insights" />
              <BenefitItem text="Mobile-responsive design for hiring on the go" />
              <BenefitItem text="Offline functionality with local data persistence" />
              <BenefitItem text="Seamless integration with existing workflows" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Hiring?</h3>
              <p className="text-gray-600 mb-6">Join hundreds of companies using TalentFlow to build better teams faster.</p>
              <Link
                to="/jobs"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Start Hiring Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, link }) => (
  <Link to={link} className="group">
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all h-full">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </Link>
);

const StatCard = ({ number, label }) => (
  <div>
    <div className="text-4xl font-bold mb-2">{number}</div>
    <div className="text-blue-100">{label}</div>
  </div>
);

const BenefitItem = ({ text }) => (
  <div className="flex items-center">
    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
    <span className="text-gray-700">{text}</span>
  </div>
);

export default Home;