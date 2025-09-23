import { useState } from 'react'
import { Upload, X, File } from 'lucide-react'

export default function FileUpload({ value, onChange, required = false, error }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (file) => {
    if (!file) return
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    setUploading(true)
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        // In real app, this would be a URL from file storage service
        url: `https://storage.example.com/files/${Date.now()}-${file.name}`
      }
      onChange(fileData)
      setUploading(false)
    } catch (error) {
      console.error('File upload error:', error)
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const removeFile = () => {
    onChange(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (value) {
    return (
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{value.name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(value.size)} • {new Date(value.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="text-red-500 hover:text-red-700"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver
          ? 'border-blue-500 bg-blue-50'
          : error
          ? 'border-red-500 bg-red-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
    >
      {uploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      ) : (
        <>
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop a file here, or{' '}
            <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.txt"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            Supports: PDF, DOC, DOCX, TXT (Max 5MB)
          </p>
        </>
      )}
    </div>
  )
}