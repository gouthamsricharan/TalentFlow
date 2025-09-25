import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function JobModal({ job, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'active',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        slug: job.slug || '',
        status: job.status || 'active',
        tags: job.tags || []
      })
    }
  }, [job])

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: job ? prev.slug : generateSlug(title)
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-2xl border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              {job ? '✏️ Edit Job' : '✨ Create New Job'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-2 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">💼 Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 bg-gray-50 focus:bg-white'
              }`}
              placeholder="e.g. Senior Frontend Developer"
            />
            {errors.title && <p className="mt-2 text-sm text-red-600 flex items-center">⚠️ {errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔗 URL Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 bg-gray-50 focus:bg-white'
              }`}
              placeholder="senior-frontend-developer"
            />
            {errors.slug && <p className="mt-2 text-sm text-red-600 flex items-center">⚠️ {errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🟢 Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="active">✨ Active</option>
              <option value="archived">📦 Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Tags</label>
            <div className="flex rounded-xl border-2 border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white transition-all duration-200">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-transparent border-0 focus:outline-none"
                placeholder="React, TypeScript, Remote..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-r-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center text-xs transition-all"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {job ? '✨ Update Job' : '🚀 Create Job'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}