# Assessment System Implementation

## Overview
Complete assessment builder and form system for TalentFlow with live preview, validation, conditional logic, and local persistence.

## Features Implemented

### 1. Assessment Builder (`/jobs/:jobId/assessment/builder`)
- **Visual Builder Interface**: Drag-and-drop style question creation
- **Section Management**: Add/remove/edit sections with custom titles
- **Question Types Supported**:
  - Single Choice (radio buttons)
  - Multiple Choice (checkboxes) 
  - Short Text (single line input)
  - Long Text (textarea)
  - Numeric (with min/max range validation)
  - File Upload (with file type restrictions)

### 2. Live Preview Pane
- **Real-time Rendering**: See assessment as candidates will see it
- **Interactive Preview**: Fill out forms to test functionality
- **Validation Testing**: See validation errors in real-time
- **Conditional Logic Preview**: Test question show/hide logic

### 3. Validation System
- **Required Fields**: Mark questions as mandatory
- **Text Length Limits**: Set max character limits for text inputs
- **Numeric Ranges**: Set min/max values for numeric inputs
- **File Type Restrictions**: Specify allowed file extensions
- **Real-time Validation**: Immediate feedback on form errors

### 4. Conditional Logic
- **Question Dependencies**: Show/hide questions based on previous answers
- **Condition Types**:
  - `equals`: Show if previous answer equals specific value
  - `not_equals`: Show if previous answer doesn't equal value
  - `contains`: Show if previous answer contains value (for multi-choice)

### 5. Persistence & State Management
- **Auto-save**: Builder state saved every 30 seconds
- **Draft Responses**: Candidate responses auto-saved as drafts
- **Local Storage**: All data persisted in IndexedDB
- **State Recovery**: Resume building/taking assessments from where you left off

### 6. Assessment Form Runtime (`/assessment/:assessmentId/candidate/:candidateId`)
- **Multi-section Navigation**: Tab-based section switching
- **Progress Tracking**: Visual progress bar and percentage
- **Form Validation**: Client-side validation with error messages
- **Responsive Design**: Works on desktop and mobile
- **Submission Prevention**: Can't retake once submitted

## API Endpoints

### Assessment Management
```
GET    /api/assessments/:jobId           # Get assessment for job
PUT    /api/assessments/:jobId           # Save/update assessment
POST   /api/assessments/:jobId/submit    # Submit assessment response
DELETE /api/assessments/:id              # Delete assessment
```

### Assessment Builder
```
GET    /api/builder-state/:jobId         # Get builder state
POST   /api/builder-state/:jobId         # Save builder state
```

### Assessment Taking
```
GET    /api/assessments/:assessmentId/candidates/:candidateId    # Get assessment for candidate
POST   /api/assessments/:assessmentId/candidates/:candidateId/submit  # Submit response
```

## Database Schema

### Assessments Table
```javascript
{
  id: number,
  jobId: number,
  stage: string,           // 'applied', 'screen', 'tech', etc.
  title: string,
  sections: [
    {
      id: number,
      title: string,
      questions: [
        {
          id: string,
          type: string,        // 'single-choice', 'multi-choice', etc.
          question: string,
          required: boolean,
          options: string[],   // For choice questions
          validation: {
            maxLength: number,
            min: number,
            max: number,
            allowedTypes: string[]
          },
          conditional: {
            dependsOn: string,
            condition: string,
            value: string
          }
        }
      ]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Assessment Responses Table
```javascript
{
  id: number,
  candidateId: number,
  jobId: number,
  stage: string,
  assessmentId: number,
  responses: {
    [questionId]: any      // Question responses
  },
  submittedAt: Date,       // null for drafts
  createdAt: Date,
  updatedAt: Date
}
```

### Builder States Table
```javascript
{
  id: number,
  jobId: number,
  state: object,           // Complete builder state
  lastModified: Date
}
```

## Usage Flow

### For HR/Recruiters (Assessment Creation)
1. Navigate to job details page
2. Click "Assessment Builder" 
3. Create sections and add questions
4. Configure validation rules and conditional logic
5. Use live preview to test assessment
6. Save assessment (auto-saves every 30s)

### For Candidates (Assessment Taking)
1. Click assessment link from kanban board
2. Navigate through sections using tabs
3. Fill out questions with real-time validation
4. See progress bar and completion percentage
5. Submit assessment (can't retake once submitted)

## Technical Implementation

### Key Components
- `AssessmentBuilder.jsx`: Main builder interface
- `AssessmentForm.jsx`: Candidate-facing form
- `assessments.js`: Database layer with validation functions
- `mirage-server.js`: API endpoints for testing

### Validation Functions
- `validateQuestionResponse()`: Validates individual question responses
- `shouldShowQuestionConditional()`: Handles conditional question logic
- `validateSection()`: Validates entire sections before navigation

### State Management
- React hooks for component state
- IndexedDB for persistent storage
- Auto-save mechanisms for draft preservation
- MirageJS for API simulation

## Current Limitations & Future Enhancements

### Current Scope
- Single assessment per job (at 'applied' stage only)
- Client-side validation only
- Local storage (IndexedDB)
- Basic conditional logic

### Potential Enhancements
- Multiple assessments per job for different stages
- Server-side validation and processing
- Advanced conditional logic (complex branching)
- Question banks and templates
- Analytics and reporting
- Bulk question import/export
- Assessment versioning
- Time limits and auto-submission

## Testing

### Test Routes
- `/test-assessment`: Debug page to check assessment status
- Use browser dev tools to inspect IndexedDB data
- MirageJS provides simulated API responses with delays and error rates

### Manual Testing Checklist
- [ ] Create assessment with all question types
- [ ] Test validation rules (required, length, range)
- [ ] Test conditional logic (show/hide questions)
- [ ] Test live preview functionality
- [ ] Test assessment submission and prevention of retaking
- [ ] Test auto-save and state recovery
- [ ] Test responsive design on mobile

## Integration Points

### With Existing System
- Integrates with job management system
- Links from kanban board candidate cards
- Uses existing candidate and job data
- Follows existing routing patterns

### Database Integration
- Extends existing modular database structure
- Uses same IndexedDB approach as jobs/candidates
- Maintains data consistency with foreign keys