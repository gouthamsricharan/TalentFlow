# TalentFlow - Hiring Platform

A comprehensive React-based hiring platform with job management, candidate tracking, kanban board functionality, and assessment system.

## 🚀 Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Architecture

### Frontend Stack
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **@dnd-kit** - Drag and drop functionality

### Database Layer
- **Dexie.js** - IndexedDB wrapper for local storage
- **Modular Database Structure**:
  - `jobs.js` - Job management
  - `candidates.js` - Candidate & timeline data
  - `assessments.js` - Assessment templates & responses

### Key Components
```
src/
├── db/                    # Modular database layer
├── pages/                 # Main application pages
├── components/            # Reusable UI components
└── utils/                 # Utility functions
```

## 🎯 Core Features

### 1. Job Management
- **Jobs Board**: Grid layout with search, filtering, pagination
- **Drag & Drop Reordering**: Visual job prioritization
- **Status Management**: Active/Archived job states
- **Responsive Design**: Mobile-first approach

### 2. Candidate Tracking
- **Kanban Board**: 6-stage hiring pipeline
- **Drag & Drop**: Move candidates between stages
- **Forward-Only Progression**: Business logic enforcement
- **Search & Pagination**: 3 candidates per stage per page
- **@Mentions System**: Team collaboration in notes

### 3. Assessment System
- **Assessment Builder**: Visual form creator
- **Question Types**: Single-choice, multi-choice, text, numeric, file upload
- **Conditional Logic**: Dynamic question flow
- **Validation Rules**: Required fields, ranges, length limits
- **Live Preview**: Real-time form preview
- **Response Management**: Local storage of candidate responses

### 4. Advanced Features
- **Read-Only Mode**: Archived jobs prevent modifications
- **Timeline Tracking**: Candidate stage history
- **File Upload**: Base64 storage with drag-and-drop
- **Responsive Layout**: Multi-column adaptive design

## 🔧 Technical Decisions

### Database Choice: IndexedDB + Dexie
**Why**: Client-side persistence without backend complexity
- ✅ Offline functionality
- ✅ Large storage capacity
- ✅ Structured queries
- ❌ Single-user limitation (addressed in production notes)

### State Management: React Hooks
**Why**: Sufficient for application complexity
- ✅ Built-in React patterns
- ✅ Minimal bundle size
- ✅ Easy debugging

### Styling: Tailwind CSS
**Why**: Rapid development with consistent design
- ✅ Utility-first approach
- ✅ Responsive design system
- ✅ Small production bundle

### Drag & Drop: @dnd-kit
**Why**: Modern, accessible drag-and-drop
- ✅ Touch device support
- ✅ Accessibility features
- ✅ Flexible API

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Single-User System**: IndexedDB is per-browser instance
2. **File Storage**: Base64 encoding increases storage size
3. **No Real-time Sync**: Changes don't sync across devices
4. **Limited Scalability**: Not suitable for large datasets

### Browser Compatibility
- **Supported**: Chrome 58+, Firefox 55+, Safari 10+
- **IndexedDB Required**: No fallback for unsupported browsers

### Performance Considerations
- **Large Files**: File uploads limited by browser storage
- **Candidate Volume**: Performance degrades with 10,000+ candidates
- **Search**: Client-side filtering may be slow with large datasets

## 🚀 Production Deployment

### For Production Use
1. **Backend Integration**: Replace IndexedDB with REST API
2. **Authentication**: Add user management system
3. **File Storage**: Use cloud storage (AWS S3, Cloudinary)
4. **Real-time Updates**: WebSocket or Server-Sent Events
5. **Database**: PostgreSQL or MongoDB
6. **Caching**: Redis for performance
7. **CDN**: Static asset delivery

### Environment Variables
```env
VITE_API_URL=https://api.talentflow.com
VITE_STORAGE_URL=https://storage.talentflow.com
```

### Deployment Commands
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
npm run deploy
```

## 📊 Assessment System Details

### Question Types Supported
- **Single Choice**: Radio buttons with conditional logic
- **Multiple Choice**: Checkboxes for multiple selections
- **Short Text**: Single-line input with length validation
- **Long Text**: Textarea with character limits
- **Numeric**: Number input with min/max validation
- **File Upload**: Drag-and-drop with type restrictions

### Validation Rules
- **Required Fields**: Prevents submission without answers
- **Character Limits**: Text length validation
- **Numeric Ranges**: Min/max value enforcement
- **File Types**: Extension and size restrictions

### Conditional Logic
- **Show/Hide Questions**: Based on previous answers
- **Dynamic Flow**: Personalized assessment paths
- **Business Rules**: Role-specific question sets

## 🔄 Data Flow

```
User Action → Component State → Database Layer → IndexedDB
     ↑                                              ↓
UI Update ← Component Re-render ← State Update ← Success/Error
```

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Job creation and editing
- [ ] Candidate drag-and-drop functionality
- [ ] Assessment builder and form submission
- [ ] File upload and storage
- [ ] Search and filtering
- [ ] Responsive design on mobile

### Automated Testing (Recommended)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 📈 Performance Metrics

### Target Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Optimization Techniques
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching Strategy**: Service worker implementation

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **TypeScript**: Gradual migration recommended

---

**Built with ❤️ for modern hiring workflows**