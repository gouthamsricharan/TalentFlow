import { useState, useRef, useEffect } from 'react'

const teamMembers = [
  { id: 1, name: 'John Smith', username: 'john.smith' },
  { id: 2, name: 'Sarah Johnson', username: 'sarah.johnson' },
  { id: 3, name: 'Mike Davis', username: 'mike.davis' },
  { id: 4, name: 'Emily Brown', username: 'emily.brown' },
  { id: 5, name: 'David Wilson', username: 'david.wilson' },
  { id: 6, name: 'Lisa Garcia', username: 'lisa.garcia' }
]

function MentionSuggestions({ suggestions, onSelect, textareaRef }) {
  if (suggestions.length === 0) return null

  return (
    <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-48 max-h-32 overflow-y-auto">
      {suggestions.map((member, index) => (
        <div
          key={member.id}
          onClick={() => onSelect(member)}
          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
        >
          <div className="font-medium text-sm text-gray-900">{member.name}</div>
          <div className="text-xs text-blue-600">@{member.username}</div>
        </div>
      ))}
    </div>
  )
}

function renderTextWithMentions(text) {
  const mentionRegex = /@(\w+(?:\.\w+)*)/g
  const parts = text.split(mentionRegex)
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
          @{part}
        </span>
      )
    }
    return part
  })
}

export default function MentionInput({ value, onChange, placeholder, className }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef(null)

  const handleInputChange = (e) => {
    const text = e.target.value
    const cursorPos = e.target.selectionStart
    
    onChange(text)
    
    // Check for @ mentions
    const beforeCursor = text.substring(0, cursorPos)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      const filtered = teamMembers.filter(member => 
        member.name.toLowerCase().includes(query) || 
        member.username.toLowerCase().includes(query)
      )
      
      setSuggestions(filtered)
      setShowSuggestions(true)
      
      // Show suggestions above textarea
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionSelect = (member) => {
    const textarea = textareaRef.current
    const cursorPos = textarea.selectionStart
    const beforeCursor = value.substring(0, cursorPos)
    const afterCursor = value.substring(cursorPos)
    
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      const beforeMention = beforeCursor.substring(0, mentionMatch.index)
      const newValue = beforeMention + `@${member.username} ` + afterCursor
      onChange(newValue)
    }
    
    setShowSuggestions(false)
    textarea.focus()
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        rows={3}
      />
      {showSuggestions && (
        <MentionSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          textareaRef={textareaRef}
        />
      )}
    </div>
  )
}

export { renderTextWithMentions }