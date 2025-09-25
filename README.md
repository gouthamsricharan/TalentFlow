# 🚀 TalentFlow - Modern Hiring Platform

A comprehensive React-based hiring platform that streamlines the entire recruitment process with job management, candidate tracking, kanban board functionality, and intelligent assessment systems.

![TalentFlow](https://img.shields.io/badge/TalentFlow-Hiring%20Platform-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.6-646CFF?style=flat&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat&logo=tailwind-css)

## ✨ Features

### 🏠 **Modern Landing Page**
- Hero section with compelling value proposition
- Feature showcase with interactive cards
- Statistics dashboard with key metrics
- Benefits section with checkmark highlights
- Responsive design with gradient backgrounds

### 💼 **Job Management**
- **Visual Job Board**: Grid layout with modern card design
- **Drag & Drop Reordering**: Smooth visual job prioritization
- **Advanced Filtering**: Search by title, tags, and status
- **Status Management**: Active/Archived job states
- **Tag System**: Categorize jobs with emoji-enhanced tags
- **Modern Job Form**: Streamlined creation/editing modal

### 👥 **Candidate Tracking**
- **Kanban Board**: 6-stage hiring pipeline (Applied → Screen → Tech → Offer → Hired/Rejected)
- **Drag & Drop Progression**: Move candidates between stages with business logic
- **Forward-Only Movement**: Prevents regression in hiring process
- **Search & Pagination**: 3 candidates per stage per page
- **@Mentions System**: Team collaboration in stage notes
- **Timeline Tracking**: Complete candidate journey history

### 📋 **Assessment System**
- **Assessment Builder**: Visual form creator with live preview
- **6 Question Types**: Single-choice, multi-choice, text, numeric, file upload
- **Conditional Logic**: Dynamic question flow based on responses
- **Role-Specific Questions**: Tailored assessments for different positions
- **Validation Rules**: Required fields, character limits, numeric ranges
- **Auto-Save Drafts**: Prevent data loss during form completion
- **Automated Scoring**: Intelligent evaluation with detailed analytics

### 📊 **Analytics & Reporting**
- **Candidate Rankings**: Performance-based leaderboards
- **Assessment Analytics**: Success rates, average scores, completion metrics
- **HR Dashboard**: High-level insights and statistics
- **Individual Results**: Detailed question-by-question breakdown
- **Export Capabilities**: Data export for further analysis

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 19.1.1** - Latest React with concurrent features
- **Vite 7.1.6** - Lightning-fast build tool and dev server
- **React Router 6.26.0** - Client-side routing with nested routes

### **UI & Styling**
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **Lucide React 0.400.0** - Beautiful icon library
- **Modern Design System** - Gradient backgrounds, glassmorphism effects
- **Responsive Layout** - Mobile-first approach

### **Data Management**
- **Dexie.js 4.0.8** - IndexedDB wrapper for local storage
- **MirageJS 0.1.48** - API mocking for development
- **Modular Database Structure** - Separated concerns for jobs, candidates, assessments

### **Interactions**
- **@dnd-kit** - Modern drag-and-drop functionality
- **Touch Support** - Mobile-friendly interactions
- **Accessibility** - WCAG compliant drag operations

## 📁 Project Structure

```
src/
├── api/                    # API client and endpoints
│   └── client.js          # Centralized API communication
├── components/             # Reusable UI components
│   ├── Layout.jsx         # Main app layout with navigation
│   ├── JobModal.jsx       # Job creation/editing form
│   ├── MentionInput.jsx   # @mentions functionality
│   ├── FileUpload.jsx     # Drag-drop file uploads
│   └── CandidateResponsesEmbed.jsx # Embedded analytics
├── db/                    # Database layer (IndexedDB)
│   ├── index.js          # Database initialization
│   ├── jobs.js           # Job management operations
│   ├── candidates.js     # Candidate CRUD operations
│   └── assessments.js    # Assessment system & scoring
├── pages/                 # Main application pages
│   ├── Home.jsx          # Landing page
│   ├── JobsBoard.jsx     # Job management dashboard
│   ├── JobDetails.jsx    # Individual job view
│   ├── KanbanBoard.jsx   # Candidate pipeline
│   ├── CandidatesList.jsx # All candidates view
│   ├── CandidateProfile.jsx # Individual candidate
│   ├── AssessmentBuilder.jsx # Assessment creation
│   ├── AssessmentForm.jsx # Candidate assessment taking
│   ├── AssessmentResults.jsx # Individual results
│   └── CandidateResponses.jsx # HR analytics dashboard
├── utils/                 # Utility functions
│   └── resetDatabase.js  # Database reset functionality
├── App.jsx               # Main app component with routing
├── main.jsx              # Application entry point
└── mirage-server.js      # Mock API server setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/talent-flow.git
cd talent-flow
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🎯 Core Workflows

### 1. **Job Management Flow**
```
Create Job → Set Tags & Status → Publish → Manage Candidates → Track Progress
```

### 2. **Candidate Journey**
```
Application → Screening → Technical → Offer → Hired/Rejected
```

### 3. **Assessment Process**
```
Build Assessment → Assign to Stage → Candidate Takes → Auto-Score → Review Results
```

## 🗄️ Database Schema

### **Jobs Table**
- `id`, `title`, `slug`, `status`, `tags[]`, `order`, `createdAt`, `updatedAt`

### **Candidates Table**
- `id`, `name`, `email`, `jobId`, `stage`, `createdAt`, `updatedAt`

### **Timeline Table**
- `id`, `candidateId`, `stage`, `notes`, `timestamp`, `createdAt`

### **Assessments Table**
- `id`, `jobId`, `stage`, `title`, `sections[]`, `createdAt`, `updatedAt`

### **Assessment Responses Table**
- `id`, `candidateId`, `assessmentId`, `responses{}`, `submittedAt`

## 🎨 Design System

### **Color Palette**
- **Primary**: Blue (#2563eb) to Indigo (#4f46e5) gradients
- **Success**: Green (#10b981) for completed states
- **Warning**: Yellow (#f59e0b) for pending actions
- **Error**: Red (#ef4444) for rejections/errors
- **Neutral**: Gray scale for backgrounds and text

### **Typography**
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable sans-serif
- **Labels**: Semibold with emoji icons

### **Components**
- **Cards**: Rounded corners (rounded-2xl/3xl), subtle shadows
- **Buttons**: Gradient backgrounds, hover animations
- **Forms**: Modern inputs with focus states
- **Status Badges**: Solid colors with pulsing indicators

## 🔧 Configuration

### **Environment Variables**
```env
VITE_API_URL=http://localhost:3000  # API endpoint
VITE_APP_NAME=TalentFlow            # Application name
```

### **Tailwind Configuration**
Custom theme extensions for gradients, animations, and spacing.

### **Vite Configuration**
Optimized build settings with React plugin and development server configuration.

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for medium screens
- **Desktop Enhanced**: Full feature set on large screens
- **Touch Friendly**: Drag-and-drop works on touch devices

## 🔒 Data Persistence

### **Local Storage Strategy**
- **IndexedDB**: Primary storage for structured data
- **Offline Support**: Full functionality without internet
- **Data Integrity**: Automatic backups and validation
- **Performance**: Optimized queries and indexing

### **Migration Path**
Ready for backend integration:
- API client abstraction layer
- Database schema compatible with SQL/NoSQL
- Authentication hooks prepared
- File upload system ready for cloud storage

## 🧪 Testing Strategy

### **Manual Testing Checklist**
- [ ] Job creation and management
- [ ] Candidate drag-and-drop functionality  
- [ ] Assessment builder and form submission
- [ ] File upload and storage
- [ ] Search and filtering operations
- [ ] Responsive design across devices

### **Recommended Automated Testing**
```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Component tests
npm run test:components
```

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
# Deploy dist/ folder
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔮 Future Enhancements

### **Phase 1: Backend Integration**
- [ ] REST API development
- [ ] User authentication system
- [ ] Real-time notifications
- [ ] Cloud file storage

### **Phase 2: Advanced Features**
- [ ] Email integration
- [ ] Calendar scheduling
- [ ] Advanced analytics
- [ ] Team collaboration tools

### **Phase 3: Enterprise Features**
- [ ] Multi-tenant support
- [ ] Advanced permissions
- [ ] Integration APIs
- [ ] Custom branding

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Code Standards**
- ESLint configuration for code quality
- Prettier for consistent formatting
- Conventional commits for clear history
- Component-based architecture

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first approach
- **Lucide** - For beautiful icons
- **Dexie.js** - For IndexedDB made simple
- **@dnd-kit** - For accessible drag-and-drop

---

**Built with ❤️ for modern hiring workflows**

For questions or support, please open an issue or contact the development team.