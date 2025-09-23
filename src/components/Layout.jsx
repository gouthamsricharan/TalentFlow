import { Link, useLocation } from 'react-router-dom'
import { Users, Briefcase, Kanban, FileText } from 'lucide-react'

export default function Layout({ children }) {
  const location = useLocation()
  
  const navItems = [
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/candidates', label: 'Candidates', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">TalentFlow</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname.startsWith(path)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 w-full py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}