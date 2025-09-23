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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {job ? 'Edit Job' : 'Create Job'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                errors.title ? 'border-red-300' : ''
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                errors.slug ? 'border-red-300' : ''
              }`}
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex mt-1">
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
                className="flex-1 rounded-l-md border-gray-300 shadow-sm"
                placeholder="Add tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {job ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}